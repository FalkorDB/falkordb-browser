/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/prefer-default-export

"use client";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React, { RefObject } from "react";
import type { FalkorDBCanvas } from "@falkordb/canvas";
import { signOut } from "next-auth/react";

export type ToastArguments = {
  title: string;
  description: React.ReactNode;
  variant: "destructive" | "default";
};

export type ToastFn = (args: ToastArguments) => void;

export const screenSize = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};


export type Value = string | number | boolean;

export type HistoryQuery = {
  queries: Query[];
  currentQuery: Query;
  query: string;
  counter: number;
};

export type Query = {
  text: string;
  metadata: string[];
  explain: string[];
  profile: string[];
  graphName: string;
  timestamp: number;
  status: "Success" | "Failed" | "Empty";
  elementsCount: number;
  fav: boolean;
  name?: string;
};

export type Node = {
  id: number;
  labels: string[];
  color: string;
  visible: boolean;
  expand: boolean;
  collapsed: boolean;
  size?: number;
  data: {
    [key: string]: any;
  };
};

export type Link = {
  id: number;
  relationship: string;
  color: string;
  source: number;
  target: number;
  visible: boolean;
  expand: boolean;
  collapsed: boolean;
  data: {
    [key: string]: any;
  };
};

export type GraphData = {
  nodes: Node[];
  links: Link[];
};

export type NodeCell = {
  id: number;
  labels: string[];
  properties: {
    [key: string]: any;
  };
};

export type LinkCell = {
  id: number;
  relationshipType: string;
  sourceId: number;
  destinationId: number;
  properties: {
    [key: string]: any;
  };
};

export type DataCell = NodeCell | LinkCell | NodeCell[] | LinkCell[] | number | string | null;

export type DataRow = {
  [key: string]: DataCell;
};

export type Data = DataRow[];

export type MemoryValue = number | Map<string, MemoryValue>;

export interface LinkStyle {
  color: string;
}

export interface LabelStyle extends LinkStyle {
  size?: number;
}

export interface InfoLabel {
  name: string;
  style: LabelStyle;
  show: boolean;
  count: number;
}

export interface Label extends Omit<InfoLabel, "count"> {
  elements: Node[];
  textWidth?: number;
  textHeight?: number;
  style: LabelStyle;
}

export interface InfoRelationship {
  name: string;
  style: LinkStyle;
  show: boolean;
  count: number;
}

export interface Relationship extends Omit<InfoRelationship, "count"> {
  elements: Link[];
  textWidth?: number;
  textHeight?: number;
  textAscent?: number;
  textDescent?: number;
}

export type GraphRef = RefObject<FalkorDBCanvas | null>;

export type Panel = "data" | "add" | undefined;

export type SelectCell = {
  value: string;
  type: "select";
  options: string[];
  selectType: "Role";
  onChange: (value: string) => Promise<boolean>;
};

export type ObjectCell = {
  value: DataCell;
  type: "object";
};

export type TextCell = {
  value: string;
  type: "text";
  onChange: (value: string) => Promise<boolean>;
};

export type Tab = "Graph" | "Table" | "Metadata";

export type ReadOnlyCell = {
  value: string;
  type: "readonly";
};

export type LazyCell = {
  value?: string;
  loadCell: () => Promise<string>;
  type: "readonly";
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  type:
  | "Text"
  | "Result"
  | "Error"
  | "Status"
  | "CypherQuery"
  | "CypherResult"
  | "Schema";
};

// [library_name, type, 'functions', function_names[]]
export type UDFEntry = [string, string, string, string[]];

// [...UDFEntry, library_code, code]
export type UDFEntryWithCode = [...UDFEntry, string, string];

export type SyntaxErrorInfo = {
  message: string;
  context: string;
  contextOffset: number;
  line: number;
  column: number;
};

export type UserFriendlyMessage = {
  title: string;
  description: React.ReactNode;
  syntaxError?: SyntaxErrorInfo;
};

