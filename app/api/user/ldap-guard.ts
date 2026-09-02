import { NextResponse } from "next/server";
import type { FalkorDB } from "falkordb";
import { getCorsHeaders } from "../utils";
import resolveLdapRejection, { LDAP_MANAGED_MESSAGE } from "./ldap-guard-decision";

export { LDAP_MANAGED_MESSAGE };

/**
 * Users and roles live in LDAP once the enterprise module has LDAP servers
 * configured, so every ACL write has to be refused server-side — the settings
 * UI hides the tab, but the API is reachable on its own.
 *
 * Returns the response to send, or `null` when the caller may proceed.
 */
export default async function rejectLdapManagedUsers(
  client: FalkorDB,
  request: Request
): Promise<NextResponse | null> {
  const rejection = await resolveLdapRejection(client);

  if (!rejection) return null;

  return NextResponse.json(
    { message: rejection.message },
    { status: rejection.status, headers: getCorsHeaders(request) }
  );
}
