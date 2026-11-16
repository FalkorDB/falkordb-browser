import { NextResponse } from "next/server";
import type { Role } from "next-auth";
import { getCorsHeaders } from "../utils";
import resolveAdminRejection from "./admin-guard-decision";

/**
 * A non-admin cannot read the LDAP config the LDAP guard probes, so this runs
 * first to answer 403 instead of 502.
 *
 * Returns the response to send, or `null` when the caller may proceed.
 */
export default function rejectNonAdmin(
  role: Role,
  request: Request
): NextResponse | null {
  const rejection = resolveAdminRejection(role);

  if (!rejection) return null;

  return NextResponse.json(
    { message: rejection.message },
    { status: rejection.status, headers: getCorsHeaders(request) }
  );
}
