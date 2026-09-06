// ---------------------------------------------------------------------------
// falkordb-cypher — public barrel
// ---------------------------------------------------------------------------
// One import surface for the whole engine. UI code should depend on this file
// (and `monacoGlue.ts` for the Monaco bindings) — never on the internal
// grammar/completion modules directly.
// ---------------------------------------------------------------------------

export {
  createFalkorCypherEngine,
  type FalkorCypherEngine,
  type FalkorCandidate,
  type FalkorSchema,
  type FalkorSyntaxError,
} from "./engine.ts";

export {
  FALKORDB_CYPHER_LANGUAGE_ID,
  FALKORDB_ALGORITHMS,
  FALKORDB_INDEX_PROCEDURES,
  buildCandidatePool,
  type CandidateKind,
} from "./falkordbSpec.ts";

export {
  FALKOR_MARKER_OWNER,
  makeGetSuggestions,
  toCompletionItems,
  attachRealtimeLinting,
} from "./monacoGlue.ts";

export {
  GRAMMAR_MARKER_OWNER,
  attachGrammarLinting,
  registerGrammarCodeActions,
  getGrammarDiagnostics,
  type AiFixBridge,
} from "./monacoGrammarLint.ts";

export { grammarErrorsToDiagnostics, prettifyGrammarMessage } from "./grammarDiagnostics.ts";

export {
  classifyRuntimeError,
  type RuntimeError,
  type RuntimeErrorKind,
} from "./runtimeErrors.ts";
