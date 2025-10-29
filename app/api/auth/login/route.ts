import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line import/no-extraneous-dependencies
import { SignJWT } from "jose";
import crypto from "crypto";
import { getClient, newClient, generateTimeUUID, getAdminConnectionForTokens, generateConsistentUserId } from "../[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
    // Check JWT secret at runtime
    if (!process.env.NEXTAUTH_SECRET) {
      // eslint-disable-next-line no-console
      console.error("NEXTAUTH_SECRET environment variable is required");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

    // Handle JSON parsing errors properly
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { 
      username, 
      password, 
      host = "localhost", 
      port = "6379", 
      tls = "false", 
      ca,
      name = "API Token",
      expiresAt = null,
      ttlSeconds = 31622400 // Default: 366 days
    } = body;

    // Determine if this is direct login (with credentials) or session-based PAT generation
    let user;
    let id;

    if (username || password || host !== "localhost" || port !== "6379" || tls !== "false" || ca) {
      // Mode 1: Direct login with credentials (Swagger/external API)
      // Generate consistent user ID based on credentials (same user = same ID)
      id = generateConsistentUserId(username || "default", host, parseInt(port, 10));

      // Attempt to connect to FalkorDB using existing logic
      const { role } = await newClient(
        {
          host,
          port: port.toString(),
          username: username || "", // Handle undefined username like NextAuth does
          password: password || "", // Handle undefined password like NextAuth does
          tls: tls.toString(),
          ca: ca || "undefined",
        },
        id
      );

      // If connection is successful, create user object
      user = {
        id,
        host,
        port: parseInt(port, 10),
        username,
        tls: tls === "true" || tls === true,
        ca,
        role,
      };
    } else {
      // Mode 2: PAT generation from existing session
      const session = await getClient();
      
      if (session instanceof NextResponse) {
        return session; // Return auth error
      }

      user = session.user;
      id = user.id;
    }

    try {
      
      // Generate a unique token ID
      const tokenId = generateTimeUUID();
      
      // Create JWT token with all necessary connection information
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Validate and prepare expiration data
      // Frontend sends expiresAt (ISO string or null) and ttlSeconds
      let expiresAtDate: Date | null = null;
      
      if (expiresAt) {
        expiresAtDate = new Date(expiresAt);
        
        // Validate the date is in the future
        if (expiresAtDate <= new Date()) {
          return NextResponse.json(
            { message: "Expiration date must be in the future" },
            { status: 400 }
          );
        }
      }
      
      // Validate TTL is reasonable (max 1 year + grace period)
      if (ttlSeconds > 31622400 || ttlSeconds < 1) {
        return NextResponse.json(
          { message: "Invalid TTL value" },
          { status: 400 }
        );
      }
      
      // Set JWT expiration time
      const expirationTime = expiresAtDate 
        ? Math.floor(expiresAtDate.getTime() / 1000) 
        : "1y"; // Use 1 year for "never" tokens
      
      const tokenPayload = {
        sub: user.id,           // Standard JWT claim for user ID
        jti: tokenId,           // JWT ID for unique identification
        username: user.username || undefined,
        role: user.role,
        host: user.host,
        port: user.port,
        tls: user.tls,
        ca: user.ca || undefined,
        iat: currentTime,
      };

      const token = await new SignJWT(tokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expirationTime)
        .sign(JWT_SECRET);

      // Store the active token in Redis using Default connection
      try {
        // Get Admin connection for token management
        const adminClient = await getAdminConnectionForTokens(
          user.host,
          user.port,
          user.tls,
          user.ca
        );
        const adminConnection = await adminClient.connection;
        
        // Hash the token for security (never store plain text)
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        // Create token metadata
        const tokenData = {
          user_id: user.id,
          token_id: tokenId,
          created_at: new Date().toISOString(),
          expires_at: expiresAtDate ? expiresAtDate.toISOString() : null,
          last_used: null,
          name,
          permissions: [user.role],
          username: user.username
        };
        
        // Store token data with calculated TTL
        // For "never" expiration: 366 days grace period allows audit trail after JWT expiration
        await adminConnection.setEx(
          `api_token:${tokenHash}`,
          ttlSeconds,
          JSON.stringify(tokenData)
        );
        
        // Add to user's token set for easy management
        await adminConnection.sAdd(`user_tokens:${user.username}`, tokenId);
        await adminConnection.expire(`user_tokens:${user.username}`, 31622400);
        
      } catch (redisError) {
        // eslint-disable-next-line no-console
        console.error('Failed to store token in Redis:', redisError);
        // Continue without Redis storage - token will still work but can't be revoked
      }

      return NextResponse.json(
        {
          message: "Authentication successful",
          token
        },
        { status: 200 }
      );
    } catch (connectionError) {
      // eslint-disable-next-line no-console
      console.error("FalkorDB connection error:", connectionError);
      return NextResponse.json(
        { message: "Invalid credentials or connection failed" },
        { status: 401 }
      );
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
