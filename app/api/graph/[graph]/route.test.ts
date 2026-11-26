import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const utilsUrl = new URL("../../utils.ts", import.meta.url).href;
const validateBodyUrl = new URL("../../validate-body.ts", import.meta.url).href;
const queryStreamUrl = new URL("../../query-stream.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__graphPrimaryRouteTest.getClient(request); }";
const runQueryModule = "data:text/javascript,export async function runQuery(graph, query, isReadOnly, options) { return globalThis.__graphPrimaryRouteTest.runQuery(graph, query, isReadOnly, options); }";

type QueryRunCall = {
    graph: GraphStub;
    query: string;
    isReadOnly: boolean;
    options?: { TIMEOUT?: number };
};
type GraphQueryCall = { graphId: string; mode: "query" | "roQuery" | "delete"; query?: string };
type RenameCall = { sourceName: string; destinationName: string };
type GraphStub = {
    query(query: string): Promise<unknown>;
    roQuery(query: string): Promise<unknown>;
    delete(): Promise<void>;
};
type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
    runQuery(graph: GraphStub, query: string, isReadOnly: boolean, options?: { TIMEOUT?: number }): Promise<unknown>;
};

declare global {
    var __graphPrimaryRouteTest: RouteTestState | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier.endsWith("/utils")) {
                return { url: utilsUrl, shortCircuit: true };
            }
            if (specifier === "../../validate-body") {
                return { url: validateBodyUrl, shortCircuit: true };
            }
            if (specifier.endsWith("/query-stream")) {
                return { url: queryStreamUrl, shortCircuit: true };
            }
            if (specifier === "next/server") return nextResolve("next/server.js", context);
        }
        if (context.parentURL === utilsUrl && specifier === "./run-query.ts") {
            return { url: runQueryModule, shortCircuit: true };
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

const { DELETE, GET, PATCH, POST } = await import("./route.ts");

after(() => {
    delete globalThis.__graphPrimaryRouteTest;
});

function harness(options: {
    role?: string;
    authResponse?: NextResponse;
    sessionError?: Error;
    queryResult?: unknown;
    queryError?: Error;
    graphError?: Error;
    deleteError?: Error;
    renameResult?: boolean | null;
    renameError?: Error;
} = {}) {
    const selectedGraphIds: string[] = [];
    const graphCalls: GraphQueryCall[] = [];
    const runQueryCalls: QueryRunCall[] = [];
    const renameCalls: RenameCall[] = [];
    const graph: GraphStub = {
        async query(query) {
            graphCalls.push({ graphId: selectedGraphIds.at(-1) ?? "", mode: "query", query });
            if (options.graphError) throw options.graphError;
            return { data: [] };
        },
        async roQuery(query) {
            graphCalls.push({ graphId: selectedGraphIds.at(-1) ?? "", mode: "roQuery", query });
            if (options.graphError) throw options.graphError;
            return { data: [] };
        },
        async delete() {
            graphCalls.push({ graphId: selectedGraphIds.at(-1) ?? "", mode: "delete" });
            if (options.deleteError) throw options.deleteError;
        },
    };

    globalThis.__graphPrimaryRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                user: { role: options.role ?? "Admin" },
                client: {
                    selectGraph(graphId: string) {
                        selectedGraphIds.push(graphId);
                        return graph;
                    },
                    connection: Promise.resolve({
                        async renameNX(sourceName: string, destinationName: string) {
                            renameCalls.push({ sourceName, destinationName });
                            if (options.renameError) throw options.renameError;
                            return options.renameResult === undefined ? true : options.renameResult;
                        },
                    }),
                },
            };
        },
        async runQuery(queryGraph, query, isReadOnly, queryOptions) {
            runQueryCalls.push({ graph: queryGraph, query, isReadOnly, options: queryOptions });
            if (options.queryError) throw options.queryError;
            return options.queryResult ?? { data: [{ n: 1 }] };
        },
    };

    return { selectedGraphIds, graphCalls, runQueryCalls, renameCalls, graph };
}

function request(path: string, init?: ConstructorParameters<typeof NextRequest>[1]): NextRequest {
    return new NextRequest(`http://localhost/api/graph/${path}`, init);
}

