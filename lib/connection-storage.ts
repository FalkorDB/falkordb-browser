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

/**
 * Build and cache the prefix.
 * Call once when the session becomes available (host & port known).
 */
export function setConnectionPrefix(host: string, port: number): void {
  _prefix = `${host}:${port}:`;
}

/**
 * Clear the prefix (e.g. on sign-out).
 */
export function clearConnectionPrefix(): void {
  _prefix = "";
}

export function getConnectionPrefix(): string {
  return _prefix;
}

// ── scoped wrappers ────────────────────────────────────────────────

function prefixed(key: string): string {
  return `${_prefix}${key}`;
}

export function getConnectionItem(key: string): string | null {
  return localStorage.getItem(prefixed(key));
}

export function setConnectionItem(key: string, value: string): void {
  localStorage.setItem(prefixed(key), value);
}

export function removeConnectionItem(key: string): void {
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

export function migrateToScopedStorage(): void {
  if (!_prefix) return;
  for (const key of SCOPED_KEYS) {
    const scopedKey = prefixed(key);
    if (localStorage.getItem(scopedKey) !== null) continue;
    const legacy = localStorage.getItem(key);
    if (legacy !== null) {
      localStorage.setItem(scopedKey, legacy);
      localStorage.removeItem(key);
    }
  }
}
