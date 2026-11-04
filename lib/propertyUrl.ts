// Property keys can contain URL-reserved characters such as ?, #, / and %,
// so both path segments are encoded or the request targets a different key.
export default function getPropertyUrl(graphId: string, elementId: number | string, key: string, readOnly = false): string {
  return `api/graph/${prepareArg(graphId)}/${encodeURIComponent(String(elementId))}/${encodeURIComponent(key)}${readOnly ? "?readOnly=true" : ""}`;
}
import { prepareArg } from "./utils.ts";
