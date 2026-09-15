/**
 * Ordering of the graph list shown in the graph selector and in the Manage
 * Graphs table.
 *
 * FalkorDB answers `GRAPH.LIST` by scanning the keyspace, so the reply carries
 * no creation time and no meaningful order. Chronological sorting is therefore
 * based on when this browser first saw each graph, kept in connection-scoped
 * storage so two servers never share a history.
 */

import { getConnectionItem, getConnectionPrefix, setConnectionItem } from "./connection-storage.ts";

export const GRAPH_SORT_ORDERS = ["new-old", "old-new", "a-z", "z-a"] as const;

export type GraphSortOrder = (typeof GRAPH_SORT_ORDERS)[number];

/** Anti-chronological: the graphs seen most recently come first. */
export const DEFAULT_GRAPH_SORT_ORDER: GraphSortOrder = "new-old";

/** What the settings control shows for each order. */
export const GRAPH_SORT_ORDER_LABELS: Record<GraphSortOrder, string> = {
  "new-old": "Newest First",
  "old-new": "Oldest First",
  "a-z": "Name (A-Z)",
  "z-a": "Name (Z-A)",
};

/** Connection-scoped key the first-seen timestamps are stored under. */
export const GRAPHS_FIRST_SEEN_KEY = "graphsFirstSeen";

/** Epoch milliseconds at which each graph name was first seen. */
export type GraphsFirstSeen = Record<string, number>;

/** Falls back to the default for anything that is not a known sort order. */
export const normalizeGraphSortOrder = (value: string | null | undefined): GraphSortOrder =>
  (GRAPH_SORT_ORDERS as readonly string[]).includes(value ?? "")
    ? (value as GraphSortOrder)
    : DEFAULT_GRAPH_SORT_ORDER;

/**
 * Reads the stored timestamps, dropping anything that is not a number so a
 * hand-edited or half-written entry cannot break the ordering.
 */
export function readGraphsFirstSeen(): GraphsFirstSeen {
  // Unprefixed, the entry would be written to the shared namespace and read
  // back for whichever server connects next.
  if (!getConnectionPrefix()) return {};

  const stored = getConnectionItem(GRAPHS_FIRST_SEEN_KEY);

  if (!stored) return {};

  try {
    const parsed: unknown = JSON.parse(stored);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, number] => Number.isFinite(entry[1]))
    );
  } catch {
    return {};
  }
}

/**
 * Stamps every graph that was not seen before with `now` and forgets the ones
 * that are gone, so a name reused after a drop counts as a new graph. Returns
 * the up-to-date timestamps.
 */
export function recordGraphsFirstSeen(names: string[], now = Date.now()): GraphsFirstSeen {
  const stored = readGraphsFirstSeen();
  const firstSeen: GraphsFirstSeen = {};
  let changed = Object.keys(stored).length !== names.length;

  names.forEach((name) => {
    const seen = stored[name];

    if (seen === undefined) {
      firstSeen[name] = now;
      changed = true;
    } else {
      firstSeen[name] = seen;
    }
  });

  if (changed && getConnectionPrefix()) setConnectionItem(GRAPHS_FIRST_SEEN_KEY, JSON.stringify(firstSeen));

  return firstSeen;
}

/** Carries a renamed graph's timestamp over, so it keeps its place in the order. */
export function renameGraphFirstSeen(from: string, to: string): void {
  if (from === to || !getConnectionPrefix()) return;

  const firstSeen = readGraphsFirstSeen();
  const seen = firstSeen[from];

  if (seen === undefined) return;

  delete firstSeen[from];
  firstSeen[to] = seen;
  setConnectionItem(GRAPHS_FIRST_SEEN_KEY, JSON.stringify(firstSeen));
}

/**
 * Orders a copy of `names`. The chronological orders fall back to the name for
 * graphs that share a timestamp — every graph that already existed when the
 * browser first connected was seen in the same pass.
 */
export function sortGraphNames(names: string[], order: GraphSortOrder, firstSeen: GraphsFirstSeen = {}): string[] {
  const byName = (a: string, b: string) => a.localeCompare(b);

  if (order === "a-z") return [...names].sort(byName);

  if (order === "z-a") return [...names].sort((a, b) => byName(b, a));

  const direction = order === "new-old" ? -1 : 1;

  return [...names].sort((a, b) => {
    const diff = (firstSeen[a] ?? 0) - (firstSeen[b] ?? 0);

    return diff === 0 ? byName(a, b) : diff * direction;
  });
}
