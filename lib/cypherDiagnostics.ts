// Pure logic for inline editor diagnostics (Monaco markers + quick fixes) from a
// failed Cypher query's error. No React/Monaco imports, so it is unit-testable to
// 100% and reused by `app/components/CypherEditor.tsx`, which turns these into
// `monaco.editor.setModelMarkers` + code actions.
//
// Positions are 1-based (Monaco convention). Errors that can't be pinned to a token
// (timeout, OOM, constraint violations, …) produce no diagnostic — they stay in the
// toast.

import { parseSyntaxError, SYNTAX_ERROR_HINT, enrichSyntaxMessage, type SyntaxErrorInfo } from "./cypherErrors.ts";
import { suggestForError, suggestionNameForError, maskCommentsAndStrings, closestMatch, findFuncArgTypo } from "./cypherSuggestions.ts";

export type EditorDiagnostic = {
  message: string;
  hint?: string;
  severity: "error" | "warning";
  code: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  quickFix?: { title: string; newText: string };
};

export type DiagnosticsResult = { sourceQuery: string; diagnostics: EditorDiagnostic[] };

export type LocatedToken = { start: number; end: number; validOccurrenceCount: number };

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Static fallback hints shown when there is no concrete "Did you mean…?" suggestion.
const FALLBACK_HINT: Record<string, string> = {
  "unknown-function": "Check the function name for typos against the FalkorDB function reference.",
  "undefined-variable": "Make sure the variable is introduced earlier (MATCH/WITH/UNWIND/CREATE) and is still in scope.",
};

/** Converts a 0-based string index to a Monaco 1-based { lineNumber, column }. */
export function offsetToPosition(text: string, index: number): { lineNumber: number; column: number } {
  let line = 1;
  let lastNewline = -1;
  for (let i = 0; i < index; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      lastNewline = i;
    }
  }
  return { lineNumber: line, column: index - lastNewline };
}

function collectMatches(masked: string, re: RegExp, tokenLength: number, accept: (index: number) => boolean): LocatedToken | undefined {
  const positions: { start: number; end: number }[] = [];
  let match = re.exec(masked);
  while (match !== null) {
    if (accept(match.index)) {
      positions.push({ start: match.index, end: match.index + tokenLength });
    }
    match = re.exec(masked);
  }
  if (positions.length === 0) return undefined;
  return { start: positions[0].start, end: positions[0].end, validOccurrenceCount: positions.length };
}

/** Locates a function call: the token immediately before `(` (supports dotted names). */
export function locateFunctionToken(query: string, token: string): LocatedToken | undefined {
  const masked = maskCommentsAndStrings(query);
  const re = new RegExp(`${escapeRegExp(token)}\\s*\\(`, "g");
  return collectMatches(masked, re, token.length, () => true);
}

/** Locates a variable reference: `\btoken\b` not immediately preceded by `.` or `:`
 *  (so property keys and labels are skipped). */
export function locateVariableToken(query: string, token: string): LocatedToken | undefined {
  const masked = maskCommentsAndStrings(query);
  const re = new RegExp(`\\b${escapeRegExp(token)}\\b`, "g");
  return collectMatches(masked, re, token.length, index => {
    const before = index > 0 ? masked[index - 1] : "";
    return before !== "." && before !== ":";
  });
}

/** Returns the word range (1-based, end-exclusive) at `column`.
 *  Non-word, non-space characters produce a run of the same character.
 *  Whitespace and out-of-range columns fall back to a single-character range. */
function wordRangeAt(lineText: string, column: number): { startColumn: number; endColumn: number } {
  const idx = column - 1;
  const isWord = (c: string | undefined): boolean => c !== undefined && /\w/.test(c);

  if (isWord(lineText[idx])) {
    let start = idx;
    while (start > 0 && isWord(lineText[start - 1])) start -= 1;
    let end = idx;
    while (end < lineText.length && isWord(lineText[end])) end += 1;
    return { startColumn: start + 1, endColumn: end + 1 };
  }

  // Non-word, non-space (operator/punct): highlight the consecutive run of the same char
  // so that e.g. '==' at column N produces a 2-char underline on '==' rather than jumping
  // back to the preceding identifier.
  if (!/\s/.test(lineText[idx] ?? "")) {
    const ch = lineText[idx];
    let runEnd = idx;
    while (runEnd + 1 < lineText.length && lineText[runEnd + 1] === ch) runEnd += 1;
    return { startColumn: idx + 1, endColumn: runEnd + 2 };
  }

  // Whitespace (or out-of-range): fall back to a single-character cursor position.
  const single = Math.max(0, Math.min(idx, lineText.length - 1));
  return { startColumn: single + 1, endColumn: single + 2 };
}

function syntaxDiagnostic(query: string, syntax: SyntaxErrorInfo): EditorDiagnostic {
  const lines = query.split("\n");
  const lineIdx = Math.min(Math.max(syntax.line, 1), lines.length) - 1;
  const lineText = lines[lineIdx];
  const column = Math.min(Math.max(syntax.column, 1), lineText.length + 1);
  const { startColumn, endColumn } = wordRangeAt(lineText, column);
  const enrichedMessage = enrichSyntaxMessage(syntax.message, syntax.context, syntax.contextOffset);
  return {
    message: enrichedMessage,
    hint: SYNTAX_ERROR_HINT,
    severity: "error",
    code: "syntax",
    startLineNumber: lineIdx + 1,
    startColumn,
    endLineNumber: lineIdx + 1,
    endColumn,
  };
}

