import test from "node:test";
import assert from "node:assert/strict";
import { parseCsvRows, splitCypherStatements } from "./upload-utils.ts";

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
