// Actionable remediation hints for common, recognizable FalkorDB Cypher errors.
//
// This is the browser analog of falkordb-rs `FalkorDBError::mitigation_hint()`
// (https://github.com/FalkorDB/falkordb-rs/pull/248): it maps a recognized error
// to a short, actionable tip telling the user how to fix it. It is purely additive
// — the original server message is always preserved and shown as-is; the hint only
// adds guidance next to it.
//
// Guardrails (kept deliberately conservative to avoid misleading hints):
//   * Hints are fixed strings — no text from the underlying error is interpolated,
//     so a hint can never echo or leak data from the original message.
//   * Patterns are anchored to the FalkorDB error templates in
//     src/errors/error_msgs.h (each entry cites its EMSG_* constant) and match on
//     distinctive, multi-token phrases. The raw error string is a mixed bucket that
//     can also carry Redis/connection/auth errors, so anything not specifically
//     recognized returns `undefined`.
//
// This module is intentionally free of React/Next/DOM imports so it stays pure and
// can be unit-tested directly with `node --test`.

export type CypherErrorHint = {
  /** Stable identifier for the recognized error (useful for tests/telemetry). */
  id: string;
  /** Short, actionable remediation tip. */
  hint: string;
};

export type SyntaxErrorInfo = {
  message: string;
  context: string;
  contextOffset: number;
  line: number;
  column: number;
};

// Parses FalkorDB parser error format:
// "errMsg: <message> line: <N>, column: <N>, offset: <N> errCtx: <snippet> errCtxOffset: <N>"
// Uses [\s\S] for multiline tolerance and avoids strict end-of-string anchoring.
export function parseSyntaxError(raw: string): SyntaxErrorInfo | null {
  const match = raw.match(
    /errMsg:\s*([\s\S]+?)\s+line:\s*(\d+),\s*column:\s*(\d+),\s*offset:\s*\d+\s+errCtx:\s?([\s\S]+?)\s+errCtxOffset:\s*(\d+)/
  );
  if (!match) return null;
  return {
    message: match[1].trim(),
    line: Math.max(1, Number(match[2])),
    column: Math.max(1, Number(match[3])),
    context: match[4],
    contextOffset: Number(match[5]),
  };
}

type CatalogEntry = CypherErrorHint & {
  test: RegExp;
};

