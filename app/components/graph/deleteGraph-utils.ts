export type DeleteGraphToast = {
  title: string;
  description?: string;
};

/**
 * Build the summary toast shown after a bulk graph deletion.
 *
 * Only reports success when at least one graph was actually deleted — this
 * avoids the misleading "deleted successfully" title when every deletion
 * failed. Individual failures are already surfaced by `securedFetch` (one
 * destructive toast per failed request), so when nothing succeeded this
 * returns `null` and no extra toast is shown.
 *
 * @param successDeletedGraphs - Names of graphs that were deleted successfully.
 * @param failedDeletedGraphs - Names of graphs whose deletion failed.
 * @returns The toast payload, or `null` when there is nothing to report.
 */
export function buildDeleteGraphToast(
  successDeletedGraphs: string[],
  failedDeletedGraphs: string[],
): DeleteGraphToast | null {
  if (successDeletedGraphs.length === 0) return null;

  const successPart = `The graph(s) ${successDeletedGraphs.join(", ")} have been deleted successfully.`;
  const failedPart = failedDeletedGraphs.length > 0
    ? ` The graph(s) ${failedDeletedGraphs.join(", ")} could not be deleted.`
    : "";

  return {
    title: "Graph(s) deleted successfully",
    description: `${successPart}${failedPart}`,
  };
}