export type ConnectionType = "Standalone" | "Cluster" | "Sentinel";

export interface ClusterNodeInfo {
  host: string;
  port: number;
  role: string;
  slots?: string;
}

export interface ConnectionInfo {
  sentinelRole?: string;
  sentinelReplicas?: number;
  sentinelMasterHost?: string;
  sentinelMasterPort?: number;
  clusterNodes?: ClusterNodeInfo[];
}

export type Cell = SelectCell | TextCell | ObjectCell | ReadOnlyCell | LazyCell;

export interface Row {
  cells: Cell[];
  name: string;
  checked?: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getSSEGraphResult(
  url: string,
  toast: ToastFn,
  setIndicator: (indicator: "online" | "offline") => void
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let handled = false;

    const evtSource = new EventSource(url);
    evtSource.addEventListener("result", (event: MessageEvent) => {
      const result = JSON.parse(event.data);
      evtSource.close();
      setIndicator("online");
      resolve(result);
    });

    evtSource.addEventListener("error", (event: MessageEvent) => {
      handled = true;
      let rawMessage: unknown = "Request failed";
      let rawStatus: unknown = 0;
      let code: string | undefined;

      try {
        const payload = JSON.parse(event.data) as {
          message?: unknown;
          status?: unknown;
          code?: string;
        };
        rawMessage = payload.message;
        rawStatus = payload.status;
        code = payload.code;
      } catch (error) {
        console.error("Failed to parse SSE error event:", error);
      }

      const message = normalizeErrorMessage(rawMessage) || "Request failed";
      const parsedStatus = Number(rawStatus);
      const status = Number.isFinite(parsedStatus) ? parsedStatus : 0;

      evtSource.close();

      if (status === 401 && code === "SESSION_INVALID") {
        triggerSessionInvalidationSignOut();
        setIndicator("offline");
        reject(new Error(message));
        return;
      }

      const friendly = toUserFriendlyMessage(message, status);
      toast({ title: friendly.title, description: friendly.description, variant: "destructive" });

      if (status === 401 || status >= 500) setIndicator("offline");

      reject(new Error(message));
    });

    evtSource.onerror = () => {
      if (handled) return;

      evtSource.close();
      toast({
        title: "Error",
        description: "Network or server error",
        variant: "destructive",
      });
      setIndicator("offline");
      reject(new Error("Network or server error"));
    };
  });
}

// Parses FalkorDB parser error format:
// "errMsg: <message> line: <N>, column: <N>, offset: <N> errCtx: <snippet> errCtxOffset: <N>"
// Uses [\s\S] for multiline tolerance and avoids strict end-of-string anchoring.
export function parseSyntaxError(raw: string): SyntaxErrorInfo | null {
  const match = raw.match(
    /errMsg:\s*([\s\S]+?)\s+line:\s*(\d+),\s*column:\s*(\d+),\s*offset:\s*\d+\s+errCtx:\s?([\s\S]+?)\s+errCtxOffset:\s*(\d+)/
  );
  if (!match) return null;
  return {
    message: match[1].trim(),
    line: Math.max(1, Number(match[2])),
    column: Math.max(1, Number(match[3])),
    context: match[4],
    contextOffset: Number(match[5]),
  };
}

