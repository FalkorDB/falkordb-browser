// Shared Cypher language data: built-in keyword and function names.
//
// These lists are the single source of truth for both the Monaco editor
// (autocomplete / tokenizer in app/components/CypherEditor.tsx) and the
// "Did you mean…?" error suggestions (lib/cypherSuggestions.ts). Keeping them
// here avoids duplicating the lists in two places.

import type { UDFEntry } from "./utils.ts";

// Multi-word keywords are listed before any single-word keyword that shares a prefix
// so that the Monarch tokenizer regex alternation tries the longer pattern first and
// avoids a shorter prefix consuming characters that belong to the full keyword.
// e.g. "LOAD CSV WITH HEADERS" before "LOAD CSV", and "ORDER BY" before shorter variants.
//
// Source: FalkorDB parser keywords in
// FalkorDB/deps/libcypher-parser/lib/src/parser.leg.
export const CYPHER_KEYWORDS = [
  // Statement options
  "CYPHER",
  "PROFILE",
  "EXPLAIN",
  // Query hints
  "USING PERIODIC COMMIT",
  // CSV import
  "LOAD CSV WITH HEADERS",
  "LOAD CSV",
  "WITH HEADERS",
  "FIELDTERMINATOR",
  "FROM",
  // Reading clauses
  "START",
  "OPTIONAL MATCH",
  "MATCH",
  "WHERE",
  "RETURN",
  "DISTINCT",
  "ORDER BY",
  "SKIP",
  "LIMIT",
  // Combining / flow clauses
  "WITH",
  "UNION ALL",
  "UNION",
  "UNWIND",
  "FOREACH",
  // Planner hints
  "USING INDEX",
  "USING JOIN ON",
  "USING SCAN",
  // Write clauses
  "CREATE UNIQUE",
  "CREATE",
  "MERGE",
  "ON CREATE SET",
  "ON MATCH SET",
  "ON CREATE",
  "ON MATCH",
  "ON",
  "DELETE",
  "DETACH DELETE",
  "SET",
  "REMOVE",
  // Schema commands
  "CREATE CONSTRAINT ON",
  "CREATE INDEX ON",
  "CREATE INDEX FOR",
  "DROP CONSTRAINT ON",
  "DROP INDEX ON",
  "DROP INDEX FOR",
  "ASSERT",
  "IS UNIQUE",
  // Procedural
  "CALL",
  "YIELD",
  // Boolean / logical operators
  "NOT",
  "AND",
  "OR",
  "XOR",
  // Predicate keywords (multi-word before single-word prefix)
  "IS NOT NULL",
  "IS NULL",
  "IN",
  "CONTAINS",
  "STARTS WITH",
  "ENDS WITH",
  // CASE expression
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  // List/predicate expressions
  "FILTER",
  "EXTRACT",
  "REDUCE",
  "ALL",
  "ANY",
  "SINGLE",
  "NONE",
  // Literal keywords
  "NULL",
  "TRUE",
  "FALSE",
  // Sort direction
  "ASC",
  "ASCENDING",
  "DESC",
  "DESCENDING",
  // Aliasing
  "AS",
];

