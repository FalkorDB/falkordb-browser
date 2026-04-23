import { promises as fs } from 'fs';
import * as path from 'path';
import { ITokenStorage, TokenData, TokenFetchOptions } from './ITokenStorage';

/**
 * File-based token storage implementation
 * Stores tokens in a JSON file (default: .data/api_tokens.json in project root)
 */
class FileTokenStorage implements ITokenStorage {
  private filePath: string;

  constructor(filePath?: string) {
    // Default to .data/api_tokens.json in project root
    // Can be overridden via API_TOKEN_STORAGE_PATH environment variable
    this.filePath = filePath || process.env.API_TOKEN_STORAGE_PATH || path.join(process.cwd(), '.data', 'api_tokens.json');
  }

  /**
   * Ensures the storage file and directory exist
   */
  private async ensureFileExists(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      // Check if file exists
      try {
        await fs.access(this.filePath);
      } catch {
        // File doesn't exist, create it with empty array
        await fs.writeFile(this.filePath, JSON.stringify({ tokens: [] }, null, 2), 'utf8');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to ensure token storage file exists:', error);
      throw new Error('Failed to initialize token storage file');
    }
  }

  /**
   * Read all tokens from file.
   * Retries up to 3 times on JSON parse failure to handle the brief window
   * where a concurrent atomic write (rename) is in progress.
   */
  private async readTokens(): Promise<TokenData[]> {
    await this.ensureFileExists();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const content = await fs.readFile(this.filePath, 'utf8');
        const data = JSON.parse(content);
        return data.tokens || [];
      } catch (error) {
        if (attempt < 2) {
          // Brief wait before retry — allows an in-progress atomic rename to
          // complete so the next read sees a consistent file.
          // eslint-disable-next-line no-await-in-loop
          await new Promise<void>((resolve) => { setTimeout(resolve, 50); });
        } else {
          // eslint-disable-next-line no-console
          console.error('Failed to read tokens from file after retries:', error);
        }
      }
    }
    return [];
  }

  /**
   * Write tokens to file atomically: write to a temp file first, then rename.
   * fs.rename is atomic on POSIX systems (same filesystem), so readers
   * always see either the old or the new complete file — never a partial write.
   */
  private async writeTokens(tokens: TokenData[]): Promise<void> {
    await this.ensureFileExists();

    const tmpPath = `${this.filePath}.tmp`;
    try {
      await fs.writeFile(
        tmpPath,
        JSON.stringify({ tokens }, null, 2),
        'utf8'
      );
      await fs.rename(tmpPath, this.filePath);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to write tokens to file:', error);
      // Clean up temp file if rename failed
      try { await fs.unlink(tmpPath); } catch { /* ignore */ }
      throw new Error('Failed to save tokens');
    }
  }

  async createToken(tokenData: TokenData): Promise<void> {
    const tokens = await this.readTokens();
    tokens.push(tokenData);
    await this.writeTokens(tokens);
  }

  async fetchTokens(options: TokenFetchOptions): Promise<TokenData[]> {
    const tokens = await this.readTokens();

    // Only PAT rows are surfaced in the tokens listing. Session rows are
    // internal and must never appear in the UI or API surface.
    let filtered = tokens.filter(t => t.is_active && (t.kind ?? 'pat') === 'pat');

    // Apply role-based filtering
    if (!options.isAdmin) {
      filtered = filtered.filter(
        t =>
          t.username === options.username &&
          t.host === (options.host || 'localhost') &&
          t.port === (options.port || 6379)
      );
    }

    // Sort by created_at descending
    return filtered.sort((a, b) => b.created_at - a.created_at);
  }

  async fetchTokenById(tokenId: string): Promise<TokenData | null> {
    const tokens = await this.readTokens();
    return tokens.find(t => t.token_id === tokenId) || null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async revokeToken(tokenId: string, revokerUsername: string): Promise<boolean> {
    const tokens = await this.readTokens();
    const token = tokens.find(t => t.token_id === tokenId);

    if (!token) {
      return false;
    }

    token.is_active = false;
    await this.writeTokens(tokens);
    return true;
  }

  async deleteToken(tokenId: string): Promise<boolean> {
    const tokens = await this.readTokens();
    const next = tokens.filter(t => t.token_id !== tokenId);
    if (next.length === tokens.length) {
      return false;
    }
    await this.writeTokens(next);
    return true;
  }

  async updateLastUsed(tokenId: string): Promise<void> {
    const tokens = await this.readTokens();
    const token = tokens.find(t => t.token_id === tokenId);

    if (token) {
      token.last_used = Math.floor(Date.now() / 1000);
      await this.writeTokens(tokens);
    }
  }

  async isTokenActive(tokenHash: string): Promise<boolean> {
    const tokens = await this.readTokens();
    const now = Math.floor(Date.now() / 1000);
    
    const token = tokens.find(t => t.token_hash === tokenHash);
    
    if (!token) {
      return false;
    }
    
    // Check if active and not expired
    return token.is_active && (token.expires_at === -1 || token.expires_at > now);
  }

  async getEncryptedPassword(tokenId: string): Promise<string | null> {
    const tokens = await this.readTokens();
    const token = tokens.find(t => t.token_id === tokenId);
    
    if (!token || !token.is_active) {
      return null;
    }
    
    return token.encrypted_password || null;
  }

  async cleanupExpiredTokens(): Promise<number> {
    const tokens = await this.readTokens();
    const now = Math.floor(Date.now() / 1000);

    const validTokens = tokens.filter(
      t => t.expires_at === -1 || t.expires_at > now
    );

    const removedCount = tokens.length - validTokens.length;

    if (removedCount > 0) {
      await this.writeTokens(validTokens);
    }

    return removedCount;
  }
}

export default FileTokenStorage;
