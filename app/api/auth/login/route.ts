import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line import/no-extraneous-dependencies
import { SignJWT } from "jose";
import { createClient } from "redis";
import { newClient, generateTimeUUID } from "../[...nextauth]/options";

// Create Redis client for token storage
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });
    
    await redisClient.connect();
  }
  return redisClient;
}

// Helper function to get token ID (jti or sub + iat)
function getTokenId(payload: any): string {
  // Use jti if available, otherwise create from sub + iat
  return payload.jti || `${payload.sub}-${payload.iat}`;
}

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
      // Generate unique user ID
      const id = generateTimeUUID();

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
      const tokenPayload = {
        sub: user.id,           // Standard JWT claim for user ID
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
        .setExpirationTime("1w")
        .sign(JWT_SECRET);

      // Store the active token in Redis with TTL
      try {
        const redis = await getRedisClient();
        const tokenId = getTokenId(tokenPayload);
        
        // Store active token with 1 week TTL (604800 seconds)
        await redis.setEx(`api-jwt-active:${tokenId}`, 604800, token);
      } catch (redisError) {
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