// Builds a React element that highlights the error position in the query snippet.
// Clamps contextOffset to valid range to prevent blank/incorrect highlights.
export function formatSyntaxError(
  message: string,
  context: string,
  contextOffset: number
): React.ReactNode {
  const safeOffset = context.length > 0
    ? Math.max(0, Math.min(contextOffset, context.length - 1))
    : 0;
  const before = context.slice(0, safeOffset);
  const errorChar = context[safeOffset] || "";
  const after = context.slice(safeOffset + 1);

  // Extract the token containing the error character and enrich the message.
  // e.g. "Invalid input 's': expected RETURN" → "Invalid input 's' in RETsURN: expected RETURN"
  let wordStart = safeOffset;
  while (wordStart > 0 && !/\s/.test(context[wordStart - 1])) wordStart -= 1;
  let wordEnd = safeOffset;
  while (wordEnd < context.length && !/\s/.test(context[wordEnd])) wordEnd += 1;
  const errorWord = context.slice(wordStart, wordEnd);

  // Insert "in <word>" after the quoted character, before the colon
  const enriched = errorWord.length > 1
    ? message.replace(/^(Invalid input '[^']*')(:)/, `$1 in ${errorWord}$2`)
    : message;

  return React.createElement("div", { className: "flex flex-col gap-1" },
    React.createElement("span", null, enriched),
    React.createElement("code", {
      className: "mt-1 block rounded px-2 py-1 text-xs font-mono whitespace-pre-wrap break-words"
    },
      before,
      React.createElement("span", {
        className: "font-bold text-xl underline mx-1"
      }, errorChar || " "),
      after
    )
  );
}

export function normalizeErrorMessage(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw instanceof Error) return raw.message;
  if (raw == null) return "";

  try {
    return JSON.stringify(raw);
  } catch {
    return String(raw);
  }
}

function extractResponseErrorMessage(bodyText: string): string {
  if (!bodyText) return "";

  try {
    const parsed = JSON.parse(bodyText) as unknown;

    if (typeof parsed === "string") return parsed;

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const body = parsed as Record<string, unknown>;
      const message = normalizeErrorMessage(body.message || body.error || body.detail);

      if (message) return message;

      if (body.status === "offline") return "Database is offline.";
    }
  } catch {
    // bodyText is already plain text
  }

  return bodyText;
}

const USER_READABLE_ERROR_PATTERNS = [
  /\bunknown function\b/i,
  /\bnot defined\b/i,
  /\balready exists\b/i,
  /\bmissing parameter\b/i,
  /\bempty query\b/i,
  /\btype mismatch\b/i,
  /\bdivision by zero\b/i,
  /\binvalid (?:cypher only|entity|graph name|host|input|json|messages|model|password|port|replace|role|type|url|username|value)\b/i,
  /\b(?:api key|attribute name|attribute value|code|graph name|key|label|messages|model|name|password|role|source name|type|username|value) (?:is required|cannot be empty)\b/i,
  /\bselected nodes are required\b/i,
  /^validation failed$/i,
  /^database is offline\.$/i,
  /^graph not found\b/i,
  /^your graph is empty\b/i,
  /^model\/api key mismatch\b/i,
  /^model ".+" not found\b/i,
  /^ollama model ".+" not found\b/i,
  /^invalid .*api key\b/i,
  /^api key error\b/i,
  /^cannot connect to ollama\b/i,
  /^network error\b/i,
  /^request timed out\b/i,
  /^could not generate\b/i,
  /^unable to generate\b/i,
  /^no messages provided$/i,
  /^no user messages found$/i,
];

function isAllowlistedUserError(message: string): boolean {
  return USER_READABLE_ERROR_PATTERNS.some(pattern => pattern.test(message));
}

