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
  {
    // EMSG_REDECLARE "The bound %s '%s' can't be redeclared in a %s clause"
    id: "redeclared-variable",
    test: /can't be redeclared in a .+ clause/i,
    hint: "This variable is already bound. Use a different name, or reference it without re-declaring it in MATCH/CREATE/MERGE.",
  },
  {
    // EMSG_SAME_RESULT_COLUMN_NAME "Multiple result columns with the same name are not supported."
    id: "duplicate-result-column",
    test: /Multiple result columns with the same name/i,
    hint: "Two result columns share a name. Give each one a distinct alias with AS.",
  },
  {
    // EMSG_SAME_ALIAS_NODE_RELATIONSHIP "The alias '%s' was specified for both a node and a relationship."
    id: "same-alias-node-rel",
    test: /was specified for both a node and a relationship/i,
    hint: "The same name is used for a node and a relationship. Rename one of them.",
  },
  {
    // EMSG_SAME_ALIAS_MULTIPLE_PATTERNS "Cannot use the same relationship variable '%s' for multiple patterns."
    id: "same-rel-var-multiple",
    test: /same relationship variable .+ for multiple patterns/i,
    hint: "A relationship variable can't be reused across patterns. Give each relationship its own name.",
  },
  {
    // EMSG_UNION_MISMATCHED_RETURNS "All sub queries in a UNION must have the same column names."
    id: "union-mismatched-returns",
    test: /All sub queries in a UNION must have the same column names/i,
    hint: "Every part of a UNION must return the same column names in the same order. Align the RETURN clauses (e.g. matching AS aliases).",
  },
  {
    // EMSG_UNION_COMBINATION "Invalid combination of UNION and UNION ALL."
    id: "union-combination",
    test: /Invalid combination of UNION and UNION ALL/i,
    hint: "Don't mix UNION and UNION ALL in one query — use one or the other throughout.",
  },
  {
    // EMSG_QUERY_INVALID_LAST_CLAUSE "Query cannot conclude with %s (must be a RETURN clause, ...)"
    id: "query-missing-return",
    test: /Query cannot conclude with .+ \(must be a RETURN clause/i,
    hint: "A query must end with RETURN, an update (CREATE/SET/DELETE/…), a procedure CALL, or a non-returning subquery. Add a RETURN.",
  },
  {
    // EMSG_UNEXPECTED_CLAUSE_FOLLOWING_RETURN "Unexpected clause following RETURN"
    id: "clause-after-return",
    test: /Unexpected clause following RETURN/i,
    hint: "Nothing can follow a final RETURN. Move earlier clauses before it, or use WITH instead of RETURN to continue.",
  },
  {
    // EMSG_MISSING_WITH_AFTER_MATCH "A WITH clause is required to introduce a MATCH clause after an OPTIONAL MATCH."
    id: "missing-with-after-optional-match",
    test: /A WITH clause is required to introduce a MATCH clause after an OPTIONAL MATCH/i,
    hint: "Add a WITH clause between an OPTIONAL MATCH and a following MATCH.",
  },
  {
    // EMSG_MISSING_WITH "A WITH clause is required to introduce %s after an updating clause."
    id: "missing-with-after-update",
    test: /A WITH clause is required to introduce .+ after an updating clause/i,
    hint: "After an updating clause (CREATE/MERGE/SET/…), add a WITH before introducing a new MATCH/clause.",
  },
  {
    // EMSG_DELETE_INVALID_ARGUMENTS "DELETE can only be called on nodes, paths and relationships"
    id: "delete-invalid-target",
    test: /DELETE can only be called on nodes, paths and relationships/i,
    hint: "DELETE works on nodes, relationships, or paths — not properties. To clear a property use REMOVE n.prop or SET n.prop = null.",
  },
  {
    // EMSG_SET_LHS_NON_ALIAS "...non-alias references on the left-hand side of SET expressions"
    id: "set-non-alias-lhs",
    test: /non-alias references on the left-hand side of SET/i,
    hint: "The left side of SET must be a bound variable or its property (e.g. n or n.prop), not a chained/expression reference.",
  },
  {
    // EMSG_FOREACH_INVALID_BODY "Only updating clauses may reside in FOREACH"
    id: "foreach-non-updating",
    test: /Only updating clauses may reside in FOREACH/i,
    hint: "FOREACH can only contain updating clauses (CREATE/MERGE/SET/DELETE/REMOVE) — not RETURN/MATCH/WITH.",
  },
  {
    // EMSG_INVALID_PROPERTY_VALUE "Property values can only be of primitive types or arrays of primitive types"
    id: "invalid-property-value",
    test: /Property values can only be of primitive types/i,
    hint: "Property values must be primitives (string/number/boolean) or arrays of primitives — not maps or nodes.",
  },
  {
    // EMSG_CALLSUBQUERY_INVALID_REFERENCES "WITH imports in CALL {} must consist of only simple references to outside variables"
    id: "call-import-simple-refs",
    test: /WITH imports in CALL \{\} must consist of only simple references/i,
    hint: "A CALL {} subquery can only import plain variables via WITH (e.g. WITH x) — not expressions like WITH x + 1.",
  },
  {
    // EMSG_MISSING_PARAMETERS "Missing parameters"
    id: "missing-parameters",
    test: /^Missing parameters$/i,
    hint: "This query uses a $parameter that wasn't provided. Supply the parameter, or inline the value.",
  },
  {
    // EMSG_INTEGER_OVERFLOW "Integer overflow '%s'"
    id: "integer-overflow",
    test: /Integer overflow '/i,
    hint: "This integer is too large for a 64-bit value. Use a smaller number or a float.",
  },
];

/** All catalog ids, in catalog order. Exposed (instead of the mutable CATALOG) so the
 *  drift-guard completeness test can assert each id is covered. */
export const CYPHER_ERROR_IDS: string[] = CATALOG.map(entry => entry.id);

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
