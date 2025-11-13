import { NextRequest, NextResponse } from "next/server";
import { getClient, getAdminConnectionForTokens } from "../../[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    // Get authenticated client (this verifies auth and gives us user info)
    const session = await getClient();
    if (session instanceof NextResponse) {
      return session; // Return the error response
    }

    const { user: authenticatedUser } = session;
    const { tokenId } = await params;

    // Get Admin connection for token management
    const adminClient = await getAdminConnectionForTokens(
      authenticatedUser.host,
      authenticatedUser.port,
      authenticatedUser.tls,
      authenticatedUser.ca
    );
    const adminConnection = await adminClient.connection;

    // Get all api_token keys
    const tokenKeys = await adminConnection.keys("api_token:*");
    
    // Fetch all token data in parallel to find the matching token
    const tokenDataPromises = tokenKeys.map(async (key) => {
      const data = await adminConnection.get(key);
      return { key, data };
    });
    
    const tokenDataResults = await Promise.all(tokenDataPromises);
    
    // Find the token that matches the tokenId
    const matchingToken = tokenDataResults.find(({ data }) => {
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.token_id === tokenId;
      }
      return false;
    });
    
    if (!matchingToken || !matchingToken.data) {
      return NextResponse.json(
        { message: "Token not found" },
        { status: 404 }
      );
    }

    const tokenData = JSON.parse(matchingToken.data);
    
    // Permission check: Admin can view any token, users can only view their own
    const isAdmin = authenticatedUser.role === 'Admin';
    const isTokenOwner = authenticatedUser.id === tokenData.user_id;
    
    if (!isAdmin && !isTokenOwner) {
      return NextResponse.json(
        { message: "Forbidden: You can only view your own tokens" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { token: tokenData },
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
