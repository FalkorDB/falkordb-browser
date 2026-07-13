import test from "node:test";
import assert from "node:assert/strict";
import { splitCypherStatements } from "./graphUpload.ts";

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

test("splitCypherStatements replaces block comments with a boundary (no token merge)", () => {
  assert.deepEqual(splitCypherStatements("RETURN 1/*x*/2;"), ["RETURN 1 2"]);
  assert.deepEqual(splitCypherStatements("MATCH (a)/*c*/RETURN a;"), ["MATCH (a) RETURN a"]);
});

test("splitCypherStatements retains an unterminated block comment so it surfaces downstream", () => {
  assert.deepEqual(splitCypherStatements("CREATE (:A); /* oops"), ["CREATE (:A)", "/* oops"]);
});
