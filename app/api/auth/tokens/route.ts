import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line import/no-extraneous-dependencies
import { SignJWT } from "jose";
import crypto from "crypto";
import StorageFactory from "@/lib/token-storage/StorageFactory";
import { getClient, generateTimeUUID } from "../[...nextauth]/options";
import { encrypt } from "../encryption";
import { getCorsHeaders } from "../../utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * Fetches tokens with role-based filtering using storage abstraction
 */
async function fetchTokens(
  isAdmin: boolean,
  username: string,
  host: string,
  port: number
): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokens?: any[];
  error?: NextResponse;
}> {
  try {
    const storage = StorageFactory.getStorage();

    const tokenData = await storage.fetchTokens({
      isAdmin,
      username,
      host,
      port,
    });

    // Transform to API response format with ISO timestamps
    // -1 means NULL (never expires / never used)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens = tokenData.map((token: any) => ({
      token_hash: token.token_hash,
      token_id: token.token_id,
      user_id: token.user_id,
      username: token.username,
      name: token.name,
      role: token.role,
      host: token.host,
      port: token.port,
      created_at: new Date(token.created_at * 1000).toISOString(),
      expires_at: token.expires_at > 0 ? new Date(token.expires_at * 1000).toISOString() : null,
      last_used: token.last_used > 0 ? new Date(token.last_used * 1000).toISOString() : null,
    }));

    return { tokens };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error querying tokens:", error);
    return {
      error: NextResponse.json(
        { message: "Failed to fetch tokens" },
        { status: 500 }
      ),
    };
  }
}

export async function GET(request: Request) {
  try {
    // 1. Authenticate the user making the request
    const session = await getClient();
    if (session instanceof NextResponse) {
      return session;
    }
    const { user: authenticatedUser } = session;

    // 2. Determine user role for filtering
    const isAdmin = authenticatedUser.role === 'Admin';

    // 3. Fetch tokens from database (with role-based filtering)
    const fetchResult = await fetchTokens(
      isAdmin,
      authenticatedUser.username || "default",
      authenticatedUser.host || "localhost",
      authenticatedUser.port || 6379
    );

    if (fetchResult.error) {
      return fetchResult.error;
    }

    // 4. Return tokens with metadata
    return NextResponse.json(
      {
        tokens: fetchResult.tokens,
        count: fetchResult.tokens!.length,
        role: authenticatedUser.role,
      },
      { status: 200, headers: getCorsHeaders(request) }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

/**
 * POST /api/auth/tokens - Session-based token generation
 * User must be logged in with valid session
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate JWT secret
    if (!process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500, headers: getCorsHeaders(request) }
      );
    }
    const jwtSecret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

    // 2. Get authenticated user from session
    const session = await getClient();
    if (session instanceof NextResponse) {
      return session; // Returns 401 if not authenticated
    }
    const { user } = session;

    // 3. Parse request body for token metadata
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const {
      name = "API Token",
      expiresAt = null,
      ttlSeconds = undefined,
    } = body;

    // 4. Validate expiration parameters
    let expiresAtDate: Date | null = null;
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt);
      if (expiresAtDate <= new Date()) {
        return NextResponse.json(
          { message: "Expiration date must be in the future" },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }
    }
    if (ttlSeconds !== undefined && (ttlSeconds > 31622400 || ttlSeconds < 1)) {
      return NextResponse.json(
        { message: "Invalid TTL value" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    // 5. Generate random token ID (jti)
    const tokenId = generateTimeUUID();

    // 6. Generate JWT token (without password)
    const currentTime = Math.floor(Date.now() / 1000);
    let expirationTime: number | undefined;
    if (expiresAtDate) {
      expirationTime = Math.floor(expiresAtDate.getTime() / 1000);
    } else if (typeof ttlSeconds === "number") {
      expirationTime = currentTime + ttlSeconds;
    }

    const tokenPayload = {
      sub: user.id,
      jti: tokenId,
      username: user.username || "default",
      role: user.role,
      host: user.host || "localhost",
      port: user.port,
      tls: user.tls,
      ca: user.ca || undefined,
      iat: currentTime,
    };

    const signer = new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt();

    if (expirationTime !== undefined) {
      signer.setExpirationTime(expirationTime);
    }

    const token = await signer.sign(jwtSecret);

    // 7. Store token using storage abstraction
    try {
      const storage = StorageFactory.getStorage();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const password = (user as any).password || '';
      const encryptedPassword = encrypt(password);

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const nowUnix = Math.floor(Date.now() / 1000);
      const expiresAtUnix = expiresAtDate ? Math.floor(expiresAtDate.getTime() / 1000) : -1;

      const username = user.username || "default";
      const host = user.host || "localhost";
      const port = user.port || 6379;
      const role = user.role || "Unknown";

      await storage.createToken({
        token_hash: tokenHash,
        token_id: tokenId,
        user_id: user.id,
        username,
        name,
        role,
        host,
        port,
        created_at: nowUnix,
        expires_at: expiresAtUnix,
        last_used: -1,
        is_active: true,
        encrypted_password: encryptedPassword,
      });
    } catch (storageError) {
      // eslint-disable-next-line no-console
      console.error('Failed to store token:', storageError);
      return NextResponse.json(
        { message: "Failed to store token" },
        { status: 500, headers: getCorsHeaders(request) }
      );
    }

    // 8. Return success response
    return NextResponse.json(
      {
        message: "Token created successfully",
        token
      },
      { status: 200, headers: getCorsHeaders(request) }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Token generation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
