// "Did you mean…?" suggestions for recognized FalkorDB Cypher errors.
//
// When a query fails with `Unknown function 'X'` or `'X' not defined`, this
// finds the closest valid name and returns a ready-to-show hint such as
// "Did you mean length()?". It is pure (no React/Monaco) so it can be unit-tested
// to 100% and reused across the toast and the query-history tooltip.
//
// Conservative by design: if there is no sufficiently close candidate, it returns
// `undefined` (no guess). Suggestions are drawn only from the built-in function
// list (+ any registered UDF names) and from identifiers in the user's own query —
// never from the raw error text.

import { BUILTIN_FUNCTIONS, CYPHER_KEYWORDS } from "./cypherLang.ts";

// Words that can appear in a capture position (e.g. right after `(`) but are not
// variables, so they must never be offered as a "did you mean" candidate.
const EXCLUDED_WORDS = new Set(
  [
    ...CYPHER_KEYWORDS,
    "NOT", "AND", "OR", "XOR", "IN", "IS", "NULL", "TRUE", "FALSE",
    "DISTINCT", "CONTAINS", "STARTS", "ENDS", "CASE", "WHEN", "THEN",
    "ELSE", "END", "ON", "BY", "ORDER", "DESC", "ASC", "ALL", "ANY",
    "NONE", "SINGLE", "EXISTS",
  ].map(w => w.toLowerCase())
);

// Built-in functions plus any UDF names registered at runtime (see
// setFunctionCandidates). Defaults to the built-ins so suggestions work before
// any UDFs are loaded.
let functionCandidates: string[] = [...BUILTIN_FUNCTIONS];

/** Registers extra (e.g. UDF) function names as suggestion candidates, on top of
 *  the always-present built-ins. */
export function setFunctionCandidates(extra: string[]): void {
  functionCandidates = Array.from(new Set([...BUILTIN_FUNCTIONS, ...extra]));
}

/** Classic Levenshtein edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i += 1) {
    const curr = [i];
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[n];
}

/** Returns the closest candidate to `target`, or `undefined` if none is close
 *  enough. Comparison is case-insensitive; the candidate's original casing is
 *  returned. The distance budget is based on the longer of the two strings
 *  (`maxLen <= 4 ? 1 : 2`), so e.g. `prsn`→`person` (distance 2, maxLen 6) qualifies. */
export function closestMatch(target: string, candidates: string[]): string | undefined {
  const t = target.toLowerCase();
  if (t.length < 3) return undefined;

  const scored = candidates
    .map(candidate => {
      const c = candidate.toLowerCase();
      const maxDistance = Math.max(t.length, c.length) <= 4 ? 1 : 2;
      return { candidate, distance: levenshtein(t, c), maxDistance };
    })
    .filter(s => s.distance > 0 && s.distance <= s.maxDistance);

  if (scored.length === 0) return undefined;

  scored.sort((a, b) => a.distance - b.distance || a.candidate.localeCompare(b.candidate));
  return scored[0].candidate;
}

/** Masks comments and quoted strings with spaces of the **same length** (newlines kept),
 *  so character offsets and line structure are preserved. Used to avoid matching
 *  identifiers inside comments/strings while keeping positions accurate. */
export function maskCommentsAndStrings(query: string): string {
  return query.replace(
    /\/\*[\s\S]*?\*\/|\/\/[^\n]*|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g,
    match => match.replace(/[^\n]/g, " ")
  );
}

/** Extracts identifiers from binding positions only — the name right after `(` or
 *  `[`, and aliases after `AS` — after stripping comments and string literals.
 *  This deliberately excludes labels/types (after `:`), property keys (after `.`),
 *  and function-namespace pieces, so a mistyped variable is matched only against
 *  real variables. Backtick-quoted identifiers are not supported (v1). */
export function extractVariableCandidates(query: string): string[] {
  const cleaned = maskCommentsAndStrings(query);

  const found = new Set<string>();
  const collect = (re: RegExp): void => {
    let match = re.exec(cleaned);
    while (match !== null) {
      found.add(match[1]);
      match = re.exec(cleaned);
    }
  };

  collect(/[([]\s*([A-Za-z_]\w*)/g);           // node/relationship variable
  collect(/\bAS\s+([A-Za-z_]\w*)/gi);          // aliases (WITH/RETURN/UNWIND … AS x)

  return Array.from(found).filter(v => !EXCLUDED_WORDS.has(v.toLowerCase()));
}

/** Returns the raw closest-name suggestion for a recognized error (function or variable),
 *  or `undefined`. Used both for the hint text and for the quick-fix replacement. */
export function suggestionNameForError(
  rawError: string,
  ctx?: { query?: string; functions?: string[] }
): { kind: "function" | "variable"; name: string } | undefined {
  const fnMatch = rawError.match(/unknown function '([^']+)'/i);
  if (fnMatch) {
    const name = closestMatch(fnMatch[1], ctx?.functions ?? functionCandidates);
    return name ? { kind: "function", name } : undefined;
  }

  const varMatch = rawError.match(/'([^']+)' not defined/i);
  if (varMatch) {
    const name = closestMatch(varMatch[1], extractVariableCandidates(ctx?.query ?? ""));
    return name ? { kind: "variable", name } : undefined;
  }

  return undefined;
}

/** Returns a ready-to-show plain-text suggestion ("Did you mean length()?") for a
 *  recognized error, or `undefined`. Function candidates default to the registered
 *  built-in/UDF list; variable candidates are derived from `ctx.query`. */
export function suggestForError(
  rawError: string,
  ctx?: { query?: string; functions?: string[] }
): string | undefined {
  const suggestion = suggestionNameForError(rawError, ctx);
  if (!suggestion) return undefined;
  return suggestion.kind === "function"
    ? `Did you mean ${suggestion.name}()?`
    : `Did you mean ${suggestion.name}?`;
}
