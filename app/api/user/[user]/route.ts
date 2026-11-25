import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { closeCachedConnection, getClient, sessionConnectionKey } from "../../auth/[...nextauth]/options";
import { decrypt } from "../../auth/encryption";
import { storeEncryptedCredential } from "../../auth/tokenUtils";
import StorageFactory from "@/lib/token-storage/StorageFactory";
import { isUsableConnectionRecord } from "@/lib/connectionBinding";
import {
  createReauthenticationHandoffId,
  REAUTHENTICATION_HANDOFF_COOKIE,
  REAUTHENTICATION_HANDOFF_PREFIX,
  REAUTHENTICATION_HANDOFF_TTL_SECONDS,
} from "@/lib/reauthentication-handoff";
import {
  ROLE,
  getRoleWithKeys,
  requiresPasswordReauthentication,
  persistAclAndRemovePreviousPasswordConnectionCredential,
  type UpdateUserResponse,
} from "../model";
import { updateUser, validateBody } from "../../validate-body";
import { getCorsHeaders, corsPreflight, shouldUseSecureCookies } from "../../utils";
import rejectLdapManagedUsers from "../ldap-guard";
import rejectNonAdmin from "../admin-guard";

export const OPTIONS = corsPreflight;

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
      let handoffId: string | undefined;
      let handoffTokenId: string | undefined;
      const tokenStorage = requiresReauthentication && user.connectionId
        ? StorageFactory.getStorage()
        : undefined;

      if (tokenStorage && user.connectionId) {
        try {
          const activeConnection = await tokenStorage.fetchTokenById(user.connectionId);
          if (!isUsableConnectionRecord(activeConnection, user.id)) {
            throw new Error("The active connection could not be verified for reauthentication");
          }

          const key = activeConnection.encrypted_key
            ? decrypt(activeConnection.encrypted_key)
            : undefined;
          handoffId = createReauthenticationHandoffId();
          handoffTokenId = `${REAUTHENTICATION_HANDOFF_PREFIX}${handoffId}`;
          await storeEncryptedCredential({
            tokenHash: crypto.createHash("sha256").update(handoffTokenId).digest("hex"),
            tokenId: handoffTokenId,
            userId: user.id,
            username: activeConnection.username,
            name: handoffTokenId,
            role: activeConnection.role,
            host: activeConnection.host,
            port: activeConnection.port,
            password: "",
            kind: "session",
            tls: activeConnection.tls ?? false,
            ca: activeConnection.ca,
            cert: activeConnection.cert,
            key,
            expiresAtUnix: Math.floor(Date.now() / 1000) + REAUTHENTICATION_HANDOFF_TTL_SECONDS,
          });
        } catch (error) {
          console.error("Failed to prepare the password reauthentication handoff:", error);
          if (handoffTokenId) {
            try {
              await tokenStorage.deleteToken(handoffTokenId);
            } catch (cleanupError) {
              console.error("Failed to remove an incomplete password reauthentication handoff:", cleanupError);
            }
          }
          return NextResponse.json(
            { message: "Unable to prepare secure reauthentication. The password was not changed." },
            { status: 500, headers: getCorsHeaders(request) }
          );
        }
      }

      const finalRole = getRoleWithKeys(role, keys);
      if (password) {
        finalRole.push("resetpass", `>${password}`);
      }
      try {
        await connection.aclSetUser(username, finalRole);
      } catch (error) {
        if (tokenStorage && handoffTokenId) {
          try {
            const deleted = await tokenStorage.deleteToken(handoffTokenId);
            if (!deleted) console.error("Password reauthentication handoff was missing during cleanup");
          } catch (cleanupError) {
            console.error("Failed to remove the password reauthentication handoff:", cleanupError);
          }
        }
        throw error;
      }

      const aclSaveStatus = await persistAclAndRemovePreviousPasswordConnectionCredential(
        requiresReauthentication,
        () => connection.aclSave(),
        error => console.error("Failed to persist ACL after changing the current user's password:", error),
        tokenStorage ? user.connectionId : undefined,
        tokenStorage ? connectionId => tokenStorage.deleteToken(connectionId) : undefined,
        error => console.error("Failed to remove the previous password credential:", error),
      );
      if (requiresReauthentication && user.connectionId) {
        await closeCachedConnection(sessionConnectionKey(user.id, user.connectionId));
      }

      const message = "User role updated";
      const response: UpdateUserResponse = requiresReauthentication ? {
        message,
        requiresReauthentication: true,
        aclSaveStatus: aclSaveStatus ?? "unknown",
        reauthenticationConnection: { host: user.host, port: user.port, username, tls: user.tls },
      } : { message, requiresReauthentication: false };
      const nextResponse = NextResponse.json(response, { status: 200, headers: getCorsHeaders(request) });
      if (handoffId) {
        nextResponse.cookies.set(REAUTHENTICATION_HANDOFF_COOKIE, handoffId, {
          httpOnly: true,
          sameSite: "lax",
          secure: shouldUseSecureCookies(request),
          path: "/api/auth",
          maxAge: REAUTHENTICATION_HANDOFF_TTL_SECONDS,
        });
      }
      return nextResponse;
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
