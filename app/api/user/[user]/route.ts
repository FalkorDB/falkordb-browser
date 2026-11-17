import { NextRequest, NextResponse } from "next/server";
import { getClient } from "../../auth/[...nextauth]/options";
import {
  ROLE,
  getRoleWithKeys,
  extractKeysFromACL,
  requiresPasswordReauthentication,
  persistAclAfterPasswordChange,
} from "../model";
import { updateUser, validateBody } from "../../validate-body";
import { getCorsHeaders, corsPreflight } from "../../utils";
import rejectLdapManagedUsers from "../ldap-guard";
import rejectNonAdmin from "../admin-guard";

export const OPTIONS = corsPreflight;

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ user: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;

    const adminRejection = rejectNonAdmin(user.role, request);
    if (adminRejection) return adminRejection;

    const ldapRejection = await rejectLdapManagedUsers(client, request);
    if (ldapRejection) return ldapRejection;

    const { user: username } = await params;
    
    try {
      const body = await request.json();
      
      // Validate request body
      const validation = validateBody(updateUser, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { role: roleKey, keys, password } = validation.data;
      const role = ROLE.get(roleKey);
      if (!role) throw new Error("Invalid role");

      const connection = await client.connection;
      const requiresReauthentication = requiresPasswordReauthentication(user.username, username, password);

      const finalRole = getRoleWithKeys(role, keys);
      if (password) {
        finalRole.push("resetpass", `>${password}`);
      }
      await connection.aclSetUser(username, finalRole);

      const aclSaved = await persistAclAfterPasswordChange(
        requiresReauthentication,
        () => connection.aclSave(),
        error => console.error("Failed to persist ACL after changing the current user's password:", error),
      );

      return NextResponse.json({
        message: "User role updated",
        requiresReauthentication,
        ...(requiresReauthentication ? { aclSaved } : {}),
      }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
