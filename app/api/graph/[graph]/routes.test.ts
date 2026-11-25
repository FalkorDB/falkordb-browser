import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const routeFiles = [
    "./count/route.ts",
    "./count/nodes/route.ts",
    "./count/edges/route.ts",
    "./info/route.ts",
    "./memory/route.ts",
];
const routeUrls = new Set(routeFiles.map((file) => new URL(file, import.meta.url).href));
const utilsUrl = new URL("../../utils.ts", import.meta.url).href;
const sseUrl = new URL("../../sse.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__graphApiRouteTest.getClient(request); }";
const runQueryModule = "data:text/javascript,export async function runQuery(graph, query, isReadOnly) { return globalThis.__graphApiRouteTest.runQuery(graph, query, isReadOnly); }";

type GraphQueryCall = { mode: "query" | "roQuery"; query: string };
type CountQueryCall = { graph: object; query: string; isReadOnly: boolean };
type GraphStub = {
    query(query: string): Promise<unknown>;
    roQuery(query: string): Promise<unknown>;
    memoryUsage(): Promise<unknown>;
};
type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
    runQuery(graph: unknown, query: string, isReadOnly: boolean): Promise<unknown>;
};

declare global {
    var __graphApiRouteTest: RouteTestState | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL && routeUrls.has(context.parentURL)) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "@/app/api/utils") {
                return { url: utilsUrl, shortCircuit: true };
            }
            if (specifier === "@/app/api/sse") {
                return { url: sseUrl, shortCircuit: true };
            }
            if (specifier.endsWith("/utils")) {
                return { url: utilsUrl, shortCircuit: true };
            }
            if (specifier === "next/server") return nextResolve("next/server.js", context);
        }
        if (context.parentURL === utilsUrl && specifier === "./run-query.ts") {
            return { url: runQueryModule, shortCircuit: true };
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (routeUrls.has(url)) {
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

const count = await import("./count/route.ts");
const nodes = await import("./count/nodes/route.ts");
const edges = await import("./count/edges/route.ts");
const info = await import("./info/route.ts");
const memory = await import("./memory/route.ts");

after(() => {
    delete globalThis.__graphApiRouteTest;
});

function request(path: string): NextRequest {
    return new NextRequest(`http://localhost/api/graph/${path}`);
}

function routeParams(graph = "graph-one") {
    return { params: Promise.resolve({ graph }) };
}

function eventPayload(stream: string, event: "result" | "error"): unknown {
    const line = stream.split("\n").find((item) => item.startsWith("data: "));
    assert.ok(line, `Expected an SSE ${event} event`);
    assert.ok(stream.startsWith(`event: ${event}\n`));
    return JSON.parse(line.slice("data: ".length));
}

function harness(options: {
    role?: string;
    authResponse?: NextResponse;
    sessionError?: Error;
    countResult?: (query: string) => unknown;
    countError?: Error;
    countErrorOn?: number;
    graphResult?: unknown;
    graphError?: Error;
    memoryResult?: unknown;
    memoryError?: Error;
} = {}) {
    const selectedGraphIds: string[] = [];
    const graphCalls: GraphQueryCall[] = [];
    const countCalls: CountQueryCall[] = [];
    let sessionCalls = 0;
    let memoryCalls = 0;

    const graph: GraphStub = {
        async query(query) {
            graphCalls.push({ mode: "query", query });
            if (options.graphError) throw options.graphError;
            return options.graphResult ?? { data: [{ info: "value" }] };
        },
        async roQuery(query) {
            graphCalls.push({ mode: "roQuery", query });
            if (options.graphError) throw options.graphError;
            return options.graphResult ?? { data: [{ info: "value" }] };
        },
        async memoryUsage() {
            memoryCalls += 1;
            if (options.memoryError) throw options.memoryError;
            return options.memoryResult ?? { used_memory: 128 };
        },
    };

    globalThis.__graphApiRouteTest = {
        async getClient() {
            sessionCalls += 1;
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                user: { role: options.role ?? "Admin" },
                client: {
                    selectGraph(graphId: string) {
                        selectedGraphIds.push(graphId);
                        return graph;
                    },
                },
            };
        },
        async runQuery(queryGraph, query, isReadOnly) {
            assert.equal(queryGraph, graph);
            countCalls.push({ graph, query, isReadOnly });
            if (options.countError && (options.countErrorOn === undefined || countCalls.length === options.countErrorOn)) {
                throw options.countError;
            }
            return options.countResult
                ? options.countResult(query)
                : query.includes("count(n)")
                    ? { data: [{ nodes: 4 }] }
                    : { data: [{ edges: 2 }] };
        },
    };

    return {
        selectedGraphIds,
        graphCalls,
        countCalls,
        get sessionCalls() {
            return sessionCalls;
        },
        get memoryCalls() {
            return memoryCalls;
        },
    };
}

test("count streams node and edge totals from the selected graph", async () => {
    const state = harness();
    const response = await count.GET(request("graph-one/count"), routeParams());

    assert.equal(response.headers.get("content-type"), "text/event-stream");
    assert.equal(response.headers.get("cache-control"), "no-cache");
    assert.deepEqual(eventPayload(await response.text(), "result"), { nodes: 4, edges: 2 });
    assert.deepEqual(state.selectedGraphIds, ["graph-one"]);
    assert.deepEqual(state.countCalls.map(({ query, isReadOnly }) => ({ query, isReadOnly })), [
        { query: "MATCH (n) RETURN count(n) as nodes", isReadOnly: false },
        { query: "MATCH ()-[e]->() RETURN count(e) as edges", isReadOnly: false },
    ]);
});

test("node and edge count endpoints default absent rows to zero and enforce read-only mode", async () => {
    const state = harness({ countResult: () => ({ data: [] }) });
    const nodeResponse = await nodes.GET(request("graph-one/count/nodes?readOnly=true"), routeParams());
    const edgeResponse = await edges.GET(
        request("tutorial-social-demo-test-1/count/edges"),
        routeParams("tutorial-social-demo-test-1"),
    );

    assert.deepEqual(eventPayload(await nodeResponse.text(), "result"), { nodes: 0 });
    assert.deepEqual(eventPayload(await edgeResponse.text(), "result"), { edges: 0 });
    assert.deepEqual(state.countCalls.map(({ query, isReadOnly }) => ({ query, isReadOnly })), [
        { query: "MATCH (n) RETURN count(n) as nodes", isReadOnly: true },
        { query: "MATCH ()-[e]->() RETURN count(e) as edges", isReadOnly: true },
    ]);
});

test("count endpoints default missing result data to zero", async () => {
    const state = harness({ countResult: () => ({}) });
    const countResponse = await count.GET(request("graph-one/count"), routeParams());
    const nodeResponse = await nodes.GET(request("graph-one/count/nodes"), routeParams());
    const edgeResponse = await edges.GET(request("graph-one/count/edges"), routeParams());

    assert.deepEqual(eventPayload(await countResponse.text(), "result"), { nodes: 0, edges: 0 });
    assert.deepEqual(eventPayload(await nodeResponse.text(), "result"), { nodes: 0 });
    assert.deepEqual(eventPayload(await edgeResponse.text(), "result"), { edges: 0 });
    assert.equal(state.countCalls.length, 4);
});

test("count endpoints preserve explicit zero totals", async () => {
    const state = harness({
        countResult: (query) => query.includes("count(n)")
            ? { data: [{ nodes: 0 }] }
            : { data: [{ edges: 0 }] },
    });
    const countResponse = await count.GET(request("graph-one/count"), routeParams());
    const nodeResponse = await nodes.GET(request("graph-one/count/nodes"), routeParams());
    const edgeResponse = await edges.GET(request("graph-one/count/edges"), routeParams());

    assert.deepEqual(eventPayload(await countResponse.text(), "result"), { nodes: 0, edges: 0 });
    assert.deepEqual(eventPayload(await nodeResponse.text(), "result"), { nodes: 0 });
    assert.deepEqual(eventPayload(await edgeResponse.text(), "result"), { edges: 0 });
    assert.equal(state.countCalls.length, 4);
});

test("count endpoints return an SSE error when a count query fails", async (t) => {
    t.mock.method(console, "error", () => {});
    const cases = [
        [count, "graph-one/count", 1],
        [nodes, "graph-one/count/nodes", 1],
        [edges, "graph-one/count/edges", 1],
    ] as const;

    for (const [route, path, expectedCalls] of cases) {
        const state = harness({ countError: new Error("count query failed") });
        const response = await route.GET(request(path), routeParams());

        assert.deepEqual(eventPayload(await response.text(), "error"), {
            message: "count query failed",
            status: 400,
        });
        assert.equal(state.countCalls.length, expectedCalls);
    }
});

test("combined count reports an error when the edge query fails after the node query", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({
        countError: new Error("edge count query failed"),
        countErrorOn: 2,
    });
    const response = await count.GET(request("graph-one/count"), routeParams());

    assert.deepEqual(eventPayload(await response.text(), "error"), {
        message: "edge count query failed",
        status: 400,
    });
    assert.deepEqual(state.countCalls.map(({ query }) => query), [
        "MATCH (n) RETURN count(n) as nodes",
        "MATCH ()-[e]->() RETURN count(e) as edges",
    ]);
});

