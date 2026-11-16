// Graph names may contain URL-reserved characters such as #, / and %, so the
// name is always sent as a single encoded path segment.
export function getProfileUrl(graphName: string): string {
  return `/api/graph/${encodeURIComponent(graphName)}/profile`;
}

export function getNodeUrl(graphName: string, nodeId: number | string, readOnly = false): string {
  return `/api/graph/${encodeURIComponent(graphName)}/${encodeURIComponent(String(nodeId))}${readOnly ? "?readOnly=true" : ""}`;
}

// The property key travels as a query value: Next.js strips _NEXTSEP_ from and
// normalizes dynamic path segments, which would change the targeted key.
export function getPropertyUrl(graphName: string, elementId: number | string, key: string, readOnly = false): string {
  return `/api/graph/${encodeURIComponent(graphName)}/${encodeURIComponent(String(elementId))}/property?propertyKey=${encodeURIComponent(key)}${readOnly ? "&readOnly=true" : ""}`;
}
