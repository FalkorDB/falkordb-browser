import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line import/no-extraneous-dependencies
import { SignJWT } from "jose";
import crypto from "crypto";
import { newClient, generateTimeUUID, getAdminConnectionForTokens, generateConsistentUserId } from "../[...nextauth]/options";

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

    const { username, password, host = "localhost", port = "6379", tls = "false", ca } = body;

    // Note: username and password are optional - same as NextAuth session behavior
    // The newClient function handles empty credentials by using "default" user

    try {
      // Generate consistent user ID based on credentials (same user = same ID)
      const id = generateConsistentUserId(username || "default", host, parseInt(port, 10));

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
      const user = {
        id,
        host,
        port: parseInt(port, 10),
        username,
        tls: tls === "true" || tls === true,
        ca,
        role,
      };

      // Create JWT token with all necessary connection information
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Generate a unique token ID
      const tokenId = generateTimeUUID();
      
      const tokenPayload = {
        sub: user.id,           // Standard JWT claim for user ID
        jti: tokenId,           // JWT ID for unique identification
        username: username || undefined,
        password: password || undefined,
        role: user.role,
        host: user.host,
        port: user.port,
        tls: user.tls,
        ca: user.ca || undefined,
        iat: currentTime,       // Issued at time
      };

      const token = await new SignJWT(tokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1y") // 1 year
        .sign(JWT_SECRET);

      // Store the active token in Redis using ADMIN connection
      // This is required because Read-Write and Read-Only users don't have SET/GET/DEL permissions
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
          expires_at: new Date(Date.now() + 31536000000).toISOString(), // 1 year (365 days)
          last_used: null,
          name: "API Token",
          permissions: [user.role],
          username: user.username
        };
        
        // Store token data with 1 year TTL (31536000 seconds = 365 days)
        await adminConnection.setEx(
          `api_token:${tokenHash}`,
          31536000,
          JSON.stringify(tokenData)
        );
        
        // Add to user's token set for easy management
        await adminConnection.sAdd(`user_tokens:${user.id}`, tokenId);
        await adminConnection.expire(`user_tokens:${user.id}`, 31536000);
        
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
