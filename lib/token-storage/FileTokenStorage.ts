import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import type { ITokenStorage, TokenData, TokenFetchOptions } from './ITokenStorage.ts';

const LOCK_OWNER_FILE = 'owner.json';
// A holder keeps the lock for one read (with ~100 ms of retries) and one atomic write.
const ABANDONED_LOCK_MS = 30_000;
// Distinguishes this process from an earlier one that reused its PID (e.g. a restarted container).
const PROCESS_INSTANCE = crypto.randomUUID();

type LockOwner = { pid: number; hostname: string; instance: string; acquiredAt: number };

function hasErrorCode(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code;
}

function uniqueSuffix(): string {
  return `${process.pid}.${Date.now()}.${crypto.randomBytes(6).toString('hex')}`;
}

async function readLockOwner(lockPath: string): Promise<LockOwner | null> {
  try {
    const owner = JSON.parse(await fs.readFile(path.join(lockPath, LOCK_OWNER_FILE), 'utf8'));
    return typeof owner?.pid === 'number' && typeof owner.hostname === 'string'
      && typeof owner.instance === 'string' && typeof owner.acquiredAt === 'number' ? owner : null;
  } catch {
    // Missing or partial owner data: the holder may still be starting, so the lock is kept.
    return null;
  }
}

/** True only when the holder provably no longer runs; holders on other hosts are never presumed dead. */
function isLockOwnerGone(owner: LockOwner): boolean {
  if (owner.hostname !== os.hostname()) return false;
  if (owner.pid === process.pid) return owner.instance !== PROCESS_INSTANCE;
  try {
    process.kill(owner.pid, 0);
    return false;
  } catch (error) {
    return hasErrorCode(error, 'ESRCH');
  }
}

/**
 * File-based token storage implementation
 * Stores tokens in a JSON file (default: .data/api_tokens.json in project root)
 */
class FileTokenStorage implements ITokenStorage {
  private filePath: string;

  // Serializes all read-modify-write operations within this process so that
  // concurrent createToken / revokeToken / updateLastUsed calls cannot:
  //   (a) race on the atomic-rename tmp file (ENOENT on rename), or
  //   (b) drop each other's updates (read N, both push, write N+1).
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(filePath?: string) {
    // Default to .data/api_tokens.json in project root
    // Can be overridden via API_TOKEN_STORAGE_PATH environment variable
    this.filePath = path.resolve(filePath || process.env.API_TOKEN_STORAGE_PATH || path.join(process.cwd(), '.data', 'api_tokens.json'));
  }

  /**
   * Serialize each snapshot update across processes sharing this local file.
   * A live lock is never stolen: a paused writer could otherwise overwrite a revocation.
   * A lock is recovered only when its holder on this host has exited and the lock is
   * far older than any critical section; other abandoned locks need operator recovery.
   * Failures do not poison the queue for subsequent callers.
   */
  private withLock<T>(op: () => Promise<T>): Promise<T> {
    const locked = async () => {
      await this.ensureDirectoryExists();
      const lockPath = `${this.filePath}.lock`;
      await this.acquireLock(lockPath);
      try {
        await this.ensureFileExists(true);
        return await op();
      } finally {
        await this.releaseLock(lockPath);
      }
    };
    const next = this.writeQueue.then(locked, locked);
    this.writeQueue = next.catch(() => undefined);
    return next;
  }

  private async acquireLock(lockPath: string): Promise<void> {
    const deadline = Date.now() + 10_000;
    while (true) {
      try {
        await fs.mkdir(lockPath, { mode: 0o700 });
        break;
      } catch (error) {
        if (!hasErrorCode(error, 'EEXIST')) throw error;
        if (await this.reclaimAbandonedLock(lockPath)) continue;
        if (Date.now() >= deadline) {
          throw new Error(`Timed out acquiring token storage lock: ${lockPath}. Stop all writers before removing an abandoned lock.`);
        }
        await new Promise(resolve => { setTimeout(resolve, 50); });
      }
    }
    const owner: LockOwner = { pid: process.pid, hostname: os.hostname(), instance: PROCESS_INSTANCE, acquiredAt: Date.now() };
    try {
      await fs.writeFile(path.join(lockPath, LOCK_OWNER_FILE), JSON.stringify(owner), { mode: 0o600, flag: 'wx' });
    } catch (error) {
      await this.releaseLock(lockPath);
      throw error;
    }
  }

