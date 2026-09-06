import type { FalkorDB } from "falkordb";
// Relative, extension-carrying path: this module is unit-tested under plain
// node, which has no view of the bundler's `@/` alias.
import { hasLdapServers, LDAP_SERVERS_CONFIG } from "../../../lib/enterprise.ts";

export const LDAP_MANAGED_MESSAGE =
  "Users and roles are managed by LDAP on this connection";

export const LDAP_PROBE_FAILED_MESSAGE = "Failed to read LDAP configuration";

export type LdapRejection = {
  status: number;
  message: string;
};

/**
 * Decide whether an ACL write may proceed on this connection.
 *
 * Returns the rejection to send, or `null` when the caller may proceed.
 * Community deployments don't register the parameter and `CONFIG GET` answers
 * with an empty map, which reads as "not LDAP-backed".
 */
export default async function resolveLdapRejection(
  client: FalkorDB
): Promise<LdapRejection | null> {
  try {
    const config = await (await client.connection).configGet(LDAP_SERVERS_CONFIG);

    if (!hasLdapServers(config)) return null;

    return { status: 403, message: LDAP_MANAGED_MESSAGE };
  } catch (error) {
    console.error(error);
    return { status: 502, message: LDAP_PROBE_FAILED_MESSAGE };
  }
}
