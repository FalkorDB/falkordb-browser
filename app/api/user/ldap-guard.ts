import { NextResponse } from "next/server";
import type { FalkorDB } from "falkordb";
import { hasLdapServers, LDAP_SERVERS_CONFIG } from "@/lib/enterprise";
import { getCorsHeaders } from "../utils";

export const LDAP_MANAGED_MESSAGE =
  "Users and roles are managed by LDAP on this connection";

/**
 * Users and roles live in LDAP once the enterprise module has LDAP servers
 * configured, so every ACL write has to be refused server-side — the settings
 * UI hides the tab, but the API is reachable on its own.
 *
 * Returns the response to send, or `null` when the caller may proceed.
 * Community deployments don't register the parameter and `CONFIG GET` answers
 * with an empty map, which reads as "not LDAP-backed".
 */
export default async function rejectLdapManagedUsers(
  client: FalkorDB,
  request: Request
): Promise<NextResponse | null> {
  try {
    const config = await (await client.connection).configGet(LDAP_SERVERS_CONFIG);

    if (!hasLdapServers(config)) return null;

    return NextResponse.json(
      { message: LDAP_MANAGED_MESSAGE },
      { status: 403, headers: getCorsHeaders(request) }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to read LDAP configuration" },
      { status: 502, headers: getCorsHeaders(request) }
    );
  }
}