  /** Removes the lock when its holder has exited; reclaimers serialize on a second lock and re-check. */
  private async reclaimAbandonedLock(lockPath: string): Promise<boolean> {
    const reclaimPath = `${lockPath}.reclaim`;
    try {
      await fs.mkdir(reclaimPath, { mode: 0o700 });
    } catch (error) {
      if (hasErrorCode(error, 'EEXIST')) return false;
      throw error;
    }
    let reclaimed = false;
    try {
      const owner = await readLockOwner(lockPath);
      if (owner && Date.now() - owner.acquiredAt >= ABANDONED_LOCK_MS && isLockOwnerGone(owner)) {
        await this.removeLockDirectory(lockPath);
        console.warn('Recovered abandoned token storage lock:', { lockPath, pid: owner.pid });
        reclaimed = true;
      }
    } finally {
      await fs.rmdir(reclaimPath);
    }
    return reclaimed;
  }

  // Renaming first frees the lock atomically, so a crash never leaves a lock without its owner.
  private async removeLockDirectory(lockPath: string): Promise<void> {
    const released = `${lockPath}.${uniqueSuffix()}.released`;
    await fs.rename(lockPath, released);
    await fs.rm(released, { recursive: true, force: true });
  }

  private async releaseLock(lockPath: string): Promise<void> {
    try {
      await this.removeLockDirectory(lockPath);
    } catch (error) {
      console.error('Failed to release token storage lock; stop all writers before recovery:', { lockPath, error });
    }
  }

