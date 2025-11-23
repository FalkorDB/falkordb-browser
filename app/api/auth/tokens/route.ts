import { NextResponse } from "next/server";
import { executePATQuery } from "@/lib/token-storage";
import { getClient } from "../[...nextauth]/options";

/**
 * Fetches tokens from FalkorDB with role-based filtering
 */
async function fetchTokens(
  isAdmin: boolean,
  username: string,
  userId: string
): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokens?: any[];
  error?: NextResponse;
}> {
  try {
    // Use string interpolation instead of parameterized queries
    const escapeString = (str: string) => str.replace(/'/g, "''");
    const userFilter = isAdmin ? "" : `AND t.user_id = '${escapeString(userId)}'`;
    
    const query = `
      MATCH (t:Token)-[:BELONGS_TO]->(u:User)
      WHERE t.is_active = true ${userFilter}
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
             t.last_used as last_used
      ORDER BY t.created_at DESC
    `;
    
    const result = await executePATQuery(query);

    // Transform FalkorDB objects to token objects with ISO timestamps
    // -1 means NULL (never expires / never used)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens = (result.data || []).map((row: any) => ({
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
    }));

    return { tokens };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error querying tokens:", error);
    return {
      error: NextResponse.json(
        { message: "Failed to fetch tokens" },
        { status: 500 }
      ),
    };
  }
}

// eslint-disable-next-line import/prefer-default-export
export async function GET() {
  try {
    // 1. Authenticate the user making the request
    const session = await getClient();
    if (session instanceof NextResponse) {
      return session;
    }
    const { user: authenticatedUser } = session;

    // 2. Determine user role for filtering
    const isAdmin = authenticatedUser.role === 'Admin';

    // 3. Fetch tokens from database (with role-based filtering)
    const fetchResult = await fetchTokens(
      isAdmin,
      authenticatedUser.username || "default",
      authenticatedUser.id
    );

    if (fetchResult.error) {
      return fetchResult.error;
    }

    // 4. Return tokens with metadata
    return NextResponse.json(
      {
        tokens: fetchResult.tokens,
        count: fetchResult.tokens!.length,
        role: authenticatedUser.role,
      },
      { status: 200 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
