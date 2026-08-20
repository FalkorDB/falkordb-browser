/**
 * FalkorDB enterprise detection.
 *
 * Graph offloading lives in a separate enterprise module (registered as
 * `falkordbe`), which is also what adds `GRAPH.STUBS`. Its presence in
 * `MODULE LIST` is the enterprise flag, so the UI can gate offload features
 * without probing commands that don't exist on community deployments.
 *
 * The same module can also delegate authentication and authorization to LDAP,
 * which the UI gates on separately (see `hasLdapServers`).
 */

export const ENTERPRISE_MODULE_NAME = "falkordbe";

export function isEnterpriseModuleList(modules: { name?: string }[]): boolean {
  return modules.some((module) => module.name?.toLowerCase() === ENTERPRISE_MODULE_NAME);
}

/**
 * Redis `CONFIG GET` parameter holding the enterprise module's LDAP servers.
 * When it is non-empty, FalkorDB delegates both authentication and
 * authorization to LDAP, so users and roles are no longer managed in the DB
 * and the browser must not offer to edit them.
 */
export const LDAP_SERVERS_CONFIG = "falkordbe.ldap_servers";

/**
 * `CONFIG GET` replies as a parameter → value map. The parameter is absent on
 * community deployments and present-but-empty when no LDAP server is set.
 */
export function hasLdapServers(config: Record<string, unknown> | null | undefined): boolean {
  if (!config) return false;

  const entry = Object.entries(config).find(
    ([key]) => key.toLowerCase() === LDAP_SERVERS_CONFIG
  );

  if (!entry) return false;

  const [, value] = entry;

  if (Array.isArray(value)) return value.some((item) => String(item).trim() !== "");

  return typeof value === "string" && value.trim() !== "";
}

export type StubsResponse = {
  stubs: string[];
};
