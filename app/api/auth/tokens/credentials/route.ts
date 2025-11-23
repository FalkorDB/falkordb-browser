import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line import/no-extraneous-dependencies
import { SignJWT } from "jose";
import crypto from "crypto";
import { executePATQuery } from "@/lib/token-storage";
import { newClient, generateTimeUUID, generateConsistentUserId } from "../../[...nextauth]/options";
import { encrypt } from "../../encryption";
import { login, validateBody } from "../../../validate-body";

/**
 * POST /api/auth/tokens/credentials
 * Generate JWT token with direct credentials (external/API/CLI)
 *
 * This endpoint is for users who are NOT logged in and need to authenticate
 * with credentials to generate a token.
 *
 * For browser users with existing session, use POST /api/auth/tokens instead.
 */
// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
    // 1. Validate JWT secret
    if (!process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { message: "Server configuration error: NEXTAUTH_SECRET not set" },
        { status: 500 }
      );
    }
    const jwtSecret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

    // 2. Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate body using Zod schema
    const validation = validateBody(login, body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    const {
      username,
      password,
      host,
      port,
      tls,
      ca,
      name = "API Token",
      expiresAt = null,
      ttlSeconds = undefined,
    } = validation.data as any;

    // 3. Authenticate with Main DB (6379)
    let authenticatedUser;
    let userPassword;
    try {
      const userId = generateConsistentUserId(username || "default", host, parseInt(port, 10));
      userPassword = password || "";

      const { role } = await newClient(
        {
          host,
          port: port.toString(),
          username: username || "",
          password: userPassword,
          tls: tls.toString(),
          ca: ca || "undefined",
        },
        userId
      );

      authenticatedUser = {
        id: userId,
        host,
        port: parseInt(port, 10),
        username: username || "default",
  tls: tls === "true" || tls === true,
        ca,
        role,
      };
    } catch (connectionError) {
      // eslint-disable-next-line no-console
      console.error("FalkorDB connection error:", connectionError);
      return NextResponse.json(
        { message: "Invalid credentials or connection failed" },
        { status: 401 }
      );
    }

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
        { message: "Invalid TTL value (must be between 1 and 31622400 seconds)" },
        { status: 400 }
      );
    }

    // 5. Generate token ID (jti)
    const tokenId = generateTimeUUID();

    // 6. Generate JWT token WITHOUT password
    const currentTime = Math.floor(Date.now() / 1000);
    let expirationTime: number | undefined;
    if (expiresAtDate) {
      expirationTime = Math.floor(expiresAtDate.getTime() / 1000);
    } else if (typeof ttlSeconds === "number") {
      expirationTime = currentTime + ttlSeconds;
    }

    const tokenPayload = {
      sub: authenticatedUser.id,
      jti: tokenId,
      username: authenticatedUser.username,
      role: authenticatedUser.role,
      host: authenticatedUser.host,
      port: authenticatedUser.port,
      tls: authenticatedUser.tls,
      ca: authenticatedUser.ca || undefined,
      iat: currentTime,
    };

    const signer = new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt();

    if (expirationTime !== undefined) {
      signer.setExpirationTime(expirationTime);
    }

    const token = await signer.sign(jwtSecret);

    // 7. Encrypt password and store token in Token DB (6380)
    try {
      const encryptedPassword = encrypt(userPassword);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const nowUnix = Math.floor(Date.now() / 1000);
      const expiresAtUnix = expiresAtDate ? Math.floor(expiresAtDate.getTime() / 1000) : -1;

      const escapeString = (str: string) => str.replace(/'/g, "''");

      const query = `
        MERGE (u:User {username: '${escapeString(authenticatedUser.username)}', user_id: '${escapeString(authenticatedUser.id)}'})
        CREATE (t:Token {
          token_hash: '${escapeString(tokenHash)}',
          token_id: '${escapeString(tokenId)}',
          user_id: '${escapeString(authenticatedUser.id)}',
          username: '${escapeString(authenticatedUser.username)}',
          name: '${escapeString(name)}',
          role: '${escapeString(authenticatedUser.role)}',
          host: '${escapeString(authenticatedUser.host)}',
          port: ${authenticatedUser.port},
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

    // 8. Return JWT token
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