// Built-in functions derived from FalkorDB's src/arithmetic/builtin_funcs.gperf
// (https://github.com/FalkorDB/FalkorDB/blob/master/src/arithmetic/builtin_funcs.gperf)
// cross-referenced against the OpenCypher specification.
// Internal operator entries (add, sub, eq, gt, etc.) and non-callable internals
// (case, list_comprehension, intern, nop, prev, path_filter, …) are excluded.
export const BUILTIN_FUNCTIONS = [
  // Predicate functions (openCypher)
  "all",
  "any",
  "exists",
  "isEmpty",
  "none",
  "single",
  // Conditional / general
  "coalesce",
  // Graph entity functions (openCypher + FalkorDB)
  "endNode",
  "hasLabels",
  "id",
  "labels",
  "properties",
  "randomUUID",
  "startNode",
  "timestamp",
  "type",
  "typeOf",     // FalkorDB extension
  // Aggregate functions
  "avg",
  "collect",
  "count",
  "max",
  "min",
  "percentileCont",
  "percentileDisc",
  "stDev",
  "stDevP",
  "sum",
  // List functions (openCypher)
  "head",
  "keys",
  "last",
  "range",
  "reduce",
  "size",
  "tail",
  "slice",
  // FalkorDB list extensions
  "list.dedup",
  "list.insert",
  "list.insertlistelements",
  "list.remove",
  "list.sort",
  // Math functions (openCypher)
  "abs",
  "ceil",
  "e",
  "exp",
  "floor",
  "log",
  "log10",
  "pow",
  "rand",
  "round",
  "sign",
  "sqrt",
  // Trigonometric functions (openCypher)
  "acos",
  "asin",
  "atan",
  "atan2",
  "cos",
  "cot",
  "degrees",
  "haversin",
  "pi",
  "radians",
  "sin",
  "tan",
  // String functions (openCypher)
  "left",
  "lTrim",
  "replace",
  "reverse",
  "right",
  "rTrim",
  "split",
  "substring",
  "toLower",
  "toUpper",
  "trim",
  // String functions (FalkorDB extensions)
  "toJSON",
  "string.join",
  "string.matchregex",
  "string.replaceregex",
  // Spatial functions (openCypher)
  "point",
  "distance",
  // Temporal functions (openCypher)
  "date",
  "date.transaction",
  "duration",
  "localtime",
  "localtime.transaction",
  "localdatetime",
  "localdatetime.transaction",
  // Type-conversion functions (openCypher)
  "toBoolean",
  "toBooleanList",
  "toBooleanOrNull",
  "toFloat",
  "toFloatList",
  "toFloatOrNull",
  "toInteger",
  "toIntegerList",
  "toIntegerOrNull",
  "toString",
  "toStringList",
  "toStringOrNull",
  // Type-conversion functions (FalkorDB extensions)
  "tolist",
  "tomap",
  // Graph traversal / path functions
  "indegree",
  "outdegree",
  "nodes",
  "relationships",
  "length",
  "shortestPath",
  "allShortestPaths",
  // Vector functions (FalkorDB extensions)
  "vecf32",
  "vec.euclideanDistance",
  "vec.cosineDistance",
];

/**
 * Fallback list of well-known FalkorDB built-in procedure names (without parentheses).
 * Used to populate CALL autocomplete when the server-side procedure fetch fails or is
 * unavailable. This list matches the procedures shipped with FalkorDB 4.x.
 */
export const FALLBACK_PROCEDURE_NAMES: string[] = [
  // db.* introspection
  "db.constraints",
  "db.indexes",
  "db.labels",
  "db.propertyKeys",
  "db.relationshipTypes",
  "db.meta.stats",
  // db.idx.* full-text & vector index procedures
  "db.idx.fulltext.createNodeIndex",
  "db.idx.fulltext.drop",
  "db.idx.fulltext.queryNodes",
  "db.idx.fulltext.queryRelationships",
  "db.idx.vector.queryNodes",
  "db.idx.vector.queryRelationships",
  // dbms.*
  "dbms.functions",
  "dbms.procedures",
  // algo.* graph algorithms
  "algo.betweenness",
  "algo.BFS",
  "algo.HarmonicCentrality",
  "algo.labelPropagation",
  "algo.maxFlow",
  "algo.MSF",
  "algo.pageRank",
  "algo.SPpaths",
  "algo.SSpaths",
  "algo.WCC",
];

// Derives the namespaced UDF function names (e.g. "myLib.myFunc") from the UDF
// list, matching how they are presented in the editor's autocomplete.
export function udfFunctionNames(udfList: UDFEntry[]): string[] {
  return udfList.flatMap(([, libName, , functions]) =>
    functions.map(fn => `${libName}.${fn}`)
  );
}