test("combined count rejects a missing edge result after a successful node count", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({
        countResult: (query) => query.includes("count(n)") ? { data: [{ nodes: 4 }] } : null,
    });
    const response = await count.GET(request("graph-one/count"), routeParams());

    assert.deepEqual(eventPayload(await response.text(), "error"), {
        message: "Something went wrong",
        status: 400,
    });
    assert.deepEqual(state.countCalls.map(({ query }) => query), [
        "MATCH (n) RETURN count(n) as nodes",
        "MATCH ()-[e]->() RETURN count(e) as edges",
    ]);
});

test("count endpoints report missing query results as SSE errors", async (t) => {
    t.mock.method(console, "error", () => {});
    const cases = [
        [count, "graph-one/count", 2],
        [nodes, "graph-one/count/nodes", 1],
        [edges, "graph-one/count/edges", 1],
    ] as const;

    for (const [route, path, expectedCalls] of cases) {
        const state = harness({ countResult: () => null });
        const response = await route.GET(request(path), routeParams());

        assert.deepEqual(eventPayload(await response.text(), "error"), {
            message: "Something went wrong",
            status: 400,
        });
        assert.equal(state.countCalls.length, expectedCalls);
    }
});

test("count endpoints forward authentication errors as SSE with status and code", async () => {
    const cases = [
        [count, "graph-one/count"],
        [nodes, "graph-one/count/nodes"],
        [edges, "graph-one/count/edges"],
    ] as const;

    for (const [route, path] of cases) {
        const unauthorized = NextResponse.json(
            { message: "Session expired", code: "SESSION_INVALID" },
            { status: 401 },
        );
        const state = harness({ authResponse: unauthorized });
        const response = await route.GET(request(path), routeParams());

        assert.equal(response.status, 200);
        assert.equal(response.headers.get("content-type"), "text/event-stream");
        assert.deepEqual(eventPayload(await response.text(), "error"), {
            message: "Session expired",
            status: 401,
            code: "SESSION_INVALID",
        });
        assert.equal(state.countCalls.length, 0);
    }
});

