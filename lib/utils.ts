/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/prefer-default-export

"use client";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React, { type RefObject } from "react";
import type { FalkorDBCanvas, Data as CanvasData } from "@falkordb/canvas";
import { signOut } from "next-auth/react";
import { getCypherErrorHint, SYNTAX_ERROR_HINT, parseSyntaxError, enrichSyntaxMessage, type SyntaxErrorInfo, type HintLink } from "./cypherErrors.ts";
import { suggestForError, findFuncArgTypo } from "./cypherSuggestions.ts";

export { parseSyntaxError };
export type { SyntaxErrorInfo };

export type ToastArguments = {
  title: string;
  description: React.ReactNode;
  variant: "destructive" | "default";
  rawMessage?: string;
  hint?: string;
  hintLink?: HintLink;
  query?: string;
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
  errorMessage?: string;
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

export type PathCell = {
  nodes: NodeCell[];
  edges?: LinkCell[];
};

export type DataCell = NodeCell | LinkCell | PathCell | NodeCell[] | LinkCell[] | PathCell[] | number | string | null;

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
  | "CypherResult";
  confidence?: number;
  tokenUsage?: number;
};

// [library_name, type, 'functions', function_names[]]
export type UDFEntry = [string, string, string, string[]];

// [...UDFEntry, library_code, code]
export type UDFEntryWithCode = [...UDFEntry, string, string];

