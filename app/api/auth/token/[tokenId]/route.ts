import { NextRequest, NextResponse } from "next/server";
import { executePATQuery } from "@/lib/token-storage";
import { getClient } from "../../[...nextauth]/options";

/**
 * Fetches token details from FalkorDB by token_id
 */
async function fetchTokenById(tokenId: string): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokenData?: any;
  error?: NextResponse;
}> {
  const escapeString = (str: string) => str.replace(/'/g, "''");
  const query = `
    MATCH (t:Token {token_id: '${escapeString(tokenId)}'})-[:BELONGS_TO]->(u:User)
    RETURN t.token_hash as token_hash,
           t.token_id as token_id,
           t.user_id as user_id,
           t.username as username,
           t.name as name,
           t.role as role,
           t.host as host,
           t.port as port,
           t.created_at as created_at,
           t.expires_at as expires_at,
           t.last_used as last_used,
           t.is_active as is_active
  `;

  const result = await executePATQuery(query);

  if (!result.data || result.data.length === 0) {
    return {
      error: NextResponse.json(
        { message: "Token not found" },
        { status: 404 }
      ),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = result.data[0] as any;

  return {
    tokenData: {
      token_hash: row.token_hash,
      token_id: row.token_id,
      user_id: row.user_id,
      username: row.username,
      name: row.name,
      role: row.role,
      host: row.host,
      port: row.port,
      created_at: new Date(row.created_at * 1000).toISOString(),
      expires_at: row.expires_at > 0 ? new Date(row.expires_at * 1000).toISOString() : null,
      last_used: row.last_used > 0 ? new Date(row.last_used * 1000).toISOString() : null,
      is_active: row.is_active,
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
  const isTokenOwner = authenticatedUser.id === tokenData.user_id;

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

// eslint-disable-next-line import/prefer-default-export
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
