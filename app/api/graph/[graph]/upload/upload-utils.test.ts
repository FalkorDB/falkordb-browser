import test, { mock } from "node:test";
import assert from "node:assert/strict";
import type { Graph } from "falkordb";
import {
  parseCsvRows,
  splitCypherStatements,
  validateUploadInput,
  executeCsvIngestion,
  executeCypherBatch,
} from "./upload-utils.ts";

function makeGraph(
  impl?: (query: string, options?: unknown) => Promise<unknown>
) {
  const querySpy = mock.fn(impl ?? (async () => ({ data: [] })));
  const graph = { query: querySpy } as unknown as Graph;
  return { graph, querySpy };
}

test("parseCsvRows parses headers and values", () => {
  const rows = parseCsvRows("name,age\nAlice,30\nBob,41");

  assert.deepEqual(rows, [
    { name: "Alice", age: "30" },
    { name: "Bob", age: "41" },
  ]);
});

test("parseCsvRows supports quoted values and escaped quotes", () => {
  const rows = parseCsvRows("name,notes\n\"Alice, Jr\",\"He said \"\"hello\"\"\"");

  assert.deepEqual(rows, [{ name: "Alice, Jr", notes: "He said \"hello\"" }]);
});

test("parseCsvRows creates fallback header names for empty columns", () => {
  const rows = parseCsvRows("name,\nAlice,1");

  assert.deepEqual(rows, [{ name: "Alice", column2: "1" }]);
});

test("splitCypherStatements splits by semicolon and ignores semicolons in strings", () => {
  const statements = splitCypherStatements(`
CREATE (:Person {name: "A;B"});
MATCH (n) WHERE n.note = 'x;y' RETURN n;
`);

  assert.deepEqual(statements, [
    "CREATE (:Person {name: \"A;B\"})",
    "MATCH (n) WHERE n.note = 'x;y' RETURN n",
  ]);
});

test("splitCypherStatements ignores empty statements", () => {
  const statements = splitCypherStatements("CREATE (:A); ;\n;MATCH (n) RETURN n;");

  assert.deepEqual(statements, ["CREATE (:A)", "MATCH (n) RETURN n"]);
});

test("splitCypherStatements returns a single statement when there is no trailing semicolon", () => {
  const statements = splitCypherStatements("MATCH (n) RETURN n");

  assert.deepEqual(statements, ["MATCH (n) RETURN n"]);
});

test("splitCypherStatements returns empty array for blank input", () => {
  assert.deepEqual(splitCypherStatements(""), []);
  assert.deepEqual(splitCypherStatements("   \n  "), []);
});

test("splitCypherStatements ignores semicolons inside backtick-quoted identifiers", () => {
  const statements = splitCypherStatements("MATCH (n:`weird;label`) RETURN n;");

  assert.deepEqual(statements, ["MATCH (n:`weird;label`) RETURN n"]);
});

test("parseCsvRows returns empty array for empty input", () => {
  assert.deepEqual(parseCsvRows(""), []);
});

test("parseCsvRows returns empty array for whitespace-only input", () => {
  assert.deepEqual(parseCsvRows("\n\n"), []);
});

test("parseCsvRows returns empty array when there are only headers and no data rows", () => {
  assert.deepEqual(parseCsvRows("name,age"), []);
});

test("parseCsvRows handles CRLF line endings", () => {
  const rows = parseCsvRows("name,age\r\nAlice,30\r\nBob,41");

  assert.deepEqual(rows, [
    { name: "Alice", age: "30" },
    { name: "Bob", age: "41" },
  ]);
});

// ---------------------------------------------------------------------------
// parseCsvRows — additional edge cases
// ---------------------------------------------------------------------------

test("parseCsvRows preserves newlines inside quoted fields", () => {
  const rows = parseCsvRows('name,note\n"multi\nline",ok');

  assert.deepEqual(rows, [{ name: "multi\nline", note: "ok" }]);
});

