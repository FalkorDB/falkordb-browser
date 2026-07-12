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
  const newUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
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

const GRAPH_KEYS = ["graph", "query", "selected", "layout", "direction"] as const;

export function useGraphParams() {
  const { params, setParam } = useUrlParams(GRAPH_KEYS);
  return {
    graphName: params.graph,
    setGraphName: useCallback((value: string) => setParam("graph", value), [setParam]),
    query: params.query,
    setQuery: useCallback((value: string) => setParam("query", value), [setParam]),
    selected: params.selected,
    setSelected: useCallback((value: string) => setParam("selected", value), [setParam]),
    layout: params.layout,
    setLayout: useCallback((value: string) => setParam("layout", value), [setParam]),
    direction: params.direction,
    setDirection: useCallback((value: string) => setParam("direction", value), [setParam]),
  };
}

/**
 * Build the full URL param record for the /graph route from current state.
 * Add new graph-page params here — the sync effect in providers.tsx
 * calls this so you never need to update the effect itself.
 */
export function buildGraphUrlParams(state: {
  graph: string;
  query: string | null;
  selected: string;
  layout: string;
  direction: string;
}): Record<string, string | null> {
  const hasGraph = Boolean(state.graph);
  return {
    graph: state.graph || null,
    // Without an active graph, query and selected are meaningless — strip them.
    query: hasGraph ? state.query : null,
    selected: hasGraph ? (state.selected || null) : null,
    layout: state.layout && state.layout !== "force" ? state.layout : null,
    direction: state.direction || null,
  };
}

/**
 * Build the full URL param record for the /settings route.
 */
export function buildSettingsUrlParams(state: {
  tab: string;
}): Record<string, string | null> {
  return {
    tab: state.tab || null,
  };
}

/**
 * Registry mapping pathname → param builder.
 * When adding a new route with URL params:
 * 1. Add a `buildXxxUrlParams` function above
 * 2. Register it here
 * 3. Pass the matching state slice from providers.tsx
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const URL_PARAM_BUILDERS: Record<string, (state: any) => Record<string, string | null>> = {
  "/graph": buildGraphUrlParams,
  "/settings": buildSettingsUrlParams,
};

/**
 * Sync current state to URL for the given pathname.
 * No-op if the pathname has no registered builder.
 */
export function syncRouteUrlParams(pathname: string, state: Record<string, unknown>) {
  const builder = URL_PARAM_BUILDERS[pathname];
  if (!builder) return;
  setUrlParam(builder(state));
}

const SETTINGS_KEYS = ["tab", "focus"] as const;

export function useSettingsParams() {
  const { params, setParam } = useUrlParams(SETTINGS_KEYS);
  return {
    tab: params.tab,
    setTab: useCallback((value: string) => setParam("tab", value), [setParam]),
    focus: params.focus,
    setFocus: useCallback((value: string) => setParam("focus", value), [setParam]),
  };
}
