import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import type { ITokenStorage, TokenData, TokenFetchOptions } from './ITokenStorage.ts';

// Each acquisition publishes its owner in a uniquely named record, so removal can target one lock instance.
const LOCK_RECORD = /^owner-[\w-]+\.json$/;
// A holder keeps the lock for one read (with ~100 ms of retries) and one atomic write.
const ABANDONED_LOCK_MS = 30_000;
// A lock whose holder cannot be checked (another host, or no readable owner record) is presumed
// abandoned only after this much longer age, far beyond any critical section.
const STALE_UNVERIFIABLE_LOCK_MS = 5 * 60_000;
const LOCK_WAIT_MS = 10_000;
// Distinguishes this process from an earlier one that reused its PID (e.g. a restarted container).
const PROCESS_INSTANCE = crypto.randomUUID();

type LockOwner = { pid: number; hostname: string; instance: string; acquiredAt: number };
/** A lock's owner record file name (when it has one) and its owner (null when malformed). */
type LockRecord = { name?: string; owner: LockOwner | null };

function hasErrorCode(error: unknown, ...codes: string[]): boolean {
  return error instanceof Error && 'code' in error && codes.includes(error.code as string);
}

function uniqueSuffix(): string {
  return `${process.pid}.${Date.now()}.${crypto.randomBytes(6).toString('hex')}`;
}

function parseLockOwner(content: string): LockOwner | null {
  try {
    const owner = JSON.parse(content);
    return typeof owner?.pid === 'number' && typeof owner.hostname === 'string'
      && typeof owner.instance === 'string' && typeof owner.acquiredAt === 'number' ? owner : null;
  } catch {
    return null;
  }
}

/**
 * The lock's owner record, or null when the lock is gone. A missing or malformed record leaves
 * only the lock's age to decide; any other read failure leaves ownership unknown, so it is
 * rethrown and the lock is kept.
 */
async function readLockRecord(lockPath: string): Promise<LockRecord | null> {
  try {
    const name = (await fs.readdir(lockPath)).find(entry => LOCK_RECORD.test(entry));
    if (!name) return { owner: null };
    return { name, owner: parseLockOwner(await fs.readFile(path.join(lockPath, name), 'utf8')) };
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return null;
    throw error;
  }
}

/** Milliseconds since the lock directory last changed; 0 when it cannot be inspected, so it is kept. */
async function lockDirectoryAge(lockPath: string): Promise<number> {
  try {
    return Date.now() - (await fs.stat(lockPath)).mtimeMs;
  } catch {
    return 0;
  }
}

/** True only when the holder provably no longer runs on this host. */
function isLockOwnerGone(owner: LockOwner): boolean {
  if (owner.pid === process.pid) return owner.instance !== PROCESS_INSTANCE;
  try {
    process.kill(owner.pid, 0);
    return false;
  } catch (error) {
    return hasErrorCode(error, 'ESRCH');
  }
}

async function isLockAbandoned(lockPath: string, owner: LockOwner | null): Promise<boolean> {
  if (!owner) return await lockDirectoryAge(lockPath) >= STALE_UNVERIFIABLE_LOCK_MS;
  if (owner.hostname !== os.hostname()) return Date.now() - owner.acquiredAt >= STALE_UNVERIFIABLE_LOCK_MS;
  return Date.now() - owner.acquiredAt >= ABANDONED_LOCK_MS && isLockOwnerGone(owner);
}

/**
 * Removes one lock instance: its uniquely named owner record, then the lock directory only if
 * it is empty. A lock is never empty, so a replacement installed meanwhile is left alone.
 * True when this call freed the lock path.
 */
async function removeLock(lockPath: string, record?: string): Promise<boolean> {
  if (record) {
    try {
      await fs.unlink(path.join(lockPath, record));
    } catch (error) {
      if (!hasErrorCode(error, 'ENOENT')) throw error;
    }
  }
  try {
    await fs.rmdir(lockPath);
    return true;
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT', 'ENOTEMPTY')) return false;
    throw error;
  }
}

