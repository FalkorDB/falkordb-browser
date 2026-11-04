const DATABASE_PROTOCOLS = new Set(["falkor:", "falkors:", "redis:", "rediss:"]);

type DatabaseEndpoint = { hostname: string; port: number };

export type AllowedDatabaseEndpoints =
  | { status: "unconfigured" }
  | { status: "invalid"; entries: string[] }
  | { status: "configured"; endpoints: ReadonlySet<string> };

function normalizeHostname(hostname: string): string | null {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  return normalized && !normalized.includes("*") ? normalized : null;
}

function endpointKey(endpoint: DatabaseEndpoint): string {
  return `${endpoint.hostname}:${endpoint.port}`;
}

function parseConfiguredEndpoint(value: string): DatabaseEndpoint | null {
  if (!value || value.includes("://")) return null;

  try {
    const parsed = new URL(`http://${value}`);
    if (
      parsed.username
      || parsed.password
      || !parsed.port
      || parsed.pathname !== "/"
      || parsed.search
      || parsed.hash
    ) {
      return null;
    }

    const hostname = normalizeHostname(parsed.hostname);
    return hostname ? { hostname, port: Number(parsed.port) } : null;
  } catch {
    return null;
  }
}

export function parseAllowedDatabaseEndpoints(value: string | undefined): AllowedDatabaseEndpoints {
  const entries = value?.split(",").map(entry => entry.trim()).filter(Boolean) ?? [];
  if (entries.length === 0) return { status: "unconfigured" };

  const endpoints = new Set<string>();
  const invalidEntries: string[] = [];
  for (const entry of entries) {
    const endpoint = parseConfiguredEndpoint(entry);
    if (!endpoint) invalidEntries.push(entry);
    else endpoints.add(endpointKey(endpoint));
  }

  if (invalidEntries.length > 0) return { status: "invalid", entries: invalidEntries };
  return { status: "configured", endpoints };
}

export function getDatabaseUrlEndpoint(value: string): DatabaseEndpoint | null {
  try {
    const parsed = new URL(value);
    if (!DATABASE_PROTOCOLS.has(parsed.protocol)) return null;
    const hostname = normalizeHostname(parsed.hostname);
    if (!hostname) return null;
    return { hostname, port: Number(parsed.port || "6379") };
  } catch {
    return null;
  }
}

export function isDatabaseEndpointAllowed(
  endpoint: DatabaseEndpoint,
  allowedEndpoints: ReadonlySet<string>,
): boolean {
  const hostname = normalizeHostname(endpoint.hostname);
  return hostname !== null && allowedEndpoints.has(endpointKey({ ...endpoint, hostname }));
}
