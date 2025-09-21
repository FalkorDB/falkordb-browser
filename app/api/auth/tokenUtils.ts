import { jwtVerify } from "jose";
import { FalkorDB } from "falkordb";

// Helper function to get token ID (jti or sub + iat)
export function getTokenId(payload: Record<string, unknown>): string {
  // Use jti if available, otherwise create from sub + iat
  return (payload.jti as string) || `${payload.sub}-${payload.iat}`;
}

// Helper function to check if a token is active using FalkorDB connection
export async function isTokenActive(token: string, falkorDBClient?: FalkorDB): Promise<boolean> {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      return true; // Default to active if no secret configured
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // If no client provided, we can't check Redis, default to active
    if (!falkorDBClient) {
      return true;
    }
    
    const connection = await falkorDBClient.connection;
    const tokenId = getTokenId(payload);
    
    // Check if token exists in active tokens list using Redis method
    const activeToken = await connection.get(`api-jwt-active:${tokenId}`);
    return activeToken !== null;
    
  } catch (error) {
    console.error("Error checking token status:", error);
    return true; // Default to active if we can't check Redis
  }
}
