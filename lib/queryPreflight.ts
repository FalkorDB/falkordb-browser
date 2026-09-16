// Pre-flight checks for a Cypher query, run in the browser just before the query
// is sent to FalkorDB.
//
// This is deliberately NOT a syntax check. The grammar in `falkordb-cypher/`
// decides whether a query *parses*; this module decides whether a query that
// parses is nevertheless **certain** to be rejected by the server, so we can say
// something useful (and point at the CSV upload flow) instead of round-tripping
// to get a bare "Unsupported URI" back.
//
// The bar for adding a rule here is high: only report an issue when the server
// will fail the query *deterministically*, for a reason the browser can see
// without touching the database. Anything uncertain (a `$parameter` source, a
// file that may or may not exist on the server) is left to the server.

import { stripCypherStringsAndComments } from "./graphUpload.ts";
// Single source of truth for what FalkorDB's `LOAD CSV` can fetch, shared with the
// server-side guard in the load-csv route so the two cannot drift apart.
import { FALKOR_FETCHABLE_SCHEMES } from "../app/lib/csv-load-url.ts";

export type PreflightCode = "LOAD_CSV_UNSUPPORTED_URI" | "LOAD_CSV_FILE_URI_UNAVAILABLE";

export interface PreflightContext {
  /** Whether `file://` sources can resolve — i.e. FalkorDB reads its import
   *  folder from the same filesystem this browser deployment writes to. */
  fileUriSupported: boolean;
}

export interface PreflightIssue {
  code: PreflightCode;
  /** Short, user-facing reason the query cannot succeed. */
  message: string;
  /** What to do about it. */
  hint: string;
  /** The offending URI, as written in the query. */
  uri: string;
  /** True when uploading the file through the browser would resolve this. */
  fixableByUpload: boolean;
}

/** `LOAD CSV [WITH HEADERS] FROM` — matched against the masked query so the
 *  keywords cannot come from inside a string literal or a comment. */
const LOAD_CSV_FROM = /\bLOAD\s+CSV\s+(?:WITH\s+HEADERS\s+)?FROM\s+/gi;

/** A URI scheme per RFC 3986: ALPHA *( ALPHA / DIGIT / "+" / "-" / "." ) ":" */
const URI_SCHEME = /^([A-Za-z][A-Za-z0-9+.-]*):/;

/** The backslash escapes FalkorDB's parser actually decodes. Everything else keeps
 *  its backslash on the server — `\uXXXX` included, which the grammar accepts as an
 *  `EscapedChar` but the server leaves verbatim — so we must keep it too, or we would
 *  judge a different URI than the one the server is given. */
const FALKOR_STRING_ESCAPES = new Map([
  ["\\", "\\"],
  ["'", "'"],
  ['"', '"'],
  ["n", "\n"],
  ["r", "\r"],
  ["t", "\t"],
  ["b", "\b"],
  ["f", "\f"],
]);

/**
 * Find the string literal that starts at `start` in `masked`, and return its
 * content taken from `original`.
 *
 * `stripCypherStringsAndComments` is length-preserving and keeps the quote
 * characters, so offsets found in the mask index straight into the original.
 * Returns `null` when the source is not a literal (a `$param`, a concatenation,
 * a function call) — we cannot know what those resolve to, so we say nothing.
 */
function readSourceLiteral(original: string, masked: string, start: number): string | null {
  const quote = masked[start];
  if (quote !== "'" && quote !== '"') return null;

  const end = masked.indexOf(quote, start + 1);
  if (end === -1) return null;

  // Decode exactly what the server decodes, so we inspect the value it will see.
  return original
    .slice(start + 1, end)
    .replace(/\\(.)/gs, (escape, char: string) => FALKOR_STRING_ESCAPES.get(char) ?? escape);
}

function schemeOf(uri: string): string | null {
  const match = URI_SCHEME.exec(uri.trim());
  return match ? match[1].toLowerCase() : null;
}

function inspectSource(uri: string, context: PreflightContext): PreflightIssue | null {
  const scheme = schemeOf(uri);

  if (scheme === null || !(FALKOR_FETCHABLE_SCHEMES as readonly string[]).includes(scheme)) {
    return {
      code: "LOAD_CSV_UNSUPPORTED_URI",
      message:
        scheme === null
          ? `LOAD CSV needs an absolute URI, but "${uri}" has no scheme.`
          : `LOAD CSV cannot read "${scheme}://" sources.`,
      hint: `FalkorDB only loads CSV from ${FALKOR_FETCHABLE_SCHEMES.map((s) => `${s}://`).join(" or ")}.`,
      uri,
      fixableByUpload: true,
    };
  }

  if (scheme === "file" && !context.fileUriSupported) {
    return {
      code: "LOAD_CSV_FILE_URI_UNAVAILABLE",
      message: `This deployment cannot read "file://" sources.`,
      hint: "The database reads its import folder from a different machine than this browser.",
      uri,
      fixableByUpload: true,
    };
  }

  return null;
}

/**
 * Report the `LOAD CSV` sources in `query` that the server is certain to reject.
 * An empty array means "nothing we can prove will fail" — not "this will work".
 */
export function preflightQuery(query: string, context: PreflightContext): PreflightIssue[] {
  const masked = stripCypherStringsAndComments(query);
  const issues: PreflightIssue[] = [];

  LOAD_CSV_FROM.lastIndex = 0;
  let match = LOAD_CSV_FROM.exec(masked);
  while (match !== null) {
    const uri = readSourceLiteral(query, masked, match.index + match[0].length);
    if (uri !== null) {
      const issue = inspectSource(uri, context);
      if (issue) issues.push(issue);
    }
    match = LOAD_CSV_FROM.exec(masked);
  }

  return issues;
}
