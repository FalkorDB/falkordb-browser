// ---------------------------------------------------------------------------
// falkordb-cypher — grammar runtime gate
// ---------------------------------------------------------------------------
// Single choke point for loading the ANTLR4-generated lexer/parser. It detects
// whether the REAL grammar has been generated yet (vs. the shipped stub) and
// exposes GRAMMAR_AVAILABLE. Every consumer guards on this flag so the engine
// degrades gracefully to a no-op when the grammar is absent — the editor never
// crashes and existing autocomplete is untouched. Drop the real
// CypherLexer.ts / CypherParser.ts artifacts into ./generated and the engine lights up.
// ---------------------------------------------------------------------------

import { CypherLexer } from "./generated/CypherLexer";
import { CypherParser } from "./generated/CypherParser";

export const GRAMMAR_AVAILABLE =
  !(CypherLexer as unknown as { __isStub?: boolean }).__isStub &&
  !(CypherParser as unknown as { __isStub?: boolean }).__isStub;

export { CypherLexer, CypherParser };
