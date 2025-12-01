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
   * - Otherwise → FileTokenStorage (default)
   */
  static getStorage(): ITokenStorage {
    if (this.instance) {
      return this.instance;
    }

    // Check if FalkorDB URL is configured
    if (process.env.API_TOKEN_FALKORDB_URL) {
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
    return !!process.env.API_TOKEN_FALKORDB_URL;
  }

  /**
   * Check if using file storage
   */
  static isFileStorage(): boolean {
    return !process.env.API_TOKEN_FALKORDB_URL;
  }
}

export default StorageFactory;
