import { ITokenStorage, TokenData, TokenFetchOptions } from './ITokenStorage';
import { executePATQuery } from './falkordb-client';

/**
 * FalkorDB-based token storage implementation
 * Stores tokens in a dedicated FalkorDB graph database
 */
class FalkorDBTokenStorage implements ITokenStorage {
  // eslint-disable-next-line class-methods-use-this
  async createToken(tokenData: TokenData): Promise<void> {
    const query = `
      MERGE (u:User {username: $username, user_id: $user_id})
      CREATE (t:Token {
        token_hash: $token_hash,
        token_id: $token_id,
        user_id: $user_id,
        username: $username,
        name: $name,
        role: $role,
        host: $host,
        port: $port,
        created_at: $created_at,
        expires_at: $expires_at,
        last_used: $last_used,
        is_active: $is_active,
        encrypted_password: $encrypted_password,
        kind: $kind,
        tls: $tls,
        ca: $ca
      })
      CREATE (t)-[:BELONGS_TO]->(u)
      RETURN t.token_id as token_id
    `;

    await executePATQuery(query, {
      token_hash: tokenData.token_hash,
      token_id: tokenData.token_id,
      user_id: tokenData.user_id,
      username: tokenData.username,
      name: tokenData.name,
      role: tokenData.role,
      host: tokenData.host,
      port: tokenData.port,
      created_at: tokenData.created_at,
      expires_at: tokenData.expires_at,
      last_used: tokenData.last_used,
      is_active: tokenData.is_active,
      encrypted_password: tokenData.encrypted_password,
      kind: tokenData.kind ?? 'pat',
      tls: tokenData.tls ?? false,
      ca: tokenData.ca ?? '',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async fetchTokens(options: TokenFetchOptions): Promise<TokenData[]> {
    // Filter by username + host + port for non-admin users
    const userFilter = options.isAdmin
      ? ""
      : "AND t.username = $username AND t.host = $host AND t.port = $port";

    // Only PAT rows are surfaced in the tokens listing. Session rows are
    // internal (rows missing a kind property are treated as 'pat' for
    // backward compatibility with pre-existing data).
    const query = `
      MATCH (t:Token)-[:BELONGS_TO]->(u:User)
      WHERE t.is_active = true
        AND (t.kind IS NULL OR t.kind = 'pat')
        ${userFilter}
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
             t.last_used as last_used,
             t.is_active as is_active,
             t.encrypted_password as encrypted_password,
             t.kind as kind,
             t.tls as tls,
             t.ca as ca
      ORDER BY t.created_at DESC
    `;

    const result = await executePATQuery(
      query,
      options.isAdmin
        ? {}
        : {
            username: options.username || '',
            host: options.host || 'localhost',
            port: options.port || 6379,
          }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result.data || []).map((row: any) => ({
      token_hash: row.token_hash,
      token_id: row.token_id,
      user_id: row.user_id,
      username: row.username,
      name: row.name,
      role: row.role,
      host: row.host,
      port: row.port,
      created_at: row.created_at,
      expires_at: row.expires_at,
      last_used: row.last_used,
      is_active: row.is_active,
      encrypted_password: row.encrypted_password,
      kind: row.kind ?? 'pat',
      tls: row.tls ?? false,
      ca: row.ca || undefined,
    }));
  }

  // eslint-disable-next-line class-methods-use-this
  async fetchTokenById(tokenId: string): Promise<TokenData | null> {
    const query = `
      MATCH (t:Token {token_id: $token_id})
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
             t.last_used as last_used,
             t.is_active as is_active,
             t.encrypted_password as encrypted_password,
             t.tls as tls,
             t.ca as ca
    `;

    const result = await executePATQuery(query, { token_id: tokenId });

    if (!result.data || result.data.length === 0) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = result.data[0] as any;

    return {
      token_hash: row.token_hash,
      token_id: row.token_id,
      user_id: row.user_id,
      username: row.username,
      name: row.name,
      role: row.role,
      host: row.host,
      port: row.port,
      created_at: row.created_at,
      expires_at: row.expires_at,
      last_used: row.last_used,
      is_active: row.is_active,
      encrypted_password: row.encrypted_password,
      tls: row.tls ?? false,
      ca: row.ca || undefined,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async revokeToken(tokenId: string, revokerUsername: string): Promise<boolean> {
    const query = `
      MATCH (t:Token {token_id: $token_id})-[:BELONGS_TO]->(u:User)
      MATCH (revoker:User {username: $revoker})
      SET t.is_active = false
      CREATE (t)-[:REVOKED_BY {at: $now}]->(revoker)
      RETURN t.token_id as token_id
    `;

    const result = await executePATQuery(query, {
      token_id: tokenId,
      revoker: revokerUsername,
      now: Math.floor(Date.now() / 1000),
    });
    return !!(result.data && result.data.length > 0);
  }

  // eslint-disable-next-line class-methods-use-this
  async deleteToken(tokenId: string): Promise<boolean> {
    const query = `
      MATCH (t:Token {token_id: $token_id})
      DETACH DELETE t
      RETURN count(t) as deleted
    `;

    const result = await executePATQuery(query, { token_id: tokenId });
    if (!result.data || result.data.length === 0) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleted = (result.data[0] as any).deleted || 0;
    return deleted > 0;
  }

  // eslint-disable-next-line class-methods-use-this
  async updateLastUsed(tokenId: string): Promise<void> {
    const query = `
      MATCH (t:Token {token_id: $token_id})
      SET t.last_used = $now
      RETURN t.token_id as token_id
    `;

    await executePATQuery(query, {
      token_id: tokenId,
      now: Math.floor(Date.now() / 1000),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async isTokenActive(tokenHash: string): Promise<boolean> {
    const query = `
      MATCH (t:Token {token_hash: $token_hash})
      WHERE t.is_active = true 
        AND (t.expires_at = -1 OR t.expires_at > $now)
      RETURN t.token_id as token_id
    `;

    const result = await executePATQuery(query, {
      token_hash: tokenHash,
      now: Math.floor(Date.now() / 1000),
    });
    return !!(result.data && result.data.length > 0);
  }

  // eslint-disable-next-line class-methods-use-this
  async getEncryptedPassword(tokenId: string): Promise<string | null> {
    const query = `
      MATCH (t:Token {token_id: $token_id})
      WHERE t.is_active = true
      RETURN t.encrypted_password as encrypted_password
    `;

    const result = await executePATQuery(query, { token_id: tokenId });

    if (!result || !result.data || result.data.length === 0) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = result.data[0] as any;
    return row.encrypted_password || null;
  }

  // eslint-disable-next-line class-methods-use-this
  async fetchTokensByUserId(userId: string, kind?: import('./ITokenStorage').TokenKind): Promise<TokenData[]> {
    const kindFilter = kind
      ? kind === 'pat'
        ? "AND (t.kind IS NULL OR t.kind = 'pat')"
        : "AND t.kind = $kind"
      : '';
    const query = `
      MATCH (t:Token {user_id: $user_id})
      WHERE t.is_active = true
        AND (t.expires_at = -1 OR t.expires_at > $now)
        ${kindFilter}
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
             t.last_used as last_used,
             t.is_active as is_active,
             t.encrypted_password as encrypted_password,
             t.kind as kind,
             t.tls as tls,
             t.ca as ca
      ORDER BY t.created_at DESC
    `;
    const result = await executePATQuery(query, {
      user_id: userId,
      now: Math.floor(Date.now() / 1000),
      ...(kind && kind !== 'pat' ? { kind } : {}),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result.data || []).map((row: any) => ({
      token_hash: row.token_hash,
      token_id: row.token_id,
      user_id: row.user_id,
      username: row.username,
      name: row.name,
      role: row.role,
      host: row.host,
      port: row.port,
      created_at: row.created_at,
      expires_at: row.expires_at,
      last_used: row.last_used,
      is_active: row.is_active,
      encrypted_password: row.encrypted_password,
      kind: row.kind ?? 'pat',
      tls: row.tls ?? false,
      ca: row.ca || undefined,
    }));
  }

  // eslint-disable-next-line class-methods-use-this
  async cleanupExpiredTokens(): Promise<number> {
    // Soft-delete expired tokens (preserves audit trail and REVOKED_BY relationships)
    const query = `
      MATCH (t:Token)
      WHERE t.expires_at > 0 AND t.expires_at < $now AND t.is_active = true
      SET t.is_active = false
      RETURN count(t) as updated_count
    `;

    const result = await executePATQuery(query, {
      now: Math.floor(Date.now() / 1000),
    });

    if (result.data && result.data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result.data[0] as any).updated_count || 0;
    }

    return 0;
  }
}

export default FalkorDBTokenStorage;
