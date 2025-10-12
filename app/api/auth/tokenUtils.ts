import { jwtVerify } from "jose";
import crypto from "crypto";

// Helper function to get token ID (jti or sub + iat)
export function getTokenId(payload: Record<string, unknown>): string {
  // Use jti if available, otherwise create from sub + iat
  return (payload.jti as string) || `${payload.sub}-${payload.iat}`;
}

// Helper function to check if a token is active using Admin connection
export async function isTokenActive(
  token: string,
  adminConnection?: { get: (key: string) => Promise<string | null> }
): Promise<boolean> {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      return true; // Default to active if no secret configured
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    
    // Verify the JWT is valid
    await jwtVerify(token, JWT_SECRET);
    
    // If no admin connection provided, we can't check Redis, default to active
    if (!adminConnection) {
      return true;
    }
    
    // Hash the token to match storage format
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Check if token exists in Redis
    const tokenData = await adminConnection.get(`api_token:${tokenHash}`);
    
    if (!tokenData) {
      return false; // Token not found, consider it revoked or expired
    }
    
    // Token exists, update last_used timestamp
    try {
      const data = JSON.parse(tokenData);
      data.last_used = new Date().toISOString();
      
      // Note: We don't update here to avoid permission issues
      // The token is still valid
    } catch (parseError) {
      // If we can't parse, still consider token active if it exists
    }
    
    return true;
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error checking token status:", error);
    return true; // Default to active if we can't check Redis
  }
}
