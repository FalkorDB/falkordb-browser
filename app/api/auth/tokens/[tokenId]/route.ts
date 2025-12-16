import { NextRequest, NextResponse } from "next/server";
import StorageFactory from "@/lib/token-storage/StorageFactory";
import { getClient } from "../../[...nextauth]/options";

/**
 * Fetches token details by token_id using storage abstraction
 */
async function fetchTokenById(tokenId: string): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokenData?: any;
  error?: NextResponse;
}> {
  const storage = StorageFactory.getStorage();
  const token = await storage.fetchTokenById(tokenId);

  if (!token) {
    return {
      error: NextResponse.json(
        { message: "Token not found" },
        { status: 404 }
      ),
    };
  }

  return {
    tokenData: {
      token_hash: token.token_hash,
      token_id: token.token_id,
      user_id: token.user_id,
      username: token.username,
      name: token.name,
      role: token.role,
      host: token.host,
      port: token.port,
      created_at: new Date(token.created_at * 1000).toISOString(),
      expires_at: token.expires_at > 0 ? new Date(token.expires_at * 1000).toISOString() : null,
      last_used: token.last_used > 0 ? new Date(token.last_used * 1000).toISOString() : null,
      is_active: token.is_active,
    },
  };
}

/**
 * Checks if user has permission to view the token
 */
function checkViewPermission(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticatedUser: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokenData: any
): { authorized: boolean; error?: NextResponse } {
  const isAdmin = authenticatedUser.role === "Admin";

  // Normalize host (empty string defaults to localhost)
  const authenticatedHost = authenticatedUser.host || "localhost";
  const tokenHost = tokenData.host || "localhost";

  // Check ownership
  const isTokenOwner =
    authenticatedUser.username === tokenData.username &&
    authenticatedHost === tokenHost &&
    authenticatedUser.port === tokenData.port;

  if (!isAdmin && !isTokenOwner) {
    return {
      authorized: false,
      error: NextResponse.json(
        { message: "Forbidden: You can only view your own tokens" },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}

/**
 * Checks if user has permission to revoke the token
 */
function checkRevokePermission(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticatedUser: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokenData: any
): { authorized: boolean; error?: NextResponse } {
  const isAdmin = authenticatedUser.role === "Admin";

  // Normalize host
  const authenticatedHost = authenticatedUser.host || "localhost";
  const tokenHost = tokenData.host || "localhost";

  // Check ownership by username + host + port (consistent across logins)
  const isTokenOwner =
    authenticatedUser.username === tokenData.username &&
    authenticatedHost === tokenHost &&
    authenticatedUser.port === tokenData.port;

  if (!isAdmin && !isTokenOwner) {
    return {
      authorized: false,
      error: NextResponse.json(
        { message: "Forbidden: You can only revoke your own tokens" },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}

/**
 * GET /api/auth/tokens/{tokenId}
 * Get token details by token ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    // Authenticate the user making the request
    const session = await getClient();
    if (session instanceof NextResponse) {
      return session;
    }
    const { user: authenticatedUser } = session;

    // Get tokenId from params
    const { tokenId } = await params;

    // Fetch token from database
    const fetchResult = await fetchTokenById(tokenId);
    if (fetchResult.error) {
      return fetchResult.error;
    }

    // Check view permissions
    const permissionCheck = checkViewPermission(
      authenticatedUser,
      fetchResult.tokenData
    );
    if (!permissionCheck.authorized) {
      return permissionCheck.error!;
    }

    // Return token data
    return NextResponse.json(
      { token: fetchResult.tokenData },
      { status: 200 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching token:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/tokens/{tokenId}
 * Revoke token by token ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    // Authenticate the user making the request
    const session = await getClient();
    if (session instanceof NextResponse) {
      return session;
    }
    const { user: authenticatedUser } = session;

    // Get tokenId from params
    const { tokenId } = await params;

    // Fetch token from database
    const fetchResult = await fetchTokenById(tokenId);
    if (fetchResult.error) {
      return fetchResult.error;
    }

    // Check if token is already inactive
    if (!fetchResult.tokenData.is_active) {
      return NextResponse.json(
        { message: "Token is already revoked" },
        { status: 400 }
      );
    }

    // Check revoke permissions
    const permissionCheck = checkRevokePermission(
      authenticatedUser,
      fetchResult.tokenData
    );
    if (!permissionCheck.authorized) {
      return permissionCheck.error!;
    }

    // Revoke token using storage abstraction
    const storage = StorageFactory.getStorage();
    const revokerUsername = authenticatedUser.username || "default";

    const success = await storage.revokeToken(tokenId, revokerUsername);

    if (!success) {
      return NextResponse.json(
        { message: "Failed to revoke token" },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        message: "Token revoked successfully",
        tokenId
      },
      { status: 200 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error revoking token:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
