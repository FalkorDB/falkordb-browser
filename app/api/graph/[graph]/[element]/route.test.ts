import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const routeUrl = import.meta.resolve("./route.ts");
const attributeUrl = import.meta.resolve("./[key]/route.ts");
const labelUrl = import.meta.resolve("./label/route.ts");
const routeUrls = [routeUrl, attributeUrl, labelUrl];
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__elementRouteSession(request); }";

declare global {
    var __elementRouteSession: ((request: Request) => Promise<unknown>) | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL && routeUrls.includes(context.parentURL)) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") return { url: authModule, shortCircuit: true };
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier === "@/lib/cypher") return nextResolve(new URL("../../../../../lib/cypher.ts", import.meta.url).href, context);
            if (specifier === "@/lib/graphValues") return nextResolve(new URL("../../../../../lib/graphValues.ts", import.meta.url).href, context);
            if (["../../../validate-body", "../../../utils", "../../../../validate-body", "../../../../utils"].includes(specifier)) return nextResolve(`${specifier}.ts`, context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (routeUrls.includes(url)) {
            const source = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
                fileName: fileURLToPath(url),
                compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, inlineSourceMap: true, inlineSources: true },
            }).outputText;
            return { format: "module", source, shortCircuit: true };
        }
        return nextLoad(url, context);
    },
});

