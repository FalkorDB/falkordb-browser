import { prepareArg } from "./utils.ts";

// Query values avoid Next.js cleanup of dynamic parameter values like _NEXTSEP_.
export default function getPropertyUrl(graphId: string, elementId: number | string, key: string, readOnly = false): string {
  return `api/graph/${prepareArg(graphId)}/${encodeURIComponent(String(elementId))}/property?propertyKey=${encodeURIComponent(key)}${readOnly ? "&readOnly=true" : ""}`;
}