/** Removes the observed lock instance when it is abandoned; true when that freed the lock path. */
async function reclaimAbandonedLock(lockPath: string): Promise<boolean> {
  const record = await readLockRecord(lockPath);
  if (!record || !(await isLockAbandoned(lockPath, record.owner))) return false;
  const removed = await removeLock(lockPath, record.name);
  if (removed) console.warn('Recovered abandoned token storage lock:', { lockPath, owner: record.owner });
  return removed;
}

/**
 * Takes the lock by renaming a staged directory that already holds this acquisition's owner
 * record onto the lock path, so a lock never exists without its owner. The rename fails while
 * another lock holds the path (Windows refuses even an empty directory, hence EPERM).
 * Returns the owner record's name, which identifies this lock instance.
 */
async function acquireLock(lockPath: string): Promise<string> {
  const record = `owner-${crypto.randomUUID()}.json`;
  const staging = `${lockPath}.${uniqueSuffix()}.pending`;
  const owner: LockOwner = { pid: process.pid, hostname: os.hostname(), instance: PROCESS_INSTANCE, acquiredAt: Date.now() };
  const deadline = owner.acquiredAt + LOCK_WAIT_MS;
  await fs.mkdir(staging, { mode: 0o700 });
  try {
    await fs.writeFile(path.join(staging, record), JSON.stringify(owner), { mode: 0o600, flag: 'wx' });
    while (true) {
      try {
        await fs.rename(staging, lockPath);
        return record;
      } catch (error) {
        if (!hasErrorCode(error, 'EEXIST', 'ENOTEMPTY', 'EPERM')) throw error;
      }
      if (await reclaimAbandonedLock(lockPath)) continue;
      if (Date.now() >= deadline) {
        throw new Error(`Timed out acquiring token storage lock: ${lockPath}. Stop all writers before removing an abandoned lock.`);
      }
      await new Promise(resolve => { setTimeout(resolve, 50); });
    }
  } catch (error) {
    await fs.rm(staging, { recursive: true, force: true });
    throw error;
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

  // Owner record of a lock this instance still holds because releasing it failed.
  private unreleasedLock?: string;

  constructor(filePath?: string) {
    // Default to .data/api_tokens.json in project root
    // Can be overridden via API_TOKEN_STORAGE_PATH environment variable
    this.filePath = path.resolve(filePath || process.env.API_TOKEN_STORAGE_PATH || path.join(process.cwd(), '.data', 'api_tokens.json'));
  }

  /**
   * Serialize each snapshot update across processes sharing this local file.
   * A live lock is not stolen: a paused writer could otherwise overwrite a revocation.
   * A lock is recovered when its holder on this host has exited and the lock is far older
   * than any critical section, or when its holder cannot be checked (another host, or a
   * missing or malformed owner record) and the lock is older than STALE_UNVERIFIABLE_LOCK_MS.
   * A lock this process failed to release is released before its next operation.
   * Failures do not poison the queue for subsequent callers.
   */
  private withLock<T>(op: () => Promise<T>): Promise<T> {
    const locked = async () => {
      await this.ensureDirectoryExists();
      const lockPath = `${this.filePath}.lock`;
      if (this.unreleasedLock) {
        await removeLock(lockPath, this.unreleasedLock);
        this.unreleasedLock = undefined;
      }
      const record = await acquireLock(lockPath);
      try {
        await this.ensureFileExists(true);
        return await op();
      } finally {
        await this.releaseLock(lockPath, record);
      }
    };
    const next = this.writeQueue.then(locked, locked);
    this.writeQueue = next.catch(() => undefined);
    return next;
  }

  private async releaseLock(lockPath: string, record: string): Promise<void> {
    try {
      await removeLock(lockPath, record);
    } catch (error) {
      this.unreleasedLock = record;
      console.error('Failed to release token storage lock; retrying before the next operation:', { lockPath, error });
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
