import type { Graph } from "falkordb";
import {
  splitCypherStatements,
} from "../../../../../lib/graphUpload.ts";

/**
 * Split a Cypher batch file into statements and execute them sequentially.
 * Returns the number of statements executed. Failures are annotated with the
 * statement number so partial-batch errors are actionable.
 */
export async function executeCypherBatch(graph: Graph, batchText: string): Promise<number> {
  const statements = splitCypherStatements(batchText);

  for (let index = 0; index < statements.length; index += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await graph.query(statements[index]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to execute Cypher statement ${index + 1}: ${message}`);
    }
  }

  return statements.length;
}
