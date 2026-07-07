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
// e.g. "OPTIONAL MATCH" before "OPTIONAL", "IS NOT NULL" before "IS NULL" before "IS".
export const CYPHER_KEYWORDS = [
  // Reading clauses
  "OPTIONAL MATCH",
  "MATCH",
  "OPTIONAL",
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
  // Write clauses
  "CREATE",
  "MERGE",
  "ON CREATE SET",
  "ON MATCH SET",
  "DELETE",
  "DETACH DELETE",
  "DETACH",
  "SET",
  "REMOVE",
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
  "IS",
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

export const BUILTIN_FUNCTIONS = [
  "all",
  "any",
  "exists",
  "isEmpty",
  "none",
  "single",
  "coalesce",
  "endNode",
  "hasLabels",
  "id",
  "labels",
  "properties",
  "randomUUID",
  "startNode",
  "timestamp",
  "type",
  "typeOf",
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
  "head",
  "keys",
  "last",
  "range",
  "size",
  "tail",
  "reduce",
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
  "acos",
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
  "left",
  "lTrim",
  "replace",
  "reverse",
  "right",
  "rTrim",
  "split",
  "substring",
  "toLower",
  "toJSON",
  "toUpper",
  "trim",
  "point",
  "distance",
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
  "indegree",
  "outdegree",
  "nodes",
  "relationships",
  "length",
  "shortestPath",
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
  "db.constraints",
  "db.indexes",
  "db.labels",
  "db.propertyKeys",
  "db.relationshipTypes",
  "db.meta.stats",
  "db.idx.fulltext.createNodeIndex",
  "db.idx.fulltext.drop",
  "db.idx.fulltext.queryNodes",
  "db.idx.vector.createNodeIndex",
  "db.idx.vector.drop",
  "db.idx.vector.queryNodes",
  "algo.SPpaths",
  "algo.SSpaths",
  "algo.betweenness",
  "algo.BFS",
  "algo.pageRank",
  "algo.degree",
];

// Derives the namespaced UDF function names (e.g. "myLib.myFunc") from the UDF
// list, matching how they are presented in the editor's autocomplete.
export function udfFunctionNames(udfList: UDFEntry[]): string[] {
  return udfList.flatMap(([, libName, , functions]) =>
    functions.map(fn => `${libName}.${fn}`)
  );
}
