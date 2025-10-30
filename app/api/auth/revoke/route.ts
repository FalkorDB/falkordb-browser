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

    const { token: tokenToRevoke, token_id: tokenIdToRevoke } = body;
    
    if (!tokenToRevoke && !tokenIdToRevoke) {
      return NextResponse.json(
        { message: "Token or token_id is required in request body" },
        { status: 400 }
      );
    }

    // SSRF Protection: Use authenticated user's connection params
    const adminClient = await getAdminConnectionForTokens(
      authenticatedUser.host,
      authenticatedUser.port,
      authenticatedUser.tls,
      authenticatedUser.ca
    );
    const adminConnection = await adminClient.connection;

    let tokenHash = "";
    let tokenId = "";
    let tokenUsername: string | undefined;

    if (tokenToRevoke) {
      // Revoke by token (original flow)
      try {
        // Verify the token to be revoked
        const { payload } = await jwtVerify(tokenToRevoke, JWT_SECRET);
        
        // Permission check: Admin can revoke any token, users can only revoke their own
        const isAdmin = authenticatedUser.role === 'Admin';
        const isTokenOwner = authenticatedUser.username === payload.username;
        
        if (!isAdmin && !isTokenOwner) {
          return NextResponse.json(
            { message: "Forbidden: You can only revoke your own tokens" },
            { status: 403 }
          );
        }
        
        // Generate token ID for revocation
        tokenId = getTokenId(payload);
        tokenUsername = payload.username as string | undefined;
        
        // Hash the token to match storage format
        tokenHash = crypto.createHash('sha256').update(tokenToRevoke).digest('hex');
        
      } catch (jwtError) {
        // eslint-disable-next-line no-console
        console.error("JWT verification failed:", jwtError);
        return NextResponse.json(
          { message: "Invalid token" },
          { status: 401 }
        );
      }
    } else {
      // Revoke by token_id (new flow for UI)
      // First, get all token keys and find the one with matching token_id
      const tokenKeys = await adminConnection.keys("api_token:*");
      
      // Fetch all tokens and find the matching one
      const tokenDataPromises = tokenKeys.map(async (key) => {
        const data = await adminConnection.get(key);
        if (data) {
          const tokenData = JSON.parse(data);
          return { key, tokenData };
        }
        return null;
      });
      
      const allTokenData = (await Promise.all(tokenDataPromises)).filter(Boolean);
      const foundTokenEntry = allTokenData.find(
        entry => entry && entry.tokenData.token_id === tokenIdToRevoke
      );
      
      if (!foundTokenEntry) {
        return NextResponse.json(
          { message: "Token not found" },
          { status: 404 }
        );
      }
      
      const { key, tokenData } = foundTokenEntry;
      tokenHash = key.replace('api_token:', '');
      tokenId = tokenData.token_id;
      tokenUsername = tokenData.username;
      
      // Permission check: Admin can revoke any token, users can only revoke their own
      const isAdmin = authenticatedUser.role === 'Admin';
      const isTokenOwner = authenticatedUser.username === tokenUsername;
      
      if (!isAdmin && !isTokenOwner) {
        return NextResponse.json(
          { message: "Forbidden: You can only revoke your own tokens" },
          { status: 403 }
        );
      }
    }

    try {
      // Remove the token from Redis
      const deletedCount = await adminConnection.del(`api_token:${tokenHash}`);
      
      // Also remove from user's token set if applicable
      if (tokenUsername) {
        await adminConnection.sRem(`user_tokens:${tokenUsername}`, tokenId);
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
      
    } catch (deleteError) {
      // eslint-disable-next-line no-console
      console.error("Token deletion error:", deleteError);
      return NextResponse.json(
        { message: "Failed to revoke token" },
        { status: 500 }
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

