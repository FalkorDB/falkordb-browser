// ---------------------------------------------------------------------------
// falkordb-cypher — diagnostics collector (ANTLR4 ErrorListener)
// ---------------------------------------------------------------------------
// A tiny, framework-agnostic ANTLR4 `ErrorListener` that captures every syntax
// error the lexer/parser reports into a structured, 1-based list. No Monaco
// imports live here — the Monaco glue turns these into `setModelMarkers`.
//
// This replaces the brittle string-matching backend-error parsing for *syntax*:
// errors are now discovered up-front, on every keystroke, straight from the
// grammar.
// ---------------------------------------------------------------------------

import { BaseErrorListener, type ATNSimulator, type RecognitionException, type Recognizer, type Token } from "antlr4ng";

/** A syntax error, positioned in 1-based line/column Monaco convention. */
export interface FalkorSyntaxError {
  message: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

/**
 * Collects syntax errors from both the lexer and the parser. Create one instance
 * per lint pass, attach it via `removeErrorListeners()` + `addErrorListener()`,
 * then read `.errors` afterwards.
 */
export class CollectorErrorListener extends BaseErrorListener {
  readonly errors: FalkorSyntaxError[] = [];

  // ANTLR calls this for every recognition error. `offendingSymbol` is the token
  // the parser tripped on (null for lexer errors); we span it so Monaco can draw
  // a red squiggly of the right width instead of a single caret.
  override syntaxError<S extends Token, T extends ATNSimulator>(
    _recognizer: Recognizer<T>,
    offendingSymbol: S | null,
    line: number,
    column: number,
    msg: string,
    _e: RecognitionException | null
  ): void {
    const startColumn = column + 1; // ANTLR columns are 0-based; Monaco is 1-based.
    // Prefer the offending token's real width; fall back to a single character so
    // incomplete input (e.g. "MATCH (n:") still gets a visible marker.
    const tokenText = offendingSymbol?.text ?? "";
    const width = tokenText && tokenText !== "<EOF>" ? tokenText.length : 1;

    this.errors.push({
      message: msg,
      startLineNumber: line,
      startColumn,
      endLineNumber: line,
      endColumn: startColumn + width,
    });
  }
}
