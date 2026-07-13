// ---------------------------------------------------------------------------
// falkordb-cypher — grammar-error enrichment bridge
// ---------------------------------------------------------------------------
// Turns raw ANTLR syntax errors (FalkorSyntaxError) into the SAME rich
// `EditorDiagnostic` shape the backend-error pipeline produces, so grammar
// (pre-run) errors get identical treatment: a prettified message, the standard
// syntax hint, and — where possible — a "Did you mean…?" quick fix. No Monaco
// imports, so it is unit-testable in isolation.
//
// This is what makes requirement "the prettified errors + hint + fix should be
// on the grammar errors too" true: the inline squiggly, the hover hint, and the
// quick fix all flow from these enriched diagnostics.
// ---------------------------------------------------------------------------

import type { EditorDiagnostic } from "../cypherDiagnostics.ts";
import { SYNTAX_ERROR_HINT } from "../cypherErrors.ts";
import { suggestForError, suggestionNameForError } from "../cypherSuggestions.ts";
import type { FalkorSyntaxError } from "./CollectorErrorListener.ts";

/** Turn a terse ANTLR message into a user-facing one, mirroring the toast style. */
export function prettifyGrammarMessage(raw: string): string {
  const unexpected = /(?:extraneous|mismatched) input '([^']*)'/i.exec(raw)
    ?? /no viable alternative at input '([^']*)'/i.exec(raw);
  if (unexpected) {
    const tok = unexpected[1] === "<EOF>" ? "end of query" : `'${unexpected[1]}'`;
    return `Unexpected ${tok}`;
  }
  const missing = /missing (\S+) at '([^']*)'/i.exec(raw);
  if (missing) return `Missing ${missing[1]} before '${missing[2]}'`;
  const badToken = /token recognition error at: '([^']*)'/i.exec(raw);
  if (badToken) return `Invalid token '${badToken[1]}'`;
  return raw;
}

/**
 * Expand a single-character span (e.g. an EOF / whitespace position) back onto
 * the preceding word so the squiggly underlines the real culprit token rather
 * than an empty gap. Mirrors the backend syntax-diagnostic behavior.
 */
function refineRange(
  lineText: string,
  startColumn: number,
  endColumn: number
): { startColumn: number; endColumn: number } {
  if (endColumn - startColumn > 1) return { startColumn, endColumn };
  const idx = startColumn - 1;
  const isWord = (c: string | undefined) => c !== undefined && /\w/.test(c);
  if (isWord(lineText[idx])) return { startColumn, endColumn };
  // Walk back past whitespace, then expand the preceding word.
  let end = idx - 1;
  while (end >= 0 && /\s/.test(lineText[end])) end -= 1;
  if (end >= 0 && isWord(lineText[end])) {
    let start = end;
    while (start > 0 && isWord(lineText[start - 1])) start -= 1;
    return { startColumn: start + 1, endColumn: end + 2 };
  }
  return { startColumn, endColumn };
}

/**
 * Convert grammar syntax errors into enriched editor diagnostics for a query.
 * `errors` come straight from the engine's `lint()`.
 */
export function grammarErrorsToDiagnostics(query: string, errors: FalkorSyntaxError[]): EditorDiagnostic[] {
  if (errors.length === 0) return [];
  const lines = query.split("\n");

  return errors.map((e) => {
    const lineIdx = Math.min(Math.max(e.startLineNumber, 1), lines.length) - 1;
    const lineText = lines[lineIdx] ?? "";
    const { startColumn, endColumn } = refineRange(lineText, e.startColumn, e.endColumn);

    const message = prettifyGrammarMessage(e.message);
    // Best-effort "Did you mean…?" — reuses the same suggestion engine the
    // backend errors use, so keyword/function typos get a concrete hint + fix.
    const suggestionHint = suggestForError(e.message, { query });
    const suggestion = suggestionNameForError(e.message, { query });

    const diagnostic: EditorDiagnostic = {
      message,
      hint: suggestionHint ?? SYNTAX_ERROR_HINT,
      severity: "error",
      code: "syntax",
      startLineNumber: lineIdx + 1,
      startColumn,
      endLineNumber: lineIdx + 1,
      endColumn,
    };
    if (suggestion) {
      diagnostic.quickFix = { title: `Replace with ${suggestion.name}`, newText: suggestion.name };
    }
    return diagnostic;
  });
}
