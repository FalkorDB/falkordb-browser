import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const utilsUrl = new URL("../../../utils.ts", import.meta.url).href;
const validateBodyUrl = new URL("../../../validate-body.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__graphDuplicateRouteTest.getClient(request); }";

type CopyCall = { sourceName: string; destinationName: string };
type GraphStub = {
    copy(destinationName: string): Promise<{ name: string }>;
};
type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __graphDuplicateRouteTest: RouteTestState | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "../../../utils") {
                return { url: utilsUrl, shortCircuit: true };
            }
            if (specifier === "../../../validate-body") {
                return { url: validateBodyUrl, shortCircuit: true };
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

const { PATCH } = await import("./route.ts");

after(() => {
    delete globalThis.__graphDuplicateRouteTest;
});

function harness(options: {
    authResponse?: NextResponse;
    sessionError?: Error;
    copyName?: string;
    copyError?: Error;
} = {}) {
    const selectedGraphNames: string[] = [];
    const copyCalls: CopyCall[] = [];
    const graph: GraphStub = {
        async copy(destinationName) {
            copyCalls.push({
                sourceName: selectedGraphNames.at(-1) ?? "",
                destinationName,
            });
            if (options.copyError) throw options.copyError;
            return { name: options.copyName ?? "copied-graph" };
        },
    };

    globalThis.__graphDuplicateRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                user: { role: "Admin" },
                client: {
                    selectGraph(graphName: string) {
                        selectedGraphNames.push(graphName);
                        return graph;
                    },
                },
            };
        },
    };

    return { selectedGraphNames, copyCalls };
}

function patchRequest(body: unknown): NextRequest {
    return new NextRequest("http://example.test/api/graph/destination-graph/duplicate", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
}

function routeParams(graph = "destination-graph") {
    return { params: Promise.resolve({ graph }) };
}

test("PATCH copies the validated source into the route graph and returns the copied graph name", async () => {
    const state = harness({ copyName: "actual-copy-name" });

    const response = await PATCH(
        patchRequest({ sourceName: "source-graph" }),
        routeParams(),
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { result: "actual-copy-name" });
    assert.deepEqual(state.selectedGraphNames, ["source-graph"]);
    assert.deepEqual(state.copyCalls, [{
        sourceName: "source-graph",
        destinationName: "destination-graph",
    }]);
});

test("PATCH rejects a missing sourceName before selecting a graph", async () => {
    const state = harness();

    const response = await PATCH(patchRequest({}), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(state.selectedGraphNames, []);
    assert.deepEqual(state.copyCalls, []);
});

test("PATCH rejects an empty sourceName before selecting a graph", async () => {
    const state = harness();

    const response = await PATCH(patchRequest({ sourceName: "" }), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(state.selectedGraphNames, []);
    assert.deepEqual(state.copyCalls, []);
});

test("PATCH rejects a non-string sourceName before selecting a graph", async () => {
    const state = harness();

    const response = await PATCH(patchRequest({ sourceName: 123 }), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(state.selectedGraphNames, []);
    assert.deepEqual(state.copyCalls, []);
});

test("PATCH passes authentication responses through unchanged", async () => {
    const authResponse = NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: { "x-auth-result": "denied" } },
    );
    harness({ authResponse });

    const response = await PATCH(patchRequest({ sourceName: "source-graph" }), routeParams());

    assert.strictEqual(response, authResponse);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("x-auth-result"), "denied");
});

test("PATCH reports copy failures as bad requests", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({ copyError: new Error("copy failed") });

    const response = await PATCH(patchRequest({ sourceName: "source-graph" }), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "copy failed" });
    assert.deepEqual(state.copyCalls, [{
        sourceName: "source-graph",
        destinationName: "destination-graph",
    }]);
});

test("PATCH returns a server error when session resolution fails", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ sessionError: new Error("session unavailable") });

    const response = await PATCH(patchRequest({ sourceName: "source-graph" }), routeParams());

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
});