// Maps raw server/Redis/FalkorDB error messages to user-friendly descriptions.
// Syntax errors are parsed and displayed with the error position highlighted.
export function toUserFriendlyMessage(raw: unknown, status: number): UserFriendlyMessage {
  const rawMessage = normalizeErrorMessage(raw).trim();
  if (!rawMessage) {
    if (status === 401) return { title: "Error", description: "Your session has expired. Please sign in again." };
    if (status >= 500) return { title: "Error", description: "Something went wrong on the server. Please try again later." };
    return { title: "Error", description: "An unexpected error occurred. Please try again." };
  }

  const parsed = parseSyntaxError(rawMessage);
  if (parsed) {
    return { title: "Syntax Error", description: formatSyntaxError(parsed.message, parsed.context, parsed.contextOffset), syntaxError: parsed };
  }

  const lower = rawMessage.toLowerCase();

  if (lower.includes("connection refused") || lower.includes("econnrefused")) {
    return { title: "Error", description: "Unable to connect to the database. Please check your connection settings." };
  }

  if (lower.includes("noauth") || lower.includes("wrongpass")) {
    return { title: "Error", description: "Database authentication failed. Please check your credentials." };
  }

  if (lower.includes("loading") && lower.includes("dataset")) {
    return { title: "Error", description: "The database is still loading. Please wait a moment and try again." };
  }

  if (lower.includes("oom") || lower.includes("out of memory")) {
    return { title: "Error", description: "The server is running low on memory. Please try again later." };
  }

  if (lower.includes("timeout") || lower.includes("timed out")) {
    return { title: "Error", description: "The request timed out. Please try a simpler query or try again later." };
  }

  if (lower.includes("readonly") && lower.includes("replica")) {
    return { title: "Error", description: "This operation cannot be performed on a read-only replica." };
  }

  if (status === 401) {
    return { title: "Error", description: "Your session has expired. Please sign in again." };
  }

  if (status >= 500) {
    return { title: "Error", description: "Something went wrong on the server. Please try again later." };
  }

  if (isAllowlistedUserError(rawMessage)) {
    return { title: "Error", description: rawMessage };
  }

  return { title: "Error", description: "An unexpected error occurred. Please try again." };
}

// Guards against triggering multiple concurrent signOut calls when many
// in-flight requests hit a newly-invalidated session at the same time.
let sessionInvalidationInFlight = false;

function triggerSessionInvalidationSignOut(): void {
  if (sessionInvalidationInFlight) return;
  sessionInvalidationInFlight = true;
  signOut({ callbackUrl: "/login" }).catch(() => {
    sessionInvalidationInFlight = false;
  });
}

export async function securedFetch(
  input: string,
  init: RequestInit,
  toast: ToastFn,
  setIndicator: (indicator: "online" | "offline") => void
): Promise<Response> {
  const response = await fetch(input, init);
  const { status } = response;

  // The server signals "your session is orphaned, sign out now" via this
  // header. We only sign out on this explicit signal so that ordinary 401s
  // (e.g. login form with wrong password) don't log out unrelated users.
  if (status === 401 && response.headers.get("X-Session-Invalid") === "1") {
    triggerSessionInvalidationSignOut();
    setIndicator("offline");
    return response;
  }

  if (status >= 300) {
    const message = extractResponseErrorMessage(await response.text());

    const friendly = toUserFriendlyMessage(message, status);
    toast({
      title: friendly.title,
      description: friendly.description,
      variant: "destructive",
    });

    if (status === 401 || status >= 500) {
      setIndicator("offline");
    }
  } else {
    setIndicator("online");
  }
  return response;
}

export function prepareArg(arg: string) {
  return encodeURIComponent(arg.trim());
}

export const between = (hash: number, from: number, to: number) => {
  if (to <= from) return from;
  return (Math.abs(hash) % (to - from)) + from;
};

export const getDefaultQuery = (q?: string) =>
  q || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN * LIMIT 100";

export const getMetaStats = async (name: string, toast: ToastFn, setIndicator: (indicator: "online" | "offline") => void, isReadOnly?: boolean) => {
  const q = "CALL db.meta.stats() YIELD labels, relTypes RETURN labels, relTypes as relationships";
  const readOnlyParam = isReadOnly ? '&readOnly=true' : '';

  try {
    const result = await getSSEGraphResult(`/api/graph/${prepareArg(name)}?query=${encodeURIComponent(q)}${readOnlyParam}`, toast, setIndicator) as { data: { labels: { [key: string]: number }, relationships: { [key: string]: number } }[] };

    if (!result) return undefined;

    const row = result.data?.[0];

    if (!row) return undefined;

    const l = Object.entries(row.labels);
    const r = Object.entries(row.relationships);

    return [l, r];
  } catch (error) {
    console.error("Failed to fetch meta stats:", error);
    return undefined;
  }
};

