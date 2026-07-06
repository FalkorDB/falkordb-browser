import type { Graph } from "falkordb";
import type { QueryOptions } from "falkordb/dist/src/commands";

export type UploadMode = "dump" | "csv" | "cypher";

export const RESTORE_UPLOAD_EXTENSIONS: readonly string[] = [".dump"];
export const CSV_UPLOAD_EXTENSIONS: readonly string[] = [".csv"];
export const CYPHER_UPLOAD_EXTENSIONS: readonly string[] = [".txt", ".cypher", ".cql"];

export interface UploadValidationInput {
  mode?: string;
  fileId?: string;
  extension?: string;
  query?: string;
}

export type UploadValidationResult =
  | { ok: true; mode: UploadMode }
  | { ok: false; status: number; message: string };

function hasExtension(allowed: readonly string[], extension?: string): boolean {
  return typeof extension === "string" && allowed.includes(extension);
}

/**
 * Validate an upload request body against the resolved file extension.
 * Pure and side-effect free so it can be unit tested in isolation.
 */
export function validateUploadInput({
  mode,
  fileId,
  extension,
  query,
}: UploadValidationInput): UploadValidationResult {
  if (!mode || !fileId) {
    return { ok: false, status: 400, message: "mode and fileId are required." };
  }

  if (mode === "dump") {
    if (!hasExtension(RESTORE_UPLOAD_EXTENSIONS, extension)) {
      return { ok: false, status: 400, message: "Restore requires a .dump file." };
    }
    return { ok: true, mode };
  }

  if (mode === "csv") {
    if (!hasExtension(CSV_UPLOAD_EXTENSIONS, extension)) {
      return { ok: false, status: 400, message: "CSV upload requires a .csv file." };
    }
    if (!query?.trim()) {
      return { ok: false, status: 400, message: "CSV upload requires a query." };
    }
    return { ok: true, mode };
  }

  if (mode === "cypher") {
    if (!hasExtension(CYPHER_UPLOAD_EXTENSIONS, extension)) {
      return { ok: false, status: 400, message: "Cypher upload requires a .txt, .cypher, or .cql file." };
    }
    return { ok: true, mode };
  }

  return { ok: false, status: 400, message: "Invalid upload mode." };
}

export function parseCsvRows(csvText: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        currentField += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      currentRow.push(currentField);
      rows.push(currentRow);
      currentField = "";
      currentRow = [];
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  const normalizedRows = rows.filter((row) => row.some((cell) => cell.trim() !== ""));

  if (normalizedRows.length === 0) {
    return [];
  }

  const [headerRow, ...dataRows] = normalizedRows;
  const headers = headerRow.map((header, index) => {
    const value = header.trim();
    return value.length > 0 ? value : `column${index + 1}`;
  });

  return dataRows.map((dataRow) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = dataRow[index] ?? "";
    });
    return record;
  });
}

export function splitCypherStatements(cypherBatch: string): string[] {
  const queries: string[] = [];
  let current = "";
  let quote: "'" | "\"" | "`" | null = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let blockCommentText = "";

  for (let i = 0; i < cypherBatch.length; i += 1) {
    const char = cypherBatch[i];
    const next = cypherBatch[i + 1];

    if (lineComment) {
      if (char === "\n" || char === "\r") {
        lineComment = false;
        current += char;
      }
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        blockCommentText = "";
        current += " ";
        i += 1;
      } else {
        blockCommentText += char;
      }
      continue;
    }

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\" && quote !== "`") {
      current += char;
      escaped = true;
      continue;
    }

    if (quote) {
      current += char;
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      blockCommentText = "/*";
      i += 1;
      continue;
    }

    if (char === "'" || char === "\"" || char === "`") {
      quote = char;
      current += char;
      continue;
    }

    if (char === ";") {
      const query = current.trim();
      if (query) queries.push(query);
      current = "";
      continue;
    }

    current += char;
  }

  if (blockComment && blockCommentText) {
    current += blockCommentText;
  }

  const finalQuery = current.trim();
  if (finalQuery) queries.push(finalQuery);

  return queries;
}

/** Default batching bounds for CSV ingestion: rows per chunk and bytes per chunk. */
export const DEFAULT_CSV_CHUNK_SIZE = 1000;
export const DEFAULT_CSV_CHUNK_BYTES = 512 * 1024;

export type CsvParamValue =
  | null
  | string
  | number
  | boolean
  | CsvParamValue[]
  | { [key: string]: CsvParamValue };

export interface CsvRowItem {
  index: number;
  data: Record<string, CsvParamValue>;
}

export interface CsvIngestionOptions {
  chunkSize?: number;
  maxChunkBytes?: number;
  transformRow?: (row: Record<string, string>) => Record<string, CsvParamValue>;
}

export interface CsvIngestionResult {
  processedRows: number;
  chunks: number;
}

