export type GraphEntryType = "active" | "stub";

export interface GraphListEntry {
  name: string;
  type: GraphEntryType;
  nodes: number | null;
  edges: number | null;
}

export function isEnterpriseModuleLoaded(modules: unknown): boolean {
  if (!Array.isArray(modules)) return false;

  return modules.some((module) => {
    if (!module || typeof module !== "object") return false;
    const moduleName = "name" in module && typeof module.name === "string" ? module.name : "";
    const normalized = moduleName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalized === "falkordbenterprise" || normalized === "falkordbenteprise";
  });
}

export function toGraphNames(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Buffer.isBuffer(value)) return [value.toString("utf8")];

  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => toGraphNames(item));
}

export function buildGraphListEntries(
  activeNames: string[],
  stubNames: string[],
  graphCounts: Map<string, { nodes: number | null; edges: number | null }>
): GraphListEntry[] {
  const active = activeNames
    .filter((name) => name && !name.endsWith("_schema"))
    .map((name) => ({
      name,
      type: "active" as const,
      nodes: graphCounts.get(name)?.nodes ?? null,
      edges: graphCounts.get(name)?.edges ?? null,
    }));

  const activeSet = new Set(active.map((entry) => entry.name));
  const stubs = [...new Set(stubNames)]
    .filter((name) => name && !name.endsWith("_schema") && !activeSet.has(name))
    .map((name) => ({
      name,
      type: "stub" as const,
      nodes: null,
      edges: null,
    }));

  return [...active, ...stubs];
}

export function toNullableNumber(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function extractCount(data: unknown, field: "nodes" | "edges"): number | null {
  if (!data || typeof data !== "object" || !("data" in data) || !Array.isArray(data.data)) return null;

  const firstRow = data.data[0];
  if (!firstRow || typeof firstRow !== "object") return null;

  return field in firstRow ? toNullableNumber(firstRow[field]) : null;
}
