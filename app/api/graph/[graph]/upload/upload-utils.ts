import type { Graph } from "falkordb";
import type { QueryOptions } from "falkordb/dist/src/commands";
import {
  DEFAULT_CSV_CHUNK_SIZE,
  DEFAULT_CSV_CHUNK_BYTES,
  assertSafeCsvHeaders,
  buildBatchCsvQuery,
  chunkCsvItems,
  parseCsvRows,
  splitCypherStatements,
  type CsvIngestionOptions,
  type CsvIngestionResult,
  type CsvRowItem,
} from "../../../../../lib/graphUpload.ts";

/**
 * Parse CSV text and execute the user's row body over the rows in batches, each
 * batch a single `UNWIND $rows` query (atomic per chunk; earlier chunks stay
 * committed if a later one fails). Returns the number of rows and chunks
 * processed. The optional `transformRow` hook lets callers coerce raw string
 * cells before they are bound as query params.
 */
export async function executeCsvIngestion(
  graph: Graph,
  csvText: string,
  body: string,
  options: CsvIngestionOptions = {}
): Promise<CsvIngestionResult> {
  const {
    chunkSize = DEFAULT_CSV_CHUNK_SIZE,
    maxChunkBytes = DEFAULT_CSV_CHUNK_BYTES,
    transformRow,
  } = options;

  const statements = splitCypherStatements(body);
  if (statements.length > 1) {
    throw new Error("The CSV query must be a single Cypher statement.");
  }
  const [statement] = statements;
  if (!statement) {
    throw new Error("The CSV query is empty.");
  }

  const rows = parseCsvRows(csvText);
  assertSafeCsvHeaders(rows);
  const items: CsvRowItem[] = rows.map((row, index) => {
    try {
      return { index, data: transformRow ? transformRow(row) : row };
    } catch (error) {
      throw new Error(`Failed to process CSV row ${index + 1}: ${(error as Error).message}`);
    }
  });
  const chunks = chunkCsvItems(items, chunkSize, maxChunkBytes);
  const query = buildBatchCsvQuery(statement);

  for (let c = 0; c < chunks.length; c += 1) {
    const chunk = chunks[c];
    try {
      // Row items carry coerced (possibly non-string) values; FalkorDB accepts
      // the list-of-maps shape at runtime, so bind it as query params.
      const queryOptions = { params: { rows: chunk } } as unknown as QueryOptions;
      // eslint-disable-next-line no-await-in-loop
      await graph.query(query, queryOptions);
    } catch (error) {
      const first = chunk[0].index + 1;
      const last = chunk[chunk.length - 1].index + 1;
      throw new Error(
        `Failed to process CSV rows ${first}-${last}: ${(error as Error).message}`
      );
    }
  }

  return { processedRows: rows.length, chunks: chunks.length };
}

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
      throw new Error(`Failed to execute Cypher statement ${index + 1}: ${(error as Error).message}`);
    }
  }

  return statements.length;
}
