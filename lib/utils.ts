/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/prefer-default-export

"use client";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MutableRefObject } from "react";
import { Node, Link, DataCell, MemoryValue } from "@/app/api/graph/model";
import type { FalkorDBCanvas } from "@falkordb/canvas";

export type ToastArguments = {
  title: string;
  description: string;
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

export type GraphRef = MutableRefObject<FalkorDBCanvas | null>;

export type Panel = "chat" | "data" | "add" | undefined;

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

export type ConnectionType = "Standalone" | "Cluster" | "Sentinel";

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
      const { message, status } = JSON.parse(event.data);

      evtSource.close();
      toast({ title: "Error", description: message, variant: "destructive" });

      if (status === 401 || status >= 500) setIndicator("offline");

      reject();
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
      reject();
    };
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
  if (status >= 300) {
    let message = await response.text();

    try {
      message = JSON.parse(message).message;
    } catch {
      // message is already text
    }

    toast({
      title: "Error",
      description: message,
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

export const getDefaultQuery = (q?: string) =>
  q || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN * LIMIT 100";

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
