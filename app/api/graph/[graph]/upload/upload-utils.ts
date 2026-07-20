import type { Graph } from "falkordb";
import {
  containsLoadCsv,
  splitCypherStatements,
} from "../../../../../lib/graphUpload.ts";

type CypherUploadExtension = ".txt" | ".cypher";

interface ExecuteCypherBatchOptions {
  sourceExtension?: CypherUploadExtension;
}

/**
 * .txt uploads are often copied from docs/issues and may include markdown
 * fences, wrappers, or full-line comments. Strip only obvious non-Cypher
 * lines to make uploads more forgiving without changing trusted .cypher files.
 *
 * Note: FalkorDB executes Cypher only. This does not add SQL support; it only
 * discards non-Cypher noise in loose text files before Cypher splitting.
 */
function normalizeTxtBatch(batchText: string): string {
  const withoutBom = batchText.replace(/^\uFEFF/, "");
  const lines = withoutBom.split(/\r?\n/);

  const kept = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;

    if (trimmed.startsWith("```")) return false;
    if (trimmed.startsWith("//")) return false;
    if (trimmed.startsWith("--")) return false;
    if (trimmed.startsWith("#")) return false;
    // Keep arbitrary ":..." lines (for fail-loud behavior) and only drop
    // known transaction wrappers often copied from cypher-shell snippets.
    if (/^:(begin|commit)\b/i.test(trimmed)) return false;

    return true;
  });

  return kept.join("\n");
}

export async function executeCypherBatch(
  graph: Graph,
  batchText: string,
  options: ExecuteCypherBatchOptions = {}
): Promise<number> {
  const normalizedBatch = options.sourceExtension === ".txt" ? normalizeTxtBatch(batchText) : batchText;
  const statements = splitCypherStatements(normalizedBatch);

  // Reject the whole batch before executing anything if any statement smuggles
  // its own `LOAD CSV` clause, so an uploaded batch can never trigger an
  // attacker-controlled outbound fetch.
  statements.forEach((statement, index) => {
    if (containsLoadCsv(statement)) {
      throw new Error(`Cypher statement ${index + 1} must not contain a LOAD CSV clause.`);
    }
  });

  for (let index = 0; index < statements.length; index += 1) {
    try {
      await graph.query(statements[index]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to execute Cypher statement ${index + 1}: ${message}`);
    }
  }

  return statements.length;
}
