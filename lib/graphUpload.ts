/**
 * Browser-safe helpers and feature flags for the Manage Graph → Upload Data flow.
 *
 * This module is intentionally free of server-only dependencies (no FalkorDB
 * driver, `fs`, or redis client) so it can be imported by both the client
 * component (`UploadGraph.tsx`) and the API routes without coupling the browser
 * bundle to server ingestion logic. The graph-executing functions live in the
 * API route's `upload-utils.ts` sibling module.
 */

/**
 * Dump restore is temporarily disabled: a FalkorDB server-side bug can corrupt
 * the target graph on RESTORE. The API (`/api/upload`) and the UI (`UploadGraph`
 * / `CreateGraph`) read this flag to keep the feature non-accessible without
 * removing the restore UI code.
 *
 * Note: flipping this flag alone does NOT re-enable restore — there is currently
 * no dump-restore execution route (`/api/graph/[graph]/upload` runs Cypher
 * batches only). A dedicated restore endpoint must also be (re)added once the
 * database issue is fixed.
 */
export const DUMP_RESTORE_ENABLED: boolean = false;

/**
 * LOAD CSV upload is temporarily disabled while its CSV temp-storage subsystem
 * (local / S3 / Vercel Blob + `/api/csv-temp` + `/api/graph/[graph]/load-csv`)
 * is hardened and given full test coverage in a follow-up PR. The flag makes the
 * feature non-accessible without deleting the code: the UI hides the "Load CSV"
 * tab and the CSV temp / load-csv routes reject requests with a 403. Set it back
 * to `true` once the follow-up work lands.
 */
export const CSV_UPLOAD_ENABLED: boolean = false;

/**
 * Split a Cypher batch file into individual statements on top-level `;`,
 * ignoring separators inside string/backtick literals and `//` or `/* *\/`
 * comments. Pure and side-effect free so it can be unit tested in isolation.
 */
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

    if (char === "\\" && (quote === "'" || quote === "\"")) {
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
