import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import authOptions, { newClient } from "@/app/api/auth/[...nextauth]/options";
import { storeEncryptedCredential } from "@/app/api/auth/tokenUtils";
import StorageFactory from "@/lib/token-storage/StorageFactory";
import { getCorsHeaders } from "@/app/api/utils";

const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

/**
 * POST /api/auth/migrate-session
 *
 * One-time migration helper. Called when the client detects that the
 * Token DB is out of sync with the current NextAuth session (e.g. after
 * a server restart wiped the in-memory FileTokenStorage, or after a
 * deploy that changed the storage backend).
 *
 * Steps:
 *  1. Read the current session (host/port/tls/username from session.user)
 *  2. Delete ALL existing connection tokens for this user from Token DB
 *     (removes stale entries that no longer match reality)
 *  3. Create a fresh FalkorDB connection to verify credentials
 *  4. Write a new connection entry to Token DB
 *  5. Return the new connection so the client can update its state
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401, headers: getCorsHeaders(request) }
      );
    }

    const storage = StorageFactory.getStorage();

    // Step 1: Remove all existing connection tokens for this user so we
    //         start from a clean slate (no stale / duplicate entries).
    try {
      const existing = await storage.fetchTokensByUserId(user.id);
      await Promise.all(
        existing
          .filter(t => t.name.startsWith("connection:"))
          .map(t => storage.deleteToken(t.token_id).catch(() => { /* ignore */ }))
      );
    } catch {
      // Non-fatal – proceed with creating the new entry.
    }

    // Step 2: Create a fresh FalkorDB connection to get the real role.
    const connId = uuidv4();
    const connKey = `${user.id}:${connId}`;

    const { role } = await newClient(
      {
        host: user.host || "localhost",
        port: (user.port ?? 6379).toString(),
        tls: (user.tls ?? false).toString(),
        // No username/password – anonymous connection matching the original login
      },
      connKey
    );

    // Step 3: Persist the new connection entry in Token DB.
    const tokenHash = crypto
      .createHash("sha256")
      .update(`connection:${connId}`)
      .digest("hex");

    await storeEncryptedCredential({
      tokenHash,
      tokenId: connId,
      userId: user.id,
      username: user.username || "default",
      name: `connection:${connId}`,
      role,
      host: user.host || "localhost",
      port: user.port ?? 6379,
      password: "",          // passwordless – empty string encrypts fine
      kind: "session",
      tls: user.tls ?? false,
      expiresAtUnix: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    });

    const newConnection = {
      id: connId,
      username: user.username || "default",
      role,
      host: user.host || "localhost",
      port: user.port ?? 6379,
      tls: user.tls ?? false,
    };

    return NextResponse.json(
      { connection: newConnection },
      { status: 200, headers: getCorsHeaders(request) }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Session migration failed:", err);
    return NextResponse.json(
      { message: "Migration failed" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
