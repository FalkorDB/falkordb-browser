import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getCypherErrorHint } from "./cypherErrors.ts";

// Frozen sample strings: the FalkorDB error templates from src/errors/error_msgs.h
// rendered with representative substitutions. These are NOT live server output, so
// the test never depends on a running server build.
describe("getCypherErrorHint — recognized FalkorDB errors", () => {
  const cases: Array<{ message: string; id: string; needle: string }> = [
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
  ];

  cases.forEach(({ message, id, needle }) => {
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
