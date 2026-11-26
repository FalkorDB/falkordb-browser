import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const utilsUrl = new URL("../../../utils.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__graphExplainRouteTest.getClient(request); }";

type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __graphExplainRouteTest: RouteTestState | undefined;
}

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
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

const { GET } = await import("./route.ts");

after(() => {
    delete globalThis.__graphExplainRouteTest;
    hooks.deregister();
});

function harness(options: {
    authResponse?: NextResponse;
    sessionError?: Error;
    explainSteps?: string[];
    explainError?: Error;
} = {}) {
    const selectedGraphs: string[] = [];
    const explainedQueries: Array<{ graph: string; query: string }> = [];
    globalThis.__graphExplainRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                client: {
                    selectGraph(graphId: string) {
                        selectedGraphs.push(graphId);
                        return {
                            async explain(query: string) {
                                explainedQueries.push({ graph: graphId, query });
                                if (options.explainError) throw options.explainError;
                                return { steps: options.explainSteps ?? ["ScanAll", "Project"] };
                            },
                        };
                    },
                },
            };
        },
    };
    return { selectedGraphs, explainedQueries };
}

function request(query?: string): NextRequest {
    const url = new URL("http://example.test/api/graph/graph-one/explain");
    if (query !== undefined) url.searchParams.set("query", query);
    return new NextRequest(url);
}

function routeParams() {
    return { params: Promise.resolve({ graph: "graph-one" }) };
}

test("GET returns the explain steps for the selected graph and submitted query", async () => {
    const state = harness({ explainSteps: ["NodeByLabelScan", "Expand", "Return"] });

    const response = await GET(request("MATCH (n:Person) RETURN n"), routeParams());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        result: ["NodeByLabelScan", "Expand", "Return"],
    });
    assert.deepEqual(state.selectedGraphs, ["graph-one"]);
    assert.deepEqual(state.explainedQueries, [{
        graph: "graph-one",
        query: "MATCH (n:Person) RETURN n",
    }]);
});

test("GET rejects a missing query without selecting a graph", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness();

    const response = await GET(request(), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Missing parameter query" });
    assert.deepEqual(state.selectedGraphs, []);
    assert.deepEqual(state.explainedQueries, []);
});

test("GET reports explain failures as client errors", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({ explainError: new Error("explain failed") });

    const response = await GET(request("RETURN 1"), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "explain failed" });
    assert.deepEqual(state.explainedQueries, [{ graph: "graph-one", query: "RETURN 1" }]);
});

test("GET passes authentication responses through unchanged", async () => {
    const authResponse = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const state = harness({ authResponse });

    const response = await GET(request("RETURN 1"), routeParams());

    assert.strictEqual(response, authResponse);
    assert.deepEqual(state.selectedGraphs, []);
});

test("GET returns a server error when session resolution fails", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({ sessionError: new Error("session unavailable") });

    const response = await GET(request("RETURN 1"), routeParams());

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
    assert.deepEqual(state.selectedGraphs, []);
});
