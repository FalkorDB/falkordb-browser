/**
 * Server-side CSV ingestion via chunked `UNWIND $rows AS row <body>`.
 *
 * The uploaded CSV is streamed and parsed row-by-row, accumulated into fixed-size
 * batches, and each batch is inserted with a single parameterized query. This
 * imports arbitrarily large files with constant memory and never needs the CSV
 * to be reachable by the database (no temp files / LOAD CSV URL, no SSRF).
 */

export const DEFAULT_CSV_CHUNK_ROWS = 1000;
const DEFAULT_CSV_MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

/** A parsed CSV row: a map (WITH HEADERS) or a positional array. */
export type CsvRecord = Record<string, string> | string[];

/** Minimal graph surface used for ingestion (keeps this module driver-free/testable). */
export interface QueryableGraph {
    query(query: string, options?: { params?: Record<string, unknown> }): Promise<unknown>;
}

/** Thrown when a batch fails; carries how many rows were already committed. */
export class CsvIngestError extends Error {
    constructor(message: string, readonly processedRows: number) {
        super(message);
        this.name = "CsvIngestError";
    }
}

export interface CsvIngestResult {
    processedRows: number;
    chunks: number;
}

/** Max accepted CSV upload size in bytes, configurable via CSV_MAX_FILE_SIZE_MB. */
export function getCsvMaxUploadBytes(): number {
    const raw = Number(process.env.CSV_MAX_FILE_SIZE_MB);
    return Number.isFinite(raw) && raw > 0
        ? Math.floor(raw * 1024 * 1024)
        : DEFAULT_CSV_MAX_UPLOAD_BYTES;
}

/**
 * Wrap the user's per-row Cypher `body` in an `UNWIND $rows AS row` prelude. The
 * rows are passed as a query parameter (never interpolated), so the CSV data can
 * never inject Cypher. A trailing `;` is tolerated.
 */
export function buildUnwindQuery(body: string): string {
    const trimmed = body.trim().replace(/;+\s*$/, "").trim();
    if (!trimmed) {
        throw new Error("A Cypher query body is required.");
    }
    return `UNWIND $rows AS row\n${trimmed}`;
}

/**
 * Consume `records`, inserting them in batches of `chunkRows` via
 * `buildUnwindQuery(body)`. Each batch is one atomic query; on failure a
 * `CsvIngestError` is thrown with the number of rows already committed.
 */
export async function ingestCsvRecords(
    graph: QueryableGraph,
    records: AsyncIterable<CsvRecord>,
    body: string,
    chunkRows: number = DEFAULT_CSV_CHUNK_ROWS,
): Promise<CsvIngestResult> {
    const query = buildUnwindQuery(body);
    const size = chunkRows > 0 ? chunkRows : DEFAULT_CSV_CHUNK_ROWS;
    let batch: CsvRecord[] = [];
    let processedRows = 0;
    let chunks = 0;

    const flush = async () => {
        if (batch.length === 0) return;
        const rows = batch;
        batch = [];
        try {
            await graph.query(query, { params: { rows } });
        } catch (error) {
            throw new CsvIngestError(
                `Failed to import rows ${processedRows + 1}-${processedRows + rows.length}: ${(error as Error).message}`,
                processedRows,
            );
        }
        processedRows += rows.length;
        chunks += 1;
    };

    for await (const record of records) {
        batch.push(record);
        if (batch.length >= size) {
            // eslint-disable-next-line no-await-in-loop
            await flush();
        }
    }
    await flush();

    if (processedRows === 0) {
        throw new CsvIngestError("The CSV has no data rows to import.", 0);
    }

    return { processedRows, chunks };
}