export type CsvColumnType = "string" | "integer" | "float" | "boolean";

/**
 * Coerce a raw CSV cell (always a string) to the target column type.
 * Empty values become null for non-string types. Invalid values throw so the
 * caller can surface an actionable error. Unknown types fall back to string.
 */
export function coerceValue(value: string, type: CsvColumnType): CsvParamValue {
  if (type === "integer" || type === "float" || type === "boolean") {
    const trimmed = value.trim();
    if (trimmed === "") return null;

    if (type === "integer") {
      if (!/^[+-]?\d+$/.test(trimmed)) {
        throw new Error(`"${value}" is not an integer`);
      }
      const parsed = Number.parseInt(trimmed, 10);
      if (!Number.isSafeInteger(parsed)) {
        throw new Error(`"${value}" is out of the safe integer range`);
      }
      return parsed;
    }

    if (type === "float") {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        throw new Error(`"${value}" is not a number`);
      }
      return parsed;
    }

    const lower = trimmed.toLowerCase();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0") return false;
    throw new Error(`"${value}" is not a boolean`);
  }

  return value;
}

/**
 * Coerce every cell of a row using a per-column type map (default string).
 * Errors are annotated with the column name.
 */
export function coerceRow(
  row: Record<string, string>,
  columnTypes: Record<string, CsvColumnType>
): Record<string, CsvParamValue> {
  const result: Record<string, CsvParamValue> = {};
  for (const [key, raw] of Object.entries(row)) {
    try {
      result[key] = coerceValue(raw, columnTypes[key] ?? "string");
    } catch (error) {
      throw new Error(`Column "${key}": ${(error as Error).message}`);
    }
  }
  return result;
}

const CYPHER_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Return a name usable as a Cypher label/property key: bare when it is a valid
 * identifier, otherwise backtick-quoted with embedded backticks doubled.
 */
export function escapeCypherIdentifier(name: string): string {
  if (CYPHER_IDENTIFIER.test(name)) return name;
  return `\`${name.replace(/`/g, "``")}\``;
}

/**
 * Build a safe starter `CREATE` statement from a node label and CSV headers.
 * Labels and property keys are escaped so arbitrary header text cannot inject
 * Cypher.
 */
export function generateCsvQuery(label: string, columns: string[]): string {
  const safeLabel = escapeCypherIdentifier(label.trim() || "Row");
  const props = columns
    .filter((col) => col.trim() !== "")
    .map((col) => `${escapeCypherIdentifier(col)}: row.${escapeCypherIdentifier(col)}`)
    .join(", ");
  return props ? `CREATE (:${safeLabel} {${props}})` : `CREATE (:${safeLabel})`;
}

/**
 * Wrap a user-provided per-row Cypher body so it runs over a batch of rows.
 * Each row is exposed as `row` (a map) and its zero-based position as `index`.
 * A trailing semicolon is stripped so the result is a single statement.
 *
 * Note: cardinality-changing clauses in the body (aggregating `WITH`, `LIMIT`,
 * a nested `UNWIND`, etc.) operate over the whole chunk, not a single row.
 */
export function buildBatchCsvQuery(body: string): string {
  const normalized = body.replace(/[;\s]+$/, "").trim();
  return `UNWIND $rows AS __r WITH __r.index AS index, __r.data AS row\n${normalized}`;
}

const csvByteEncoder = new TextEncoder();

/** Approximate the serialized UTF-8 byte size of a row item. */
function approximateItemBytes(item: CsvRowItem): number {
  return csvByteEncoder.encode(JSON.stringify(item)).length;
}

/**
 * Split row items into chunks bounded by both a row count and an approximate
 * serialized byte size, so wide rows don't produce oversized query params.
 */
export function chunkCsvItems(
  items: CsvRowItem[],
  maxRows: number,
  maxBytes: number
): CsvRowItem[][] {
  const chunks: CsvRowItem[][] = [];
  let current: CsvRowItem[] = [];
  let currentBytes = 0;

  for (const item of items) {
    const size = approximateItemBytes(item);
    if (current.length > 0 && (current.length >= maxRows || currentBytes + size > maxBytes)) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(item);
    currentBytes += size;
  }

  if (current.length > 0) chunks.push(current);

  return chunks;
}

const CSV_HEADER_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Reject CSV headers that aren't valid Cypher identifiers. The FalkorDB param
 * serializer emits map keys verbatim (`{key:value}`), so a header with spaces or
 * special characters would produce an invalid — and potentially injectable — map
 * literal when bound as `$rows`.
 */
function assertSafeCsvHeaders(rows: Record<string, string>[]): void {
  if (rows.length === 0) return;
  for (const key of Object.keys(rows[0])) {
    if (!CSV_HEADER_IDENTIFIER.test(key)) {
      throw new Error(
        `CSV column "${key}" is not a valid identifier; rename it using letters, digits, or underscore.`
      );
    }
  }
}

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
