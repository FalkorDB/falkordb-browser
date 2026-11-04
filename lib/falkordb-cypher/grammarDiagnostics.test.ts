import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SYNTAX_ERROR_HINT } from "../cypherErrors.ts";
import { grammarErrorsToDiagnostics, prettifyGrammarMessage } from "./grammarDiagnostics.ts";
import { lint } from "./linter.ts";

describe("prettifyGrammarMessage", () => {
  it("normalizes mismatched/extraneous input into Unexpected", () => {
    assert.equal(prettifyGrammarMessage("mismatched input 'RETsURN' expecting RETURN"), "Unexpected 'RETsURN'");
    assert.equal(prettifyGrammarMessage("extraneous input 'X' expecting EOF"), "Unexpected 'X'");
  });

  it("normalizes no-viable-alternative and EOF messages", () => {
    assert.equal(prettifyGrammarMessage("no viable alternative at input '<EOF>'"), "Unexpected end of query");
  });

  it("normalizes missing token and invalid-token messages", () => {
    assert.equal(prettifyGrammarMessage("missing ')' at 'RETURN'"), "Missing ')' before 'RETURN'");
    assert.equal(prettifyGrammarMessage("token recognition error at: '@'"), "Invalid token '@'");
  });
});

describe("grammarErrorsToDiagnostics", () => {
  it("adds syntax hint and stable syntax code", () => {
    const diagnostics = grammarErrorsToDiagnostics("MATCH (n) RETsURN n", [
      {
        message: "mismatched input 'RETsURN' expecting RETURN",
        startLineNumber: 1,
        startColumn: 11,
        endLineNumber: 1,
        endColumn: 12,
      },
    ]);

    assert.equal(diagnostics.length, 1);
    assert.equal(diagnostics[0].code, "syntax");
    assert.equal(diagnostics[0].severity, "error");
    assert.equal(diagnostics[0].hint, SYNTAX_ERROR_HINT);
    assert.equal(diagnostics[0].message, "Unexpected 'RETsURN'");
  });

  it("expands one-char ranges back to the previous word", () => {
    const diagnostics = grammarErrorsToDiagnostics("MATCH (n) LIM 100", [
      {
        message: "mismatched input '100' expecting LIMIT",
        startLineNumber: 1,
        startColumn: 14,
        endLineNumber: 1,
        endColumn: 15,
      },
    ]);

    assert.deepEqual([diagnostics[0].startColumn, diagnostics[0].endColumn], [11, 14]);
  });
});

describe("Cypher grammar compatibility (#2208)", () => {
  it("still reports syntax errors for invalid queries", () => {
    assert.notDeepEqual(lint("MATCH (n RETURN n"), []);
  });

  for (const query of ["MATCH (n) RETURN n {.name .age}", "MATCH (n) RETURN n {.name,}"]) {
    it(`rejects malformed map projection: ${query}`, () => {
      assert.notDeepEqual(lint(query), []);
    });
  }

  const validQueries = [
    "MATCH (n) WHERE exists(n.name) RETURN n",
    "CALL { MATCH (m) RETURN m } RETURN m",
    "MATCH (n) WHERE EXISTS { MATCH (n)-->(m) } RETURN n",
    "MATCH (n) RETURN n {.name}",
    "MATCH (n) RETURN n {.*}",
    "MATCH (n) RETURN n {.name} AS person",
    "MATCH (n) RETURN collect(n {.name})",
    "MATCH (n) RETURN collect(n {.name}) AS people",
    "MATCH (n) RETURN n {name: n.name, answer: 42}",
    "MATCH (n) WITH n, 42 AS answer RETURN n {.name, answer}",
    "MATCH (n) RETURN n {nested: n {.name}}",
    "CALL db.labels() YIELD label AS name WHERE name = 'Person' RETURN name",
    "MATCH (n) CALL db.labels() YIELD label AS name WHERE name = 'Person' RETURN n, name",
    "MATCH (n:Call) RETURN n",
    "MATCH (n) RETURN n.call",
    "MATCH (n:Yield) RETURN n.yield",
    "MATCH ()-[r:YIELD]->() RETURN r",
    "CREATE VECTOR INDEX FOR ()-[e:Call]->() ON (e.embedding) OPTIONS {dimension:3, similarityFunction:'euclidean'}",
  ];

  for (const query of validQueries) {
    it(`accepts ${query}`, () => {
      assert.deepEqual(lint(query), []);
    });
  }
});
