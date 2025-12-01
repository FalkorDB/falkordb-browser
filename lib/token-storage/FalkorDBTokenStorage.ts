import { ITokenStorage, TokenData, TokenFetchOptions } from './ITokenStorage';
import { executePATQuery } from './falkordb-client';

/**
 * FalkorDB-based token storage implementation
 * Stores tokens in a dedicated FalkorDB graph database
 */
class FalkorDBTokenStorage implements ITokenStorage {
  // eslint-disable-next-line class-methods-use-this
  private escapeString(str: string): string {
    return str.replace(/'/g, "''");
  }

  async createToken(tokenData: TokenData): Promise<void> {
    const query = `
      MERGE (u:User {username: '${this.escapeString(tokenData.username)}', user_id: '${this.escapeString(tokenData.user_id)}'})
      CREATE (t:Token {
        token_hash: '${this.escapeString(tokenData.token_hash)}',
        token_id: '${this.escapeString(tokenData.token_id)}',
        user_id: '${this.escapeString(tokenData.user_id)}',
        username: '${this.escapeString(tokenData.username)}',
        name: '${this.escapeString(tokenData.name)}',
        role: '${this.escapeString(tokenData.role)}',
        host: '${this.escapeString(tokenData.host)}',
        port: ${tokenData.port},
        created_at: ${tokenData.created_at},
        expires_at: ${tokenData.expires_at},
        last_used: ${tokenData.last_used},
        is_active: ${tokenData.is_active},
        encrypted_password: '${this.escapeString(tokenData.encrypted_password)}'
      })
      CREATE (t)-[:BELONGS_TO]->(u)
      RETURN t.token_id as token_id
    `;

    await executePATQuery(query);
  }

  async fetchTokens(options: TokenFetchOptions): Promise<TokenData[]> {
    // Filter by username + host + port for non-admin users
    const userFilter = options.isAdmin
      ? ""
      : `AND t.username = '${this.escapeString(options.username || '')}' AND t.host = '${this.escapeString(options.host || 'localhost')}' AND t.port = ${options.port || 6379}`;

    const query = `
      MATCH (t:Token)-[:BELONGS_TO]->(u:User)
      WHERE t.is_active = true ${userFilter}
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
             t.encrypted_password as encrypted_password
      ORDER BY t.created_at DESC
    `;

    const result = await executePATQuery(query);

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
    }));
  }

  async fetchTokenById(tokenId: string): Promise<TokenData | null> {
    const query = `
      MATCH (t:Token {token_id: '${this.escapeString(tokenId)}'})-[:BELONGS_TO]->(u:User)
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
             t.encrypted_password as encrypted_password
    `;

    const result = await executePATQuery(query);

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
    };
  }

  async revokeToken(tokenId: string, revokerUsername: string): Promise<boolean> {
    const nowUnix = Math.floor(Date.now() / 1000);

    const query = `
      MATCH (t:Token {token_id: '${this.escapeString(tokenId)}'})-[:BELONGS_TO]->(u:User)
      MATCH (revoker:User {username: '${this.escapeString(revokerUsername)}'})
      SET t.is_active = false
      CREATE (t)-[:REVOKED_BY {at: ${nowUnix}}]->(revoker)
      RETURN t.token_id as token_id
    `;

    const result = await executePATQuery(query);
    return !!(result.data && result.data.length > 0);
  }

  async updateLastUsed(tokenId: string): Promise<void> {
    const nowUnix = Math.floor(Date.now() / 1000);

    const query = `
      MATCH (t:Token {token_id: '${this.escapeString(tokenId)}'})
      SET t.last_used = ${nowUnix}
      RETURN t.token_id as token_id
    `;

    await executePATQuery(query);
  }

  // eslint-disable-next-line class-methods-use-this
  async isTokenActive(tokenHash: string): Promise<boolean> {
    const nowUnix = Math.floor(Date.now() / 1000);

    const query = `
      MATCH (t:Token {token_hash: '${this.escapeString(tokenHash)}'})
      WHERE t.is_active = true 
        AND (t.expires_at = -1 OR t.expires_at > ${nowUnix})
      RETURN t.token_id as token_id
    `;

    const result = await executePATQuery(query);
    return !!(result.data && result.data.length > 0);
  }

  // eslint-disable-next-line class-methods-use-this
  async getEncryptedPassword(tokenId: string): Promise<string | null> {
    const query = `
      MATCH (t:Token {token_id: '${this.escapeString(tokenId)}'})
      WHERE t.is_active = true
      RETURN t.encrypted_password as encrypted_password
    `;

    const result = await executePATQuery(query);

    if (!result || !result.data || result.data.length === 0) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = result.data[0] as any;
    return row.encrypted_password || null;
  }

  // eslint-disable-next-line class-methods-use-this
  async cleanupExpiredTokens(): Promise<number> {
    const nowUnix = Math.floor(Date.now() / 1000);

    // Delete tokens that have expired (expires_at > 0 AND expires_at < now)
    const query = `
      MATCH (t:Token)
      WHERE t.expires_at > 0 AND t.expires_at < ${nowUnix}
      DELETE t
      RETURN count(t) as deleted_count
    `;

    const result = await executePATQuery(query);

    if (result.data && result.data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result.data[0] as any).deleted_count || 0;
    }

    return 0;
  }
}

export default FalkorDBTokenStorage;
