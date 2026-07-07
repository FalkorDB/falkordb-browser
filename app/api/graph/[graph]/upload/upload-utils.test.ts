import test, { mock } from "node:test";
import assert from "node:assert/strict";
import type { Graph } from "falkordb";
import { executeCsvIngestion, executeCypherBatch } from "./upload-utils.ts";

function makeGraph(
  impl?: (query: string, options?: unknown) => Promise<unknown>
) {
  const querySpy = mock.fn(impl ?? (async () => ({ data: [] })));
  const graph = { query: querySpy } as unknown as Graph;
  return { graph, querySpy };
}

// ---------------------------------------------------------------------------
// executeCsvIngestion (batched)
// ---------------------------------------------------------------------------

test("executeCsvIngestion runs one batched UNWIND query per chunk with row items", async () => {
  const { graph, querySpy } = makeGraph();

  const result = await executeCsvIngestion(
    graph,
    "name,age\nAlice,30\nBob,41",
    "CREATE (:Person {name: row.name})"
  );

  assert.deepEqual(result, { processedRows: 2, chunks: 1 });
  assert.equal(querySpy.mock.callCount(), 1);
  assert.match(
    querySpy.mock.calls[0].arguments[0] as string,
    /^UNWIND \$rows AS __r WITH __r\.index AS index, __r\.data AS row\n/
  );
  assert.deepEqual(querySpy.mock.calls[0].arguments[1], {
    params: {
      rows: [
        { index: 0, data: { name: "Alice", age: "30" } },
        { index: 1, data: { name: "Bob", age: "41" } },
      ],
    },
  });
});

test("executeCsvIngestion splits large inputs into multiple chunk queries", async () => {
  const { graph, querySpy } = makeGraph();
  const csv = ["name", "n0", "n1", "n2", "n3", "n4"].join("\n");

  const result = await executeCsvIngestion(graph, csv, "CREATE (:P {n: row.name})", {
    chunkSize: 2,
  });

  assert.deepEqual(result, { processedRows: 5, chunks: 3 });
  assert.equal(querySpy.mock.callCount(), 3);
});

test("executeCsvIngestion applies the transformRow hook before binding params", async () => {
  const { graph, querySpy } = makeGraph();

  await executeCsvIngestion(graph, "age\n30", "CREATE (:P {age: row.age})", {
    transformRow: (row) => ({ age: Number(row.age) }),
  });

  assert.deepEqual(querySpy.mock.calls[0].arguments[1], {
    params: { rows: [{ index: 0, data: { age: 30 } }] },
  });
});

test("executeCsvIngestion runs no query and returns 0 for an empty CSV", async () => {
  const { graph, querySpy } = makeGraph();

  const result = await executeCsvIngestion(graph, "", "CREATE (:P {n: row.name})");

  assert.deepEqual(result, { processedRows: 0, chunks: 0 });
  assert.equal(querySpy.mock.callCount(), 0);
});

test("executeCsvIngestion rejects a multi-statement body before running anything", async () => {
  const { graph, querySpy } = makeGraph();

  await assert.rejects(
    () => executeCsvIngestion(graph, "n\n1", "CREATE (:A); CREATE (:B)"),
    /must be a single Cypher statement/
  );
  assert.equal(querySpy.mock.callCount(), 0);
});

test("executeCsvIngestion uses the normalized statement (drops a trailing comment/semicolon)", async () => {
  const { graph, querySpy } = makeGraph();

  await executeCsvIngestion(graph, "n\n1", "CREATE (:A {n: row.n}); // trailing");

  assert.match(
    querySpy.mock.calls[0].arguments[0] as string,
    /AS row\nCREATE \(:A \{n: row\.n\}\)$/
  );
});

test("executeCsvIngestion rejects an empty/comment-only body", async () => {
  const { graph, querySpy } = makeGraph();

  await assert.rejects(
    () => executeCsvIngestion(graph, "n\n1", "// just a comment"),
    /CSV query is empty/
  );
  assert.equal(querySpy.mock.callCount(), 0);
});

test("executeCsvIngestion annotates failures with the failing chunk's row range", async () => {
  const { graph } = makeGraph(async () => {
    throw new Error("boom");
  });

  await assert.rejects(
    () => executeCsvIngestion(graph, "n\nA\nB\nC", "CREATE (:P {n: row.name})", { chunkSize: 2 }),
    /Failed to process CSV rows 1-2: boom/
  );
});

test("executeCsvIngestion rejects CSV headers that are not valid identifiers", async () => {
  const { graph, querySpy } = makeGraph();

  await assert.rejects(
    () => executeCsvIngestion(graph, "first name\nAlice", "CREATE (:P {n: row.name})"),
    /CSV column "first name" is not a valid identifier/
  );
  assert.equal(querySpy.mock.callCount(), 0);
});

test("executeCsvIngestion annotates transformRow errors with the row number", async () => {
  const { graph, querySpy } = makeGraph();

  await assert.rejects(
    () =>
      executeCsvIngestion(graph, "n\nA\nB", "CREATE (:P {n: row.n})", {
        transformRow: (row) => {
          if (row.n === "B") throw new Error('Column "n": bad');
          return row;
        },
      }),
    /Failed to process CSV row 2: Column "n": bad/
  );
  assert.equal(querySpy.mock.callCount(), 0);
});

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
