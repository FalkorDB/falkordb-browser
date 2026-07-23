// ---------------------------------------------------------------------------
// falkordb-cypher — simplified query-response handler
// ---------------------------------------------------------------------------
// When grammar linting is active (see linter.ts + attachGrammarLinting), invalid
// syntax is blocked before submit. When grammar artifacts are unavailable,
// linter.ts no-ops and backend syntax errors can still surface. This module only
// classifies runtime/database issues that remain relevant in both paths.
// ---------------------------------------------------------------------------

/** The only error classes that can still reach the client post-syntax-gating. */
export type RuntimeErrorKind = "timeout" | "resourceLimit" | "missingConstraint" | "unknown";

export interface RuntimeError {
  kind: RuntimeErrorKind;
  /** User-facing message. */
  message: string;
  /** Original server text, for a "See more" affordance. */
  raw: string;
}

// Ordered runtime-only matchers. No syntax patterns here by design.
const RUNTIME_MATCHERS: { kind: RuntimeErrorKind; test: RegExp; message: string }[] = [
  {
    kind: "timeout",
    test: /timed?\s*out|timeout|exceeded maximum.*time/i,
    message: "The query took too long and was cancelled. Try narrowing it or adding an index.",
  },
  {
    kind: "resourceLimit",
    test: /resultset size|max queued queries|memory|resource|too many/i,
    message: "The query hit a server resource limit. Reduce the result size or simplify the query.",
  },
  {
    kind: "missingConstraint",
    test: /constraint|no such index|index .* (does not|doesn't) exist|unique/i,
    message: "A required index or constraint is missing for this operation.",
  },
];

/**
 * Classify a backend error. Returns null when the payload indicates success.
 *
 * @param raw   The error string (or falsy on success) returned by the server.
 */
export function classifyRuntimeError(raw: unknown): RuntimeError | null {
  const text = typeof raw === "string" ? raw.trim() : raw ? String(raw).trim() : "";
  if (!text) return null; // success — nothing to handle.

  const match = RUNTIME_MATCHERS.find((m) => m.test.test(text));
  if (match) return { kind: match.kind, message: match.message, raw: text };

  // Anything else is an unexpected runtime failure — surface it verbatim.
  return { kind: "unknown", message: "The query failed to execute. Please try again.", raw: text };
}
