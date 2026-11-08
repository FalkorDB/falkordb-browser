const MAX_INDEX_ROWS = 256;

interface OptimizationGraph {
  explain(query: string): Promise<{ steps: readonly string[] }>;
  roQuery(query: string): Promise<{ data?: unknown }>;
}

export async function getOptimizationContext(graph: OptimizationGraph, query: string) {
  const [explainResult, indexResult] = await Promise.allSettled([
    graph.explain(query),
    graph.roQuery("CALL db.indexes() YIELD label, types, entitytype RETURN label, types, entitytype"),
  ]);
  if (explainResult.status === "rejected") throw explainResult.reason;
  const available = indexResult.status === "fulfilled";
  if (!available) console.warn("Cypher optimizer index metadata unavailable");
  const rows = available && Array.isArray(indexResult.value.data) ? indexResult.value.data : [];
  return {
    plan: explainResult.value.steps,
    indexes: {
      available,
      entries: rows.slice(0, MAX_INDEX_ROWS),
      truncated: rows.length > MAX_INDEX_ROWS,
      ...(!available ? { warning: "Index metadata is unavailable. Do not assume the graph has no indexes." } : {}),
    },
  };
}
