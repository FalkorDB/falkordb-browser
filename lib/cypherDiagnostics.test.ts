import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  offsetToPosition,
  locateFunctionToken,
  locateVariableToken,
  computeEditorDiagnostics,
  codeActionEditsForMarkers,
  analyzeSchemaWarnings,
  type EditorDiagnostic,
} from "./cypherDiagnostics.ts";

describe("offsetToPosition", () => {
  it("computes 1-based column on the first line", () => {
    assert.deepEqual(offsetToPosition("abc", 2), { lineNumber: 1, column: 3 });
    assert.deepEqual(offsetToPosition("abc", 0), { lineNumber: 1, column: 1 });
  });
  it("computes line and column across newlines", () => {
    assert.deepEqual(offsetToPosition("ab\ncd", 4), { lineNumber: 2, column: 2 });
  });
});

describe("locateFunctionToken", () => {
  it("locates a function call before '('", () => {
    assert.deepEqual(locateFunctionToken("RETURN lenght(1)", "lenght"), { start: 7, end: 13, validOccurrenceCount: 1 });
  });
  it("supports dotted names and reports multiple occurrences", () => {
    assert.equal(locateFunctionToken("RETURN vec.cosine(x)", "vec.cosine")?.validOccurrenceCount, 1);
    assert.equal(locateFunctionToken("RETURN foo(1) + foo(2)", "foo")?.validOccurrenceCount, 2);
  });
  it("does not match the token when not used as a call, or only inside a string", () => {
    assert.equal(locateFunctionToken("RETURN foo", "foo"), undefined);
    assert.equal(locateFunctionToken("RETURN 'foo(' ", "foo"), undefined);
  });
});

describe("locateVariableToken", () => {
  it("locates a standalone variable (incl. at index 0)", () => {
    assert.deepEqual(locateVariableToken("MATCH (person) RETURN prsn", "prsn"), { start: 22, end: 26, validOccurrenceCount: 1 });
    assert.equal(locateVariableToken("prsn RETURN prsn", "prsn")?.validOccurrenceCount, 2);
    assert.equal(locateVariableToken("prsn", "prsn")?.start, 0);
  });
  it("skips property keys (after '.') and labels (after ':')", () => {
    assert.equal(locateVariableToken("RETURN n.name", "name"), undefined);
    assert.equal(locateVariableToken("MATCH (n:Person)", "Person"), undefined);
  });
});

describe("computeEditorDiagnostics — syntax errors", () => {
  const syntaxError = (col: number, line = 1) =>
    `errMsg: Invalid input 'X' line: ${line}, column: ${col}, offset: 10 errCtx: ctx errCtxOffset: 10`;

  it("underlines the word at the reported column", () => {
    const { diagnostics, sourceQuery } = computeEditorDiagnostics("MATCH (n) XRETURN n", syntaxError(11));
    assert.equal(sourceQuery, "MATCH (n) XRETURN n");
    assert.equal(diagnostics.length, 1);
    assert.equal(diagnostics[0].code, "syntax");
    assert.equal(diagnostics[0].startColumn, 11);
    assert.equal(diagnostics[0].endColumn, 18); // "XRETURN"
    assert.ok(diagnostics[0].hint);
  });
  it("highlights the preceding word when the error column is the space after it (e.g. incomplete keyword)", () => {
    // column 6 = space after 'MATCH' in 'MATCH (n)' → highlights 'MATCH' (cols 1-5, endColumn=6)
    const d = computeEditorDiagnostics("MATCH (n)", syntaxError(6)).diagnostics[0];
    assert.deepEqual([d.startColumn, d.endColumn], [1, 6]); // "MATCH"
  });
  it("highlights 'LIM' (incomplete keyword) when the trailing space is the reported error position", () => {
    // 'LIM' occupies cols 11-13 in 'MATCH (n) LIM 100'; col 14 = the space after it
    const d = computeEditorDiagnostics("MATCH (n) LIM 100", syntaxError(14)).diagnostics[0];
    assert.deepEqual([d.startColumn, d.endColumn], [11, 14]); // "LIM"
  });
  it("falls back to a single-character range when the space is not preceded by a word", () => {
    // column 2 = space after '(' — non-word predecessor → single-char fallback
    const d = computeEditorDiagnostics("( n)", syntaxError(2)).diagnostics[0];
    assert.equal(d.endColumn - d.startColumn, 1);
  });
  it("clamps a line number beyond the query and handles an empty line", () => {
    const beyond = computeEditorDiagnostics("RETURN 1", syntaxError(3, 9)).diagnostics[0];
    assert.equal(beyond.startLineNumber, 1);
    const empty = computeEditorDiagnostics("", syntaxError(1)).diagnostics[0];
    assert.deepEqual([empty.startColumn, empty.endColumn], [1, 2]);
  });
  it("expands a word spanning the whole line (start and end boundaries)", () => {
    const d = computeEditorDiagnostics("XMATCH", syntaxError(1)).diagnostics[0];
    assert.deepEqual([d.startColumn, d.endColumn], [1, 7]);
  });
  it("expands a word when the column points into its middle", () => {
    const d = computeEditorDiagnostics("RETURN value", syntaxError(10)).diagnostics[0];
    assert.deepEqual([d.startColumn, d.endColumn], [8, 13]);
  });
  it("highlights a single operator character when the next char differs", () => {
    // non-word, non-space char '(' not followed by another '(' → single-char underline
    const d = computeEditorDiagnostics("MATCH (n)", syntaxError(7)).diagnostics[0];
    assert.equal(d.endColumn - d.startColumn, 1);
  });
  it("highlights a run of repeated operator characters (e.g. '===')", () => {
    // non-word, non-space char '=' repeated three times → 3-char underline
    const d = computeEditorDiagnostics("===", syntaxError(1)).diagnostics[0];
    assert.equal(d.endColumn - d.startColumn, 3);
  });
  it("diagnoses a syntax error as an undefined-variable when a func-arg is a typo of a bound variable", () => {
    // "RETUR" is a syntax error; "nod" in id(nod) is a typo of the bound variable "node"
    const d = computeEditorDiagnostics(
      "MATCH (node) RETUR id(nod)",
      syntaxError(14)
    ).diagnostics[0];
    assert.equal(d.code, "undefined-variable");
    assert.ok(d.message.includes("nod"));
  });
});