export function rgbToHSL(hex: string): string {
  // Remove the # if present
  const formattedHex = hex.replace(/^#/, "");

  // Convert hex to RGB
  const r = parseInt(formattedHex.slice(0, 2), 16) / 255;
  const g = parseInt(formattedHex.slice(2, 4), 16) / 255;
  const b = parseInt(formattedHex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
        break;
    }
    h /= 6;
  }

  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `hsl(${hDeg}, ${sPct}%, ${lPct}%)`;
}

type MemoryValueType = (string | number | MemoryValueType)[];

const processEntries = (arr: MemoryValueType): Map<string, MemoryValue> => {
  const entries: [string, MemoryValue][] = [];

  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i] as string;
    const value = arr[i + 1];

    // If the value is an array, recursively process it
    if (Array.isArray(value)) {
      entries.push([key, processEntries(value)]);
    } else {
      entries.push([key, value as number]);
    }
  }

  return new Map(entries);
};

export const getMemoryUsage = async (
  name: string,
  toast: ToastFn,
  setIndicator: (indicator: "online" | "offline") => void
): Promise<Map<string, MemoryValue>> => {
  const result = await securedFetch(
    `api/graph/${prepareArg(name)}/memory`,
    {
      method: "GET",
    },
    toast,
    setIndicator
  );

  if (!result.ok) return new Map();

  const json = await result.json();

  return processEntries(json.result);
};

/**
 * Builds a nested object from an array of keys, where each element becomes a nested property.
 *
 * @param arr - Ordered list of keys; each successive element becomes a child object of the previous key
 * @returns An object where each string in `arr` is a nested key (an empty array returns `{}`)
 */
export function createNestedObject(arr: string[]): object {
  if (arr.length === 0) return {};

  const [first, ...rest] = arr;
  return { [first]: createNestedObject(rest) };
}

/**
 * Finds the index of the closing brace that matches the opening brace at startIndex.
 * Properly handles nested braces in Cypher queries (e.g., map literals, nested CALL blocks).
 * Also handles braces inside string literals (single or double quoted).
 * 
 * @param str - The string to search in
 * @param startIndex - The index of the opening brace
 * @returns The index of the matching closing brace, or -1 if not found
 */
function findMatchingBrace(str: string, startIndex: number): number {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = startIndex; i < str.length; i += 1) {
    const char = str[i];
    const prevChar = i > 0 ? str[i - 1] : '';

    // Toggle quote state (ignore escaped quotes)
    if (char === "'" && prevChar !== '\\') {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && prevChar !== '\\') {
      inDoubleQuote = !inDoubleQuote;
    }

    // Only count braces when not inside a string literal
    if (!inSingleQuote && !inDoubleQuote) {
      if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          return i;
        }
      }
    }
  }
  return -1;
}

/**
 * Checks if query contains any CALL block followed by RETURN without LIMIT.
 * Handles nested braces correctly (e.g., map literals like {key: "val"}).
 * Only matches if RETURN immediately follows the CALL block (before other clauses).
 * Iterates through ALL CALL blocks to handle multiple subqueries (e.g., UNION queries).
 * 
 * @param query - The Cypher query to check
 * @returns true if any CALL block with RETURN but no LIMIT is found
 */