function postRequest(path: string, body: unknown, contentType = "application/json"): NextRequest {
    return request(path, {
        method: "POST",
        headers: { "content-type": contentType },
        body: JSON.stringify(body),
    });
}

function patchRequest(path: string, body: unknown): NextRequest {
    return request(path, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
}

function routeParams(graph = "graph-one") {
    return { params: Promise.resolve({ graph }) };
}

async function eventPayload(response: Response, event: "result" | "error"): Promise<unknown> {
    const stream = await response.text();
    const line = stream.split("\n").find((item) => item.startsWith("data: "));
    assert.ok(line, `Expected an SSE ${event} event`);
    assert.ok(stream.startsWith(`event: ${event}\n`));
    return JSON.parse(line.slice("data: ".length));
}

test("GET streams a read-only query with its graph and converted timeout", async () => {
    const state = harness({ queryResult: { data: [{ n: "Ada" }] } });

    const response = await GET(
        request("graph-one?query=MATCH%20(n)%20RETURN%20n&timeout=1.5"),
        routeParams(),
    );

    assert.equal(response.headers.get("content-type"), "text/event-stream");
    assert.deepEqual(await eventPayload(response, "result"), { data: [{ n: "Ada" }] });
    assert.deepEqual(state.selectedGraphIds, ["graph-one"]);
    assert.deepEqual(state.runQueryCalls.map(({ query, isReadOnly, options }) => ({ query, isReadOnly, options })), [{
        query: "MATCH (n) RETURN n",
        isReadOnly: true,
        options: { TIMEOUT: 1500 },
    }]);
});

test("GET reports missing queries and invalid timeouts through SSE errors", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness();

    const missingQuery = await GET(request("graph-one"), routeParams());
    assert.deepEqual(await eventPayload(missingQuery, "error"), {
        message: "Missing parameter query",
        status: 400,
    });

    const invalidTimeout = await GET(
        request("graph-one?query=RETURN%201&timeout=not-a-number"),
        routeParams(),
    );
    assert.deepEqual(await eventPayload(invalidTimeout, "error"), {
        message: "Invalid parameter timeout",
        status: 400,
    });
    assert.deepEqual(state.selectedGraphIds, []);
});

test("GET forwards authentication status and code in its SSE error", async () => {
    const state = harness({
        authResponse: NextResponse.json(
            { message: "Connection expired", code: "CONNECTION_EXPIRED" },
            { status: 401 },
        ),
    });

    const response = await GET(request("graph-one?query=RETURN%201"), routeParams());

    assert.deepEqual(await eventPayload(response, "error"), {
        message: "Connection expired",
        code: "CONNECTION_EXPIRED",
        status: 401,
    });
    assert.deepEqual(state.selectedGraphIds, []);
});

test("GET returns an SSE server error when session resolution fails", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ sessionError: new Error("session unavailable") });

    const response = await GET(request("graph-one?query=RETURN%201"), routeParams());

    assert.deepEqual(await eventPayload(response, "error"), {
        message: "Internal server error",
        status: 500,
    });
});

test("GET reports query execution failures as SSE server errors", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ queryError: new Error("backend unavailable") });

    const response = await GET(
        request("graph-one?query=RETURN%201"),
        routeParams(),
    );

    assert.deepEqual(await eventPayload(response, "error"), {
        message: "Internal server error",
        status: 500,
    });
});

test("POST streams JSON queries with timeout and requested read-only mode", async () => {
    const state = harness({ queryResult: { data: [{ n: "Ada" }] } });

    const response = await POST(
        postRequest("graph-one?readOnly=true", { query: "MATCH (n) RETURN n", timeout: 2.5 }),
        routeParams(),
    );

    assert.deepEqual(await eventPayload(response, "result"), { data: [{ n: "Ada" }] });
    assert.deepEqual(state.selectedGraphIds, ["graph-one"]);
    assert.deepEqual(state.runQueryCalls.map(({ query, isReadOnly, options }) => ({ query, isReadOnly, options })), [{
        query: "MATCH (n) RETURN n",
        isReadOnly: true,
        options: { TIMEOUT: 2500 },
    }]);
});