test("parseCsvRows fills missing trailing columns with empty strings", () => {
  const rows = parseCsvRows("a,b,c\n1,2");

  assert.deepEqual(rows, [{ a: "1", b: "2", c: "" }]);
});

test("parseCsvRows ignores extra columns beyond the header count", () => {
  const rows = parseCsvRows("a,b\n1,2,3");

  assert.deepEqual(rows, [{ a: "1", b: "2" }]);
});

test("parseCsvRows trims surrounding whitespace from header names", () => {
  const rows = parseCsvRows(" name , age \nAlice,30");

  assert.deepEqual(rows, [{ name: "Alice", age: "30" }]);
});

// ---------------------------------------------------------------------------
// splitCypherStatements — comment handling
// ---------------------------------------------------------------------------

test("splitCypherStatements ignores line comments and their semicolons", () => {
  const statements = splitCypherStatements("CREATE (:A); // trailing; comment\nCREATE (:B);");

  assert.deepEqual(statements, ["CREATE (:A)", "CREATE (:B)"]);
});

test("splitCypherStatements ignores a full-line comment between statements", () => {
  const statements = splitCypherStatements("CREATE (:A);\n// just a comment;\nCREATE (:B);");

  assert.deepEqual(statements, ["CREATE (:A)", "CREATE (:B)"]);
});

test("splitCypherStatements ignores block comments and their semicolons", () => {
  const statements = splitCypherStatements("CREATE (:A) /* a ; b */ ;CREATE (:B)");

  assert.deepEqual(statements, ["CREATE (:A)", "CREATE (:B)"]);
});

test("splitCypherStatements keeps // sequences inside string literals", () => {
  const statements = splitCypherStatements(
    "MATCH (n) WHERE n.url = 'http://example.com' RETURN n;"
  );

  assert.deepEqual(statements, ["MATCH (n) WHERE n.url = 'http://example.com' RETURN n"]);
});

test("splitCypherStatements keeps /* sequences inside string literals", () => {
  const statements = splitCypherStatements("RETURN '/* not a comment */' AS s;");

  assert.deepEqual(statements, ["RETURN '/* not a comment */' AS s"]);
});

// ---------------------------------------------------------------------------
// validateUploadInput
// ---------------------------------------------------------------------------

test("validateUploadInput requires mode and fileId", () => {
  for (const input of [{}, { mode: "csv" }, { fileId: "x" }]) {
    const result = validateUploadInput(input);
    if (result.ok) assert.fail("expected validation failure");
    assert.equal(result.status, 400);
    assert.equal(result.message, "mode and fileId are required.");
  }
});

test("validateUploadInput accepts rdb restore with a .dump file", () => {
  const result = validateUploadInput({ mode: "rdb", fileId: "x", extension: ".dump" });
  if (!result.ok) assert.fail("expected .dump restore to be valid");
  assert.equal(result.mode, "rdb");
});

test("validateUploadInput rejects rdb restore with a .rdb file", () => {
  const result = validateUploadInput({ mode: "rdb", fileId: "x", extension: ".rdb" });
  if (result.ok) assert.fail("expected .rdb to be rejected (RESTORE needs a DUMP payload)");
  assert.equal(result.status, 400);
  assert.match(result.message, /Restore requires a \.dump file/);
});

test("validateUploadInput rejects rdb restore with an unsupported extension", () => {
  const result = validateUploadInput({ mode: "rdb", fileId: "x", extension: ".csv" });
  if (result.ok) assert.fail("expected validation failure");
  assert.equal(result.status, 400);
  assert.match(result.message, /Restore requires a \.dump file/);
});

test("validateUploadInput accepts csv with a .csv file and a query", () => {
  const result = validateUploadInput({
    mode: "csv",
    fileId: "x",
    extension: ".csv",
    query: "CREATE (:P {n: $row.name})",
  });
  if (!result.ok) assert.fail("expected csv upload to be valid");
  assert.equal(result.mode, "csv");
});

