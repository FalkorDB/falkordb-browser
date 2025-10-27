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
  adminConnection?: { get: (key: string) => Promise<string | null>; setEx: (key: string, ttl: number, value: string) => Promise<string | void> }
): Promise<boolean> {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      return false; // Fail-closed: cannot validate without secret
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    
    // Verify the JWT is valid
    await jwtVerify(token, JWT_SECRET);
    
    // Fail-closed: without admin connection we cannot validate revocation
    if (!adminConnection) {
      return false;
    }
    
    // Hash the token to match storage format
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Check if token exists in Redis
    const tokenData = await adminConnection.get(`api_token:${tokenHash}`);
    
    if (!tokenData) {
      return false; // Token not found, consider it revoked or expired
    }
    
    // Token exists, update last_used timestamp (throttled to avoid excessive writes)
    try {
      const UPDATE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
      const data = JSON.parse(tokenData);
      const lastUsed = data.last_used ? new Date(data.last_used).getTime() : 0;
      const now = Date.now();
      
      // Only update if more than 5 minutes have passed since last update
      if (now - lastUsed > UPDATE_THRESHOLD_MS) {
        data.last_used = new Date(now).toISOString();
        
        // Update Redis preserving the original TTL (1 year + 1 day grace period)
        // Use setEx with original TTL of 31622400 seconds (366 days)
        await adminConnection.setEx(
          `api_token:${tokenHash}`,
          31622400, // 1 year + 1 day TTL (preserves grace period)
          JSON.stringify(data)
        );
      }
    } catch (parseError) {
      // If we can't parse or update, still consider token active if it exists
    }
    
    return true;
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error checking token status:", error);
    return false; // Fail-closed: deny access on errors
  }
}
