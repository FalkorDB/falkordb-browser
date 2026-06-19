import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getCypherErrorHint,
  parseSyntaxError,
  SYNTAX_ERROR_HINT,
  CYPHER_ERROR_IDS,
} from "./cypherErrors.ts";
import { DRIFT_CASES, NOT_DRIFT_TESTABLE } from "./cypherErrorDriftCases.ts";

// Frozen sample strings: the FalkorDB error templates from src/errors/error_msgs.h
// rendered with representative substitutions. These are NOT live server output, so
// the test never depends on a running server build.
const RECOGNIZED_SAMPLES: Array<{ message: string; id: string; needle: string }> = [
    { message: "'x' not defined", id: "undefined-variable", needle: "in scope" },
    { message: "Unknown function 'foo'", id: "unknown-function", needle: "function name" },
    { message: "Type mismatch: expected Integer but was String", id: "type-mismatch", needle: "toInteger" },
    { message: "Division by zero", id: "division-by-zero", needle: "denominator" },
    { message: "Can't use aggregate functions inside of aggregate functions.", id: "nested-aggregation", needle: "separate WITH" },
    { message: "WITH clause projections must be aliased", id: "with-missing-alias", needle: "AS" },
    { message: "RETURN * is not allowed when there are no variables in scope", id: "return-star-no-vars", needle: "at least one variable" },
    { message: "Variable length path, maximum number of hops must be greater or equal to minimum number of hops.", id: "var-length-range", needle: "[*1..3]" },
    { message: "Only directed relationships are supported in CREATE", id: "create-directed-relationship", needle: "(a)-[:REL]->(b)" },
    { message: "Error: query with more than one statement is not supported.", id: "multiple-statements", needle: "single statement" },
    { message: "unique constraint violation on node of type Person", id: "unique-constraint", needle: "MERGE" },
    { message: "mandatory constraint violation: node with label Person missing property name", id: "mandatory-constraint", needle: "existence" },
    { message: "Procedure `db.idx.fulltext.queryNodes` is not registered", id: "procedure-not-registered", needle: "spelling" },
    { message: "Query timed out", id: "query-timed-out", needle: "timeout" },
    { message: "Query's mem consumption exceeded capacity", id: "mem-consumption", needle: "LIMIT" },
    { message: "Write queue is full: cannot accept additional write queries at this time. Please retry later.", id: "write-queue-full", needle: "retry" },
    { message: "The bound variable 'n' can't be redeclared in a CREATE clause", id: "redeclared-variable", needle: "different name" },
    { message: "Error: Multiple result columns with the same name are not supported.", id: "duplicate-result-column", needle: "distinct alias" },
    { message: "The alias 'a' was specified for both a node and a relationship.", id: "same-alias-node-rel", needle: "Rename" },
    { message: "Cannot use the same relationship variable 'r' for multiple patterns.", id: "same-rel-var-multiple", needle: "own name" },
    { message: "All sub queries in a UNION must have the same column names.", id: "union-mismatched-returns", needle: "same column names" },
    { message: "Invalid combination of UNION and UNION ALL.", id: "union-combination", needle: "one or the other" },
    { message: "Query cannot conclude with MATCH (must be a RETURN clause, an update clause, a procedure call or a non-returning subquery)", id: "query-missing-return", needle: "must end with RETURN" },
    { message: "Unexpected clause following RETURN", id: "clause-after-return", needle: "Nothing can follow" },
    { message: "A WITH clause is required to introduce a MATCH clause after an OPTIONAL MATCH.", id: "missing-with-after-optional-match", needle: "OPTIONAL MATCH" },
    { message: "A WITH clause is required to introduce MATCH after an updating clause.", id: "missing-with-after-update", needle: "add a WITH" },
    { message: "DELETE can only be called on nodes, paths and relationships", id: "delete-invalid-target", needle: "REMOVE" },
    { message: "FalkorDB does not currently support non-alias references on the left-hand side of SET expressions", id: "set-non-alias-lhs", needle: "left side of SET" },
    { message: "Error: Only updating clauses may reside in FOREACH", id: "foreach-non-updating", needle: "updating clauses" },
    { message: "Property values can only be of primitive types or arrays of primitive types", id: "invalid-property-value", needle: "primitives" },
    { message: "WITH imports in CALL {} must consist of only simple references to outside variables", id: "call-import-simple-refs", needle: "plain variables" },
    { message: "Missing parameters", id: "missing-parameters", needle: "parameter" },
    { message: "Integer overflow '999999999999999999999999999999'", id: "integer-overflow", needle: "64-bit" },
  ];

describe("getCypherErrorHint — recognized FalkorDB errors", () => {
  RECOGNIZED_SAMPLES.forEach(({ message, id, needle }) => {
    it(`recognizes ${id}`, () => {
      const result = getCypherErrorHint(message);
      assert.ok(result, `expected a hint for ${JSON.stringify(message)}`);
      assert.equal(result.id, id);
      assert.ok(
        result.hint.includes(needle),
        `hint for ${id} (${JSON.stringify(result.hint)}) should mention ${JSON.stringify(needle)}`
      );
    });
  });
});

describe("getCypherErrorHint — unrecognized messages return undefined", () => {
  // The raw message is a mixed bucket: connection/auth/Redis/API/chat errors must
  // NOT false-positive into a Cypher hint.
  const negatives = [
    "",
    "Request failed",
    "Network or server error",
    "ECONNREFUSED 127.0.0.1:6379",
    "NOAUTH Authentication required.",
    "WRONGPASS invalid username-password pair",
    "READONLY You can't write against a read only replica.",
    "Graph my-graph already exists",
    "An unexpected error occurred. Please try again.",
    "Cannot connect to Ollama",
    "Invalid API key",
  ];

  negatives.forEach((message) => {
    it(`returns undefined for ${JSON.stringify(message)}`, () => {
      assert.equal(getCypherErrorHint(message), undefined);
    });
  });
});

