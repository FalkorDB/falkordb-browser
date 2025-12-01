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
   * Read all tokens from file
   */
  private async readTokens(): Promise<TokenData[]> {
    await this.ensureFileExists();

    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      const data = JSON.parse(content);
      return data.tokens || [];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to read tokens from file:', error);
      return [];
    }
  }

  /**
   * Write tokens to file
   */
  private async writeTokens(tokens: TokenData[]): Promise<void> {
    await this.ensureFileExists();

    try {
      await fs.writeFile(
        this.filePath,
        JSON.stringify({ tokens }, null, 2),
        'utf8'
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to write tokens to file:', error);
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

    // Filter active tokens only
    let filtered = tokens.filter(t => t.is_active);

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

  async updateLastUsed(tokenId: string): Promise<void> {
    const tokens = await this.readTokens();
    const token = tokens.find(t => t.token_id === tokenId);

    if (token) {
      token.last_used = Math.floor(Date.now() / 1000);
      await this.writeTokens(tokens);
    }
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
