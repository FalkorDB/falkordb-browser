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

// A graph name is an arbitrary string, so `__proto__` and `constructor` are
// legal names. Every map built here is prototype-less and every lookup is an
// own-property one, so such a name is an ordinary entry instead of a prototype
// member on read and the prototype setter on write.
const emptyFirstSeen = (): GraphsFirstSeen => Object.create(null) as GraphsFirstSeen;

const seenAt = (firstSeen: GraphsFirstSeen, name: string): number | undefined =>
  (Object.hasOwn(firstSeen, name) ? firstSeen[name] : undefined);

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
  if (!getConnectionPrefix()) return emptyFirstSeen();

  const stored = getConnectionItem(GRAPHS_FIRST_SEEN_KEY);

  if (!stored) return emptyFirstSeen();

  try {
    const parsed: unknown = JSON.parse(stored);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return emptyFirstSeen();

    const firstSeen = emptyFirstSeen();

    Object.entries(parsed).forEach(([name, seen]) => {
      if (Number.isFinite(seen)) firstSeen[name] = seen as number;
    });

    return firstSeen;
  } catch {
    return emptyFirstSeen();
  }
}

/**
 * Stamps every graph that was not seen before with `now` and forgets the ones
 * that are gone, so a name reused after a drop counts as a new graph. Returns
 * the up-to-date timestamps.
 */
export function recordGraphsFirstSeen(names: string[], now = Date.now()): GraphsFirstSeen {
  const stored = readGraphsFirstSeen();
  const firstSeen = emptyFirstSeen();
  let changed = false;

  names.forEach((name) => {
    const seen = seenAt(stored, name);

    if (seen === undefined) {
      firstSeen[name] = now;
      changed = true;
    } else {
      firstSeen[name] = seen;
    }
  });

  // Graphs that are gone simply did not make it into the rebuilt map, so the
  // key counts differ — comparing against `names.length` instead would miss a
  // list that dropped one graph and gained another under a duplicate name.
  if (Object.keys(stored).length !== Object.keys(firstSeen).length) changed = true;

  if (changed && getConnectionPrefix()) setConnectionItem(GRAPHS_FIRST_SEEN_KEY, JSON.stringify(firstSeen));

  return firstSeen;
}

/** Carries a renamed graph's timestamp over, so it keeps its place in the order. */
export function renameGraphFirstSeen(from: string, to: string): void {
  if (from === to || !getConnectionPrefix()) return;

  const firstSeen = readGraphsFirstSeen();
  const seen = seenAt(firstSeen, from);

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
    const diff = (seenAt(firstSeen, a) ?? 0) - (seenAt(firstSeen, b) ?? 0);

    return diff === 0 ? byName(a, b) : diff * direction;
  });
}