test("count endpoints report unexpected session failures as an SSE server error", async (t) => {
    t.mock.method(console, "error", () => {});
    const cases = [
        [count, "graph-one/count"],
        [nodes, "graph-one/count/nodes"],
        [edges, "graph-one/count/edges"],
    ] as const;

    for (const [route, path] of cases) {
        const state = harness({ sessionError: new Error("session unavailable") });
        const response = await route.GET(request(path), routeParams());

        assert.deepEqual(eventPayload(await response.text(), "error"), {
            message: "Internal server error",
            status: 500,
        });
        assert.equal(state.countCalls.length, 0);
    }
});

test("info route selects each supported metadata query and read-only executor", async () => {
    const cases = [
        ["(function)", "CALL dbms.procedures() YIELD name as info", "query"],
        ["(property key)", "CALL db.propertyKeys() YIELD propertyKey as info", "query"],
        ["(label)", "CALL db.labels() YIELD label as info", "roQuery"],
        ["(relationship type)", "CALL db.relationshipTypes() YIELD relationshipType as info", "query"],
    ] as const;

    for (const [type, query, mode] of cases) {
        const state = harness({ role: type === "(label)" ? "Read-Only" : "Admin" });
        const response = await info.GET(
            request(`graph-one/info?type=${encodeURIComponent(type)}`),
            routeParams(),
        );

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { result: { data: [{ info: "value" }] } });
        assert.deepEqual(state.selectedGraphIds, ["graph-one"]);
        assert.deepEqual(state.graphCalls, [{ mode, query }]);
    }
});