  private async cleanupTempFile(tmpPath: string): Promise<void> {
    try {
      await fs.unlink(tmpPath);
    } catch (cleanupError) {
      // eslint-disable-next-line no-console
      console.error('Failed to clean up token storage temp file:', { tmpPath, cleanupError });
    }
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      // Ensure directory exists with restrictive permissions (owner-only)
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true, mode: 0o700 });
      // Enforce permissions on pre-existing directory
      await fs.chmod(dir, 0o700);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to ensure token storage file exists:', error);
      throw new Error('Failed to initialize token storage file');
    }
  }

  private async ensureFileExists(lockHeld = false): Promise<void> {
    await this.ensureDirectoryExists();
    try {
      await fs.chmod(this.filePath, 0o600);
    } catch (error) {
      if (!hasErrorCode(error, 'ENOENT')) {
        console.error('Failed to access token storage file:', error);
        throw new Error('Failed to initialize token storage file', { cause: error });
      }
      if (lockHeld) {
        await this.writeTokens([]);
      } else {
        // The lock holder checks again and atomically publishes the initial snapshot.
        await this.withLock(() => Promise.resolve());
      }
    }
  }

  /**
   * Read all tokens from file.
   * Retries up to 3 times on JSON parse failure to handle the brief window
   * where a concurrent atomic write (rename) is in progress.
   * Callers inside `withLock` pass `lockHeld` so a missing file never queues a nested lock.
   */
  private async readTokens(lockHeld = false): Promise<TokenData[]> {
    await this.ensureFileExists(lockHeld);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const content = await fs.readFile(this.filePath, 'utf8');
        const data = JSON.parse(content);
        if (!data || !Array.isArray(data.tokens)) throw new Error('Invalid token storage contents');
        return data.tokens;
      } catch (error) {
        if (attempt < 2) {
          // Brief wait before retry — allows an in-progress atomic rename to
          // complete so the next read sees a consistent file.
          // eslint-disable-next-line no-await-in-loop
          await new Promise<void>((resolve) => { setTimeout(resolve, 50); });
        } else {
          // eslint-disable-next-line no-console
          console.error('Failed to read tokens from file after retries:', error);
          throw new Error('Failed to read token storage', { cause: error });
        }
      }
    }
    throw new Error('Failed to read token storage');
  }

  /**
   * Write tokens to file atomically: write to a UNIQUE temp file first, then rename.
   * fs.rename is atomic on POSIX systems (same filesystem). Each writer uses its
   * own tmp filename (pid + timestamp + random) so concurrent writers cannot
   * consume each other's staging file and trigger ENOENT on rename.
   * Never overwrite the live file non-atomically.
   */
  private async writeTokens(tokens: TokenData[]): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });

    const content = JSON.stringify({ tokens }, null, 2);
    const tmpPath = `${this.filePath}.${uniqueSuffix()}.tmp`;
    try {
      await fs.writeFile(tmpPath, content, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
      await fs.rename(tmpPath, this.filePath);
    } catch (renameError) {
      await this.cleanupTempFile(tmpPath);
      console.error('Failed to atomically write tokens to file:', renameError);
      throw new Error('Failed to save tokens', { cause: renameError });
    }
  }

  async createToken(tokenData: TokenData): Promise<void> {
    return this.withLock(async () => {
      const tokens = await this.readTokens(true);
      tokens.push(tokenData);
      await this.writeTokens(tokens);
    });
  }

  async fetchTokens(options: TokenFetchOptions): Promise<TokenData[]> {
    const tokens = await this.readTokens();

    // Only PAT rows are surfaced in the tokens listing. Session rows are
    // internal and must never appear in the UI or API surface.
    let filtered = tokens.filter(t => t.is_active && (t.kind ?? 'pat') === 'pat');

    // Admins may manage any token for their own endpoint, but not tokens
    // belonging to unrelated database connections.
    if (options.isAdmin) {
      filtered = filtered.filter(
        t =>
          t.host.toLowerCase() === (options.host || 'localhost').toLowerCase() &&
          t.port === (options.port || 6379)
      );
    } else {
      filtered = filtered.filter(
        t =>
          t.username === options.username &&
          t.host.toLowerCase() === (options.host || 'localhost').toLowerCase() &&
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
    return this.withLock(async () => {
      const tokens = await this.readTokens(true);
      const token = tokens.find(t => t.token_id === tokenId);

      if (!token) {
        return false;
      }

      token.is_active = false;
      await this.writeTokens(tokens);
      return true;
    });
  }

  async deleteToken(tokenId: string): Promise<boolean> {
    return this.withLock(async () => {
      const tokens = await this.readTokens(true);
      const next = tokens.filter(t => t.token_id !== tokenId);
      if (next.length === tokens.length) {
        return false;
      }
      await this.writeTokens(next);
      return true;
    });
  }

  async updateLastUsed(tokenId: string): Promise<void> {
    return this.withLock(async () => {
      const tokens = await this.readTokens(true);
      const token = tokens.find(t => t.token_id === tokenId);

      if (token) {
        token.last_used = Math.floor(Date.now() / 1000);
        await this.writeTokens(tokens);
      }
    });
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

  async fetchTokensByUserId(userId: string, kind?: import('./ITokenStorage').TokenKind): Promise<TokenData[]> {
    const tokens = await this.readTokens();
    const now = Math.floor(Date.now() / 1000);
    return tokens
      .filter(t => t.user_id === userId && t.is_active && (t.expires_at === -1 || t.expires_at > now))
      .filter(t => !kind || (t.kind ?? 'pat') === kind)
      .sort((a, b) => b.created_at - a.created_at);
  }

  async cleanupExpiredTokens(): Promise<number> {
    return this.withLock(async () => {
      const tokens = await this.readTokens(true);
      const now = Math.floor(Date.now() / 1000);

      const validTokens = tokens.filter(
        t => t.expires_at === -1 || t.expires_at > now
      );

      const removedCount = tokens.length - validTokens.length;

      if (removedCount > 0) {
        await this.writeTokens(validTokens);
      }

      return removedCount;
    });
  }
}

export default FileTokenStorage;
