import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { findFunctionLine } from "./functionNavigation.ts";

describe("findFunctionLine", () => {
  const source = [
    "function alpha() { return 1; }",
    "",
    "const beta = () => 2;",
    "const gamma = async function () { return 3; };",
    "const o = { delta: function () { return 4; } };",
  ].join("\n");

  it("finds a named function declaration", () => {
    assert.equal(findFunctionLine(source, "alpha"), 1);
  });

  it("finds an arrow-function assignment", () => {
    assert.equal(findFunctionLine(source, "beta"), 3);
  });

  it("finds an object function assignment", () => {
    assert.equal(findFunctionLine(source, "delta"), 5);
  });

  it("returns null when function does not exist", () => {
    assert.equal(findFunctionLine(source, "missing"), null);
  });
});
