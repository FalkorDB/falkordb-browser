/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line import/prefer-default-export

"use client";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MutableRefObject } from "react";
import { ForceGraphMethods } from "react-force-graph-2d";
import { Node, Link, DataCell } from "@/app/api/graph/model";

export const screenSize = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export type GraphRef = MutableRefObject<
  ForceGraphMethods<Node, Link> | undefined
>;

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

export type ReadOnlyCell = {
  value: string;
  type: "readonly";
};

export type Cell = SelectCell | TextCell | ObjectCell | ReadOnlyCell;
export interface Row {
  cells: Cell[];
  checked?: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function securedFetch(
  input: string,
  init: RequestInit,
  toast?: any,
  setIndicator?: (indicator: "online" | "offline") => void
): Promise<Response> {
  const response = await fetch(input, init);
  const { status } = response;
  if (status >= 300) {
    const err = await response.text();
    if (toast) {
      toast({
        title: "Error",
        description: err,
        variant: "destructive",
      });
    }
    if (status === 401 || status >= 500) {
      if (setIndicator) {
        setIndicator("offline");
      }
    }
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
    chart.zoomToFit(1000, padding * paddingMultiplier, filter);
  }
}

export function createNestedObject(arr: string[]): object {
  if (arr.length === 0) return {};

  const [first, ...rest] = arr;
  return { [first]: createNestedObject(rest) };
}

export function getMainReturnLimit(query: string) {
  const match = query.match(
    /.*\bRETURN\b.*?(?:\bLIMIT\b\s*(\d+))?(?:\s*;?\s*$|\s*$)/i
  );
  return match && match[1];
}

export function getQueryWithLimit(query: string, limit: number) {
  if (limit === 0) return query;

  const hasMainReturnLimit = getMainReturnLimit(query);

  if (hasMainReturnLimit) {
    return query;
  }

  return `${query} LIMIT ${limit}`;
}

export async function fetchOptions(
  type: "Graph" | "Schema",
  toast: any,
  setIndicator: (indicator: "online" | "offline") => void,
  indicator: "online" | "offline"
): Promise<[string[], string]> {
  const response: [string[], string] = [[], ""];

  if (indicator === "offline") return response;

  const result = await securedFetch(
    `api/${type === "Graph" ? "graph" : "schema"}`,
    {
      method: "GET",
    },
    toast,
    setIndicator
  );

  if (!result.ok) return response;

  const { opts } = (await result.json()) as { opts: string[] };

  response[0] = opts;

  if (opts.length === 1) [response[1]] = opts;

  return response;
}

export const formatName = (newGraphName: string) =>
  newGraphName === '""' ? "" : newGraphName;
