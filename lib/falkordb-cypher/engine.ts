// ---------------------------------------------------------------------------
// falkordb-cypher — engine (public, UI-agnostic API)
// ---------------------------------------------------------------------------
// The single entry point the UI layer talks to. It owns the *live schema* (via
// an injected getter) and exposes two pure operations:
//
//   • getCompletions(text, line, column) → semantic candidates at the caret
//   • lint(text)                         → syntax errors for the whole text
//
// Deliberately free of Monaco/React imports so the "brain" can be swapped,
// tested, or reused (e.g. in a headless validator) independently of the editor.
// ---------------------------------------------------------------------------

import { collectCandidates } from "./completionCore.ts";
import { lint as lintText } from "./linter.ts";
import type { FalkorCandidate, FalkorSchema } from "./falkordbSpec.ts";
import type { FalkorSyntaxError } from "./CollectorErrorListener.ts";

export interface FalkorCypherEngine {
  /** Grammar-valid, schema-aware candidates at a 1-based line / 0-based column. */
  getCompletions(text: string, line: number, column: number): FalkorCandidate[];
  /** Syntax errors for the full text; empty array ⇒ valid. */
  lint(text: string): FalkorSyntaxError[];
}

/**
 * Create an engine bound to a schema provider. `getSchema` is called lazily on
 * each completion request, so injecting new FalkorDB parameters (labels,
 * procedures, algo.pageRank / algo.bfs, `$params`) is as simple as returning
 * them from the getter — no re-registration required (requirement 8).
 */
export function createFalkorCypherEngine(
  getSchema: () => FalkorSchema = () => ({})
): FalkorCypherEngine {
  return {
    getCompletions(text, line, column) {
      return collectCandidates(text, { line, column }, getSchema());
    },
    lint(text) {
      return lintText(text);
    },
  };
}

export type { FalkorCandidate, FalkorSchema, FalkorSyntaxError };
