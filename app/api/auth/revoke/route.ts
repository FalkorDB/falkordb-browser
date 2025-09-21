import { NextRequest, NextResponse } from "next/server";
import { createClient } from "redis";
import { jwtVerify } from "jose";

// Create Redis client for token revocation storage
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

// Helper function to extract JWT from Authorization header
function extractJWTFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// Helper function to get token ID (jti or sub + iat)
function getTokenId(payload: any): string {
  // Use jti if available, otherwise create from sub + iat
  return payload.jti || `${payload.sub}-${payload.iat}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check JWT secret at runtime
    if (!process.env.NEXTAUTH_SECRET) {
      console.error("NEXTAUTH_SECRET environment variable is required");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

    // First verify authentication token from header
    const authToken = extractJWTFromRequest(request);
    if (!authToken) {
      return NextResponse.json(
        { message: "Authorization header with Bearer token required" },
        { status: 401 }
      );
    }

    // Verify the authentication token
    try {
      await jwtVerify(authToken, JWT_SECRET);
    } catch (authError) {
      return NextResponse.json(
        { message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Parse request body to get token to revoke
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { token: tokenToRevoke } = body;
    
    if (!tokenToRevoke) {
      return NextResponse.json(
        { message: "Token to revoke is required in request body" },
        { status: 400 }
      );
    }

    try {
      // Verify the token to be revoked
      const { payload } = await jwtVerify(tokenToRevoke, JWT_SECRET);
      
      // Get Redis client
      const redis = await getRedisClient();
      
      // Generate token ID for revocation storage
      const tokenId = getTokenId(payload);
      
      // Remove the active token from Redis
      const deletedCount = await redis.del(`api-jwt-active:${tokenId}`);
      
      if (deletedCount === 0) {
        return NextResponse.json(
          { 
            message: "Token was not found in active tokens (may have already been revoked or expired)",
            tokenId 
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { 
          message: "Token revoked successfully",
          tokenId 
        },
        { status: 200 }
      );
      
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error("Token revocation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to check if a token is active (exported for use in auth)
export async function isTokenActive(token: string): Promise<boolean> {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      return true; // Default to active if no secret configured
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    const redis = await getRedisClient();
    const tokenId = getTokenId(payload);
    
    // Check if token exists in active tokens list
    const activeToken = await redis.get(`api-jwt-active:${tokenId}`);
    return activeToken !== null;
    
  } catch (error) {
    console.error("Error checking token status:", error);
    return true; // Default to active if we can't check Redis
  }
}
