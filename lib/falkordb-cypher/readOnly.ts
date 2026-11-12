import { CharStream, CommonTokenStream, ParserRuleContext, type ParseTree } from "antlr4ng";
import { CollectorErrorListener } from "./CollectorErrorListener.ts";
import { parseEntryRule } from "./grammarMapping.ts";
import { CypherLexer, CypherParser, GRAMMAR_AVAILABLE } from "./grammarRuntime.ts";

const NON_READ_ONLY_RULES = new Set([
  CypherParser.RULE_oC_UpdatingClause,
  CypherParser.RULE_oC_FalkorCommand,
  CypherParser.RULE_oC_StandaloneCall,
  CypherParser.RULE_oC_InQueryCall,
]);

function containsNonReadOnlyRule(tree: ParseTree): boolean {
  if (!(tree instanceof ParserRuleContext)) return false;
  if (NON_READ_ONLY_RULES.has(tree.ruleIndex)) return true;
  return tree.children.some(containsNonReadOnlyRule);
}

/**
 * Conservatively accepts only valid queries that the grammar can prove are read-only.
 * CALL procedures are rejected because their side effects are procedure-specific.
 */
export function isReadOnlyQuery(query: string): boolean {
  if (!GRAMMAR_AVAILABLE || !query.trim()) return false;

  const errors = new CollectorErrorListener();
  const lexer = new CypherLexer(CharStream.fromString(query));
  lexer.removeErrorListeners();
  lexer.addErrorListener(errors);

  const parser = new CypherParser(new CommonTokenStream(lexer));
  parser.removeErrorListeners();
  parser.addErrorListener(errors);

  const tree = parseEntryRule(parser);
  return errors.errors.length === 0 && !containsNonReadOnlyRule(tree);
}
