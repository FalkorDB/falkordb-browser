/**
 * Token data structure
 */
export interface TokenData {
  token_hash: string;
  token_id: string;
  user_id: string;
  username: string;
  name: string;
  role: string;
  host: string;
  port: number;
  created_at: number; // Unix timestamp
  expires_at: number; // Unix timestamp, -1 means never expires
  last_used: number; // Unix timestamp, -1 means never used
  is_active: boolean;
  encrypted_password: string;
}

/**
 * Filter options for fetching tokens
 */
export interface TokenFetchOptions {
  isAdmin: boolean;
  username?: string;
  host?: string;
  port?: number;
}

/**
 * Abstract interface for token storage backends
 * Implementations: FileTokenStorage, FalkorDBTokenStorage
 */
export interface ITokenStorage {
  /**
   * Store a new token
   */
  createToken(tokenData: TokenData): Promise<void>;

  /**
   * Fetch tokens with optional filtering
   */
  fetchTokens(options: TokenFetchOptions): Promise<TokenData[]>;

  /**
   * Fetch a single token by token_id
   */
  fetchTokenById(tokenId: string): Promise<TokenData | null>;

  /**
   * Revoke a token (mark as inactive)
   */
  revokeToken(tokenId: string, revokerUsername: string): Promise<boolean>;

  /**
   * Update last used timestamp for a token
   */
  updateLastUsed(tokenId: string): Promise<void>;

  /**
   * Clean up expired tokens (optional, for maintenance)
   */
  cleanupExpiredTokens?(): Promise<number>;
}
