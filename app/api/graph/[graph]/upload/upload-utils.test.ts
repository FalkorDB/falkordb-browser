import test, { mock } from "node:test";
import assert from "node:assert/strict";
import type { Graph } from "falkordb";
import { executeCypherBatch } from "./upload-utils.ts";

function makeGraph(
  impl?: (query: string, options?: unknown) => Promise<unknown>
) {
  const querySpy = mock.fn(impl ?? (async () => ({ data: [] })));
  const graph = { query: querySpy } as unknown as Graph;
  return { graph, querySpy };
}

// ---------------------------------------------------------------------------
// executeCypherBatch
// ---------------------------------------------------------------------------

test("executeCypherBatch executes each statement and returns the count", async () => {
  const { graph, querySpy } = makeGraph();

  const count = await executeCypherBatch(
    graph,
    "CREATE (:A); CREATE (:B); MATCH (n) RETURN n;"
  );

  assert.equal(count, 3);
  assert.equal(querySpy.mock.callCount(), 3);
  assert.equal(querySpy.mock.calls[0].arguments[0], "CREATE (:A)");
  assert.equal(querySpy.mock.calls[2].arguments[0], "MATCH (n) RETURN n");
});

test("executeCypherBatch runs no query and returns 0 for a blank batch", async () => {
  const { graph, querySpy } = makeGraph();

  const count = await executeCypherBatch(graph, "  \n ; ; \n");

  assert.equal(count, 0);
  assert.equal(querySpy.mock.callCount(), 0);
});

test("executeCypherBatch annotates failures with the statement number and stops", async () => {
  let calls = 0;
  const { graph, querySpy } = makeGraph(async () => {
    calls += 1;
    if (calls === 2) throw new Error("syntax error");
    return { data: [] };
  });

  await assert.rejects(
    () => executeCypherBatch(graph, "CREATE (:A); BADSTATEMENT; CREATE (:C)"),
    /Failed to execute Cypher statement 2: syntax error/
  );
  assert.equal(querySpy.mock.callCount(), 2);
});

test("executeCypherBatch rejects a batch containing LOAD CSV without executing anything", async () => {
  const { graph, querySpy } = makeGraph();

  await assert.rejects(
    () =>
      executeCypherBatch(
        graph,
        "CREATE (:A); LOAD CSV FROM 'http://evil.example/x' AS row RETURN row"
      ),
    /Cypher statement 2 must not contain a LOAD CSV clause\./
  );
  assert.equal(querySpy.mock.callCount(), 0);
});
