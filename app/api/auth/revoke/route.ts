import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getTokenId } from "../tokenUtils";
import { getClient } from "../[...nextauth]/options";



// eslint-disable-next-line import/prefer-default-export
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

    // Get authenticated client (this verifies auth and gives us FalkorDB connection)
    const session = await getClient();
    if (session instanceof NextResponse) {
      return session; // Return the error response
    }

    const { client } = session;

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
      
      // Use the existing Redis connection from FalkorDB client
      const connection = await client.connection;
      
      // Generate token ID for revocation storage
      const tokenId = getTokenId(payload);
      
      // Remove the active token from Redis using Redis method
      const deletedCount = await connection.del(`api-jwt-active:${tokenId}`);
      
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