function hasCallBlockWithReturnNoLimit(query: string): boolean {
  let searchStart = 0;

  // Iterate through all CALL blocks in the query
  while (searchStart < query.length) {
    const callMatch = /\bCALL\s*\{/i.exec(query.substring(searchStart));
    if (!callMatch) break;

    const absoluteIndex = searchStart + callMatch.index;
    const openBraceIndex = absoluteIndex + callMatch[0].indexOf('{');
    const closeBraceIndex = findMatchingBrace(query, openBraceIndex);

    if (closeBraceIndex !== -1) {
      // Check only the immediate continuation after this CALL block
      // Stop at the next major clause (UNION, WITH, MATCH, CALL, etc.) or end of query
      const afterCallBlock = query.substring(closeBraceIndex + 1);
      const nextClauseMatch = afterCallBlock.match(/\b(UNION|WITH|MATCH|CALL|CREATE|MERGE|DELETE|SET|REMOVE)\b/i);
      const relevantPart = nextClauseMatch
        ? afterCallBlock.substring(0, nextClauseMatch.index)
        : afterCallBlock;

      // Check if this immediate part has RETURN without LIMIT
      if (/\bRETURN\b/i.test(relevantPart) && !/\bLIMIT\b/i.test(relevantPart)) {
        return true;
      }

      // Move search position past this CALL block
      searchStart = closeBraceIndex + 1;
    } else {
      // If no matching brace found, move past the opening brace and continue
      searchStart = openBraceIndex + 1;
    }
  }

  return false;
}

export function getQueryWithLimit(
  query: string,
  limit: number
): [string, number] {
  let existingLimit = 0;

  const finalReturnMatch = query.match(
    /\bRETURN\b(?!\s+.+?\bCALL\b)[^;]*?\bLIMIT\s+(\d+)/is
  );
  if (finalReturnMatch) {
    existingLimit = parseInt(finalReturnMatch[1], 10);
  }

  if (limit === 0) return [query, existingLimit];

  if (query.includes("UNION")) {
    if (!query.includes("CALL")) {
      return [`CALL { ${query} } RETURN * LIMIT ${limit}`, limit];
    }

    if (hasCallBlockWithReturnNoLimit(query)) {
      return [`${query} LIMIT ${limit}`, limit];
    }
  }

  if (query.match(/\bRETURN\b(?![^;]*\bLIMIT\b)/i)) {
    return [`${query} LIMIT ${limit}`, limit];
  }

  return [query, existingLimit];
}

export const formatName = (newGraphName: string) =>
  newGraphName === '""' ? "" : newGraphName;

export async function fetchOptions(
  type: "Graph" | "Schema",
  toast: ToastFn,
  setIndicator: (indicator: "online" | "offline") => void,
  indicator: "online" | "offline",
  setSelectedValue: (value: string) => void,
  setOptions: (options: string[]) => void,
  contentPersistence: boolean
) {
  if (indicator === "offline") return;

  const result = await securedFetch(
    `api/${type === "Graph" ? "graph" : "schema"}`,
    {
      method: "GET",
    },
    toast,
    setIndicator
  );

  if (!result.ok) return;


  const { opts } = (await result.json()) as { opts: string[] };

  setOptions(opts);

  if (
    setSelectedValue &&
    opts.length === 1 &&
    (!contentPersistence || type === "Graph")
  )
    setSelectedValue(formatName(opts[0]));
}

export const areCaptionKeysEqual = (left: [string, boolean][], right: [string, boolean][]) =>
  left.length === right.length && left.every((key, index) => key[0] === right[index][0] && key[1] === right[index][1]);

export function getTheme(theme: string | undefined) {
  let currentTheme = theme;

  if (currentTheme === "system")
    currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  return {
    background: currentTheme === "dark" ? "#1A1A1A" : "#FFFFFF",
    foreground: currentTheme === "dark" ? "#FFFFFF" : "#1A1A1A",
    secondary: currentTheme === "dark" ? "#242424" : "#E6E6E6",
    currentTheme,
  };
}

// Type guard: runtime check that proves elements is [Node, Node]
export function isTwoNodes(elements: (Node | Link)[]): elements is [Node, Node] {
  return elements.length === 2 &&
    elements.every((e): e is Node => "labels" in e);
}
