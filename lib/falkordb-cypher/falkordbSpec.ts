// ---------------------------------------------------------------------------
// falkordb-cypher — dialect specification
// ---------------------------------------------------------------------------
// This module is the single source of truth for what makes the *falkordb-cypher*
// language differ from vanilla openCypher. The ANTLR4 grammar (CypherLexer /
// CypherParser, generated from the openCypher grammar) provides the syntactic
// baseline; this file *wraps* that baseline with FalkorDB-specific semantics:
//
//   • FalkorDB-only clauses / keywords (FOREACH, DETACH DELETE synonyms, …)
//   • Graph procedures (db.*, algo.*) surfaced through CALL
//   • Full-text / vector index constraints (db.idx.fulltext.*, db.idx.vector.*)
//   • Graph-algorithm parameters (algo.pageRank, algo.BFS, …)
//   • A runtime-injectable schema (labels, relationship types, property keys,
//     server-reported procedures) so completion stays live per graph.
//
// NOTHING here imports Monaco or ANTLR — it is pure data + types, so it can be
// unit-tested in isolation and reused by both the completion engine and the
// linter.
// ---------------------------------------------------------------------------

import { CYPHER_KEYWORDS, BUILTIN_FUNCTIONS, FALLBACK_PROCEDURE_NAMES } from "../cypherLang.ts";

export const FALKORDB_CYPHER_LANGUAGE_ID = "falkordb-cypher";

/** Semantic category of a completion candidate. Drives the Monaco icon/kind. */
export type CandidateKind =
  | "keyword"
  | "function"
  | "procedure"
  | "algorithm"
  | "label"
  | "relationshipType"
  | "propertyKey"
  | "variable"
  | "parameter"
  | "namespace";

/** A single, UI-agnostic completion candidate produced by the engine. */
export interface FalkorCandidate {
  /** Text shown in the popup (e.g. "algo.pageRank"). */
  label: string;
  /** Text inserted; may contain a `${0}` snippet placeholder. */
  insertText: string;
  /** Whether `insertText` uses snippet syntax (function/procedure calls do). */
  isSnippet?: boolean;
  kind: CandidateKind;
  /** Human-readable "(keyword)", "(procedure)"… tag reused by the existing UI. */
  detail: string;
}

/**
 * Live, per-graph schema injected at runtime. Everything here is optional so the
 * engine degrades gracefully when a graph has not finished loading.
 */
export interface FalkorSchema {
  labels?: string[];
  relationshipTypes?: string[];
  propertyKeys?: string[];
  /** Fully-qualified procedure names reported by `db.procedures()` / server. */
  procedures?: string[];
  /** Namespaced UDF function names (e.g. "myLib.myFunc"). */
  functions?: string[];
  /** Query parameters currently in scope (`$foo`). */
  parameters?: string[];
}

// ---------------------------------------------------------------------------
// FalkorDB-specific graph algorithms exposed through `CALL algo.*`.
// These are the parameters requirement (8) asks us to inject seamlessly.
// ---------------------------------------------------------------------------
export const FALKORDB_ALGORITHMS: string[] = [
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

// ---------------------------------------------------------------------------
// Full-text & vector index procedures. Requirement (2) calls out "full-text
// index constraints" — these are the only procedures allowed to create/query
// those indexes in FalkorDB, so we surface them as first-class procedures.
// ---------------------------------------------------------------------------
export const FALKORDB_INDEX_PROCEDURES: string[] = [
  "db.idx.fulltext.createNodeIndex",
  "db.idx.fulltext.drop",
  "db.idx.fulltext.queryNodes",
  "db.idx.fulltext.queryRelationships",
  "db.idx.vector.queryNodes",
  "db.idx.vector.queryRelationships",
];

const KEYWORD_CANDIDATES: FalkorCandidate[] = CYPHER_KEYWORDS.map((label) => ({
  label,
  insertText: label,
  kind: "keyword",
  detail: "(keyword)",
}));

const FUNCTION_CANDIDATES: FalkorCandidate[] = BUILTIN_FUNCTIONS.map((name) => ({
  label: `${name}()`,
  insertText: `${name}(\${0})`,
  isSnippet: true,
  kind: "function",
  detail: "(function)",
}));

// Static procedures = server fallback list ∪ index procedures ∪ algorithms,
// de-duplicated. When the live schema reports procedures they take precedence.
const STATIC_PROCEDURE_NAMES = Array.from(
  new Set([...FALLBACK_PROCEDURE_NAMES, ...FALKORDB_INDEX_PROCEDURES, ...FALKORDB_ALGORITHMS])
);

function procedureCandidate(name: string): FalkorCandidate {
  const isAlgo = name.startsWith("algo.");
  return {
    label: `${name}()`,
    insertText: `${name}(\${0})`,
    isSnippet: true,
    kind: isAlgo ? "algorithm" : "procedure",
    detail: isAlgo ? "(algorithm)" : "(procedure)",
  };
}

/**
 * Builds the full candidate pool for the falkordb-cypher dialect, merging the
 * static grammar-derived keywords/functions with the live, injected schema.
 * The completion core filters this pool down to what is grammatically valid at
 * the caret — this function only decides *what exists* in the language, not
 * *what is legal here*.
 */
export function buildCandidatePool(schema: FalkorSchema = {}): FalkorCandidate[] {
  const procedureNames = schema.procedures?.length ? schema.procedures : STATIC_PROCEDURE_NAMES;

  const labelCandidates: FalkorCandidate[] = (schema.labels ?? []).map((label) => ({
    label,
    insertText: label,
    kind: "label",
    detail: "(label)",
  }));

  const relCandidates: FalkorCandidate[] = (schema.relationshipTypes ?? []).map((label) => ({
    label,
    insertText: label,
    kind: "relationshipType",
    detail: "(relationship type)",
  }));

  const propCandidates: FalkorCandidate[] = (schema.propertyKeys ?? []).map((label) => ({
    label,
    insertText: label,
    kind: "propertyKey",
    detail: "(property key)",
  }));

  const procedureCandidates: FalkorCandidate[] = procedureNames.map(procedureCandidate);

  const udfCandidates: FalkorCandidate[] = (schema.functions ?? []).map((name) => ({
    label: `${name}()`,
    insertText: `${name}(\${0})`,
    isSnippet: true,
    kind: "function",
    detail: "(udf function)",
  }));

  const paramCandidates: FalkorCandidate[] = (schema.parameters ?? []).map((name) => ({
    label: `$${name.replace(/^\$/, "")}`,
    insertText: `$${name.replace(/^\$/, "")}`,
    kind: "parameter",
    detail: "(parameter)",
  }));

  return [
    ...KEYWORD_CANDIDATES,
    ...FUNCTION_CANDIDATES,
    ...procedureCandidates,
    ...udfCandidates,
    ...labelCandidates,
    ...relCandidates,
    ...propCandidates,
    ...paramCandidates,
  ];
}
