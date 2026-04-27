import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import crypto from "crypto";
import StorageFactory from "@/lib/token-storage/StorageFactory";
import { encrypt } from "./encryption";

/**
 * Validates JWT secret exists in environment
 */
export function validateJWTSecret(): { valid: boolean; secret?: Uint8Array; error?: NextResponse } {
  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!authSecret) {
    // eslint-disable-next-line no-console
    console.error("AUTH_SECRET environment variable is required");
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
    secret: new TextEncoder().encode(authSecret),
  };
}

// Helper function to get token ID (jti or sub + iat)
export function getTokenId(payload: Record<string, unknown>): string {
  // Use jti if available, otherwise create from sub + iat
  return (payload.jti as string) || `${payload.sub}-${payload.iat}`;
}

// Helper function to check if a token is active
export async function isTokenActive(
  token: string
): Promise<boolean> {
  try {
    const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
    if (!authSecret) {
      return false; // Fail-closed: cannot validate without secret
    }

    const JWT_SECRET = new TextEncoder().encode(authSecret);
    
    // Verify the JWT is valid
    await jwtVerify(token, JWT_SECRET);
    
    // Hash the token to match storage format
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Check if token exists and is active using storage abstraction
    const storage = StorageFactory.getStorage();
    const isActive = await storage.isTokenActive(tokenHash);
    
    if (!isActive) {
      return false; // Token not found, expired, or revoked
    }
    
    // Token exists and is active, update last_used timestamp (throttled)
    // Note: updateLastUsed in storage implementations should handle throttling
    // For now, we'll skip the throttling logic here and just update
    // This could be improved by adding a getTokenByHash method to get the token_id
    
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
    
    // Get encrypted password using storage abstraction
    const storage = StorageFactory.getStorage();
    const encryptedPassword = await storage.getEncryptedPassword(tokenId);
    
    if (!encryptedPassword) {
      throw new Error(`Token not found or inactive: ${tokenId}`);
    }
    
    // Decrypt and return password
    const decryptedPassword = decrypt(encryptedPassword);
    return decryptedPassword;
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching password from Token DB:", error);
    // Re-throw the original error if it has a meaningful message (like ENCRYPTION_KEY missing)
    if (error instanceof Error && error.message.includes("ENCRYPTION_KEY")) {
      throw error;
    }
    throw new Error(`Failed to retrieve password for token: ${tokenId}`);
  }
}

/**
 * Persist an encrypted credential entry in the Token DB.
 * Shared helper used by the NextAuth session flow (bound to a session credentialRef)
 * and the personal-access-token flows (bound to a JWT).
 */
export async function storeEncryptedCredential(params: {
  tokenHash: string;
  tokenId: string;
  userId: string;
  username: string;
  name: string;
  role: string;
  host: string;
  port: number;
  password: string;
  expiresAtUnix?: number;
  kind?: 'session' | 'pat';
}): Promise<void> {
  const storage = StorageFactory.getStorage();
  const nowUnix = Math.floor(Date.now() / 1000);

  await storage.createToken({
    token_hash: params.tokenHash,
    token_id: params.tokenId,
    user_id: params.userId,
    username: params.username,
    name: params.name,
    role: params.role,
    host: params.host,
    port: params.port,
    created_at: nowUnix,
    expires_at: params.expiresAtUnix ?? -1,
    last_used: -1,
    is_active: true,
    encrypted_password: encrypt(params.password),
    kind: params.kind ?? 'pat',
  });
}