// Ordered list; the first matching entry wins. Each `test` mirrors a FalkorDB
// server error template (cited by its EMSG_* constant in src/errors/error_msgs.h).
const CATALOG: CatalogEntry[] = [
  {
    // EMSG_NOT_DEFINED "'%s' not defined"
    id: "undefined-variable",
    test: /'[^']+' not defined/i,
    hint: "Make sure the variable is introduced in an earlier MATCH, WITH, UNWIND, or CREATE clause and is still in scope. Check for typos in the name.",
  },
  {
    // EMSG_UNKNOWN_FUNCTION "Unknown function '%s'"
    id: "unknown-function",
    test: /unknown function '[^']*'/i,
    hint: "Check the function name for typos. See the FalkorDB function reference for the list of supported functions.",
  },
  {
    // EMSG_TYPE_MISMATCH "Type mismatch: expected %s but was %s"
    id: "type-mismatch",
    test: /type mismatch: expected .+ but was /i,
    hint: "A value's type doesn't match what the operation expects. Convert it with a function such as toInteger(), toFloat(), or toString(), or adjust the value.",
  },
  {
    // EMSG_DIVISION_BY_ZERO "Division by zero"
    id: "division-by-zero",
    test: /\bdivision by zero\b/i,
    hint: "Guard the denominator before dividing, e.g. with a CASE expression or by filtering out zero values in a WHERE clause.",
  },
  {
    // EMSG_NESTED_AGGREGATION "Can't use aggregate functions inside of aggregate functions."
    id: "nested-aggregation",
    test: /aggregate functions inside of aggregate functions/i,
    hint: "Aggregations can't be nested. Compute the inner aggregate in a separate WITH clause, then aggregate its result.",
  },
  {
    // EMSG_WITH_PROJ_MISSING_ALIAS "WITH clause projections must be aliased"
    id: "with-missing-alias",
    test: /WITH clause projections must be aliased/i,
    hint: "Every expression in a WITH clause must be aliased with AS, e.g. WITH count(n) AS total.",
  },
  {
    // EMSG_RETURN_STAR_NO_VARIABLES "RETURN * is not allowed when there are no variables in scope"
    id: "return-star-no-vars",
    test: /RETURN \* is not allowed when there are no variables in scope/i,
    hint: "RETURN * needs at least one variable in scope. Name a variable in your MATCH/WITH (e.g. MATCH (n)) or return an explicit expression.",
  },
  {
    // EMSG_VAR_LEN_INVALID_RANGE "...maximum number of hops must be greater or equal to minimum number of hops."
    id: "var-length-range",
    test: /maximum number of hops must be greater or equal to minimum number of hops/i,
    hint: "In a variable-length pattern [*min..max], max must be greater than or equal to min, e.g. [*1..3].",
  },
  {
    // EMSG_CREATE_DIRECTED_RELATIONSHIP "Only directed relationships are supported in CREATE"
    id: "create-directed-relationship",
    test: /only directed relationships are supported in CREATE/i,
    hint: "CREATE needs a direction on each relationship, e.g. (a)-[:REL]->(b) rather than (a)-[:REL]-(b).",
  },
  {
    // EMSG_QUERY_WITH_MULTIPLE_STATEMENTS "Error: query with more than one statement is not supported."
    id: "multiple-statements",
    test: /query with more than one statement is not supported/i,
    hint: "Run a single statement at a time. Remove extra queries or the trailing semicolon separating them.",
  },
  {
    // EMSG_UNIQUE_CONSTRAINT_VIOLATION_NODE / _EDGE "unique constraint violation..."
    id: "unique-constraint",
    test: /unique constraint violation/i,
    hint: "A unique constraint already covers this value. Use a different value, or MERGE instead of CREATE to reuse the existing entity.",
  },
  {
    // EMSG_MANDATORY_CONSTRAINT_VIOLATION_NODE / _EDGE "mandatory constraint violation..."
    id: "mandatory-constraint",
    test: /mandatory constraint violation/i,
    hint: "A mandatory (existence) constraint requires this property. Set the property when you create or update the node or relationship.",
  },
  {
    // EMSG_PROCEDURE_NOT_REGISTERED "Procedure `%s` is not registered"
    id: "procedure-not-registered",
    test: /procedure .+ is not registered/i,
    hint: "Check the procedure name and spelling, and make sure the procedure is supported by your FalkorDB version.",
  },
  {
    // EMSG_QUERY_TIMEOUT "Query timed out"
    id: "query-timed-out",
    test: /\bquery timed out\b/i,
    hint: "The query exceeded its time limit. Simplify it, add indexes on the properties you filter by, or raise the timeout in query settings.",
  },
  {
    // EMSG_QUERY_MEM_CONSUMPTION "Query's mem consumption exceeded capacity"
    id: "mem-consumption",
    test: /mem consumption exceeded capacity/i,
    hint: "The query used too much memory. Reduce the result size (add LIMIT), avoid large cartesian products, or simplify the query.",
  },
  {
    // EMSG_WRITE_QUEUE_FULL "Write queue is full: ..."
    id: "write-queue-full",
    test: /write queue is full/i,
    hint: "The server is busy processing writes. Wait a moment and retry the query.",
  },
];

/**
 * Returns a short, actionable remediation hint for a recognized FalkorDB Cypher
 * error, or `undefined` when the message is not specifically recognized.
 *
 * The raw message is never modified or echoed into the hint — callers should keep
 * showing the original server text and use this only to add guidance beside it.
 */
export function getCypherErrorHint(raw: string): CypherErrorHint | undefined {
  if (!raw) return undefined;
  const entry = CATALOG.find(({ test }) => test.test(raw));
  return entry ? { id: entry.id, hint: entry.hint } : undefined;
}

// Generic hint for Cypher syntax/parse errors. These carry a position (so they are
// highlighted in the editor) but no specific catalog entry, so a single generic tip
// is shown next to the highlighted character.
export const SYNTAX_ERROR_HINT =
  "Check for typos, missing commas, or unbalanced brackets, parentheses, or quotes near the highlighted position.";
