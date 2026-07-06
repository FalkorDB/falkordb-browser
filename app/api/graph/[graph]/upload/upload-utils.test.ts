import test, { mock } from "node:test";
import assert from "node:assert/strict";
import type { Graph } from "falkordb";
import {
  parseCsvRows,
  splitCypherStatements,
  validateUploadInput,
  executeCsvIngestion,
  executeCypherBatch,
  buildBatchCsvQuery,
  chunkCsvItems,
  coerceValue,
  coerceRow,
  escapeCypherIdentifier,
  generateCsvQuery,
  type CsvRowItem,
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

test("validateUploadInput accepts dump restore with a .dump file", () => {
  const result = validateUploadInput({ mode: "dump", fileId: "x", extension: ".dump" });
  if (!result.ok) assert.fail("expected .dump restore to be valid");
  assert.equal(result.mode, "dump");
});

test("validateUploadInput rejects dump restore with a .rdb file", () => {
  const result = validateUploadInput({ mode: "dump", fileId: "x", extension: ".rdb" });
  if (result.ok) assert.fail("expected .rdb to be rejected (RESTORE needs a DUMP payload)");
  assert.equal(result.status, 400);
  assert.match(result.message, /Restore requires a \.dump file/);
});

test("validateUploadInput rejects dump restore with an unsupported extension", () => {
  const result = validateUploadInput({ mode: "dump", fileId: "x", extension: ".csv" });
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
// buildBatchCsvQuery
// ---------------------------------------------------------------------------

test("buildBatchCsvQuery wraps the body in an UNWIND exposing row and index", () => {
  assert.equal(
    buildBatchCsvQuery("CREATE (:Person {name: row.name})"),
    "UNWIND $rows AS __r WITH __r.index AS index, __r.data AS row\nCREATE (:Person {name: row.name})"
  );
});

test("buildBatchCsvQuery trims and strips a trailing semicolon", () => {
  assert.match(buildBatchCsvQuery("  CREATE (:A) ;  "), /AS row\nCREATE \(:A\)$/);
});

// ---------------------------------------------------------------------------
// chunkCsvItems
// ---------------------------------------------------------------------------

function makeItems(n: number): CsvRowItem[] {
  return Array.from({ length: n }, (_, i) => ({ index: i, data: { v: String(i) } }));
}

test("chunkCsvItems splits by row count", () => {
  const chunks = chunkCsvItems(makeItems(5), 2, 1_000_000);
  assert.deepEqual(chunks.map((c) => c.length), [2, 2, 1]);
  assert.deepEqual(chunks[2][0], { index: 4, data: { v: "4" } });
});

test("chunkCsvItems returns a single chunk when everything fits", () => {
  const chunks = chunkCsvItems(makeItems(3), 1000, 1_000_000);
  assert.equal(chunks.length, 1);
  assert.equal(chunks[0].length, 3);
});

test("chunkCsvItems splits by approximate byte size for wide rows", () => {
  const wide: CsvRowItem[] = Array.from({ length: 4 }, (_, i) => ({
    index: i,
    data: { blob: "x".repeat(100) },
  }));
  const chunks = chunkCsvItems(wide, 1000, 80);
  assert.equal(chunks.length, 4);
});

test("chunkCsvItems returns no chunks for an empty list", () => {
  assert.deepEqual(chunkCsvItems([], 1000, 1000), []);
});

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

test("splitCypherStatements replaces block comments with a boundary (no token merge)", () => {
  assert.deepEqual(splitCypherStatements("RETURN 1/*x*/2;"), ["RETURN 1 2"]);
  assert.deepEqual(splitCypherStatements("MATCH (a)/*c*/RETURN a;"), ["MATCH (a) RETURN a"]);
});

test("splitCypherStatements retains an unterminated block comment so it surfaces downstream", () => {
  assert.deepEqual(splitCypherStatements("CREATE (:A); /* oops"), ["CREATE (:A)", "/* oops"]);
});

// ---------------------------------------------------------------------------
// coerceValue / coerceRow
// ---------------------------------------------------------------------------

test("coerceValue returns strings unchanged", () => {
  assert.equal(coerceValue("hello", "string"), "hello");
  assert.equal(coerceValue("", "string"), "");
});

test("coerceValue parses integers and maps empty to null", () => {
  assert.equal(coerceValue("42", "integer"), 42);
  assert.equal(coerceValue("-7", "integer"), -7);
  assert.equal(coerceValue("  ", "integer"), null);
});

test("coerceValue rejects non-integers", () => {
  assert.throws(() => coerceValue("4.5", "integer"), /not an integer/);
  assert.throws(() => coerceValue("abc", "integer"), /not an integer/);
});

test("coerceValue rejects integers outside the safe range", () => {
  assert.throws(() => coerceValue("9007199254740993", "integer"), /safe integer range/);
});

test("coerceValue parses floats and rejects invalid", () => {
  assert.equal(coerceValue("3.14", "float"), 3.14);
  assert.equal(coerceValue("", "float"), null);
  assert.throws(() => coerceValue("x", "float"), /not a number/);
});

test("coerceValue parses booleans (true/false/1/0, case-insensitive)", () => {
  assert.equal(coerceValue("true", "boolean"), true);
  assert.equal(coerceValue("FALSE", "boolean"), false);
  assert.equal(coerceValue("1", "boolean"), true);
  assert.equal(coerceValue("0", "boolean"), false);
  assert.equal(coerceValue("", "boolean"), null);
  assert.throws(() => coerceValue("maybe", "boolean"), /not a boolean/);
});

test("coerceRow applies per-column types and defaults unlisted columns to string", () => {
  assert.deepEqual(
    coerceRow({ name: "Alice", age: "30", vip: "true" }, { age: "integer", vip: "boolean" }),
    { name: "Alice", age: 30, vip: true }
  );
});

test("coerceRow annotates conversion errors with the column name", () => {
  assert.throws(() => coerceRow({ age: "old" }, { age: "integer" }), /Column "age": .*not an integer/);
});

// ---------------------------------------------------------------------------
// escapeCypherIdentifier / generateCsvQuery
// ---------------------------------------------------------------------------

test("escapeCypherIdentifier leaves valid identifiers bare", () => {
  assert.equal(escapeCypherIdentifier("name"), "name");
  assert.equal(escapeCypherIdentifier("_x1"), "_x1");
});

test("escapeCypherIdentifier backtick-quotes and doubles embedded backticks", () => {
  assert.equal(escapeCypherIdentifier("first name"), "`first name`");
  assert.equal(escapeCypherIdentifier("a`b"), "`a``b`");
  assert.equal(escapeCypherIdentifier("1col"), "`1col`");
});

test("generateCsvQuery builds a CREATE with escaped label and props", () => {
  assert.equal(
    generateCsvQuery("Person", ["name", "age"]),
    "CREATE (:Person {name: row.name, age: row.age})"
  );
});

test("generateCsvQuery escapes unsafe headers/label so they cannot inject Cypher", () => {
  const q = generateCsvQuery("La bel", ["first name", "x`) DETACH DELETE n //"]);
  assert.match(q, /^CREATE \(:`La bel` \{/);
  assert.ok(q.includes("`first name`: row.`first name`"));
  assert.ok(q.includes("`x``) DETACH DELETE n //`: row.`x``) DETACH DELETE n //`"));
});

test("generateCsvQuery defaults the label and handles no columns", () => {
  assert.equal(generateCsvQuery("", []), "CREATE (:Row)");
  assert.equal(generateCsvQuery("  ", ["a"]), "CREATE (:Row {a: row.a})");
});

test("parseCsvRows rejects duplicate column headers", () => {
  assert.throws(() => parseCsvRows("name,name\nA,B"), /Duplicate CSV column "name"/);
});

test("splitCypherStatements treats a backslash outside quotes as a literal char", () => {
  assert.deepEqual(
    splitCypherStatements("CREATE (n)\\;MATCH (n) RETURN n;"),
    ["CREATE (n)\\", "MATCH (n) RETURN n"]
  );
});

test("parseCsvRows stores a __proto__ header as an own property (no prototype pollution)", () => {
  const rows = parseCsvRows("__proto__,name\nx,Alice");
  assert.equal(rows.length, 1);
  assert.ok(Object.prototype.hasOwnProperty.call(rows[0], "__proto__"));
  assert.equal(rows[0]["__proto__"], "x");
  assert.equal(rows[0].name, "Alice");
  assert.equal(Object.getPrototypeOf(rows[0]), Object.prototype);
});

test("coerceRow stores a __proto__ column as an own property", () => {
  const [row] = parseCsvRows("__proto__,age\n5,30");
  const coerced = coerceRow(row, { age: "integer" });
  assert.ok(Object.prototype.hasOwnProperty.call(coerced, "__proto__"));
  assert.equal(coerced["__proto__"], "5");
  assert.equal(coerced.age, 30);
});