const route = await import("./route.ts");
const attribute = await import("./[key]/route.ts");
const label = await import("./label/route.ts");
const params = { params: Promise.resolve({ graph: "graph-one", element: "42" }) };
const attributeParams = { params: Promise.resolve({ graph: "graph-one", element: "42", key: "original" }) };
const request = (method: string, body?: unknown, search = "") => new NextRequest(`http://localhost/api/graph/graph-one/42${search}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { "content-type": "application/json" } }),
});
after(() => { delete globalThis.__elementRouteSession; });

type QueryCall = { graph: string; mode: "read" | "write"; query: string; params: Record<string, unknown> };
function session(role = "Admin", failure?: Error): QueryCall[] {
    const calls: QueryCall[] = [];
    globalThis.__elementRouteSession = async () => ({
        user: { role },
        client: {
            selectGraph(graph: string) {
                const execute = async (mode: "read" | "write", query: string, options: { params: Record<string, unknown> }) => {
                    calls.push({ graph, mode, query, params: options.params });
                    if (failure) throw failure;
                    return { data: ["result"] };
                };
                return {
                    query: (query: string, options: { params: Record<string, unknown> }) => execute("write", query, options),
                    roQuery: (query: string, options: { params: Record<string, unknown> }) => execute("read", query, options),
                };
            },
        },
    });
    return calls;
}

test("reads neighbors with a bound element ID and respects read-only requests", async () => {
    const calls = session();
    const normal = await route.GET(request("GET"), params);
    const readonly = await route.GET(request("GET", undefined, "?readOnly=true"), params);
    assert.deepEqual(await normal.json(), { result: { data: ["result"] } });
    assert.equal(readonly.status, 200);
    assert.deepEqual(calls.map(({ graph, mode, params: queryParams }) => ({ graph, mode, params: queryParams })), [
        { graph: "graph-one", mode: "write", params: { id: 42 } },
        { graph: "graph-one", mode: "read", params: { id: 42 } },
    ]);
    assert.match(calls[0].query, /WHERE ID\(n\) = \$id/);
});

test("creates nodes and relationships with quoted identifiers and bound values", async () => {
    const calls = session();
    const node = await route.POST(request("POST", {
        type: true, label: ["Person", "unusual label"], attributes: [["name", "Ada"], ["score", 7]],
    }), params);
    const edge = await route.POST(request("POST", {
        type: false, label: ["knows"], attributes: [["active", true]], selectedNodes: [{ id: 2 }, { id: 3 }],
    }), params);
    assert.equal(node.status, 200);
    assert.equal(edge.status, 200);
    assert.deepEqual(await node.json(), { result: { data: ["result"] } });
    assert.equal(calls[0].query, "CREATE (n:`Person`:`unusual label` {`name`: $attr_0,`score`: $attr_1}) RETURN n");
    assert.deepEqual(calls[0].params, { attr_0: "Ada", attr_1: 7 });
    assert.equal(calls[1].query, "MATCH (a), (b) WHERE ID(a) = $nodeA AND ID(b) = $nodeB CREATE (a)-[e:`knows` {`active`: $attr_0}]->(b) RETURN e");
    assert.deepEqual(calls[1].params, { nodeA: 2, nodeB: 3, attr_0: true });
});

test("deletes nodes and relationships using a bound ID", async () => {
    const calls = session();
    for (const type of [true, false]) {
        const response = await route.DELETE(request("DELETE", { type }), params);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { message: "Element deleted successfully" });
    }
    assert.deepEqual(calls.map(({ query, params: queryParams }) => ({ query, params: queryParams })), [
        { query: "MATCH (n) WHERE ID(n) = $id DELETE n", params: { id: 42 } },
        { query: "MATCH ()-[e]->() WHERE ID(e) = $id DELETE e", params: { id: 42 } },
    ]);
});

test("rejects malformed element requests before running queries", async (t) => {
    t.mock.method(console, "error", () => {});
    const calls = session();
    const cases = [
        [route.POST, { type: "node", label: [], attributes: [] }],
        [route.POST, { type: false, label: ["R"], attributes: [], selectedNodes: [{ id: 1 }] }],
        [route.POST, { type: false, label: [], attributes: [], selectedNodes: [{ id: 1 }, { id: 2 }] }],
        [route.DELETE, { type: "node" }],
    ] as const;
    for (const [handler, body] of cases) {
        const response = await handler(request(handler === route.POST ? "POST" : "DELETE", body), params);
        assert.equal(response.status, 400);
        assert.equal(typeof (await response.json()).message, "string");
    }
    assert.equal(calls.length, 0);
});

test("prevents read-only roles and explicit read-only requests from mutating", async () => {
    for (const [role, search] of [["Read-Only", ""], ["Admin", "?readOnly=true"]]) {
        const calls = session(role);
        const created = await route.POST(request("POST", { type: true, label: [], attributes: [] }, search), params);
        const deleted = await route.DELETE(request("DELETE", { type: true }, search), params);
        for (const response of [created, deleted]) {
            assert.equal(response.status, 403);
            assert.deepEqual(await response.json(), { message: "Forbidden: read-only connection" });
        }
        assert.deepEqual(calls, []);
    }
});

test("passes through authentication failures and reports session or query errors", async (t) => {
    t.mock.method(console, "error", () => {});
    const operations = [
        () => route.GET(request("GET"), params),
        () => route.POST(request("POST", { type: true, label: [], attributes: [] }), params),
        () => route.DELETE(request("DELETE", { type: true }), params),
    ];
    globalThis.__elementRouteSession = async () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    for (const operation of operations) assert.equal((await operation()).status, 401);
    globalThis.__elementRouteSession = async () => { throw new Error("session failure"); };
    for (const operation of operations) {
        const response = await operation();
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { message: "Internal server error" });
    }
    session("Admin", new Error("query failed"));
    for (const operation of operations) {
        const response = await operation();
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { message: "query failed" });
    }
});

test("adds and removes labels as quoted identifiers with a bound element ID", async () => {
    const calls = session();
    const added = await label.POST(request("POST", { label: "Person label" }), params);
    const removed = await label.DELETE(request("DELETE", { label: "Person label" }), params);
    assert.equal(added.status, 200);
    assert.equal(removed.status, 200);
    assert.deepEqual(await added.json(), { message: "Label added successfully" });
    assert.deepEqual(await removed.json(), { message: "Label removed successfully" });
    assert.deepEqual(calls.map(({ query, params: queryParams }) => ({ query, params: queryParams })), [
        { query: "MATCH (n) WHERE ID(n) = $id SET n:`Person label`", params: { id: 42 } },
        { query: "MATCH (n) WHERE ID(n) = $id REMOVE n:`Person label`", params: { id: 42 } },
    ]);
});

test("updates and deletes properties for nodes and relationships", async () => {
    const calls = session();
    const node = await attribute.POST(request("POST", { type: true, value: "2025-09-15", valueType: "date" }, "?propertyKey=date%20of%20birth"), attributeParams);
    const edge = await attribute.POST(request("POST", { type: false, value: "hello" }), attributeParams);
    const removeNode = await attribute.DELETE(request("DELETE", { type: true }), attributeParams);
    const removeEdge = await attribute.DELETE(request("DELETE", { type: false }), attributeParams);
    for (const response of [node, edge, removeNode, removeEdge]) assert.equal(response.status, 200);
    assert.deepEqual(calls.map(({ query, params: queryParams }) => ({ query, params: queryParams })), [
        { query: "MATCH (n) WHERE ID(n) = $id SET n.`date of birth` = date($value)", params: { id: 42, value: "2025-09-15" } },
        { query: "MATCH ()-[e]->() WHERE ID(e) = $id SET e.`original` = $value", params: { id: 42, value: "hello" } },
        { query: "MATCH (n) WHERE ID(n) = $id SET n.`original` = NULL", params: { id: 42 } },
        { query: "MATCH ()-[e]->() WHERE ID(e) = $id SET e.`original` = NULL", params: { id: 42 } },
    ]);
});

test("rejects invalid labels and properties without running queries", async () => {
    const calls = session();
    const attempts = [
        () => label.POST(request("POST", { label: "" }), params),
        () => label.DELETE(request("DELETE", { label: "" }), params),
        () => attribute.POST(request("POST", { type: true, value: "not a date", valueType: "date" }), attributeParams),
        () => attribute.DELETE(request("DELETE", { type: "node" }), attributeParams),
        () => attribute.POST(request("POST", { type: true, value: "x" }, "?propertyKey="), attributeParams),
        () => attribute.DELETE(request("DELETE", { type: true }, "?propertyKey="), attributeParams),
    ];
    for (const attempt of attempts) {
        const response = await attempt();
        assert.equal(response.status, 400);
        assert.equal(typeof (await response.json()).message, "string");
    }
    assert.deepEqual(calls, []);
});

test("blocks label and property changes on read-only connections", async () => {
    const calls = session("Read-Only");
    const attempts = [
        () => label.POST(request("POST", { label: "A" }), params),
        () => label.DELETE(request("DELETE", { label: "A" }), params),
        () => attribute.POST(request("POST", { type: true, value: "x" }), attributeParams),
        () => attribute.DELETE(request("DELETE", { type: true }), attributeParams),
    ];
    for (const attempt of attempts) {
        const response = await attempt();
        assert.equal(response.status, 403);
        assert.deepEqual(await response.json(), { message: "Forbidden: read-only connection" });
    }
    assert.deepEqual(calls, []);
});

test("propagates authentication, session, and query failures for labels and properties", async (t) => {
    t.mock.method(console, "error", () => {});
    const attempts = [
        () => label.POST(request("POST", { label: "A" }), params),
        () => label.DELETE(request("DELETE", { label: "A" }), params),
        () => attribute.POST(request("POST", { type: true, value: "x" }), attributeParams),
        () => attribute.DELETE(request("DELETE", { type: true }), attributeParams),
    ];
    globalThis.__elementRouteSession = async () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    for (const attempt of attempts) assert.equal((await attempt()).status, 401);
    globalThis.__elementRouteSession = async () => { throw new Error("session failure"); };
    for (const attempt of attempts) {
        const response = await attempt();
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { message: "Internal server error" });
    }
    session("Admin", new Error("query failed"));
    for (const attempt of attempts) {
        const response = await attempt();
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { message: "query failed" });
    }
});