describe("computeEditorDiagnostics — semantic token errors", () => {
  it("marks an unknown function with a hint and a replace quick fix", () => {
    const d = computeEditorDiagnostics("RETURN lenght(1)", "Unknown function 'lenght'").diagnostics[0];
    assert.equal(d.code, "unknown-function");
    assert.equal(d.message, "Unknown function 'lenght'");
    assert.equal(d.hint, "Did you mean length()?");
    assert.deepEqual(d.quickFix, { title: "Replace with length", newText: "length" });
    assert.deepEqual([d.startColumn, d.endColumn], [8, 14]);
  });
  it("marks an undefined variable with a hint and a replace quick fix", () => {
    const d = computeEditorDiagnostics("MATCH (person) RETURN prsn", "'prsn' not defined").diagnostics[0];
    assert.equal(d.code, "undefined-variable");
    assert.equal(d.hint, "Did you mean person?");
    assert.deepEqual(d.quickFix, { title: "Replace with person", newText: "person" });
  });
  it("uses the catalog hint and omits the quick fix when there is no close suggestion", () => {
    const d = computeEditorDiagnostics("RETURN zzzzz(1)", "Unknown function 'zzzzz'").diagnostics[0];
    assert.ok(d.hint && d.hint.includes("function name"));
    assert.equal(d.quickFix, undefined);
  });
  it("omits the quick fix when the token is ambiguous (multiple occurrences)", () => {
    const d = computeEditorDiagnostics("RETURN lenght(1) + lenght(2)", "Unknown function 'lenght'").diagnostics[0];
    assert.equal(d.hint, "Did you mean length()?");
    assert.equal(d.quickFix, undefined);
  });
  it("emits no diagnostic when the token can't be located", () => {
    assert.deepEqual(computeEditorDiagnostics("RETURN x", "Unknown function 'foo'").diagnostics, []);
    assert.deepEqual(computeEditorDiagnostics("RETURN n.name", "'name' not defined").diagnostics, []);
  });
  it("emits no diagnostic for whole-query / unrecognized errors", () => {
    assert.deepEqual(computeEditorDiagnostics("RETURN 1/0", "Division by zero").diagnostics, []);
  });
});

describe("codeActionEditsForMarkers", () => {
  const diag: EditorDiagnostic = {
    message: "Unknown function 'lenght'", severity: "error", code: "unknown-function",
    startLineNumber: 1, startColumn: 8, endLineNumber: 1, endColumn: 14,
    quickFix: { title: "Replace with length", newText: "length" },
  };
  const marker = { code: "unknown-function", startLineNumber: 1, startColumn: 8, endLineNumber: 1, endColumn: 14 };

  it("returns the edit for a marker matching a quick-fixable diagnostic", () => {
    const edits = codeActionEditsForMarkers([diag], [marker]);
    assert.equal(edits.length, 1);
    assert.equal(edits[0].newText, "length");
    assert.deepEqual(edits[0].range, { startLineNumber: 1, startColumn: 8, endLineNumber: 1, endColumn: 14 });
  });
  it("returns nothing for a diagnostic without a quick fix", () => {
    const noFix = { ...diag, quickFix: undefined };
    assert.deepEqual(codeActionEditsForMarkers([noFix], [marker]), []);
  });
  it("returns nothing when no diagnostic matches the marker (stale range)", () => {
    assert.deepEqual(codeActionEditsForMarkers([diag], [{ ...marker, startColumn: 99 }]), []);
  });
});

describe("analyzeSchemaWarnings", () => {
  const labels = ["Person", "Admin"];

  it("returns nothing when the schema is not loaded", () => {
    assert.deepEqual(analyzeSchemaWarnings("MATCH (n:Persn)", []), []);
  });
  it("warns on a label that is a close typo of a known one, with a quick fix", () => {
    const w = analyzeSchemaWarnings("MATCH (n:Persn)", labels);
    assert.equal(w.length, 1);
    assert.equal(w[0].code, "unknown-label");
    assert.equal(w[0].severity, "warning");
    assert.equal(w[0].hint, "Did you mean Person?");
    assert.deepEqual(w[0].quickFix, { title: "Replace with Person", newText: "Person" });
    assert.deepEqual([w[0].startColumn, w[0].endColumn], [10, 15]); // "Persn"
  });
  it("supports anonymous nodes and multi-label patterns, skipping known labels", () => {
    assert.equal(analyzeSchemaWarnings("MATCH (:Persn)", labels)[0]?.hint, "Did you mean Person?");
    const multi = analyzeSchemaWarnings("MATCH (n:Person:Admn)", labels);
    assert.equal(multi.length, 1); // Person is known (skipped), Admn -> Admin
    assert.equal(multi[0].hint, "Did you mean Admin?");
  });
  it("does not warn on known labels, brand-new labels, or map keys", () => {
    assert.deepEqual(analyzeSchemaWarnings("MATCH (n:Person)", labels), []); // known
    assert.deepEqual(analyzeSchemaWarnings("MATCH (n:Zzzzzz)", labels), []); // not close to any known
    assert.deepEqual(analyzeSchemaWarnings("RETURN {Persn: 1}", labels), []); // map key, not a label
  });
});
