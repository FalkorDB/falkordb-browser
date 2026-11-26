import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__graphStubsRouteTest.getClient(request); }";

type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __graphStubsRouteTest: RouteTestState | undefined;
}

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "@/app/api/utils") {
                return nextResolve(new URL("../../utils.ts", import.meta.url).href, context);
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
    delete globalThis.__graphStubsRouteTest;
    hooks.deregister();
});

function harness(options: {
    authResponse?: NextResponse;
    sessionError?: Error;
    stubs?: unknown[];
    stubsError?: Error;
} = {}) {
    let calls = 0;
    globalThis.__graphStubsRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                client: {
                    async stubs() {
                        calls += 1;
                        if (options.stubsError) throw options.stubsError;
                        return options.stubs ?? [];
                    },
                },
            };
        },
    };
    return () => calls;
}

function request(): Request {
    return new Request("http://example.test/api/graph/stubs");
}

test("GET returns the database graph stubs", async () => {
    const calls = harness({ stubs: [{ name: "person", labels: ["Person"] }] });

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        stubs: [{ name: "person", labels: ["Person"] }],
    });
    assert.equal(calls(), 1);
});

test("GET passes authentication responses through unchanged", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const calls = harness({ authResponse: denied });

    assert.strictEqual(await GET(request()), denied);
    assert.equal(calls(), 0);
});

test("GET returns a client error when reading graph stubs fails", async (t) => {
    t.mock.method(console, "error", () => {});
    const calls = harness({ stubsError: new Error("stubs failed") });

    const response = await GET(request());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "stubs failed" });
    assert.equal(calls(), 1);
});

test("GET returns a server error when session resolution fails", async (t) => {
    t.mock.method(console, "error", () => {});
    const calls = harness({ sessionError: new Error("session unavailable") });

    const response = await GET(request());

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
    assert.equal(calls(), 0);
});
