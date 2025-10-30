import { NextResponse } from "next/server";
import { getClient, getAdminConnectionForTokens } from "../[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET() {
  try {
    // Get authenticated client (this verifies auth and gives us user info)
    const session = await getClient();
    if (session instanceof NextResponse) {
      return session; // Return the error response
    }

    const { user: authenticatedUser } = session;

    // Get Admin connection for token management
    const adminClient = await getAdminConnectionForTokens(
      authenticatedUser.host,
      authenticatedUser.port,
      authenticatedUser.tls,
      authenticatedUser.ca
    );
    const adminConnection = await adminClient.connection;

    const isAdmin = authenticatedUser.role === 'Admin';

    // Get all api_token keys
    const tokenKeys = await adminConnection.keys("api_token:*");
    
    // Fetch all token data in parallel
    const tokenDataPromises = tokenKeys.map(async (key) => {
      const data = await adminConnection.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    });
    
    const allTokens = (await Promise.all(tokenDataPromises)).filter(Boolean);
    
    // Filter tokens based on user role
    const tokens = isAdmin 
      ? allTokens // Admin sees all tokens
      : allTokens.filter(token => token.user_id === authenticatedUser.id); // User sees only their tokens
    
    return NextResponse.json(
      { 
        tokens,
        count: tokens.length
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
