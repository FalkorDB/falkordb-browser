import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line import/no-extraneous-dependencies
import { SignJWT } from "jose";
import crypto from "crypto";
import { executePATQuery } from "@/lib/token-storage";
import { getClient, newClient, generateTimeUUID } from "../[...nextauth]/options";
import { encrypt } from "../encryption";
import { validateJWTSecret } from "../tokenUtils";

/**
 * Fetches tokens from FalkorDB with role-based filtering
 */
async function fetchTokens(
  isAdmin: boolean,
  username: string,
  userId: string
): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokens?: any[];
  error?: NextResponse;
}> {
  try {
    // Use string interpolation instead of parameterized queries
    const escapeString = (str: string) => str.replace(/'/g, "''");
    const userFilter = isAdmin ? "" : `AND t.user_id = '${escapeString(userId)}'`;
    
    const query = `
      MATCH (t:Token)-[:BELONGS_TO]->(u:User)
      WHERE t.is_active = true ${userFilter}
      RETURN t.token_hash as token_hash,
             t.token_id as token_id,
             t.user_id as user_id,
             t.username as username,
             t.name as name,
             t.role as role,
             t.host as host,
             t.port as port,
             t.created_at as created_at,
             t.expires_at as expires_at,
             t.last_used as last_used
      ORDER BY t.created_at DESC
    `;
    
    const result = await executePATQuery(query);

    // Transform FalkorDB objects to token objects with ISO timestamps
    // -1 means NULL (never expires / never used)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens = (result.data || []).map((row: any) => ({
      token_hash: row.token_hash,
      token_id: row.token_id,
      user_id: row.user_id,
      username: row.username,
      name: row.name,
      role: row.role,
      host: row.host,
      port: row.port,
      created_at: new Date(row.created_at * 1000).toISOString(),
      expires_at: row.expires_at > 0 ? new Date(row.expires_at * 1000).toISOString() : null,
      last_used: row.last_used > 0 ? new Date(row.last_used * 1000).toISOString() : null,
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

export async function GET() {
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
      authenticatedUser.id
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
      { status: 200 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
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
        { status: 500 }
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
        { status: 400 }
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
          { status: 400 }
        );
      }
    }
    if (ttlSeconds !== undefined && (ttlSeconds > 31622400 || ttlSeconds < 1)) {
      return NextResponse.json(
        { message: "Invalid TTL value" },
        { status: 400 }
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

    // 7. Store token in FalkorDB
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const password = (user as any).password || '';
      const encryptedPassword = encrypt(password);

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const nowUnix = Math.floor(Date.now() / 1000);
      const expiresAtUnix = expiresAtDate ? Math.floor(expiresAtDate.getTime() / 1000) : -1;

      const escapeString = (str: string) => str.replace(/'/g, "''");
      const username = user.username || "default";
      const host = user.host || "localhost";
      const role = user.role || "Unknown";

      const query = `
        MERGE (u:User {username: '${escapeString(username)}', user_id: '${escapeString(user.id)}'})
        CREATE (t:Token {
          token_hash: '${escapeString(tokenHash)}',
          token_id: '${escapeString(tokenId)}',
          user_id: '${escapeString(user.id)}',
          username: '${escapeString(username)}',
          name: '${escapeString(name)}',
          role: '${escapeString(role)}',
          host: '${escapeString(host)}',
          port: ${Number.parseInt(String(user.port), 10)},
          created_at: ${nowUnix},
          expires_at: ${expiresAtUnix},
          last_used: -1,
          is_active: true,
          encrypted_password: '${escapeString(encryptedPassword)}'
        })
        CREATE (t)-[:BELONGS_TO]->(u)
        RETURN t.token_id as token_id
      `;

      await executePATQuery(query);
    } catch (storageError) {
      // eslint-disable-next-line no-console
      console.error('Failed to store token in FalkorDB:', storageError);
      // Continue - token will still work but can't be managed via UI
    }

    // 8. Return success response
    return NextResponse.json(
      {
        message: "Token created successfully",
        token
      },
      { status: 200 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Token generation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
