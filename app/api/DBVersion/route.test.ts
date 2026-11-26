import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";

type ModuleEntry = { name?: string; ver?: string };
type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __dbVersionRouteTest: RouteTestState | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__dbVersionRouteTest.getClient(request); }";
const utilsUrl = new URL("../utils.ts", import.meta.url).href;
const enterpriseUrl = new URL("../../../lib/enterprise.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "@/app/api/utils") {
                return nextResolve(utilsUrl, context);
            }
            if (specifier === "@/lib/enterprise") {
                return nextResolve(enterpriseUrl, context);
            }
            if (specifier === "next/server") return nextResolve("next/server.js", context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (url === routeUrl) {
            const source = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
                fileName: fileURLToPath(url),
                compilerOptions: {
                    module: ts.ModuleKind.ESNext,
                    target: ts.ScriptTarget.ES2022,
                    inlineSourceMap: true,
                    inlineSources: true,
                },
            }).outputText;
            return { format: "module", source, shortCircuit: true };
        }
        return nextLoad(url, context);
    },
});

const { GET } = await import("./route.ts");

after(() => {
    delete globalThis.__dbVersionRouteTest;
    hooks.deregister();
});

function harness(options: {
    authResponse?: NextResponse;
    sessionError?: Error;
    modules?: ModuleEntry[];
    moduleListError?: Error;
} = {}) {
    let moduleListCalls = 0;
    globalThis.__dbVersionRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                client: {
                    connection: Promise.resolve({
                        async moduleList() {
                            moduleListCalls += 1;
                            if (options.moduleListError) throw options.moduleListError;
                            return options.modules ?? [];
                        },
                    }),
                },
            };
        },
    };
    return () => moduleListCalls;
}

function request(): Request {
    return new Request("https://example.test/api/DBVersion");
}

test("GET returns the graph module version and detects enterprise modules", async () => {
    const calls = harness({
        modules: [
            { name: "graph", ver: "2.14.9" },
            { name: "falkordbe", ver: "2.14.9-enterprise" },
        ],
    });

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        result: ["graph", "2.14.9"],
        enterprise: true,
    });
    assert.equal(calls(), 1);
});

test("GET reports community graph module versions as non-enterprise", async () => {
    harness({ modules: [{ name: "graph", ver: "2.14.9" }] });

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        result: ["graph", "2.14.9"],
        enterprise: false,
    });
});

test("GET returns service unavailable when the graph module is absent", async () => {
    const calls = harness({ modules: [{ name: "search", ver: "2.8.0" }] });

    const response = await GET(request());

    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { message: "Graph module not found" });
    assert.equal(calls(), 1);
});

test("GET passes authentication responses through unchanged", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const calls = harness({ authResponse: denied });

    assert.strictEqual(await GET(request()), denied);
    assert.equal(calls(), 0);
});

test("GET reports module lookup and session failures", async (t) => {
    t.mock.method(console, "error", () => {});

    harness({ moduleListError: new Error("module lookup failed") });
    const lookupResponse = await GET(request());
    assert.equal(lookupResponse.status, 400);
    assert.deepEqual(await lookupResponse.json(), { message: "module lookup failed" });

    harness({ sessionError: new Error("session unavailable") });
    const sessionResponse = await GET(request());
    assert.equal(sessionResponse.status, 500);
    assert.deepEqual(await sessionResponse.json(), { message: "Internal server error" });
});