test("info route rejects missing and unknown metadata types without querying", async (t) => {
    t.mock.method(console, "error", () => {});
    for (const url of ["graph-one/info", "graph-one/info?type=(unknown)"]) {
        const state = harness();
        const response = await info.GET(request(url), routeParams());

        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { message: "Type is required" });
        assert.deepEqual(state.graphCalls, []);
    }
});

test("info route passes through authentication responses and reports query failures", async (t) => {
    t.mock.method(console, "error", () => {});
    const unauthorized = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const authState = harness({ authResponse: unauthorized });
    const authResponse = await info.GET(request("graph-one/info?type=(label)"), routeParams());
    assert.equal(authResponse.status, 401);
    assert.deepEqual(await authResponse.json(), { message: "Unauthorized" });
    assert.deepEqual(authState.selectedGraphIds, []);

    const queryState = harness({ graphError: new Error("metadata query failed") });
    const queryResponse = await info.GET(request("graph-one/info?type=(label)"), routeParams());
    assert.equal(queryResponse.status, 400);
    assert.deepEqual(await queryResponse.json(), { message: "metadata query failed" });
    assert.deepEqual(queryState.graphCalls, [{
        mode: "query",
        query: "CALL db.labels() YIELD label as info",
    }]);
});

test("info route reports unexpected session failures as server errors", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({ sessionError: new Error("session unavailable") });
    const response = await info.GET(request("graph-one/info?type=(label)"), routeParams());

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
    assert.deepEqual(state.graphCalls, []);
});

test("memory route returns usage from one selected graph call", async () => {
    const state = harness({ memoryResult: { used_memory: 256 } });
    const response = await memory.GET(request("graph-one/memory"), routeParams());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { result: { used_memory: 256 } });
    assert.deepEqual(state.selectedGraphIds, ["graph-one"]);
    assert.equal(state.sessionCalls, 1);
    assert.equal(state.memoryCalls, 1);
});

test("memory route forwards authentication responses and reports usage failures", async (t) => {
    t.mock.method(console, "error", () => {});
    const unauthorized = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const authState = harness({ authResponse: unauthorized });
    const authResponse = await memory.GET(request("graph-one/memory"), routeParams());
    assert.equal(authResponse.status, 401);
    assert.deepEqual(await authResponse.json(), { message: "Unauthorized" });
    assert.equal(authState.sessionCalls, 1);
    assert.equal(authState.memoryCalls, 0);

    const memoryState = harness({ memoryError: new Error("memory unavailable") });
    const memoryResponse = await memory.GET(request("graph-one/memory"), routeParams());
    assert.equal(memoryResponse.status, 400);
    assert.deepEqual(await memoryResponse.json(), { message: "memory unavailable" });
    assert.deepEqual(memoryState.selectedGraphIds, ["graph-one"]);
});
