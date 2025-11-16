import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import crypto from "crypto";
import { executePATQuery } from "@/lib/token-storage";
import { getTokenId, validateJWTSecret } from "../tokenUtils";
import { getClient } from "../[...nextauth]/options";

/**
 * Parses and validates request body
 */
async function parseRequestBody(request: NextRequest): Promise<{ 
  token?: string; 
  tokenId?: string; 
  error?: NextResponse 
}> {
  try {
    const body = await request.json();
    const { token: tokenToRevoke, token_id: tokenIdToRevoke } = body;
    
    if (!tokenToRevoke && !tokenIdToRevoke) {
      return {
        error: NextResponse.json(
          { message: "Token or token_id is required in request body" },
          { status: 400 }
        ),
      };
    }
    
    return { token: tokenToRevoke, tokenId: tokenIdToRevoke };
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
 * Resolves token details by JWT token string
 */
async function resolveTokenByJWT(
  token: string,
  jwtSecret: Uint8Array,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticatedUser: any,
  isAdmin: boolean
): Promise<{ 
  tokenHash?: string; 
  tokenId?: string; 
  tokenUsername?: string; 
  error?: NextResponse 
}> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    
    // Permission check
    const isTokenOwner = authenticatedUser.username === payload.username;
    if (!isAdmin && !isTokenOwner) {
      return {
        error: NextResponse.json(
          { message: "Forbidden: You can only revoke your own tokens" },
          { status: 403 }
        ),
      };
    }
    
    return {
      tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      tokenId: getTokenId(payload),
      tokenUsername: payload.username as string | undefined,
    };
  } catch (jwtError) {
    // eslint-disable-next-line no-console
    console.error("JWT verification failed:", jwtError);
    return {
      error: NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      ),
    };
  }
}

/**
 * Resolves token details by token_id from database
 */
async function resolveTokenById(
  tokenId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticatedUser: any,
  isAdmin: boolean
): Promise<{ 
  tokenHash?: string; 
  tokenId?: string; 
  tokenUsername?: string; 
  error?: NextResponse 
}> {
  const escapeString = (str: string) => str.replace(/'/g, "''");
  const findQuery = `
    MATCH (t:Token {token_id: '${escapeString(tokenId)}'})-[:BELONGS_TO]->(u:User)
    WHERE t.is_active = true
    RETURN t.token_hash as token_hash, 
           t.token_id as token_id,
           t.username as username
  `;
  
  const findResult = await executePATQuery(findQuery);
  
  if (!findResult.data || findResult.data.length === 0) {
    return {
      error: NextResponse.json(
        { message: "Token not found" },
        { status: 404 }
      ),
    };
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const foundToken = findResult.data[0] as any;
  
  // Permission check
  const isTokenOwner = authenticatedUser.username === foundToken.username;
  if (!isAdmin && !isTokenOwner) {
    return {
      error: NextResponse.json(
        { message: "Forbidden: You can only revoke your own tokens" },
        { status: 403 }
      ),
    };
  }
  
  return {
    tokenHash: foundToken.token_hash,
    tokenId: foundToken.token_id,
    tokenUsername: foundToken.username,
  };
}

/**
 * Performs soft delete of token in FalkorDB
 */
async function revokeTokenInDatabase(
  tokenHash: string,
  tokenId: string,
  revokerUsername: string
): Promise<{ success: boolean; error?: NextResponse }> {
  try {
    const escapeString = (str: string) => str.replace(/'/g, "''");
    const nowUnix = Math.floor(Date.now() / 1000);
    const revokeQuery = `
      MATCH (t:Token {token_hash: '${escapeString(tokenHash)}'})-[:BELONGS_TO]->(u:User)
      MATCH (revoker:User {username: '${escapeString(revokerUsername)}'})
      SET t.is_active = false
      CREATE (t)-[:REVOKED_BY {at: ${nowUnix}}]->(revoker)
      RETURN t.token_id as token_id
    `;
    
    const revokeResult = await executePATQuery(revokeQuery);
    
    if (!revokeResult.data || revokeResult.data.length === 0) {
      return {
        success: false,
        error: NextResponse.json(
          { 
            message: "Token was not found in active tokens (may have already been revoked)",
            tokenId 
          },
          { status: 200 }
        ),
      };
    }
    
    return { success: true };
  } catch (revokeError) {
    // eslint-disable-next-line no-console
    console.error("Token revocation error:", revokeError);
    return {
      success: false,
      error: NextResponse.json(
        { message: "Failed to revoke token" },
        { status: 500 }
      ),
    };
  }
}

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest) {
  try {
    // Validate JWT secret
    const jwtValidation = validateJWTSecret();
    if (!jwtValidation.valid) {
      return jwtValidation.error!;
    }

    // Authenticate the user making the request
    const session = await getClient();
    if (session instanceof NextResponse) {
      return session;
    }
    const { user: authenticatedUser } = session;
    const isAdmin = authenticatedUser.role === 'Admin';

    // Parse request body
    const bodyResult = await parseRequestBody(request);
    if (bodyResult.error) {
      return bodyResult.error;
    }

    // Resolve token details (by JWT or by token_id)
    let tokenDetails;
    if (bodyResult.token) {
      // Revoke by full JWT token
      tokenDetails = await resolveTokenByJWT(
        bodyResult.token,
        jwtValidation.secret!,
        authenticatedUser,
        isAdmin
      );
    } else {
      // Revoke by token_id
      tokenDetails = await resolveTokenById(
        bodyResult.tokenId!,
        authenticatedUser,
        isAdmin
      );
    }

    if (tokenDetails.error) {
      return tokenDetails.error;
    }

    // Revoke token in database
    const revokeResult = await revokeTokenInDatabase(
      tokenDetails.tokenHash!,
      tokenDetails.tokenId!,
      authenticatedUser.username || "default"
    );

    if (revokeResult.error) {
      return revokeResult.error;
    }

    // 6. Return success response
    return NextResponse.json(
      { 
        message: "Token revoked successfully",
        tokenId: tokenDetails.tokenId
      },
      { status: 200 }
    );
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Token revocation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

