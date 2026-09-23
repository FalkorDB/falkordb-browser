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
 * `:` separates the segments and `%` introduces an escape, so escaping both
 * keeps the username inside its own segment. Without it the prefix is not
 * injective: user `alice` reading `chat-bob:chat-social` (a graph named
 * `bob:chat-social`) and user `alice:chat-bob` reading `chat-social` land on
 * the same key. Every username free of `:` and `%` encodes to itself, so no
 * existing scope moves.
 */
function escapeScopeSegment(value: string): string {
  return value.replace(/%/g, "%25").replace(/:/g, "%3A");
}

/**
 * The storage prefix for a connection. Exported because the staleness checks in
 * `providers.tsx` compare against it — building the string twice would let the
 * two drift and silently disable those checks.
 */
export function buildConnectionPrefix(host: string, port: number, username: string): string {
  return `${host}:${port}:${escapeScopeSegment(username)}:`;
}

/**
 * Written into every scope the browser has actually authenticated as, so the
 * migration below can tell one apart from a legacy key that merely looks like
 * one. See `belongsToAnotherUserScope`.
 */
const SCOPE_MARKER_KEY = "__scope";

/**
 * Build and cache the prefix.
 * Call once when the session becomes available (host, port & username known).
 */
export function setConnectionPrefix(host: string, port: number, username: string): void {
  _host = host;
  _port = port;
  _prefix = buildConnectionPrefix(host, port, username);
  if (isBrowser()) localStorage.setItem(`${_prefix}${SCOPE_MARKER_KEY}`, "1");
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

/**
 * Removes every scoped key starting with `keyPrefix`. Used to drop the
 * per-tab entries (chat history, …) of a tab the user just closed.
 */
export function removeConnectionItemsByPrefix(keyPrefix: string): void {
  if (!isBrowser()) return;
  const full = prefixed(keyPrefix);
  const doomed: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(full)) doomed.push(key);
  }
  doomed.forEach(key => localStorage.removeItem(key));
}

// ── legacy migration ───────────────────────────────────────────────

/**
 * Keys that moved from plain localStorage to connection-scoped storage.
 * On first load after upgrade, copy the old unscoped value into the
 * scoped key and remove the legacy entry so migration is one-time.
 * Must be called AFTER setConnectionPrefix().
 */
const SCOPED_KEYS = ["query history"];

/** Prefixes used by keys scoped to a single graph entity, e.g. `chat-<graphName>` or `labelStyle_<label>`. */
const SCOPED_KEY_PREFIXES = ["chat-", "cypherOnly-", "labelStyle_", "relationshipStyle_"];

function isRecognizedScopedKey(suffix: string): boolean {
  return SCOPED_KEYS.includes(suffix) || SCOPED_KEY_PREFIXES.some(p => suffix.startsWith(p));
}

/**
 * True when `suffix` is `<username>:<key>` for a username this browser has
 * actually signed in as.
 *
 * Usernames are unconstrained, so `chat-bob`'s `host:port:chat-bob:chat-social`
 * is indistinguishable by shape from a legacy key for a graph named
 * `bob:chat-social` — and migrating it would copy his data into this scope and
 * delete his original. Shape cannot settle it, so ask the scope: every session
 * stamps `SCOPE_MARKER_KEY` into its own prefix, and only a scope that exists
 * has one. A graph name that merely looks like a username still migrates.
 *
 * `suffix` is key text that already carries an escaped username, so the segment
 * is compared verbatim rather than re-escaped through `buildConnectionPrefix`.
 * Escaping leaves no colon in a username, so the first boundary is the only one
 * that can name a live scope; the later ones are still scanned because a marker
 * written before the escape existed spells its colons out.
 *
 * The residual case is a user who last signed in before this marker existed and
 * has not signed in since, which is the behaviour that shipped before it.
 */
function belongsToAnotherUserScope(suffix: string): boolean {
  for (let sep = suffix.indexOf(":"); sep !== -1; sep = suffix.indexOf(":", sep + 1)) {
    const scope = `${_host}:${_port}:${suffix.slice(0, sep)}:`;
    if (localStorage.getItem(`${scope}${SCOPE_MARKER_KEY}`) !== null) return true;
  }
  return false;
}

export function migrateToScopedStorage(): void {
  if (!isBrowser() || !_prefix) return;
  // Only run migration once per prefix to avoid repeating work on every
  // session update (e.g. switching active connection).
  if (_migrated.has(_prefix)) return;
  _migrated.add(_prefix);

  // ── Phase 1: migrate old host:port: prefix → current host:port:username: prefix ──
  // Legacy format: "host:port:key"             (before username was added)
  // Current format: "host:port:username:key"   (escaped username, "default" when anonymous)
  const legacyPrefix = `${_host}:${_port}:`;

  if (legacyPrefix !== _prefix) {
    const toMigrate: [string, string][] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(legacyPrefix)) continue;
      // Skip keys that already use the current prefix
      if (key.startsWith(_prefix)) continue;
      const suffix = key.slice(legacyPrefix.length);
      // Only migrate keys we recognize (exact scoped keys or graph-prefixed keys),
      // and only when they are not already another user's scoped key.
      if (isRecognizedScopedKey(suffix) && !belongsToAnotherUserScope(suffix)) {
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
