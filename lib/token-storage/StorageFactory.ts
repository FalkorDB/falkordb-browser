import * as path from 'path';
import { ITokenStorage } from './ITokenStorage';
import FileTokenStorage from './FileTokenStorage';
import FalkorDBTokenStorage from './FalkorDBTokenStorage';

/**
 * Factory for creating the appropriate token storage instance
 * based on environment configuration
 */
class StorageFactory {
  private static instance: ITokenStorage | null = null;

  /**
   * Gets the default file storage path
   */
  private static getDefaultFilePath(): string {
    return process.env.API_TOKEN_STORAGE_PATH || path.join(process.cwd(), '.data', 'api_tokens.json');
  }

  /**
   * Gets the token storage instance (singleton pattern)
   *
   * Storage selection logic:
   * - If API_TOKEN_FALKORDB_URL is set → FalkorDBTokenStorage
   * - If PAT_FALKORDB_HOST is set → FalkorDBTokenStorage (uses PAT_FALKORDB_* vars)
   * - Otherwise → FileTokenStorage (default, single-process dev only)
   *
   * NOTE: FileTokenStorage is NOT safe for concurrent use by multiple
   * processes or parallel test workers. Always configure one of the
   * FalkorDB env vars in multi-process environments (CI, production).
   */
  static getStorage(): ITokenStorage {
    if (this.instance) {
      return this.instance;
    }

    // Use FalkorDB when either the full URL or the host env var is present.
    // PAT_FALKORDB_HOST is already used by falkordb-client.ts as the fallback
    // connection target, so if it is set the PAT FalkorDB is intentionally
    // configured and we should store tokens there instead of in a local file.
    if (process.env.API_TOKEN_FALKORDB_URL || process.env.PAT_FALKORDB_HOST) {
      // eslint-disable-next-line no-console
      console.log('Using FalkorDB storage for API tokens');
      this.instance = new FalkorDBTokenStorage();
    } else {
      // eslint-disable-next-line no-console
      console.log(
        'Using file storage for API tokens at:',
        this.getDefaultFilePath()
      );
      this.instance = new FileTokenStorage();
    }

    return this.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Check if using FalkorDB storage
   */
  static isFalkorDBStorage(): boolean {
    return !!(process.env.API_TOKEN_FALKORDB_URL || process.env.PAT_FALKORDB_HOST);
  }

  /**
   * Check if using file storage
   */
  static isFileStorage(): boolean {
    return !(process.env.API_TOKEN_FALKORDB_URL || process.env.PAT_FALKORDB_HOST);
  }
}

export default StorageFactory;