describe("getCypherErrorHint — hints never echo the underlying message", () => {
  it("does not interpolate the variable name into the hint", () => {
    const result = getCypherErrorHint("'super_secret_var' not defined");
    assert.ok(result);
    assert.ok(!result.hint.includes("super_secret_var"));
  });
});

describe("getCypherErrorHint — disambiguates near-miss wordings", () => {
  // The two "WITH clause is required" variants differ only by their trailing phrase;
  // each must resolve to its own id (and never shadow the other) regardless of order.
  it("introduce-after-OPTIONAL-MATCH resolves to the optional-match id", () => {
    const r = getCypherErrorHint(
      "A WITH clause is required to introduce a MATCH clause after an OPTIONAL MATCH."
    );
    assert.equal(r?.id, "missing-with-after-optional-match");
  });

  it("introduce-after-updating-clause resolves to the update id", () => {
    const r = getCypherErrorHint(
      "A WITH clause is required to introduce MATCH after an updating clause."
    );
    assert.equal(r?.id, "missing-with-after-update");
  });

  it("a returning-subquery variant still resolves to query-missing-return", () => {
    const r = getCypherErrorHint(
      "Query cannot conclude with a returning subquery (must be a RETURN clause, an update clause, a procedure call or a non-returning subquery)"
    );
    assert.equal(r?.id, "query-missing-return");
  });
});

describe("parseSyntaxError", () => {
  it("parses message, position, and context from the FalkorDB parser format", () => {
    const raw =
      "errMsg: Invalid input 'X' line: 2, column: 5, offset: 9 errCtx: MATCH (X errCtxOffset: 7";
    const info = parseSyntaxError(raw);
    assert.ok(info);
    assert.equal(info.message, "Invalid input 'X'");
    assert.equal(info.line, 2);
    assert.equal(info.column, 5);
    assert.equal(info.context, "MATCH (X");
    assert.equal(info.contextOffset, 7);
  });

  it("tolerates a multiline message body", () => {
    const raw =
      "errMsg: line one\nline two line: 1, column: 1, offset: 0 errCtx: ctx errCtxOffset: 0";
    const info = parseSyntaxError(raw);
    assert.ok(info);
    assert.equal(info.message, "line one\nline two");
  });

  it("clamps zero line/column up to 1", () => {
    const raw = "errMsg: oops line: 0, column: 0, offset: 0 errCtx: c errCtxOffset: 0";
    const info = parseSyntaxError(raw);
    assert.ok(info);
    assert.equal(info.line, 1);
    assert.equal(info.column, 1);
  });

  it("returns null when the string is not a parser error", () => {
    assert.equal(parseSyntaxError("'x' not defined"), null);
    assert.equal(parseSyntaxError(""), null);
  });
});

describe("SYNTAX_ERROR_HINT", () => {
  it("is a non-empty, generic tip", () => {
    assert.equal(typeof SYNTAX_ERROR_HINT, "string");
    assert.ok(SYNTAX_ERROR_HINT.length > 0);
  });
});

// Completeness guard: every catalog id must be covered by the drift fixtures — either
// as a runnable DRIFT_CASE or as a documented NOT_DRIFT_TESTABLE exception. This keeps
// lib/cypherErrorDriftCases.ts (and therefore the live smoke test) in lockstep with the
// catalog, so a newly added error can't silently ship without drift coverage.
describe("drift-case completeness", () => {
  const driftIds = DRIFT_CASES.map((c) => c.id);
  const driftIdSet = new Set(driftIds);
  const notTestable = new Set(Object.keys(NOT_DRIFT_TESTABLE));
  const catalogIds = new Set(CYPHER_ERROR_IDS);

  it("every catalog id is either a drift case or marked not-testable", () => {
    const uncovered = CYPHER_ERROR_IDS.filter(
      (id) => !driftIdSet.has(id) && !notTestable.has(id)
    );
    assert.deepEqual(uncovered, [], `catalog ids missing drift coverage: ${uncovered.join(", ")}`);
  });

  it("no id is both a drift case and not-testable", () => {
    const overlap = [...driftIdSet].filter((id) => notTestable.has(id));
    assert.deepEqual(overlap, [], `ids in both lists: ${overlap.join(", ")}`);
  });

  it("drift cases and not-testable entries reference only real catalog ids", () => {
    const stray = [...driftIds, ...notTestable].filter((id) => !catalogIds.has(id));
    assert.deepEqual(stray, [], `unknown ids referenced: ${stray.join(", ")}`);
  });

  it("has no duplicate drift-case ids", () => {
    assert.equal(driftIds.length, driftIdSet.size);
  });

  it("every drift case agrees with the catalog on a frozen sample of its wording", () => {
    // Without a DB we can still verify the contract the smoke test checks live: for each
    // drift id, a frozen sample of that error must (a) match the drift's expectedMessage
    // and (b) resolve back to the same id via the catalog. This fails if the catalog regex
    // and the drift expectation ever disagree.
    const sampleById = new Map(RECOGNIZED_SAMPLES.map(({ id, message }) => [id, message]));
    DRIFT_CASES.forEach(({ id, expectedMessage }) => {
      const sample = sampleById.get(id);
      assert.ok(sample, `no frozen sample for drift id ${id}`);
      assert.match(sample, expectedMessage, `drift expectedMessage for ${id} doesn't match its frozen sample`);
      assert.equal(getCypherErrorHint(sample)?.id, id, `catalog doesn't resolve the frozen sample for ${id}`);
    });
  });
});
