/**
 * The connection the UI currently considers active, injected into outgoing
 * requests as `X-Connection-Id`.
 *
 * Kept in a module of its own, with no imports, so that anything needing to pin
 * a request to a connection can read it — including helpers that must stay
 * loadable outside the Next runtime.
 */

// Not initialised from localStorage to avoid overriding restricted-user sessions.
// providers.tsx keeps it in sync after every render.
let activeConnectionId: string | null = null;

// Monotonic counter bumped whenever the active connection id actually changes.
// Async callers can capture it before a request and re-check it before applying
// results, so a switch (including A→B→A, where the id repeats) is still detected.
let connectionEpoch = 0;

export function setActiveConnectionIdGlobal(id: string | null) {
  // Bump only when switching AWAY from an already-established connection (the old
  // id is non-null). The initial null→id establishment on every page load is not
  // a "switch" and must not discard the first graph-list load / query, which
  // capture the epoch before the connection id settles.
  if (activeConnectionId !== null && id !== activeConnectionId) connectionEpoch += 1;
  activeConnectionId = id;
}

export function getActiveConnectionIdGlobal(): string | null {
  return activeConnectionId;
}

export function getConnectionEpoch(): number {
  return connectionEpoch;
}
