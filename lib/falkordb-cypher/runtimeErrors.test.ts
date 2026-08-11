import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyRuntimeError } from "./runtimeErrors.ts";

describe("classifyRuntimeError", () => {
  it("returns null on success", () => {
    assert.equal(classifyRuntimeError(""), null);
    assert.equal(classifyRuntimeError(undefined), null);
  });

  it("classifies timeouts and resource limits", () => {
    assert.equal(classifyRuntimeError("Query timed out")?.kind, "timeout");
    assert.equal(classifyRuntimeError("Resultset size limit reached")?.kind, "resourceLimit");
  });

  it("separates a violated constraint from a missing one", () => {
    const violation = classifyRuntimeError("unique constraint violation on node of type Person");
    assert.equal(violation?.kind, "constraintViolation");
    assert.match(violation!.message, /violates a constraint/);

    const missing = classifyRuntimeError("Unable to create index: no such index");
    assert.equal(missing?.kind, "missingConstraint");
  });

  // Every alternative of the constraint-violation matcher must win over the
  // `missingConstraint` matcher that follows it, so each one is pinned here.
  const violations = [
    "unique constraint violation on node of type Person",
    "Node violates a unique constraint on :Person(id)",
    "Attribute 'name' is already indexed",
    "duplicate key value for :Person(id)",
  ];

  violations.forEach((raw) => {
    it(`classifies a constraint violation: ${raw}`, () => {
      assert.equal(classifyRuntimeError(raw)?.kind, "constraintViolation");
    });
  });

  it("falls back to unknown while keeping the raw text", () => {
    const error = classifyRuntimeError("something else broke");
    assert.equal(error?.kind, "unknown");
    assert.equal(error?.raw, "something else broke");
  });
});
