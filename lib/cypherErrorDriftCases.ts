// Drift-guard fixtures for the Cypher error catalog (lib/cypherErrors.ts).
//
// The catalog recognizes errors by matching the *wording* of FalkorDB server
// messages. That wording is defined in the server (src/errors/error_msgs.h) and can
// change between versions — if it does, our regexes silently stop matching and users
// lose their hints. To catch that early, every catalog entry that can be provoked by a
// query is paired here with a real query plus the message we expect it to produce.
//
// `lib/cypherErrors.smoke.ts` runs each query against a live FalkorDB and asserts
// BOTH that the live message still matches `expectedMessage` AND that
// `getCypherErrorHint(liveMessage).id === id`. The unit completeness test
// (lib/cypherErrors.test.ts) asserts every catalog id is covered here — either as a
// runnable `DRIFT_CASES` entry or as a documented `NOT_DRIFT_TESTABLE` exception.
//
// This module is intentionally pure (no `falkordb` / React / Next imports) so the
// completeness test can import it under `node --test` without a database.

export type DriftCase = {
  /** Catalog id this query is expected to resolve to (see lib/cypherErrors.ts). */
  id: string;
  /** A query that reliably provokes the error on a real FalkorDB. */
  query: string;
  /** A distinctive fragment of the live message, used as a wording sentinel. */
  expectedMessage: RegExp;
};

