/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line import/prefer-default-export

"use client";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MutableRefObject } from "react";
import { ForceGraphMethods } from "react-force-graph-2d";
import { Node, Link, DataCell, MemoryValue } from "@/app/api/graph/model";

export const screenSize = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * Calculates the appropriate text color (black or white) based on background color brightness
 * Uses the relative luminance formula from WCAG guidelines
 * @param bgColor Background color in hex format (e.g., "#ff5733")
 * @returns "white" for dark backgrounds, "black" for light backgrounds
 */
export const getContrastTextColor = (bgColor: string): string => {
  let r: number;
  let g: number;
  let b: number;

  // Handle HSL colors
  if (bgColor.startsWith('hsl')) {
    // Parse HSL: hsl(h, s%, l%)
    const hslMatch = bgColor.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
    if (hslMatch) {
      const h = parseInt(hslMatch[1], 10) / 360;
      const s = parseFloat(hslMatch[2]) / 100;
      const l = parseFloat(hslMatch[3]) / 100;

      // Convert HSL to RGB
      const hue2rgb = (p: number, q: number, tParam: number) => {
        let t = tParam;
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      if (s === 0) {
        r = l;
        g = l;
        b = l; // achromatic
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
    } else {
      // Fallback if parsing fails
      return 'white';
    }
  } else {
    // Handle hex colors
    const hex = bgColor.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  }

  // Calculate relative luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? 'black' : 'white';
};

export type GraphRef = MutableRefObject<
  ForceGraphMethods<Node, Link> | undefined
>;

export type Panel = "chat" | "data" | "add" | undefined;

export type TextPriority = {
  name: string;
  ignore: boolean;
};

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

export type Cell = SelectCell | TextCell | ObjectCell | ReadOnlyCell | LazyCell;

export type ViewportState = {
  zoom: number;
  centerX: number;
  centerY: number;
};

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any,
  setIndicator: (indicator: "online" | "offline") => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
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
  toast: any,
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

/**
 * Fits the force-graph view to show all (optionally filtered) nodes within the canvas bounds.
 *
 * The function computes padding as 10% of the smaller canvas dimension, scales it by
 * `paddingMultiplier`, and invokes the graph's `zoomToFit` with a 500ms duration.
 *
 * @param chartRef - Optional reference to the force-graph instance to operate on.
 * @param filter - Optional predicate to include only nodes that should be considered when fitting.
 * @param paddingMultiplier - Multiplier applied to the computed padding (default: 1).
 */
export function handleZoomToFit(
  chartRef?: GraphRef,
  filter?: (node: Node) => boolean,
  paddingMultiplier = 1
) {
  const chart = chartRef?.current;
  if (chart) {
    // Get canvas dimensions
    const canvas = document.querySelector(
      ".force-graph-container canvas"
    ) as HTMLCanvasElement;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Calculate padding as 10% of the smallest canvas dimension
    const minDimension = Math.min(rect.width, rect.height);
    const padding = minDimension * 0.1;
    chart.zoomToFit(500, padding * paddingMultiplier, filter);
  }
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
  toast: any,
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

export function getQueryWithLimit(
  query: string,
  limit: number
): [string, number] {
  let existingLimit = 0;

  const finalReturnMatch = query.match(
    /\bRETURN\b(?!\s+.+?\bCALL\b)[^;]*?\bLIMIT\s+(\d+)/
  );
  if (finalReturnMatch) {
    existingLimit = parseInt(finalReturnMatch[1], 10);
  }

  if (limit === 0) return [query, existingLimit];

  if (query.includes("UNION")) {
    if (!query.includes("CALL")) {
      return [`CALL { ${query} } RETURN * LIMIT ${limit}`, limit];
    }

    if (query.match(/\bCALL\s*\{.*?\}\s*RETURN\b(?!\s+.+?\s+\bLIMIT\b)/i)) {
      return [`${query} LIMIT ${limit}`, limit];
    }
  }

  if (query.match(/\bRETURN\b(?!\s+.+?\s+\bLIMIT\b)/i)) {
    return [`${query} LIMIT ${limit}`, limit];
  }

  return [query, existingLimit];
}

export const getNodeDisplayText = (node: Node, displayTextPriority: TextPriority[]) => {
  const { data: nodeData } = node;

  const displayText = displayTextPriority.find(({ name, ignore }) => {
    const key = ignore
      ? Object.keys(nodeData).find(
        (k) => k.toLowerCase() === name.toLowerCase()
      )
      : name;

    return (
      key &&
      nodeData[key] &&
      typeof nodeData[key] === "string" &&
      nodeData[key].trim().length > 0
    );
  });

  if (displayText) {
    const key = displayText.ignore
      ? Object.keys(nodeData).find(
        (k) => k.toLowerCase() === displayText.name.toLowerCase()
      )
      : displayText.name;

    if (key) {
      return String(nodeData[key]);
    }
  }

  return String(node.id);
}

export const formatName = (newGraphName: string) =>
  newGraphName === '""' ? "" : newGraphName;

export async function fetchOptions(
  type: "Graph" | "Schema",
  toast: any,
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
    elements.every((e): e is Node => !!e.labels)
}