test("validateUploadInput rejects csv with a non-csv extension", () => {
  const result = validateUploadInput({ mode: "csv", fileId: "x", extension: ".txt", query: "RETURN 1" });
  if (result.ok) assert.fail("expected validation failure");
  assert.equal(result.status, 400);
  assert.match(result.message, /CSV upload requires a \.csv file/);
});

test("validateUploadInput rejects csv without a (non-blank) query", () => {
  for (const query of [undefined, "", "   "]) {
    const result = validateUploadInput({ mode: "csv", fileId: "x", extension: ".csv", query });
    if (result.ok) assert.fail("expected validation failure");
    assert.equal(result.status, 400);
    assert.match(result.message, /CSV upload requires a query/);
  }
});

test("validateUploadInput accepts cypher with .txt, .cypher, or .cql", () => {
  for (const extension of [".txt", ".cypher", ".cql"]) {
    const result = validateUploadInput({ mode: "cypher", fileId: "x", extension });
    if (!result.ok) assert.fail(`expected cypher ${extension} to be valid`);
    assert.equal(result.mode, "cypher");
  }
});

test("validateUploadInput rejects cypher with an unsupported extension", () => {
  const result = validateUploadInput({ mode: "cypher", fileId: "x", extension: ".csv" });
  if (result.ok) assert.fail("expected validation failure");
  assert.equal(result.status, 400);
  assert.match(result.message, /Cypher upload requires a \.txt, \.cypher, or \.cql file/);
});

test("validateUploadInput rejects an unknown mode", () => {
  const result = validateUploadInput({ mode: "xml", fileId: "x", extension: ".xml" });
  if (result.ok) assert.fail("expected validation failure");
  assert.equal(result.status, 400);
  assert.equal(result.message, "Invalid upload mode.");
});

// ---------------------------------------------------------------------------
// executeCsvIngestion
// ---------------------------------------------------------------------------

test("executeCsvIngestion runs the query once per row with row and index params", async () => {
  const { graph, querySpy } = makeGraph();
  const query = "CREATE (:Person {name: $row.name})";

  const count = await executeCsvIngestion(graph, "name,age\nAlice,30\nBob,41", query);

  assert.equal(count, 2);
  assert.equal(querySpy.mock.callCount(), 2);
  assert.equal(querySpy.mock.calls[0].arguments[0], query);
  assert.deepEqual(querySpy.mock.calls[0].arguments[1], {
    params: { row: { name: "Alice", age: "30" }, index: 0 },
  });
  assert.deepEqual(querySpy.mock.calls[1].arguments[1], {
    params: { row: { name: "Bob", age: "41" }, index: 1 },
  });
});

test("executeCsvIngestion runs no query and returns 0 for an empty CSV", async () => {
  const { graph, querySpy } = makeGraph();

  const count = await executeCsvIngestion(graph, "", "CREATE (:P)");

  assert.equal(count, 0);
  assert.equal(querySpy.mock.callCount(), 0);
});

test("executeCsvIngestion annotates failures with the row number and stops", async () => {
  let calls = 0;
  const { graph, querySpy } = makeGraph(async () => {
    calls += 1;
    if (calls === 2) throw new Error("boom");
    return { data: [] };
  });

  await assert.rejects(
    () => executeCsvIngestion(graph, "name\nA\nB\nC", "CREATE (:P {n: $row.name})"),
    /Failed to process CSV row 2: boom/
  );
  assert.equal(querySpy.mock.callCount(), 2);
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

test("splitCypherStatements replaces block comments with a boundary (no token merge)", () => {
  assert.deepEqual(splitCypherStatements("RETURN 1/*x*/2;"), ["RETURN 1 2"]);
  assert.deepEqual(splitCypherStatements("MATCH (a)/*c*/RETURN a;"), ["MATCH (a) RETURN a"]);
});

test("splitCypherStatements retains an unterminated block comment so it surfaces downstream", () => {
  assert.deepEqual(splitCypherStatements("CREATE (:A); /* oops"), ["CREATE (:A)", "/* oops"]);
});