export type UserFriendlyMessage = {
  title: string;
  description: React.ReactNode;
  rawMessage?: string;
  hint?: string;
  hintLink?: HintLink;
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
  setIndicator: (indicator: "online" | "offline") => void,
  options?: { query?: string; signal?: AbortSignal; connectionId?: string | null }
): Promise<unknown> {
  const signal = options?.signal;
  // Already superseded before we even open the stream.
  if (signal?.aborted) return Promise.reject(createAbortError());

  return new Promise((resolve, reject) => {
    let settled = false;

    // Route through an explicit connection id when provided, so every request in
    // a batch targets the same connection even if the global changes mid-flight.
    const connId = options?.connectionId !== undefined ? options.connectionId : _activeConnectionId;

    // EventSource doesn't support headers — inject connectionId as a query param.
    let effectiveUrl = normalizeApiUrl(url);
    if (connId) {
      const sep = effectiveUrl.includes("?") ? "&" : "?";
      effectiveUrl += `${sep}connectionId=${encodeURIComponent(connId)}`;
    }

    const evtSource = new EventSource(effectiveUrl);

    const onAbort = () => {
      // Superseded (e.g. graph/connection switch): close silently — no toast, no
      // indicator change — and reject so callers can drop the result.
      finishReject(createAbortError());
    };

    function cleanup() {
      if (signal) signal.removeEventListener("abort", onAbort);
      evtSource.close();
    }
    function finishResolve(value: unknown) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    }
    function finishReject(error: Error) {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    }

    if (signal) signal.addEventListener("abort", onAbort);

    evtSource.addEventListener("result", (event: MessageEvent) => {
      if (settled) return;
      const payloadText = typeof event.data === "string" ? event.data : "";

      try {
        const result = JSON.parse(payloadText);
        setIndicator("online");
        finishResolve(result);
      } catch (error) {
        console.error("Failed to parse SSE result event:", error);
        setIndicator("offline");
        finishReject(new Error("Invalid server response"));
      }
    });

    evtSource.addEventListener("error", (event: MessageEvent) => {
      if (settled) return;

      const eventData = typeof (event as { data?: unknown }).data === "string"
        ? (event as { data?: string }).data
        : "";

      // A native EventSource "error" (network/connection failure) carries no
      // data — leave it for evtSource.onerror below so it surfaces as an
      // offline/network error instead of a generic "Request failed".
      if (!eventData) return;

      // Superseded while the error was arriving — drop it without a toast.
      if (signal?.aborted) {
        finishReject(createAbortError());
        return;
      }

      let rawMessage: unknown = "";
      let rawStatus: unknown = 0;
      let code: string | undefined;

      try {
        const payload = JSON.parse(eventData) as {
          message?: unknown;
          status?: unknown;
          code?: string;
        };
        rawMessage = payload.message;
        rawStatus = payload.status;
        code = payload.code;
      } catch (error) {
        rawMessage = extractResponseErrorMessage(eventData);
        console.error("Failed to parse SSE error event:", error);
      }

      if (!rawMessage) {
        rawMessage = (event as { message?: unknown }).message;
      }

      const message = normalizeErrorMessage(rawMessage) || "Request failed";
      const parsedStatus = Number(rawStatus);
      const status = Number.isFinite(parsedStatus) ? parsedStatus : 0;

      if (status === 401 && code === "SESSION_INVALID") {
        triggerSessionInvalidationSignOut();
        setIndicator("offline");
        finishReject(new Error(message));
        return;
      }

      const friendly = toUserFriendlyMessage(message, status, options?.query ? { query: options.query } : undefined);
      toast({ title: friendly.title, description: friendly.description, variant: "destructive", rawMessage: friendly.rawMessage, hint: friendly.hint, hintLink: friendly.hintLink, query: options?.query });

      if (status === 401 || status >= 500) setIndicator("offline");

      finishReject(new Error(message));
    });

    evtSource.onerror = () => {
      if (settled) return;

      // Superseded — drop it without a toast / offline flip.
      if (signal?.aborted) {
        finishReject(createAbortError());
        return;
      }

      toast({
        title: "Error",
        description: "Network or server error",
        variant: "destructive",
      });
      setIndicator("offline");
      finishReject(new Error("Network or server error"));
    };
  });
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

  const enriched = enrichSyntaxMessage(message, context, contextOffset);

  // When the error char is whitespace, step back and highlight the preceding word.
  let wordStart = safeOffset;
  while (wordStart > 0 && !/\s/.test(context[wordStart - 1])) wordStart -= 1;
  let wordEnd = safeOffset;
  while (wordEnd < context.length && !/\s/.test(context[wordEnd])) wordEnd += 1;
  const errorWord = context.slice(wordStart, wordEnd);

  const isWhitespaceError = !errorChar || /\s/.test(errorChar);
  if (isWhitespaceError && errorWord.length > 1) {
    return React.createElement("div", { className: "flex flex-col gap-1" },
      React.createElement("span", null, enriched),
      React.createElement("code", {
        className: "mt-1 block rounded px-2 py-1 text-xs font-mono whitespace-pre-wrap break-words"
      },
        context.slice(0, wordStart),
        React.createElement("span", {
          className: "font-bold text-xl underline mx-1"
        }, errorWord),
        context.slice(safeOffset) // space + rest
      )
    );
  }

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
  // Connection errors from /api/connections
  /^cannot connect to falkordb\b/i,
  /^authentication failed\b/i,
  /^connection timed out\b/i,
  // Data ingestion / file upload (app/api/upload, app/api/graph/[graph]/upload).
  // These messages are authored for end users, so show them verbatim.
  /\brequires a (?:\.dump|\.csv|\.txt|\.cql|\.cypher)\b/i,
  /\bbatch files can be executed\b/i,
  /\brequires a query\b/i,
  /^invalid upload mode\b/i,
  /\btemporarily disabled\b/i,
  /^invalid request body\b/i,
  /^(?:invalid|unsupported) file (?:type|name|contents)\b/i,
  /^file is too large\b/i,
  /^no file uploaded\b/i,
  /^request body is missing\b/i,
  /^uploaded file not found\b/i,
  /^mode and fileId are required\b/i,
  /^you do not have permission\b/i,
  /\bmust be a single cypher statement\b/i,
  /^the csv query is empty\b/i,
  /\bis not a valid identifier\b/i,
  /^duplicate csv column\b/i,
  /\bfailed to (?:restore the graph dump|process csv rows?|process the csv file|execute cypher statement|execute the cypher batch)\b/i,
];

function isAllowlistedUserError(message: string): boolean {
  return USER_READABLE_ERROR_PATTERNS.some(pattern => pattern.test(message));
}

