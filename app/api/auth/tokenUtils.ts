import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import crypto from "crypto";
import { executePATQuery } from "@/lib/token-storage/falkordb-client";

/**
 * Validates JWT secret exists in environment
 */
export function validateJWTSecret(): { valid: boolean; secret?: Uint8Array; error?: NextResponse } {
  if (!process.env.NEXTAUTH_SECRET) {
    // eslint-disable-next-line no-console
    console.error("NEXTAUTH_SECRET environment variable is required");
    return {
      valid: false,
      error: NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      ),
    };
  }
  return {
    valid: true,
    secret: new TextEncoder().encode(process.env.NEXTAUTH_SECRET),
  };
}

// Helper function to get token ID (jti or sub + iat)
export function getTokenId(payload: Record<string, unknown>): string {
  // Use jti if available, otherwise create from sub + iat
  return (payload.jti as string) || `${payload.sub}-${payload.iat}`;
}

// Helper function to check if a token is active using FalkorDB PAT instance
export async function isTokenActive(
  token: string
): Promise<boolean> {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      return false; // Fail-closed: cannot validate without secret
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    
    // Verify the JWT is valid
    await jwtVerify(token, JWT_SECRET);
    
    // Hash the token to match storage format
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Helper to escape strings for Cypher (FalkorDB doesn't support parameterized queries)
    const escapeString = (str: string) => str.replace(/'/g, "''");
    
    // Check if token exists in FalkorDB and is active
    const now = Math.floor(Date.now() / 1000); // Unix timestamp
    const query = `
      MATCH (t:Token {token_hash: '${escapeString(tokenHash)}'})
      WHERE t.is_active = true 
        AND (t.expires_at = -1 OR t.expires_at > ${now})
      RETURN t.token_id as token_id, t.last_used as last_used
    `;
    
    const result = await executePATQuery(query);
    
    if (!result || !result.data || result.data.length === 0) {
      return false; // Token not found, expired, or revoked
    }
    
    // Token exists and is active, update last_used timestamp (throttled)
    try {
      const UPDATE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
      // FalkorDB returns objects, not arrays
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenData = result.data[0] as any;
      const lastUsed = tokenData.last_used ? tokenData.last_used * 1000 : 0; // Convert to ms
      const nowMs = Date.now();
      
      // Only update if more than 5 minutes have passed since last update
      if (nowMs - lastUsed > UPDATE_THRESHOLD_MS) {
        const nowUnix = Math.floor(nowMs / 1000);
        const updateQuery = `
          MATCH (t:Token {token_hash: '${escapeString(tokenHash)}'})
          SET t.last_used = ${nowUnix}
        `;
        
        await executePATQuery(updateQuery);
      }
    } catch (updateError) {
      // If we can't update, still consider token active if it exists
      // eslint-disable-next-line no-console
      console.warn("Failed to update last_used timestamp:", updateError);
    }
    
    return true;
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error checking token status:", error);
    return false; // Fail-closed: deny access on errors
  }
}

/**
 * Retrieves encrypted password from Token DB for connection recreation
 * Used when existing connection dies and needs to be re-established
 * @param tokenId - The token ID (jti from JWT payload)
 * @returns Decrypted password for reconnection
 * @throws Error if token not found or password cannot be retrieved
 */
export async function getPasswordFromTokenDB(tokenId: string): Promise<string> {
  try {
    // Import decrypt function dynamically to avoid circular dependencies
    const { decrypt } = await import('./encryption');
    
    // Helper to escape strings for Cypher
    const escapeString = (str: string) => str.replace(/'/g, "''");
    
    // Query Token DB for the encrypted password
    const query = `
      MATCH (t:Token {token_id: '${escapeString(tokenId)}'})
      WHERE t.is_active = true
      RETURN t.encrypted_password as encrypted_password, t.token_id as token_id
    `;
    
    const result = await executePATQuery(query);
    
    if (!result || !result.data || result.data.length === 0) {
      throw new Error(`Token not found or inactive: ${tokenId}`);
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenData = result.data[0] as any;
    const encryptedPassword = tokenData.encrypted_password;
    
    if (!encryptedPassword) {
      throw new Error(`No password stored for token: ${tokenId}`);
    }
    
    // Decrypt and return password
    const decryptedPassword = decrypt(encryptedPassword);
    return decryptedPassword;
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching password from Token DB:", error);
    throw new Error(`Failed to retrieve password for token: ${tokenId}`);
  }
}
