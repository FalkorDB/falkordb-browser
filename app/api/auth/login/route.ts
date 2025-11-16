import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line import/no-extraneous-dependencies
import { SignJWT } from "jose";
import crypto from "crypto";
import { executePATQuery } from "@/lib/token-storage";
import { getClient, newClient, generateTimeUUID, generateConsistentUserId } from "../[...nextauth]/options";
import { encrypt } from "../encryption";
import { validateJWTSecret } from "../tokenUtils";

/**
 * Parses and validates request body
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function parseRequestBody(request: NextRequest): Promise<{ body?: any; error?: NextResponse }> {
  try {
    const body = await request.json();
    return { body };
  } catch (jsonError) {
    return {
      error: NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Authenticates user via direct credentials or existing session
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function authenticateUser(body: any): Promise<{ user?: any; password?: string; error?: NextResponse }> {
  const { 
    username, 
    password, 
    host = "localhost", 
    port = "6379", 
    tls = "false", 
    ca,
  } = body;

  // Mode 1: Direct login with credentials (Swagger/external API)
  if (username || password || host !== "localhost" || port !== "6379" || tls !== "false" || ca) {
    try {
      const id = generateConsistentUserId(username || "default", host, parseInt(port, 10));
      const userPassword = password || "";

      const { role } = await newClient(
        {
          host,
          port: port.toString(),
          username: username || "",
          password: userPassword,
          tls: tls.toString(),
          ca: ca || "undefined",
        },
        id
      );

      return {
        user: {
          id,
          host,
          port: parseInt(port, 10),
          username,
          tls: tls === "true" || tls === true,
          ca,
          role,
        },
        password: userPassword,
      };
    } catch (connectionError) {
      // eslint-disable-next-line no-console
      console.error("FalkorDB connection error:", connectionError);
      return {
        error: NextResponse.json(
          { message: "Invalid credentials or connection failed" },
          { status: 401 }
        ),
      };
    }
  }

  // Mode 2: PAT generation from existing session
  const session = await getClient();
  
  if (session instanceof NextResponse) {
    return { error: session };
  }

  return {
    user: session.user,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    password: (session.user as any).password as string | undefined,
  };
}

/**
 * Validates token expiration parameters
 */
function validateExpiration(expiresAt: string | null, ttlSeconds: number | undefined): { 
  valid: boolean; 
  expiresAtDate?: Date | null; 
  error?: NextResponse 
} {
  let expiresAtDate: Date | null = null;
  
  if (expiresAt) {
    expiresAtDate = new Date(expiresAt);
    
    if (expiresAtDate <= new Date()) {
      return {
        valid: false,
        error: NextResponse.json(
          { message: "Expiration date must be in the future" },
          { status: 400 }
        ),
      };
    }
  }
  
  // If ttlSeconds is undefined, it means "never expires" - skip validation
  if (ttlSeconds !== undefined && (ttlSeconds > 31622400 || ttlSeconds < 1)) {
    return {
      valid: false,
      error: NextResponse.json(
        { message: "Invalid TTL value" },
        { status: 400 }
      ),
    };
  }
  
  return { valid: true, expiresAtDate };
}

/**
 * Generates JWT token with user information
 * Note: Password is NOT included in JWT - it's stored securely in Token DB (6380)
 */
async function generateJWTToken(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any,
  tokenId: string,
  expiresAtDate: Date | null,
  ttlSeconds: number | undefined,
  jwtSecret: Uint8Array
): Promise<string> {
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Calculate expiration time based on expiresAtDate or ttlSeconds
  let expirationTime: number | undefined;
  if (expiresAtDate) {
    expirationTime = Math.floor(expiresAtDate.getTime() / 1000);
  } else if (typeof ttlSeconds === "number") {
    expirationTime = currentTime + ttlSeconds;
  } else {
    expirationTime = undefined; // Never expires
  }
  
  // JWT payload WITHOUT password for security
  const tokenPayload = {
    sub: user.id,
    jti: tokenId,
    username: user.username || "default",
    role: user.role,
    host: user.host,
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

  return signer.sign(jwtSecret);
}

/**
 * Stores token metadata in FalkorDB PAT instance
 */
async function storeTokenInFalkorDB(
  token: string,
  tokenId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any,
  name: string,
  expiresAtDate: Date | null,
  encryptedPassword: string
): Promise<void> {
  // Validate and provide defaults for required fields
  if (!user.id || !user.port) {
    throw new Error('Missing parameters');
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const nowUnix = Math.floor(Date.now() / 1000);
  const expiresAtUnix = expiresAtDate ? Math.floor(expiresAtDate.getTime() / 1000) : -1;
  
  // Use string interpolation - parameterized queries don't work with FalkorDB
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
}

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
    // 1. Validate JWT secret
    const jwtValidation = validateJWTSecret();
    if (!jwtValidation.valid) {
      return jwtValidation.error!;
    }

    // 2. Parse request body
    const bodyResult = await parseRequestBody(request);
    if (bodyResult.error) {
      return bodyResult.error;
    }

    const { 
      name = "API Token",
      expiresAt = null,
      ttlSeconds = undefined, // Default: never expires
    } = bodyResult.body;

    // 3. Authenticate user (direct login or session)
    const authResult = await authenticateUser(bodyResult.body);
    if (authResult.error) {
      return authResult.error;
    }

    // 4. Validate expiration parameters
    const expirationValidation = validateExpiration(expiresAt, ttlSeconds);
    if (!expirationValidation.valid) {
      return expirationValidation.error!;
    }

    // 5. Generate token ID
    const tokenId = generateTimeUUID();

    // 6. Generate JWT token (without password for security)
    const token = await generateJWTToken(
      authResult.user!,
      tokenId,
      expirationValidation.expiresAtDate ?? null,
      ttlSeconds,
      jwtValidation.secret!
    );

    // 7. Store token in FalkorDB (non-blocking)
    try {
      // Encrypt password before storing in Token DB
      const encryptedPassword = authResult.password ? encrypt(authResult.password) : encrypt('');
      
      await storeTokenInFalkorDB(
        token,
        tokenId,
        authResult.user!,
        name,
        expirationValidation.expiresAtDate!,
        encryptedPassword
      );
    } catch (storageError) {
      // eslint-disable-next-line no-console
      console.error('Failed to store token in FalkorDB:', storageError);
      // Continue - token will still work but can't be managed via UI
    }

    // 8. Return success response
    return NextResponse.json(
      {
        message: "Authentication successful",
        token
      },
      { status: 200 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