// Maps raw server/Redis/FalkorDB error messages to user-friendly descriptions.
// Syntax errors are parsed and displayed with the error position highlighted.
export function toUserFriendlyMessage(raw: unknown, status: number, ctx?: { query?: string }): UserFriendlyMessage {
  const rawMessage = normalizeErrorMessage(raw).trim();
  if (!rawMessage) {
    if (status === 401) return { title: "Error", description: "Your session has expired. Please sign in again." };
    if (status >= 500) return { title: "Error", description: "Something went wrong on the server. Please try again later." };
    return { title: "Error", description: "An unexpected error occurred. Please try again." };
  }

  const parsed = parseSyntaxError(rawMessage);
  if (parsed) {
    let { message, context, contextOffset } = parsed;
    // If a function-arg typo is the root cause, point the toast highlight at the typo.
    const typo = ctx?.query ? findFuncArgTypo(ctx.query) : undefined;
    if (typo) {
      const re = new RegExp(`\\b${typo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      const m = re.exec(context);
      if (m) {
        contextOffset = m.index;
        message = `'${typo}' not defined`;
      }
    }
    return { title: "Syntax Error", description: formatSyntaxError(message, context, contextOffset), syntaxError: parsed, rawMessage, hint: SYNTAX_ERROR_HINT };
  }

  // "Did you mean…?" is more specific than the catalog tip, so it takes precedence.
  const catalog = getCypherErrorHint(rawMessage);
  const hint = suggestForError(rawMessage, { query: ctx?.query }) ?? catalog?.hint;
  const hintLink = catalog?.link;

  // For user-readable errors, description IS the raw message — skip rawMessage
  // to avoid a duplicate "See more" section.
  if (isAllowlistedUserError(rawMessage) || hint) {
    return { title: "Error", description: rawMessage, hint, hintLink };
  }

  const lower = rawMessage.toLowerCase();

  if (lower.includes("connection refused") || lower.includes("econnrefused")) {
    return { title: "Error", description: "Unable to connect to the database. Please check your connection settings.", rawMessage, hint, hintLink };
  }

  if (lower.includes("noauth") || lower.includes("wrongpass")) {
    return { title: "Error", description: "Database authentication failed. Please check your credentials.", rawMessage, hint, hintLink };
  }

  if (lower.includes("loading") && lower.includes("dataset")) {
    return { title: "Error", description: "The database is still loading. Please wait a moment and try again.", rawMessage, hint, hintLink };
  }

  if (lower.includes("oom") || lower.includes("out of memory")) {
    return { title: "Error", description: "The server is running low on memory. Please try again later.", rawMessage, hint, hintLink };
  }

  if (lower.includes("timeout") || lower.includes("timed out")) {
    return { title: "Error", description: "The request timed out. Please try a simpler query or try again later.", rawMessage, hint, hintLink };
  }

  if (lower.includes("readonly") && lower.includes("replica")) {
    return { title: "Error", description: "This operation cannot be performed on a read-only replica.", rawMessage, hint, hintLink };
  }

  if (status === 401) {
    return { title: "Error", description: "Your session has expired. Please sign in again.", rawMessage, hint, hintLink };
  }

  if (status >= 500) {
    return { title: "Error", description: "Something went wrong on the server. Please try again later.", rawMessage, hint, hintLink };
  }

  return { title: "Error", description: "An unexpected error occurred. Please try again.", rawMessage, hint, hintLink };
}

// Guards against concurrent signOut calls when multiple in-flight requests hit an invalidated session.
let sessionInvalidationInFlight = false;

function triggerSessionInvalidationSignOut(): void {
  if (sessionInvalidationInFlight) return;
  sessionInvalidationInFlight = true;
  signOut({ callbackUrl: "/login" }).catch(() => {
    sessionInvalidationInFlight = false;
  });
}

// Active connection ID — injected into every outgoing request as X-Connection-Id.
// Not initialised from localStorage to avoid overriding restricted-user sessions.
// providers.tsx keeps it in sync after every render.
let _activeConnectionId: string | null = null;
// Monotonic counter bumped whenever the active connection id actually changes.
// Async callers can capture it before a request and re-check it before applying
// results, so a switch (including A→B→A, where the id repeats) is still detected.
let _connectionEpoch = 0;

export function setActiveConnectionIdGlobal(id: string | null) {
  if (id !== _activeConnectionId) _connectionEpoch += 1;
  _activeConnectionId = id;
}

export function getActiveConnectionIdGlobal(): string | null {
  return _activeConnectionId;
}

export function getConnectionEpoch(): number {
  return _connectionEpoch;
}

/** Error thrown when an in-flight request is superseded (e.g. a graph/connection
 *  switch aborts its AbortSignal). Callers should treat it as a no-op, not a
 *  failure — it must never surface a toast. */
export function createAbortError(): Error {
  const err = new Error("The operation was aborted.");
  err.name = "AbortError";
  return err;
}

/** True when the given error is an abort (from createAbortError or a native
 *  fetch/AbortController abort). Native aborts reject with a DOMException named
 *  "AbortError", which is NOT an `instanceof Error` in browsers — so match on
 *  the `name` of any object rather than the Error prototype. */
export function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

function normalizeApiUrl(input: string): string {
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(input) || input.startsWith("//") || input.startsWith("/")) {
    return input;
  }

  return `/${input}`;
}

export async function securedFetch(
  input: string,
  init: RequestInit,
  toast: ToastFn,
  setIndicator: (indicator: "online" | "offline") => void,
): Promise<Response> {
  // Callers that set X-Connection-Id explicitly take priority over the global.
  const effectiveInit = { ...init };
  const existingHeaders = new Headers(effectiveInit.headers);
  if (_activeConnectionId && !existingHeaders.has("X-Connection-Id")) {
    existingHeaders.set("X-Connection-Id", _activeConnectionId);
  }
  effectiveInit.headers = existingHeaders;

  const response = await fetch(normalizeApiUrl(input), effectiveInit);
  const { status } = response;

  // Sign out only on an explicit X-Session-Invalid signal, not on all 401s.
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
      rawMessage: friendly.rawMessage,
      hint: friendly.hint,
      hintLink: friendly.hintLink,
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

/**
 * Upload a single file via XHR so the caller can render real request-body upload
 * progress (the fetch API can't report it). Mirrors securedFetch's behaviour:
 * injects X-Connection-Id, surfaces a friendly error toast, and drives the
 * online/offline indicator. Resolves (never rejects) with the raw response.
 */
export function uploadFileWithProgress(
  input: string,
  file: File,
  toast: ToastFn,
  setIndicator: (indicator: "online" | "offline") => void,
  onProgress?: (percent: number) => void,
): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", normalizeApiUrl(input));
    // Keep uploads unbounded client-side; server/proxy limits should enforce
    // maximum duration/size for large files on slower links.
    xhr.timeout = 0;

    if (_activeConnectionId) {
      xhr.setRequestHeader("X-Connection-Id", _activeConnectionId);
    }

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      const { status, responseText: body } = xhr;

      if (status === 401 && xhr.getResponseHeader("X-Session-Invalid") === "1") {
        triggerSessionInvalidationSignOut();
        setIndicator("offline");
        resolve({ ok: false, status, body });
        return;
      }

      if (status >= 300) {
        const friendly = toUserFriendlyMessage(extractResponseErrorMessage(body), status);
        toast({
          title: friendly.title,
          description: friendly.description,
          variant: "destructive",
          rawMessage: friendly.rawMessage,
          hint: friendly.hint,
          hintLink: friendly.hintLink,
        });
        if (status === 401 || status >= 500) setIndicator("offline");
        resolve({ ok: false, status, body });
        return;
      }

      setIndicator("online");
      resolve({ ok: true, status, body });
    };

    xhr.onerror = () => {
      toast({
        title: "Error",
        description: "Network error while uploading the file. Please try again.",
        variant: "destructive",
      });
      setIndicator("offline");
      resolve({ ok: false, status: 0, body: "" });
    };

    xhr.ontimeout = () => {
      toast({
        title: "Error",
        description: "Upload timed out. Please try again.",
        variant: "destructive",
      });
      setIndicator("offline");
      resolve({ ok: false, status: 0, body: "" });
    };

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

export const between = (hash: number, from: number, to: number) => {
  if (to <= from) return from;
  return (Math.abs(hash) % (to - from)) + from;
};

export const getDefaultQuery = (q?: string) =>
  q || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN * LIMIT 100";

export const getMetaStats = async (
  name: string,
  toast: ToastFn,
  setIndicator: (indicator: "online" | "offline") => void,
  isReadOnly?: boolean,
  options?: { signal?: AbortSignal; connectionId?: string | null },
) => {
  if (!name) return undefined;

  const q = "CALL db.meta.stats() YIELD labels, relTypes RETURN labels, relTypes as relationships";
  const readOnlyParam = isReadOnly ? '&readOnly=true' : '';

  try {
    const result = await getSSEGraphResult(
      `/api/graph/${prepareArg(name)}?query=${encodeURIComponent(q)}${readOnlyParam}`,
      toast,
      setIndicator,
      { signal: options?.signal, connectionId: options?.connectionId },
    ) as { data: { labels: { [key: string]: number }, relationships: { [key: string]: number } }[] };

    if (!result) return undefined;

    const row = result.data?.[0];
    if (!row || typeof row !== "object" || Array.isArray(row)) return undefined;

    const { labels, relationships } = row;
    if (
      !labels || typeof labels !== "object" || Array.isArray(labels) ||
      !relationships || typeof relationships !== "object" || Array.isArray(relationships)
    ) return undefined;

    const l = Object.entries(labels);
    const r = Object.entries(relationships);

    return [l, r];
  } catch (error) {
    // A superseded request (graph/connection switch) is not a real failure.
    if (isAbortError(error)) return undefined;
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
  setIndicator: (indicator: "online" | "offline") => void,
  // Pass activeConnectionId explicitly from React context/closure.
  // This avoids relying on the module-level global _activeConnectionId
  // which can be reset to null by Next.js HMR between renders.
  connectionId?: string | null,
  signal?: AbortSignal,
): Promise<Map<string, MemoryValue>> => {
  // Use plain fetch (not securedFetch) so NOPERM / version-too-low 400 errors
  // from restricted users don't produce error toasts — memory usage is an
  // optional admin-only feature and missing it is not an error worth surfacing.
  try {
    const effectiveConnId = connectionId !== undefined ? connectionId : _activeConnectionId;
    const headers = new Headers();
    if (effectiveConnId) {
      headers.set("X-Connection-Id", effectiveConnId);
    }
    const result = await fetch(`/api/graph/${prepareArg(name)}/memory`, { headers, signal });
    if (!result.ok) return new Map();
    const json = await result.json();
    return processEntries(json.result);
  } catch {
    // Includes AbortError when superseded — treat as "no memory info".
    return new Map();
  }
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

export const convertToCanvasData = (graphData: GraphData): CanvasData => ({
    nodes: graphData.nodes.map(({ id, labels, color, visible, size, data, expand }) => ({
        id,
        labels,
        color,
        visible,
        size,
        expand,
        data
    })),
    links: graphData.links.map(({ id, relationship, color, visible, source, target, data }) => ({
        id,
        relationship,
        color,
        visible,
        source,
        target,
        data
    }))
});

export const formatName = (newGraphName: string) =>
  newGraphName === '""' ? "" : newGraphName;

export async function fetchOptions(
  toast: ToastFn,
  setIndicator: (indicator: "online" | "offline") => void,
  indicator: "online" | "offline",
  setSelectedValue: (value: string) => void,
  setOptions: (options: string[]) => void,
) {
  if (indicator === "offline") return;

  const result = await securedFetch(
    `/api/graph`,
    {
      method: "GET",
    },
    toast,
    setIndicator
  );

  if (!result.ok) return;


  const { opts } = (await result.json()) as { opts: string[] };

  setOptions(opts);

  if (opts.length === 1) setSelectedValue(formatName(opts[0]));
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
