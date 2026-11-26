import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";

type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __statusRouteTest: RouteTestState | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__statusRouteTest.getClient(request); }";
const utilsUrl = new URL("../utils.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "../auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "../utils") {
                return nextResolve(utilsUrl, context);
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
    delete globalThis.__statusRouteTest;
    hooks.deregister();
});

function harness(options: {
    authResponse?: NextResponse;
    sessionError?: Error;
    pingError?: Error;
} = {}) {
    let pingCalls = 0;
    globalThis.__statusRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                client: {
                    connection: Promise.resolve({
                        async ping() {
                            pingCalls += 1;
                            if (options.pingError) throw options.pingError;
                        },
                    }),
                },
            };
        },
    };
    return () => pingCalls;
}

function request(): Request {
    return new Request("https://example.test/api/status");
}

test("GET reports online after a successful database ping", async () => {
    const calls = harness();

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "online" });
    assert.equal(calls(), 1);
});

test("GET reports offline when the database ping fails", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ pingError: new Error("database unavailable") });

    const response = await GET(request());

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { status: "offline" });
});

test("GET passes authentication responses through without pinging", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const calls = harness({ authResponse: denied });

    assert.strictEqual(await GET(request()), denied);
    assert.equal(calls(), 0);
});

test("GET reports offline when session lookup fails", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ sessionError: new Error("session unavailable") });

    const response = await GET(request());

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { status: "offline" });
});
