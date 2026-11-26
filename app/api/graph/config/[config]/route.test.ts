import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__graphNamedConfigRouteTest.getClient(request); }";
const validateBodyUrl = new URL("../../../validate-body.ts", import.meta.url).href;
const utilsUrl = new URL("../../../utils.ts", import.meta.url).href;

type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __graphNamedConfigRouteTest: RouteTestState | undefined;
}

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "../../../validate-body") {
                return { url: validateBodyUrl, shortCircuit: true };
            }
            if (specifier === "../../../utils") {
                return { url: utilsUrl, shortCircuit: true };
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

const { GET, POST } = await import("./route.ts");

after(() => {
    delete globalThis.__graphNamedConfigRouteTest;
    hooks.deregister();
});

function harness(options: {
    authResponse?: NextResponse;
    sessionError?: Error;
    configValue?: unknown;
    configGetError?: Error;
    configSetError?: Error;
} = {}) {
    const calls: Array<{ method: string; name: string; value?: unknown }> = [];
    globalThis.__graphNamedConfigRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                client: {
                    async configGet(name: string) {
                        calls.push({ method: "get", name });
                        if (options.configGetError) throw options.configGetError;
                        return options.configValue ?? "config-value";
                    },
                    async configSet(name: string, value: unknown) {
                        calls.push({ method: "set", name, value });
                        if (options.configSetError) throw options.configSetError;
                        return "OK";
                    },
                },
            };
        },
    };
    return calls;
}

function request(method: "GET" | "POST", body?: unknown): NextRequest {
    return new NextRequest("http://example.test/api/graph/config/max-query-mem", {
        method,
        ...(method === "POST"
            ? {
                headers: { "content-type": "application/json" },
                body: JSON.stringify(body),
            }
            : {}),
    });
}

function routeParams(config = "max-query-mem") {
    return { params: Promise.resolve({ config }) };
}

test("GET reads the named graph configuration value", async () => {
    const calls = harness({ configValue: "8192" });

    const response = await GET(request("GET"), routeParams());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { config: "8192" });
    assert.deepEqual(calls, [{ method: "get", name: "max-query-mem" }]);
});

test("GET returns a client error when reading the named config fails", async (t) => {
    t.mock.method(console, "error", () => {});
    const calls = harness({ configGetError: new Error("read failed") });

    const response = await GET(request("GET"), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "read failed" });
    assert.deepEqual(calls, [{ method: "get", name: "max-query-mem" }]);
});

test("POST parses numeric configuration values before updating them", async () => {
    const calls = harness();

    const response = await POST(request("POST", { value: "4096" }), routeParams());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { config: "OK" });
    assert.deepEqual(calls, [{ method: "set", name: "max-query-mem", value: 4096 }]);
});

test("POST preserves CMD_INFO configuration as a string", async () => {
    const calls = harness();

    const response = await POST(
        request("POST", { value: "CALL db.labels()" }),
        routeParams("CMD_INFO"),
    );

    assert.equal(response.status, 200);
    assert.deepEqual(calls, [{
        method: "set",
        name: "CMD_INFO",
        value: "CALL db.labels()",
    }]);
});

test("POST rejects invalid input and nonnumeric values without updating configuration", async (t) => {
    t.mock.method(console, "error", () => {});
    const calls = harness();

    const missingValue = await POST(request("POST", {}), routeParams());
    const invalidNumber = await POST(request("POST", { value: "not-a-number" }), routeParams());

    assert.equal(missingValue.status, 400);
    assert.equal(invalidNumber.status, 400);
    assert.deepEqual(await missingValue.json(), { message: "value: Value is required" });
    assert.deepEqual(await invalidNumber.json(), { message: "Invalid value" });
    assert.deepEqual(calls, []);
});

test("GET and POST pass authentication responses through unchanged", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const calls = harness({ authResponse: denied });

    assert.strictEqual(await GET(request("GET"), routeParams()), denied);
    assert.strictEqual(await POST(request("POST", { value: "1" }), routeParams()), denied);
    assert.deepEqual(calls, []);
});

test("POST reports update failures as client errors", async (t) => {
    t.mock.method(console, "error", () => {});
    const calls = harness({ configSetError: new Error("update failed") });

    const response = await POST(request("POST", { value: "1" }), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "update failed" });
    assert.deepEqual(calls, [{ method: "set", name: "max-query-mem", value: 1 }]);
});

test("GET and POST return server errors when session resolution fails", async (t) => {
    t.mock.method(console, "error", () => {});
    const calls = harness({ sessionError: new Error("session unavailable") });

    const getResponse = await GET(request("GET"), routeParams());
    const postResponse = await POST(request("POST", { value: "1" }), routeParams());

    for (const response of [getResponse, postResponse]) {
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { message: "Internal server error" });
    }
    assert.deepEqual(calls, []);
});
