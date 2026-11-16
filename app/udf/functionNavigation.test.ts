import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { findFunctionLine, findFunctionLocation } from "./functionNavigation.ts";

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

  it("prefers a declaration over an earlier call site", () => {
    const withCallSite = ["alpha();", "function alpha() { return 1; }"].join("\n");
    assert.equal(findFunctionLine(withCallSite, "alpha"), 2);
  });

  it("prefers a bare-identifier arrow declaration over an earlier call site", () => {
    const withCallSite = ["beta(1);", "const beta = x => x + 1;"].join("\n");
    assert.equal(findFunctionLine(withCallSite, "beta"), 2);
  });

  it("prefers an async bare-identifier arrow declaration over an earlier call site", () => {
    const withCallSite = ["beta(1);", "const beta = async x => x + 1;"].join("\n");
    assert.equal(findFunctionLine(withCallSite, "beta"), 2);
  });

  it("finds an arrow declaration whose parameter list wraps", () => {
    const wrapped = ["const beta = (", "  a,", "  b", ") => a + b;"].join("\n");
    assert.equal(findFunctionLine(wrapped, "beta"), 1);
  });

  it("finds a wrapped arrow declaration whose parameters carry a call default", () => {
    const wrapped = ["beta(1);", "const beta = (", "  a = fallback(),", "  b", ") => a + b;"].join("\n");
    assert.equal(findFunctionLine(wrapped, "beta"), 2);
  });

  it("does not treat a wrapped nested call as the declaration", () => {
    const shadowed = ["const beta = (", "  fallback(1)", ");", "falkor.register('beta', impl);"].join("\n");
    assert.equal(findFunctionLine(shadowed, "beta"), 4);
  });

  it("finds an arrow declaration whose parameters carry a call default", () => {
    const withCallSite = ["beta(1);", "const beta = (a = fallback()) => a;"].join("\n");
    assert.equal(findFunctionLine(withCallSite, "beta"), 2);
  });

  it("does not treat a parenthesised expression as the declaration", () => {
    const shadowed = ["const beta = (1 + 2);", "falkor.register('beta', impl);"].join("\n");
    assert.equal(findFunctionLine(shadowed, "beta"), 2);
  });

  it("does not treat a wrapped parenthesised expression as the declaration", () => {
    const shadowed = ["const beta = (", "  1 + 2", ");", "falkor.register('beta', impl);"].join("\n");
    assert.equal(findFunctionLine(shadowed, "beta"), 4);
  });

  it("falls back to a registration entry", () => {
    const registered = ["const impl = () => 1;", "falkor.register('Echo', impl);"].join("\n");
    assert.equal(findFunctionLine(registered, "Echo"), 2);
  });

  it("ignores the library namespace on the listed name", () => {
    const registered = [
      "function ReturnInt       () { return 12; }",
      "falkor.register ('ReturnInt', ReturnInt);",
    ].join("\n");

    assert.equal(findFunctionLine(registered, "ReturnTypes.ReturnInt"), 1);
  });
});

describe("findFunctionLocation", () => {
  it("points at the function name, not the line start", () => {
    const source = ["// header", "  function alpha() { return 1; }"].join("\n");

    assert.deepEqual(findFunctionLocation(source, "alpha"), {
      lineNumber: 2,
      column: 12,
      length: 5,
    });
  });

  it("points at the registered name inside the quotes", () => {
    const source = "falkor.register('Echo', impl);";

    assert.deepEqual(findFunctionLocation(source, "Echo"), {
      lineNumber: 1,
      column: 18,
      length: 4,
    });
  });

  it("selects only the last segment of a namespaced name", () => {
    const source = "function alpha() { return 1; }";

    assert.deepEqual(findFunctionLocation(source, "MyLib.alpha"), {
      lineNumber: 1,
      column: 10,
      length: 5,
    });
  });

  it("returns null for empty input", () => {
    assert.equal(findFunctionLocation("", "alpha"), null);
    assert.equal(findFunctionLocation("function alpha() {}", ""), null);
    assert.equal(findFunctionLocation("function alpha() {}", "MyLib."), null);
  });
});

describe("findFunctionLine ranking and comments", () => {
  it("prefers the registration over an earlier call site", () => {
    assert.equal(findFunctionLine("Echo();\nfalkor.register('Echo', impl);", "lib.Echo"), 2);
  });

  it("ignores a declaration mentioned in a line comment", () => {
    assert.equal(findFunctionLine("// see function foo() below\n\nfunction foo() {}", "foo"), 3);
  });

  it("ignores a block comment spanning lines and keeps columns", () => {
    assert.deepEqual(findFunctionLocation("/* foo(\n */ const s = '//'; function foo() {}", "foo"), {
      lineNumber: 2,
      column: 30,
      length: 3,
    });
  });

  it("keeps a registration whose string holds comment markers", () => {
    assert.equal(findFunctionLine("// foo\nfalkor.register(\"foo\", x); // foo(", "foo"), 2);
  });

  it("does not let a quote in a regex literal swallow the next line", () => {
    assert.equal(findFunctionLine("const re = /'/; // foo(\nfunction foo() {}", "foo"), 2);
  });

  it("keeps template literals that span lines", () => {
    assert.equal(findFunctionLine("const t = `a\n// foo(\nb`;\nfoo();", "foo"), 2);
  });
});

describe("findFunctionLine unclosed parameter list", () => {
  it("does not treat a parameter list that never closes as a declaration", () => {
    assert.equal(findFunctionLine("const foo = (a,\n  b\nfoo;", "foo"), 1);
    assert.equal(findFunctionLine("const foo = (a,\n  b\nfoo(1);", "foo"), 3);
  });
});
