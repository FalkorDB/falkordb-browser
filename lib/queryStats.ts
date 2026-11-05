import type { QueryStatistics } from "falkordb";

/**
 * A query's statistics: parsed `stats` from the falkordb client (v7+), or the
 * raw `metadata` lines that browser versions before it saved in the query
 * history.
 */
export type QueryStatsSource = {
  stats?: QueryStatistics;
  metadata?: string[];
};

// The counters in the order and wording the server reports them
const COUNTER_LINES: Array<[keyof QueryStatistics, string]> = [
  ["labelsAdded", "Labels added"],
  ["labelsRemoved", "Labels removed"],
  ["nodesCreated", "Nodes created"],
  ["nodesDeleted", "Nodes deleted"],
  ["propertiesSet", "Properties set"],
  ["propertiesRemoved", "Properties removed"],
  ["relationshipsCreated", "Relationships created"],
  ["relationshipsDeleted", "Relationships deleted"],
  ["indicesCreated", "Indices created"],
  ["indicesDeleted", "Indices deleted"],
  ["constraintsCreated", "Constraints created"],
  ["constraintsDeleted", "Constraints deleted"],
];

const EXECUTION_TIME = "Query internal execution time:";

/**
 * The statistics as the lines the server sends, e.g. `Nodes created: 1`:
 * every counter that is not 0, then cached execution and execution time.
 */
export function getStatsLines(query: QueryStatsSource): string[] {
  const { stats } = query;
  if (!stats) return query.metadata ?? [];

  const lines = COUNTER_LINES
    .filter(([key]) => stats[key])
    .map(([key, label]) => `${label}: ${stats[key]}`);
  lines.push(`Cached execution: ${stats.cachedExecution ? 1 : 0}`);
  lines.push(`${EXECUTION_TIME} ${stats.queryInternalExecutionTime} milliseconds`);
  return lines;
}

/** The query's execution time, e.g. `0.42ms`, or undefined when unknown. */
export function getExecutionTime(query: QueryStatsSource): string | undefined {
  if (query.stats) return `${query.stats.queryInternalExecutionTime}ms`;
  return query.metadata
    ?.find((line) => line.startsWith(EXECUTION_TIME))
    ?.slice(EXECUTION_TIME.length)
    .trim()
    .replace(" milliseconds", "ms");
}
