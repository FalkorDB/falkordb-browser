import type { Graph } from "falkordb";

export type UploadMode = "rdb" | "csv" | "cypher";

export const RDB_UPLOAD_EXTENSIONS: readonly string[] = [".rdb", ".dump"];
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

  if (mode === "rdb") {
    if (!hasExtension(RDB_UPLOAD_EXTENSIONS, extension)) {
      return { ok: false, status: 400, message: "RDB upload requires a .rdb or .dump file." };
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
        i += 1;
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

  const finalQuery = current.trim();
  if (finalQuery) queries.push(finalQuery);

  return queries;
}

/**
 * Parse CSV text and execute the user-provided query once per row, passing the
 * row object and its zero-based index as `$row` / `$index` query parameters.
 * Returns the number of rows processed. Failures are annotated with the row
 * number so partial-batch errors are actionable.
 */
export async function executeCsvIngestion(
  graph: Graph,
  csvText: string,
  query: string
): Promise<number> {
  const rows = parseCsvRows(csvText);

  for (let index = 0; index < rows.length; index += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await graph.query(query, { params: { row: rows[index], index } });
    } catch (error) {
      throw new Error(`Failed to process CSV row ${index + 1}: ${(error as Error).message}`);
    }
  }

  return rows.length;
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
