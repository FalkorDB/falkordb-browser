// Graph names may contain URL-reserved characters such as #, / and %, so the
// name is always sent as a single encoded path segment.
export function getProfileUrl(graphName: string, query: string, readOnly = false): string {
  return `/api/graph/${encodeURIComponent(graphName)}/profile?query=${encodeURIComponent(query)}${readOnly ? "&readOnly=true" : ""}`;
}

export function getNodeUrl(graphName: string, nodeId: number | string, readOnly = false): string {
  return `/api/graph/${encodeURIComponent(graphName)}/${nodeId}${readOnly ? "?readOnly=true" : ""}`;
}
