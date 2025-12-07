/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line import/prefer-default-export

"use client";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MutableRefObject } from "react";
import { Node, Link, DataCell, MemoryValue } from "@/app/api/graph/model";
import * as d3 from "d3";

export const MEMORY_USAGE_VERSION_THRESHOLD = 41408;
export const screenSize = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// Type for vanilla force-graph library instance
export interface VanillaForceGraphInstance {
  width(width: number): VanillaForceGraphInstance;
  height(height: number): VanillaForceGraphInstance;
  graphData(data: { nodes: Node[]; links: any[] }): VanillaForceGraphInstance;
  nodeRelSize(size: number): VanillaForceGraphInstance;
  nodeCanvasObjectMode(mode: () => string): VanillaForceGraphInstance;
  linkCanvasObjectMode(mode: () => string): VanillaForceGraphInstance;
  linkDirectionalArrowRelPos(pos: number): VanillaForceGraphInstance;
  linkDirectionalArrowLength(
    length: number | ((link: Link) => number)
  ): VanillaForceGraphInstance;
  linkDirectionalArrowColor(
    color: string | ((link: Link) => string)
  ): VanillaForceGraphInstance;
  linkWidth(
    width: number | ((link: Link) => number)
  ): VanillaForceGraphInstance;
  linkLabel(
    label: string | ((link: Link) => string)
  ): VanillaForceGraphInstance;
  nodeLabel(
    label: string | ((node: Node) => string)
  ): VanillaForceGraphInstance;
  nodeCanvasObject(
    fn: (node: Node, ctx: CanvasRenderingContext2D) => void
  ): VanillaForceGraphInstance;
  linkCanvasObject(
    fn: (link: any, ctx: CanvasRenderingContext2D) => void
  ): VanillaForceGraphInstance;
  onNodeClick(fn: (node: Node) => void): VanillaForceGraphInstance;
  onNodeHover(fn: (node: Node | null) => void): VanillaForceGraphInstance;
  onLinkHover(fn: (link: Link | null) => void): VanillaForceGraphInstance;
  onNodeRightClick(
    fn: (node: Node, event: MouseEvent) => void
  ): VanillaForceGraphInstance;
  onLinkRightClick(
    fn: (link: Link, event: MouseEvent) => void
  ): VanillaForceGraphInstance;
  onBackgroundClick(
    fn: (event?: MouseEvent) => void
  ): VanillaForceGraphInstance;
  onBackgroundRightClick(
    fn: (event?: MouseEvent) => void
  ): VanillaForceGraphInstance;
  linkCurvature(curvature: string | number): VanillaForceGraphInstance;
  nodeVisibility(visibility: string): VanillaForceGraphInstance;
  linkVisibility(visibility: string): VanillaForceGraphInstance;
  cooldownTicks(ticks: number): VanillaForceGraphInstance;
  cooldownTime(time: number): VanillaForceGraphInstance;
  onEngineStop(fn: () => void): VanillaForceGraphInstance;
  backgroundColor(color: string): VanillaForceGraphInstance;
  d3Force(name: "link"): d3.ForceLink<any, any> | undefined;
  d3Force(name: "center"): d3.ForceCenter<any> | undefined;
  d3Force(name: "charge"): d3.ForceManyBody<any> | undefined;
  d3Force(name: "collision"): d3.ForceCollide<any> | undefined;
  d3Force(name: string): d3.Force<any, any> | undefined;
  d3Force(
    name: string,
    force: d3.Force<any, any> | null
  ): VanillaForceGraphInstance;
  d3ReheatSimulation(): VanillaForceGraphInstance;
  zoom(): number;
  zoom(scale: number, durationMs?: number): VanillaForceGraphInstance;
  centerAt(): { x: number; y: number };
  centerAt(
    x?: number,
    y?: number,
    durationMs?: number
  ): VanillaForceGraphInstance;
  zoomToFit(
    durationMs?: number,
    padding?: number,
    nodeFilter?: (node: Node) => boolean
  ): VanillaForceGraphInstance;
  // Private cleanup method
  _destructor?: () => void;
}

// GraphRef for vanilla force-graph library
export type GraphRef = MutableRefObject<VanillaForceGraphInstance | undefined>;

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
    const err = await response.text();
    toast({
      title: "Error",
      description: err,
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

const processEntries = (arr: unknown[]): Map<string, MemoryValue> => {
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

export const getNodeDisplayText = (
  node: Node,
  displayTextPriority: TextPriority[]
) => {
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
};

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
export function isTwoNodes(
  elements: (Node | Link)[]
): elements is [Node, Node] {
  return elements.length === 2 && elements.every((e): e is Node => !!e.labels);
}
