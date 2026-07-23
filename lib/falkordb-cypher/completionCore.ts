// ---------------------------------------------------------------------------
// falkordb-cypher — completion core (antlr4-c3)
// ---------------------------------------------------------------------------
// Replaces the old brittle hand-rolled lookahead with the ANTLR4 Code
// Completion Core (antlr4-c3). Given the source text and a caret offset, it:
//
//   1. Tokenizes with the generated CypherLexer.
//   2. Finds the token index at the caret (error-tolerant: partial identifiers
//      like the "n:" in "MATCH (n:" still resolve to the right position).
//   3. Runs CodeCompletionCore to get the set of *grammatically valid* tokens
//      and preferred rules at that position.
//   4. Translates those into falkordb-cypher semantic candidates, pulling
//      schema-driven items (labels, procedures, algorithms…) from the pool.
//
// Pure logic, no Monaco. Errors during parsing are swallowed — c3 works off the
// token stream and does not require a successful parse, which is exactly what
// makes the completion error-tolerant.
// ---------------------------------------------------------------------------

import { CharStream, CommonTokenStream } from "antlr4ng";
import { CodeCompletionCore } from "antlr4-c3";
import { CypherLexer, CypherParser, GRAMMAR_AVAILABLE } from "./grammarRuntime.ts";
import {
  PREFERRED_RULES,
  IGNORED_TOKENS,
  RULE_TO_CATEGORY,
  tokenLiteral,
  parseEntryRule,
} from "./grammarMapping.ts";
import { buildCandidatePool, type FalkorCandidate, type FalkorSchema } from "./falkordbSpec.ts";
import { CYPHER_KEYWORDS } from "../cypherLang.ts";

const SUPPORTED_KEYWORD_LITERALS = new Set(
  CYPHER_KEYWORDS.flatMap((keyword) => [keyword, ...keyword.split(" ")]).map((keyword) => keyword.toUpperCase())
);

/** 0-based caret offset within the source string. */
export interface CaretPosition {
  /** 1-based line. */
  line: number;
  /** 0-based column (character index within the line). */
  column: number;
}

function buildLexer(text: string): CypherLexer {
  const lexer = new CypherLexer(CharStream.fromString(text));
  // Silence console spam from the lexer; the linter owns error reporting.
  lexer.removeErrorListeners();
  return lexer;
}

/**
 * Locate the index of the token the caret sits in/before. antlr4-c3 wants the
 * index of the token to complete *at*. We scan the filled token stream for the
 * first token whose span contains (or starts at) the caret.
 */
function tokenIndexAtCaret(tokens: CommonTokenStream, caret: CaretPosition): number {
  tokens.fill();
  const list = tokens.getTokens();
  for (let i = 0; i < list.length; i += 1) {
    const t = list[i];
    const tokenLine = t.line;
    const startCol = t.column;
    const stopCol = t.column + (t.text?.length ?? 0);
    // Caret is within this token, or just before it on the same line.
    if (tokenLine === caret.line && caret.column <= stopCol) {
      // If the caret is exactly at the token start, complete at this token;
      // otherwise it is mid/after-token, still this index.
      return caret.column >= startCol ? i : Math.max(0, i - 1);
    }
    if (tokenLine > caret.line) return Math.max(0, i - 1);
  }
  return Math.max(0, list.length - 1);
}

/**
 * Compute completion candidates at the caret for the falkordb-cypher dialect.
 * `schema` injects the live, per-graph items (labels, procedures, algo params).
 */
export function collectCandidates(
  text: string,
  caret: CaretPosition,
  schema: FalkorSchema = {}
): FalkorCandidate[] {
  // Grammar not generated yet → no-op so the editor's existing autocomplete is
  // left entirely to the host provider (no regression).
  if (!GRAMMAR_AVAILABLE) return [];

  const lexer = buildLexer(text);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new CypherParser(tokenStream);
  parser.removeErrorListeners(); // c3 does not need a clean parse.

  // A parse pass populates the ATN simulator state c3 walks. Failures are fine.
  try {
    parseEntryRule(parser);
  } catch {
    /* error-tolerant: incomplete input is expected while typing */
  }

  const core = new CodeCompletionCore(parser);
  core.ignoredTokens = new Set(IGNORED_TOKENS);
  core.preferredRules = new Set(PREFERRED_RULES);

  const caretIndex = tokenIndexAtCaret(tokenStream, caret);
  const candidates = core.collectCandidates(caretIndex);

  const pool = buildCandidatePool(schema);
  const results: FalkorCandidate[] = [];
  const seen = new Set<string>();
  const push = (c: FalkorCandidate) => {
    const key = `${c.kind}:${c.label}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(c);
    }
  };

  // (a) Keyword/operator tokens the grammar says are valid here → literal text.
  for (const [tokenType] of candidates.tokens) {
    const literal = tokenLiteral(tokenType);
    if (literal) {
      if (!SUPPORTED_KEYWORD_LITERALS.has(literal)) continue;
      // Reuse a pooled keyword candidate if one exists (keeps casing/detail),
      // else synthesize one from the grammar literal.
      const pooled = pool.find((p) => p.kind === "keyword" && p.label.toUpperCase() === literal);
      push(pooled ?? { label: literal, insertText: literal, kind: "keyword", detail: "(keyword)" });
    }
  }

  // (b) Preferred rules valid here → schema-driven candidates by category.
  const activeCategories = new Set<FalkorCandidate["kind"]>();
  for (const [ruleIndex] of candidates.rules) {
    const category = RULE_TO_CATEGORY.get(ruleIndex);
    if (category) activeCategories.add(category);
  }
  // A procedure context (CALL invocationName / functionInvocation) is shared by
  // procedures, built-in/UDF functions, and FalkorDB algorithms — surface all.
  if (activeCategories.has("procedure")) {
    activeCategories.add("algorithm");
    activeCategories.add("function");
  }
  for (const candidate of pool) {
    if (activeCategories.has(candidate.kind)) push(candidate);
  }

  return results;
}