// Every query below was verified against a live FalkorDB (GRAPH.QUERY) — the comment
// after each shows the exact message produced at verification time.
export const DRIFT_CASES: DriftCase[] = [
  // --- existing catalog entries that are query-triggerable -------------------
  {
    id: "undefined-variable",
    query: "MATCH (p:Person) RETURN xyz",
    expectedMessage: /not defined/i, // 'xyz' not defined
  },
  {
    id: "unknown-function",
    query: "RETURN lenght(1)",
    expectedMessage: /Unknown function/i, // Unknown function 'lenght'
  },
  {
    id: "type-mismatch",
    query: "RETURN 'a' * 2",
    // Type mismatch: expected Integer, Float, or Null but was String
    expectedMessage: /Type mismatch: expected .+ but was/i,
  },
  {
    id: "division-by-zero",
    query: "RETURN 1/0",
    expectedMessage: /Division by zero/i, // Division by zero
  },
  {
    id: "nested-aggregation",
    query: "MATCH (n) RETURN count(count(n))",
    // Can't use aggregate functions inside of aggregate functions.
    expectedMessage: /aggregate functions inside of aggregate functions/i,
  },
  {
    id: "with-missing-alias",
    query: "MATCH (n) WITH n.name RETURN 1",
    // WITH clause projections must be aliased
    expectedMessage: /WITH clause projections must be aliased/i,
  },
  {
    id: "return-star-no-vars",
    query: "MATCH () RETURN *",
    // RETURN * is not allowed when there are no variables in scope
    expectedMessage: /RETURN \* is not allowed when there are no variables in scope/i,
  },
  {
    id: "var-length-range",
    query: "MATCH (a)-[*3..1]->(b) RETURN a",
    // Variable length path, maximum number of hops must be greater or equal to minimum number of hops.
    expectedMessage: /maximum number of hops must be greater or equal to minimum number of hops/i,
  },
  {
    id: "create-directed-relationship",
    query: "CREATE (a)-[:KNOWS]-(b)",
    // Only directed relationships are supported in CREATE
    expectedMessage: /Only directed relationships are supported in CREATE/i,
  },
  {
    id: "multiple-statements",
    query: "MATCH (n) RETURN n; MATCH (m) RETURN m",
    // Error: query with more than one statement is not supported.
    expectedMessage: /more than one statement is not supported/i,
  },
  {
    id: "procedure-not-registered",
    query: "CALL db.nope()",
    expectedMessage: /is not registered/i, // Procedure `db.nope` is not registered
  },

  // --- newly added catalog entries ------------------------------------------
  {
    id: "redeclared-variable",
    query: "MATCH (n) CREATE (n)",
    // The bound variable 'n' can't be redeclared in a CREATE clause
    expectedMessage: /can't be redeclared in a .+ clause/i,
  },
  {
    id: "duplicate-result-column",
    query: "MATCH (n) RETURN n AS x, n AS x",
    // Error: Multiple result columns with the same name are not supported.
    expectedMessage: /Multiple result columns with the same name/i,
  },
  {
    id: "same-alias-node-rel",
    query: "MATCH (a)-[a]->(b) RETURN a",
    // The alias 'a' was specified for both a node and a relationship.
    expectedMessage: /was specified for both a node and a relationship/i,
  },
  {
    id: "same-rel-var-multiple",
    query: "MATCH ()-[r]->(), ()-[r]->() RETURN r",
    // Cannot use the same relationship variable 'r' for multiple patterns.
    expectedMessage: /same relationship variable .+ for multiple patterns/i,
  },
  {
    id: "union-mismatched-returns",
    query: "MATCH (n) RETURN n UNION MATCH (m) RETURN m AS x",
    // All sub queries in a UNION must have the same column names.
    expectedMessage: /All sub queries in a UNION must have the same column names/i,
  },
  {
    id: "union-combination",
    query: "RETURN 1 AS x UNION RETURN 2 AS x UNION ALL RETURN 3 AS x",
    // Invalid combination of UNION and UNION ALL.
    expectedMessage: /Invalid combination of UNION and UNION ALL/i,
  },
  {
    id: "query-missing-return",
    query: "MATCH (n)",
    // Query cannot conclude with MATCH (must be a RETURN clause, ...)
    expectedMessage: /Query cannot conclude with .+ \(must be a RETURN clause/i,
  },
  {
    id: "clause-after-return",
    query: "RETURN 1 MATCH (n) RETURN n",
    expectedMessage: /Unexpected clause following RETURN/i, // Unexpected clause following RETURN
  },
  {
    id: "missing-with-after-optional-match",
    query: "OPTIONAL MATCH (n) MATCH (m) RETURN m",
    // A WITH clause is required to introduce a MATCH clause after an OPTIONAL MATCH.
    expectedMessage: /A WITH clause is required to introduce a MATCH clause after an OPTIONAL MATCH/i,
  },
  {
    id: "missing-with-after-update",
    query: "CREATE (n) MATCH (m) RETURN m",
    // A WITH clause is required to introduce MATCH after an updating clause.
    expectedMessage: /A WITH clause is required to introduce .+ after an updating clause/i,
  },
  {
    id: "delete-invalid-target",
    query: "MATCH (n) DELETE n.name",
    // DELETE can only be called on nodes, paths and relationships
    expectedMessage: /DELETE can only be called on nodes, paths and relationships/i,
  },
  {
    id: "set-non-alias-lhs",
    query: "MATCH (n) SET n.a.b = 1",
    // FalkorDB does not currently support non-alias references on the left-hand side of SET expressions
    expectedMessage: /non-alias references on the left-hand side of SET/i,
  },
  {
    id: "foreach-non-updating",
    query: "MATCH (n) FOREACH (x IN [1] | RETURN x)",
    // Error: Only updating clauses may reside in FOREACH
    expectedMessage: /Only updating clauses may reside in FOREACH/i,
  },
  {
    id: "invalid-property-value",
    query: "CREATE (n {x:{a:1}})",
    // Property values can only be of primitive types or arrays of primitive types
    expectedMessage: /Property values can only be of primitive types/i,
  },
  {
    id: "call-import-simple-refs",
    query: "WITH 1 AS x CALL { WITH x + 1 RETURN 1 AS y } RETURN y",
    // WITH imports in CALL {} must consist of only simple references to outside variables
    expectedMessage: /WITH imports in CALL \{\} must consist of only simple references/i,
  },
  {
    id: "missing-parameters",
    query: "RETURN $p",
    expectedMessage: /Missing parameters/i, // Missing parameters
  },
  {
    id: "integer-overflow",
    query: "RETURN 999999999999999999999999999999",
    // Integer overflow '999999999999999999999999999999'
    expectedMessage: /Integer overflow/i,
  },
];

// Catalog ids that are intentionally NOT covered by a runnable drift case, with the
// reason. These describe runtime/resource or constraint-setup conditions that can't be
// provoked safely or deterministically by a single throwaway query in a smoke test.
export const NOT_DRIFT_TESTABLE: Record<string, string> = {
  "unique-constraint":
    "Requires creating a unique constraint and then violating it (multi-step schema setup).",
  "mandatory-constraint":
    "Requires creating a mandatory (existence) constraint and then violating it (multi-step schema setup).",
  "query-timed-out":
    "Requires a query that exceeds the server time limit — non-deterministic and slow to provoke.",
  "mem-consumption":
    "Requires exhausting the query memory limit — unsafe/non-deterministic in a shared smoke run.",
  "write-queue-full":
    "Requires saturating the server write queue under load — not reproducible by a single query.",
};
