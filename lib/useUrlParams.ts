"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { setUrlParam } from "./urlParams";

// The param helpers themselves are pure, so they live in ./urlParams and are
// unit-testable on their own. Re-exported here so callers keep a single entry
// point for everything URL-param related.
export * from "./urlParams";

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