function tokenDiagnostic(
  query: string,
  code: string,
  message: string,
  errorMessage: string,
  located: LocatedToken
): EditorDiagnostic {
  const start = offsetToPosition(query, located.start);
  const end = offsetToPosition(query, located.end);
  const diagnostic: EditorDiagnostic = {
    message,
    hint: suggestForError(errorMessage, { query }) ?? FALLBACK_HINT[code],
    severity: "error",
    code,
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  };

  // Quick fix only when the token is unambiguous (single valid occurrence) and we have
  // a concrete suggested name to replace it with.
  const suggestion = suggestionNameForError(errorMessage, { query });
  if (located.validOccurrenceCount === 1 && suggestion) {
    diagnostic.quickFix = { title: `Replace with ${suggestion.name}`, newText: suggestion.name };
  }
  return diagnostic;
}

/** Builds editor diagnostics for a failed query. Returns the source query alongside the
 *  diagnostics so the editor can ignore stale results (query edited since it ran). */
export function computeEditorDiagnostics(query: string, errorMessage: string): DiagnosticsResult {
  const diagnostics: EditorDiagnostic[] = [];

  const syntax = parseSyntaxError(errorMessage);
  if (syntax) {
    // If a function-arg typo is the likely root cause, highlight that token instead
    // of the confusing parser-reported position (e.g. id(nod) → squiggle on 'nod').
    const typo = findFuncArgTypo(query);
    if (typo) {
      const located = locateVariableToken(query, typo);
      if (located) {
        const msg = `'${typo}' not defined`;
        diagnostics.push(tokenDiagnostic(query, "undefined-variable", msg, msg, located));
        return { sourceQuery: query, diagnostics };
      }
    }
    diagnostics.push(syntaxDiagnostic(query, syntax));
    return { sourceQuery: query, diagnostics };
  }

  const fnMatch = errorMessage.match(/unknown function '([^']+)'/i);
  if (fnMatch) {
    const located = locateFunctionToken(query, fnMatch[1]);
    if (located) diagnostics.push(tokenDiagnostic(query, "unknown-function", `Unknown function '${fnMatch[1]}'`, errorMessage, located));
    return { sourceQuery: query, diagnostics };
  }

  const varMatch = errorMessage.match(/'([^']+)' not defined/i);
  if (varMatch) {
    const located = locateVariableToken(query, varMatch[1]);
    if (located) diagnostics.push(tokenDiagnostic(query, "undefined-variable", `'${varMatch[1]}' not defined`, errorMessage, located));
    return { sourceQuery: query, diagnostics };
  }

  return { sourceQuery: query, diagnostics };
}

/** Proactive (as-you-type) warnings for unknown node labels that look like a typo of a
 *  known label. Anchored to node patterns `(…:Label…)` so map keys (`{key: value}`) can
 *  never be mistaken for labels, and only emitted when the label is close to a known one
 *  (so brand-new labels are never flagged). Returns `[]` when the schema isn't loaded. */
export function analyzeSchemaWarnings(query: string, knownLabels: string[]): EditorDiagnostic[] {
  if (knownLabels.length === 0) return [];
  const known = new Set(knownLabels);
  const masked = maskCommentsAndStrings(query);
  const warnings: EditorDiagnostic[] = [];

  const chainRe = /\(\s*(?:[A-Za-z_]\w*)?\s*((?::[A-Za-z_]\w*)+)/g;
  let chain = chainRe.exec(masked);
  while (chain !== null) {
    const chainText = chain[1];
    const chainStart = chain.index + chain[0].length - chainText.length;
    const labelRe = /:([A-Za-z_]\w*)/g;
    let labelMatch = labelRe.exec(chainText);
    while (labelMatch !== null) {
      const label = labelMatch[1];
      const suggestion = known.has(label) ? undefined : closestMatch(label, knownLabels);
      if (suggestion) {
        const startIdx = chainStart + labelMatch.index + 1; // skip the ':'
        const start = offsetToPosition(query, startIdx);
        const end = offsetToPosition(query, startIdx + label.length);
        warnings.push({
          message: `Unknown label '${label}'`,
          hint: `Did you mean ${suggestion}?`,
          severity: "warning",
          code: "unknown-label",
          startLineNumber: start.lineNumber,
          startColumn: start.column,
          endLineNumber: end.lineNumber,
          endColumn: end.column,
          quickFix: { title: `Replace with ${suggestion}`, newText: suggestion },
        });
      }
      labelMatch = labelRe.exec(chainText);
    }
    chain = chainRe.exec(masked);
  }
  return warnings;
}

type MarkerRange = {
  code: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

/** Pure mapping from current markers back to quick-fix edits. Matches a marker to its
 *  diagnostic by `code` + exact range (never by message), and returns the replacement
 *  edit only for diagnostics that carry a quick fix. */
export function codeActionEditsForMarkers(
  diagnostics: EditorDiagnostic[],
  markers: MarkerRange[]
): { title: string; code: string; newText: string; range: Omit<MarkerRange, "code"> }[] {
  const edits: { title: string; code: string; newText: string; range: Omit<MarkerRange, "code"> }[] = [];
  markers.forEach(marker => {
    const diagnostic = diagnostics.find(d =>
      d.code === marker.code &&
      d.startLineNumber === marker.startLineNumber &&
      d.startColumn === marker.startColumn &&
      d.endLineNumber === marker.endLineNumber &&
      d.endColumn === marker.endColumn
    );
    if (diagnostic?.quickFix) {
      edits.push({
        title: diagnostic.quickFix.title,
        code: diagnostic.code,
        newText: diagnostic.quickFix.newText,
        range: {
          startLineNumber: diagnostic.startLineNumber,
          startColumn: diagnostic.startColumn,
          endLineNumber: diagnostic.endLineNumber,
          endColumn: diagnostic.endColumn,
        },
      });
    }
  });
  return edits;
}
