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
