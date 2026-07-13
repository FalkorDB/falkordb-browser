// ---------------------------------------------------------------------------
// falkordb-cypher — grammar mapping
// ---------------------------------------------------------------------------
// The bridge between the raw openCypher ANTLR4 grammar and the falkordb-cypher
// dialect. antlr4-c3 tells us, at a caret, which *token types* and *parser
// rules* are grammatically valid. This module translates those low-level
// grammar facts into the high-level semantic categories our UI understands
// (label, relationship type, property key, procedure, …).
//
// Keeping every grammar-name reference in ONE place means that when the grammar
// is regenerated or the dialect is extended, only this file changes — the
// engine and UI stay untouched. That is the "explicitly designate falkordb-cypher"
// wrapping layer required by the spec.
// ---------------------------------------------------------------------------

import { CypherParser, CypherLexer } from "./grammarRuntime.ts";

/** Resolve an ANTLR static constant (rule index / token type) by name safely. */
function constant(owner: Record<string, unknown>, name: string): number | undefined {
  const value = owner[name];
  return typeof value === "number" ? value : undefined;
}

const P = CypherParser as unknown as Record<string, unknown>;
const L = CypherLexer as unknown as Record<string, unknown>;

// ---------------------------------------------------------------------------
// Parser rules whose presence at the caret implies a *schema* completion.
// These are the openCypher `oC_`-prefixed rule names. We look each up by name
// and drop any a grammar build doesn't define, so a grammar variant never
// crashes.
// ---------------------------------------------------------------------------
export const RULE_TO_CATEGORY: ReadonlyMap<number, "label" | "relationshipType" | "propertyKey" | "procedure" | "function" | "variable"> =
  new Map(
    (
      [
        ["oC_NodeLabel", "label"],
        ["oC_LabelName", "label"],
        ["oC_RelTypeName", "relationshipType"],
        ["oC_PropertyKeyName", "propertyKey"],
        ["oC_ProcedureName", "procedure"],
        ["oC_FunctionName", "function"],
        ["oC_Variable", "variable"],
      ] as const
    )
      .map(([ruleName, category]) => [constant(P, `RULE_${ruleName}`), category] as const)
      .filter((entry): entry is readonly [number, (typeof entry)[1]] => entry[0] !== undefined)
  );

/**
 * The set of parser rules we ask antlr4-c3 to treat as *candidate rules* (i.e.
 * stop descending and report the rule itself). Everything in RULE_TO_CATEGORY
 * qualifies.
 */
export const PREFERRED_RULES: ReadonlySet<number> = new Set(RULE_TO_CATEGORY.keys());

// ---------------------------------------------------------------------------
// Lexer token types that carry no useful completion text on their own and would
// only add noise (whitespace, comments, literals, identifiers). antlr4-c3 lets
// us ignore these so the schema rules above fire instead.
// ---------------------------------------------------------------------------
export const IGNORED_TOKENS: ReadonlySet<number> = new Set(
  ["SP", "WHITESPACE", "Comment", "StringLiteral", "DecimalInteger", "HexInteger", "OctalInteger", "UnescapedSymbolicName", "EscapedSymbolicName"]
    .map((name) => constant(L, name))
    .filter((t): t is number => t !== undefined)
);

/**
 * Map a concrete lexer token type to the keyword/operator text ANTLR knows for
 * it, so a valid keyword token becomes an insertable string. openCypher defines
 * keywords as case-insensitive fragment rules (`MATCH : ('M'|'m')…`), so their
 * `literalNames` entry is null and the keyword text lives in `symbolicNames`.
 * Returns undefined for punctuation and for tokens without a fixed spelling
 * (identifiers, literals) — those are handled via schema rules instead.
 */
export function tokenLiteral(tokenType: number): string | undefined {
  const literal = (CypherLexer as unknown as { literalNames?: (string | null)[] }).literalNames?.[tokenType];
  if (literal) {
    const unquoted = literal.replace(/^'/, "").replace(/'$/, "");
    // Only surface word-like keywords; skip pure punctuation (e.g. '(', '{').
    return /^[A-Za-z][A-Za-z ]*$/.test(unquoted) ? unquoted.toUpperCase() : undefined;
  }
  const symbolic = (CypherLexer as unknown as { symbolicNames?: (string | null)[] }).symbolicNames?.[tokenType];
  if (symbolic && /^[A-Z][A-Z_0-9]*$/.test(symbolic)) {
    // Strip the disambiguation prefix openCypher uses for target-reserved words
    // (e.g. L_SKIP → SKIP, NULL stays NULL).
    return symbolic.replace(/^L_/, "");
  }
  return undefined;
}

/** Entry-rule accessor, isolated so a grammar rename only touches this file. */
export function parseEntryRule(parser: CypherParser) {
  return parser.oC_Cypher();
}
