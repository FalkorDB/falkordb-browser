import { NextResponse } from "next/server";
import type { Role } from "next-auth";
import { getCorsHeaders } from "../utils";

export const ADMIN_ONLY_MESSAGE = "Forbidden: only Admin users can manage users";

/**
 * Only Admin ACL users may change users, and a non-admin cannot read the LDAP
 * config the LDAP guard probes, so this runs first to answer 403 instead of 502.
 *
 * Returns the response to send, or `null` when the caller may proceed.
 */
export default function rejectNonAdmin(
  role: Role,
  request: Request
): NextResponse | null {
  if (role === "Admin") return null;

  return NextResponse.json(
    { message: ADMIN_ONLY_MESSAGE },
    { status: 403, headers: getCorsHeaders(request) }
  );
}