test("POST rejects non-string query values before selecting a graph", async () => {
    const state = harness();

    const response = await POST(postRequest("graph-one", { query: 42 }), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Invalid parameter query" });
    assert.deepEqual(state.selectedGraphIds, []);
});

test("POST reports malformed JSON without selecting a graph", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness();

    const response = await POST(
        request("graph-one", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: "{",
        }),
        routeParams(),
    );

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(typeof body.message, "string");
    assert.ok(body.message.length > 0);
    assert.deepEqual(state.selectedGraphIds, []);
});

test("POST create mode uses query for writable roles and roQuery for read-only roles", async () => {
    for (const [role, mode] of [["Admin", "query"], ["Read-Only", "roQuery"]] as const) {
        const state = harness({ role });

        const response = await POST(postRequest("graph-one", {}), routeParams());

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { message: "Graph created successfully" });
        assert.deepEqual(state.selectedGraphIds, ["graph-one"]);
        assert.deepEqual(state.graphCalls, [{ graphId: "graph-one", mode, query: "RETURN 1" }]);
    }
});

test("POST supports graph creation when the request is not JSON", async () => {
    const state = harness();

    const response = await POST(
        postRequest("graph-one", "create", "text/plain"),
        routeParams(),
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "Graph created successfully" });
    assert.deepEqual(state.graphCalls, [{ graphId: "graph-one", mode: "query", query: "RETURN 1" }]);
});

test("POST reports graph creation query failures", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({ graphError: new Error("creation failed") });

    const response = await POST(postRequest("graph-one", {}), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "creation failed" });
    assert.deepEqual(state.graphCalls, [{ graphId: "graph-one", mode: "query", query: "RETURN 1" }]);
});

test("DELETE removes the selected graph and confirms its name", async () => {
    const state = harness();

    const response = await DELETE(request("graph-one", { method: "DELETE" }), routeParams());

    assert.ok(response);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "graph-one graph deleted" });
    assert.deepEqual(state.selectedGraphIds, ["graph-one"]);
    assert.deepEqual(state.graphCalls, [{ graphId: "graph-one", mode: "delete" }]);
});

test("DELETE reports graph deletion failures as bad requests", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({ deleteError: new Error("delete failed") });

    const response = await DELETE(request("graph-one", { method: "DELETE" }), routeParams());

    assert.ok(response);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "delete failed" });
    assert.deepEqual(state.selectedGraphIds, ["graph-one"]);
});

test("PATCH validates rename input before attempting a rename", async () => {
    const state = harness();

    const response = await PATCH(patchRequest("graph-one", { sourceName: "" }), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "sourceName: Source name cannot be empty" });
    assert.deepEqual(state.renameCalls, []);
});

test("PATCH renames from the validated source to the route graph", async () => {
    const state = harness({ renameResult: true });

    const response = await PATCH(
        patchRequest("graph-one", { sourceName: "source-graph" }),
        routeParams(),
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { data: true });
    assert.deepEqual(state.renameCalls, [{
        sourceName: "source-graph",
        destinationName: "graph-one",
    }]);
});

test("PATCH reports a destination name conflict", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({ renameResult: null });

    const response = await PATCH(
        patchRequest("graph-one", { sourceName: "source-graph" }),
        routeParams(),
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "graph-one already exists" });
    assert.deepEqual(state.renameCalls, [{
        sourceName: "source-graph",
        destinationName: "graph-one",
    }]);
});

test("handlers return their documented server-error shape when session resolution fails", async (t) => {
    t.mock.method(console, "error", () => {});

    harness({ sessionError: new Error("session unavailable") });
    const deleted = await DELETE(request("graph-one", { method: "DELETE" }), routeParams());
    assert.ok(deleted);
    assert.equal(deleted.status, 500);
    assert.deepEqual(await deleted.json(), { message: "Internal server error" });

    harness({ sessionError: new Error("session unavailable") });
    const posted = await POST(postRequest("graph-one", {}), routeParams());
    assert.equal(posted.status, 500);
    assert.deepEqual(await posted.json(), { message: "Internal server error" });

    harness({ sessionError: new Error("session unavailable") });
    const patched = await PATCH(patchRequest("graph-one", { sourceName: "source-graph" }), routeParams());
    assert.equal(patched.status, 500);
    assert.deepEqual(await patched.json(), { message: "Internal server error" });
});
