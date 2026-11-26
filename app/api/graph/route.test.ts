import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__graphListRouteTest.getClient(request); }";

type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __graphListRouteTest: RouteTestState | undefined;
}

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "@/app/api/utils") {
                return nextResolve(new URL("../utils.ts", import.meta.url).href, context);
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
    delete globalThis.__graphListRouteTest;
    hooks.deregister();
});

function harness(options: {
    authResponse?: NextResponse;
    sessionError?: Error;
    graphNames?: string[];
    listError?: Error;
} = {}) {
    const calls: string[] = [];
    globalThis.__graphListRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                client: {
                    async list() {
                        calls.push("list");
                        if (options.listError) throw options.listError;
                        return options.graphNames ?? [];
                    },
                },
            };
        },
    };
    return calls;
}

function request(): Request {
    return new Request("http://example.test/api/graph");
}

test("GET lists selectable graphs while hiding legacy schema graphs", async () => {
    const calls = harness({
        graphNames: ["people", "orders_schema", "schema_archive_schema", "analytics"],
    });

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { opts: ["people", "analytics"] });
    assert.deepEqual(calls, ["list"]);
});

test("GET passes authentication responses through unchanged", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    harness({ authResponse: denied });

    assert.strictEqual(await GET(request()), denied);
});

test("GET returns a client error when graph listing fails", async (t) => {
    t.mock.method(console, "error", () => {});
    const calls = harness({ listError: new Error("list failed") });

    const response = await GET(request());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "list failed" });
    assert.deepEqual(calls, ["list"]);
});

test("GET returns a server error when session resolution fails", async (t) => {
    t.mock.method(console, "error", () => {});
    const calls = harness({ sessionError: new Error("session unavailable") });

    const response = await GET(request());

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
    assert.deepEqual(calls, []);
});
