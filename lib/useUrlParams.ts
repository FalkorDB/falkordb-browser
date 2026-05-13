"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Update one or more URL search params via history.replaceState.
 * Pass `null` as a value to delete a param.
 */
export function setUrlParam(updates: Record<string, string | null>) {
  const params = new URLSearchParams(window.location.search);

  // Delete all managed keys first so re-adding preserves the caller's order
  Object.keys(updates).forEach(key => params.delete(key));

  // Re-add in the order provided by the caller
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const search = params.toString();
  const newUrl = `${window.location.pathname}${search ? `?${search}` : ""}`;
  window.history.replaceState(null, "", newUrl);
}

/**
 * Generic hook that reads URL search params and returns typed getters / setters.
 *
 * @param keys - The param names to track (e.g. `["graph", "query"]`).
 * @returns `params` object keyed by name with current value (string, empty string if absent),
 *          and a `setParam(key, value)` function that updates the URL.
 *
 * @example
 * // on /graph?graph=movies&query=MATCH(n) RETURN n
 * const { params, setParam } = useUrlParams(["graph", "query"]);
 * params.graph  // "movies"
 * params.query  // "MATCH(n) RETURN n"
 * setParam("graph", "books");           // updates URL
 * setParam("graph", "");                // removes param
 */
export default function useUrlParams<K extends string>(keys: readonly K[]) {
  const searchParams = useSearchParams();

  const params = {} as Record<K, string>;
  keys.forEach((key) => {
    params[key] = searchParams.get(key) || "";
  });

  const setParam = useCallback((key: K, value: string) => {
    setUrlParam({ [key]: value || null });
  }, []);

  return { params, setParam };
}

// ---- Route-specific hooks ----
// Add one per route so consumers don't need to specify param keys.

const GRAPH_KEYS = ["graph", "query", "selected"] as const;

export function useGraphParams() {
  const { params, setParam } = useUrlParams(GRAPH_KEYS);
  return {
    graphName: params.graph,
    setGraphName: useCallback((value: string) => setParam("graph", value), [setParam]),
    query: params.query,
    setQuery: useCallback((value: string) => setParam("query", value), [setParam]),
    selected: params.selected,
    setSelected: useCallback((value: string) => setParam("selected", value), [setParam]),
  };
}

const SETTINGS_KEYS = ["tab"] as const;

export function useSettingsParams() {
  const { params, setParam } = useUrlParams(SETTINGS_KEYS);
  return {
    tab: params.tab,
    setTab: useCallback((value: string) => setParam("tab", value), [setParam]),
  };
}
