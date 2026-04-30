/**
 * Connection-scoped localStorage helpers.
 *
 * Every key written through these helpers is prefixed with
 * host:port from the FalkorDB connection so that two browser tabs
 * pointing at different servers do not clobber each other's
 * query history, chat messages, etc.
 */

// ── prefix management ──────────────────────────────────────────────

let _prefix = "";
let _host = "";
let _port = 0;
let _migrated = new Set<string>();

/**
 * Build and cache the prefix.
 * Call once when the session becomes available (host, port & username known).
 */
export function setConnectionPrefix(host: string, port: number, username: string): void {
  _host = host;
  _port = port;
  _prefix = `${host}:${port}:${username}:`;
}

/**
 * Clear the prefix (e.g. on sign-out).
 */
export function clearConnectionPrefix(): void {
  _prefix = "";
  _migrated.clear();
}

export function getConnectionPrefix(): string {
  return _prefix;
}

// ── SSR guard ──────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ── scoped wrappers ────────────────────────────────────────────────

function prefixed(key: string): string {
  return `${_prefix}${key}`;
}

export function getConnectionItem(key: string): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(prefixed(key));
}

export function setConnectionItem(key: string, value: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(prefixed(key), value);
}

export function removeConnectionItem(key: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(prefixed(key));
}

// ── legacy migration ───────────────────────────────────────────────

/**
 * Keys that moved from plain localStorage to connection-scoped storage.
 * On first load after upgrade, copy the old unscoped value into the
 * scoped key and remove the legacy entry so migration is one-time.
 * Must be called AFTER setConnectionPrefix().
 */
const SCOPED_KEYS = ["query history", "savedContent"];

/** Prefixes used by graph-specific keys stored as `prefix-graphName`. */
const SCOPED_KEY_PREFIXES = ["chat-", "cypherOnly-", "labelStyle_"];

export function migrateToScopedStorage(): void {
  if (!isBrowser() || !_prefix) return;
  // Only run migration once per prefix to avoid repeating work on every
  // session update (e.g. switching active connection).
  if (_migrated.has(_prefix)) return;
  _migrated.add(_prefix);

  // ── Phase 1: migrate old host:port: prefix → current host:port:username: prefix ──
  // Legacy format: "host:port:key"             (before username was added)
  // Current format: "host:port:username:key"   (username is always "default" or a real name)
  const legacyPrefix = `${_host}:${_port}:`;

  if (legacyPrefix !== _prefix) {
    const toMigrate: [string, string][] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(legacyPrefix)) continue;
      // Skip keys that already use the current prefix
      if (key.startsWith(_prefix)) continue;
      const suffix = key.slice(legacyPrefix.length);
      // Only migrate keys we recognize (exact scoped keys or graph-prefixed keys)
      const isExactScopedKey = SCOPED_KEYS.includes(suffix);
      const isPrefixedKey = SCOPED_KEY_PREFIXES.some(p => suffix.startsWith(p));
      if (isExactScopedKey || isPrefixedKey) {
        toMigrate.push([key, prefixed(suffix)]);
      }
    }
    for (const [oldKey, newKey] of toMigrate) {
      if (localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, localStorage.getItem(oldKey)!);
      }
      localStorage.removeItem(oldKey);
    }
  }

  // ── Phase 2: migrate fully unscoped keys → new prefix ──
  // Migrate exact-match keys
  for (const key of SCOPED_KEYS) {
    const scopedKey = prefixed(key);
    if (localStorage.getItem(scopedKey) !== null) continue;
    const legacy = localStorage.getItem(key);
    if (legacy !== null) {
      localStorage.setItem(scopedKey, legacy);
      localStorage.removeItem(key);
    }
  }

  // Migrate graph-specific prefixed keys (e.g. "chat-myGraph", "cypherOnly-myGraph")
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    // Skip keys that are already scoped (start with the connection prefix)
    if (key.startsWith(_prefix)) continue;
    for (const p of SCOPED_KEY_PREFIXES) {
      if (key.startsWith(p)) {
        const scopedKey = prefixed(key);
        if (localStorage.getItem(scopedKey) === null) {
          localStorage.setItem(scopedKey, localStorage.getItem(key)!);
        }
        localStorage.removeItem(key);
        // Removing a key shifts indices, so decrement to re-check the current index
        i--;
        break;
      }
    }
  }
}
