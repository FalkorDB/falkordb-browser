import { prepareArg } from "./utils.ts";

// Encode each path segment so reserved characters cannot change the target.
export default function getPropertyUrl(graphId: string, elementId: number | string, key: string, readOnly = false): string {
  return `api/graph/${prepareArg(graphId)}/${encodeURIComponent(String(elementId))}/${encodeURIComponent(key)}${readOnly ? "?readOnly=true" : ""}`;
}
