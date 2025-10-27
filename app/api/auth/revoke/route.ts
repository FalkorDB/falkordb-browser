import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import crypto from "crypto";
import { getTokenId } from "../tokenUtils";
import { getClient, getAdminConnectionForTokens } from "../[...nextauth]/options";



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

    // Get authenticated client (this verifies auth and gives us user info)
    const session = await getClient();
    if (session instanceof NextResponse) {
      return session; // Return the error response
    }

    const { user: authenticatedUser } = session;

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
      
      // Permission check: Admin can revoke any token, users can only revoke their own
      const isAdmin = authenticatedUser.role === 'Admin';
      const isTokenOwner = authenticatedUser.id === payload.sub;
      
      if (!isAdmin && !isTokenOwner) {
        return NextResponse.json(
          { message: "Forbidden: You can only revoke your own tokens" },
          { status: 403 }
        );
      }
      
      // SSRF Protection: Use authenticated user's connection params, not token payload
      // This prevents attackers from crafting JWTs that point to internal servers
      const adminClient = await getAdminConnectionForTokens(
        authenticatedUser.host,
        authenticatedUser.port,
        authenticatedUser.tls,
        authenticatedUser.ca
      );
      const adminConnection = await adminClient.connection;
      
      // Generate token ID for revocation
      const tokenId = getTokenId(payload);
      
      // Hash the token to match storage format
      const tokenHash = crypto.createHash('sha256').update(tokenToRevoke).digest('hex');
      
      // Remove the token from Redis
      const deletedCount = await adminConnection.del(`api_token:${tokenHash}`);
      
      // Also remove from user's token set
      if (payload.sub) {
        await adminConnection.sRem(`user_tokens:${payload.sub}`, tokenId);
      }
      
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
      // eslint-disable-next-line no-console
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Token revocation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

