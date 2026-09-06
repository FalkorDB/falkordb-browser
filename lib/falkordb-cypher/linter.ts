// ---------------------------------------------------------------------------
// falkordb-cypher — linter
// ---------------------------------------------------------------------------
// Runs a full lex + parse pass purely to harvest syntax errors via the
// CollectorErrorListener. Pure logic, no Monaco. This is what powers the
// real-time (on-input) red squigglies and the `isQueryValid` execution gate.
// ---------------------------------------------------------------------------

import { CharStream, CommonTokenStream } from "antlr4ng";
import { CypherLexer, CypherParser, GRAMMAR_AVAILABLE } from "./grammarRuntime.ts";
import { parseEntryRule } from "./grammarMapping.ts";
import { CollectorErrorListener, type FalkorSyntaxError } from "./CollectorErrorListener.ts";

/**
 * Lint a falkordb-cypher query. Returns every syntax error found by the lexer
 * and parser. An empty array means the text is syntactically valid.
 */
export function lint(text: string): FalkorSyntaxError[] {
  // Empty / whitespace-only input is trivially valid (no marker while idle).
  if (!text.trim()) return [];

  // Grammar not generated yet → treat everything as valid so execution is never
  // falsely blocked. Real linting activates once the grammar is dropped in.
  if (!GRAMMAR_AVAILABLE) return [];

  const listener = new CollectorErrorListener();

  const lexer = new CypherLexer(CharStream.fromString(text));
  lexer.removeErrorListeners();
  lexer.addErrorListener(listener);

  const tokenStream = new CommonTokenStream(lexer);
  const parser = new CypherParser(tokenStream);
  parser.removeErrorListeners();
  parser.addErrorListener(listener);

  // Default (error-recovering) strategy keeps parsing after the first error so
  // we can report every problem in one pass, not just the earliest.
  try {
    parseEntryRule(parser);
  } catch {
    /* Any thrown recognition error is already captured by the listener. */
  }

  return listener.errors;
}
