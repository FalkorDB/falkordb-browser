import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  levenshtein,
  closestMatch,
  extractVariableCandidates,
  suggestForError,
  setFunctionCandidates,
} from "./cypherSuggestions.ts";
import { udfFunctionNames, BUILTIN_FUNCTIONS } from "./cypherLang.ts";

describe("levenshtein", () => {
  it("returns the length of the other string when one is empty", () => {
    assert.equal(levenshtein("", "abc"), 3);
    assert.equal(levenshtein("abc", ""), 3);
  });
  it("is zero for equal strings", () => {
    assert.equal(levenshtein("count", "count"), 0);
  });
  it("counts substitutions, insertions and deletions", () => {
    assert.equal(levenshtein("lenght", "length"), 2);
    assert.equal(levenshtein("prsn", "person"), 2);
    assert.equal(levenshtein("kitten", "sitting"), 3);
  });
});

describe("closestMatch", () => {
  it("returns undefined for targets shorter than 3 chars", () => {
    assert.equal(closestMatch("ab", ["abc", "abd"]), undefined);
  });
  it("returns undefined when no candidate is close enough", () => {
    assert.equal(closestMatch("zzzzz", ["length", "collect"]), undefined);
  });
  it("returns undefined on an exact (case-insensitive) match", () => {
    assert.equal(closestMatch("Count", ["count"]), undefined);
  });
  it("matches within distance 1 for short names (maxLen <= 4)", () => {
    assert.equal(closestMatch("sgn", ["sign", "sin"]), "sign");
  });
  it("rejects distance 2 for short names (maxLen <= 4)", () => {
    assert.equal(closestMatch("min", ["max"]), undefined);
  });
  it("matches within distance 2 for longer names (maxLen > 4)", () => {
    assert.equal(closestMatch("lenght", ["length", "collect"]), "length");
  });
  it("prefers the smaller distance", () => {
    assert.equal(closestMatch("lenght", ["length", "lenghts"]), "lenghts");
  });
  it("breaks distance ties alphabetically", () => {
    assert.equal(closestMatch("abcd", ["abcf", "abce"]), "abce");
  });
});

describe("extractVariableCandidates", () => {
  it("captures node and relationship variables and aliases", () => {
    assert.deepEqual(
      extractVariableCandidates("MATCH (a)-[r]->(b) UNWIND [1] AS n RETURN n").sort(),
      ["a", "b", "n", "r"]
    );
  });
  it("excludes labels (after ':'), so a typo'd var matches the variable not the label", () => {
    assert.deepEqual(extractVariableCandidates("MATCH (person:Person) RETURN person"), ["person"]);
  });
  it("does not capture property keys (after '.') or function-namespace pieces", () => {
    const vars = extractVariableCandidates("RETURN vec.euclideanDistance(x), n.name");
    assert.ok(vars.includes("x"));
    assert.ok(!vars.includes("vec"));
    assert.ok(!vars.includes("euclideanDistance"));
    assert.ok(!vars.includes("name"));
  });
  it("ignores identifiers inside line comments", () => {
    assert.deepEqual(extractVariableCandidates("MATCH (a) // (fake)\nRETURN a"), ["a"]);
  });
  it("ignores identifiers inside block comments", () => {
    assert.deepEqual(extractVariableCandidates("/* (fake) */ MATCH (a) RETURN a"), ["a"]);
  });
  it("ignores identifiers inside single- and double-quoted strings (incl. escapes)", () => {
    assert.deepEqual(extractVariableCandidates("MATCH (a) WHERE a.x = 'it\\'s (fake)'"), ["a"]);
    assert.deepEqual(extractVariableCandidates('MATCH (a) WHERE a.x = "(fake)"'), ["a"]);
  });
  it("excludes keyword-like captures (e.g. (NOT x))", () => {
    assert.deepEqual(extractVariableCandidates("MATCH (a) WHERE (NOT a) RETURN a"), ["a"]);
  });
  it("conservatively captures the first identifier of a grouped expression", () => {
    assert.deepEqual(extractVariableCandidates("MATCH (p) WHERE (p.age > 1) RETURN p"), ["p"]);
  });
});

describe("suggestForError", () => {
  beforeEach(() => setFunctionCandidates([])); // reset registry to built-ins only

  it("suggests the closest function from an explicit candidate list", () => {
    assert.equal(
      suggestForError("Unknown function 'lenght'", { functions: ["length", "collect"] }),
      "Did you mean length()?"
    );
  });
  it("falls back to the registered function candidates when none are passed", () => {
    assert.equal(suggestForError("Unknown function 'lenght'"), "Did you mean length()?");
  });
  it("returns undefined for an unknown function with no close candidate", () => {
    assert.equal(suggestForError("Unknown function 'zzzzz'", { functions: ["length"] }), undefined);
  });
  it("suggests the closest variable from the query", () => {
    assert.equal(
      suggestForError("'prsn' not defined", { query: "MATCH (person) RETURN prsn" }),
      "Did you mean person?"
    );
  });
  it("suggests the variable, not a same-spelled label", () => {
    assert.equal(
      suggestForError("'Persn' not defined", { query: "MATCH (person:Person) RETURN Persn" }),
      "Did you mean person?"
    );
  });
  it("returns undefined for an undefined variable with no query context", () => {
    assert.equal(suggestForError("'prsn' not defined"), undefined);
  });
  it("returns undefined when no variable is close enough", () => {
    assert.equal(
      suggestForError("'xyz' not defined", { query: "MATCH (person) RETURN xyz" }),
      undefined
    );
  });
  it("returns undefined for unrecognized errors", () => {
    assert.equal(suggestForError("Division by zero"), undefined);
  });
});

describe("setFunctionCandidates (UDF names)", () => {
  it("registers UDF names alongside the built-ins", () => {
    setFunctionCandidates(["myLib.myFunc"]);
    assert.equal(
      suggestForError("Unknown function 'myLib.myFunch'"),
      "Did you mean myLib.myFunc()?"
    );
    // built-ins still present
    assert.equal(suggestForError("Unknown function 'lenght'"), "Did you mean length()?");
    setFunctionCandidates([]); // reset
  });
});

describe("udfFunctionNames", () => {
  it("derives namespaced UDF function names", () => {
    assert.deepEqual(
      udfFunctionNames([["lib", "myLib", "functions", ["f1", "f2"]]]),
      ["myLib.f1", "myLib.f2"]
    );
    assert.deepEqual(udfFunctionNames([]), []);
  });
  it("exports a non-empty built-in function list", () => {
    assert.ok(BUILTIN_FUNCTIONS.includes("length"));
  });
});
