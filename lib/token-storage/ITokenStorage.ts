/**
 * Distinguishes rows created for a NextAuth browser session (ephemeral,
 * hard-deleted on sign-out) from user-issued personal access tokens
 * (long-lived, soft-revoked with audit trail).
 */
export type TokenKind = 'session' | 'pat';

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
  /**
   * Discriminates between session credentials and PATs. Optional for
   * backward compatibility with rows written before this field existed
   * (treated as 'pat' by readers).
   */
  kind?: TokenKind;
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
   * Permanently delete a token. Use this for ephemeral session credentials
   * that have no audit value once the session ends. For user-issued PATs
   * prefer revokeToken to preserve the REVOKED_BY trail.
   */
  deleteToken(tokenId: string): Promise<boolean>;

  /**
   * Update last used timestamp for a token
   */
  updateLastUsed(tokenId: string): Promise<void>;

  /**
   * Check if a token is active and valid
   * @param tokenHash - SHA256 hash of the token
   * @returns true if token is active and not expired
   */
  isTokenActive(tokenHash: string): Promise<boolean>;

  /**
   * Get encrypted password for a token
   * @param tokenId - The token ID
   * @returns Encrypted password or null if not found
   */
  getEncryptedPassword(tokenId: string): Promise<string | null>;

  /**
   * Fetch all tokens belonging to a specific user/session, optionally
   * filtered by kind. Used to list additional connections stored against
   * a session.
   */
  fetchTokensByUserId(userId: string, kind?: TokenKind): Promise<TokenData[]>;

  /**
   * Clean up expired tokens (optional, for maintenance)
   */
  cleanupExpiredTokens?(): Promise<number>;
}
