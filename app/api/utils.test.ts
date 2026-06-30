import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import type { Graph } from "falkordb";

// ---------------------------------------------------------------------------
// Local copy of runQuery — mirrors app/api/utils.ts exactly so the test
// runner doesn't have to load Next.js (which it can't resolve in isolation).
// If the production function changes, update this copy to match.
// ---------------------------------------------------------------------------
type QueryOptions = Parameters<Graph["query"]>[1];

const runQuery = async (graph: Graph, query: string, isReadOnly: boolean, options?: QueryOptions) => {
    return isReadOnly
        ? await graph.roQuery(query, options)
        : await graph.query(query, options);
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type MockResult = { data: string };
const OK: MockResult = { data: "ok" };

function makeGraph({
    queryResult = OK,
    roQueryResult = OK,
    queryError,
}: {
    queryResult?: MockResult;
    roQueryResult?: MockResult;
    queryError?: Error;
} = {}): { graph: Graph; querySpy: ReturnType<typeof mock.fn>; roQuerySpy: ReturnType<typeof mock.fn> } {
    const querySpy = mock.fn(async () => {
        if (queryError) throw queryError;
        return queryResult;
    });
    const roQuerySpy = mock.fn(async () => roQueryResult);

    const graph = { query: querySpy, roQuery: roQuerySpy } as unknown as Graph;
    return { graph, querySpy, roQuerySpy };
}

// ---------------------------------------------------------------------------
// runQuery
// ---------------------------------------------------------------------------

describe("runQuery", () => {
    // ------------------------------------------------------------------
    // isReadOnly = true  →  always use roQuery (replica or Read-Only user)
    // ------------------------------------------------------------------
    it("uses roQuery when isReadOnly is true", async () => {
        const { graph, querySpy, roQuerySpy } = makeGraph();
        await runQuery(graph, "MATCH (n) RETURN n", true);
        assert.equal(roQuerySpy.mock.callCount(), 1);
        assert.equal(querySpy.mock.callCount(), 0);
    });

    it("forwards options to roQuery when isReadOnly is true", async () => {
        const { graph, roQuerySpy } = makeGraph();
        const opts = { TIMEOUT: 3000 };
        await runQuery(graph, "MATCH (n) RETURN n", true, opts);
        assert.deepEqual(roQuerySpy.mock.calls[0].arguments[1], opts);
    });

    // ------------------------------------------------------------------
    // isReadOnly = false  →  use graph.query (write-capable instance)
    // ------------------------------------------------------------------
    it("uses graph.query when isReadOnly is false", async () => {
        const { graph, querySpy, roQuerySpy } = makeGraph();
        await runQuery(graph, "CREATE (n)", false);
        assert.equal(querySpy.mock.callCount(), 1);
        assert.equal(roQuerySpy.mock.callCount(), 0);
    });

    it("forwards options to graph.query when isReadOnly is false", async () => {
        const { graph, querySpy } = makeGraph();
        const opts = { TIMEOUT: 1500 };
        await runQuery(graph, "MATCH (n) RETURN n", false, opts);
        assert.deepEqual(querySpy.mock.calls[0].arguments[1], opts);
    });

    it("propagates errors from graph.query without swallowing them", async () => {
        const permErr = new Error("NOPERM this user has no permissions");
        const { graph } = makeGraph({ queryError: permErr });
        await assert.rejects(() => runQuery(graph, "CREATE (n)", false), /NOPERM/);
    });
});
