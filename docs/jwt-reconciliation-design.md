# JWT Reconciliation Redesign (Thread 2)

## Context

In `app/api/auth/[...nextauth]/options.ts`, the connId fallback path can reconnect using `session.user.host/port/username/tls` from the JWT-derived session (around the `newClient({... host: sessionUser.host ...})` block), instead of using a Token DB row as the single source of truth.  
This creates an architectural security gap: identity/session state and connection target state can diverge.

## Problem Summary

Current flow mixes two authorities:

1. **JWT/session payload** (`host`, `port`, `username`, `role`, `tls`, `activeConnectionId`)
2. **Token DB connection row** (`connection:<connId>` with encrypted credential + host metadata)

When reconciliation fails (stale/missing conn row), fallback can rebuild a connection from JWT host fields.  
That behavior is resilient, but it allows "session identity is valid" while "connection target is ambiguous".

## Security Risks

1. **Target confusion / mismatch**: `activeConnectionId` and JWT host fields can point to different targets.
2. **Weak trust boundary**: JWT claim data is treated as reconnection authority, not just session pointer.
3. **Inconsistent authorization context**: role/user metadata may be computed from one source while connection comes from another.
4. **Hard-to-audit behavior**: fallback reconnect path is not tied to an explicit persisted connection record.

## Design Goals

1. Make **Token DB connection rows authoritative** for runtime connection material.
2. Make JWT/session contain only **minimal routing identifiers**, not mutable connection metadata.
3. Ensure every resolved `connId` is **ownership-bound** to the authenticated session.
4. Remove host-based reconciliation fallback that can bypass canonical connection state.
5. Preserve UX (multi-connection switching) with deterministic, auditable behavior.

## Proposed Architecture

### 1) Session binding model

Add a per-login random session binding ID (`sid`) stored in JWT and in each session connection row.

- `sid` is generated for every successful sign-in event (new login creates a new binding ID).
- Each `connection:<connId>` row stores `session_binding_id = sid`.
- Connection lookup requires both:
  - `token_id == connId`
  - `session_binding_id == sid`

This prevents cross-session/cross-token confusion even when user IDs are stable hashes.

### 2) JWT minimization (authoritative pointer only)

JWT keeps:

- `sub` / `id`
- `sid`
- `activeConnectionId`

JWT removes as authoritative fields for connection reconstruction:

- `host`, `port`, `username`, `role`, `tls`, `ca`, `url`

These values are resolved from Token DB at request time (or cached client keyed by `sid:connId` with Token DB verification).

### 3) Strict connection resolution

`getClient()` resolution order:

1. Resolve `sid` + `activeConnectionId` (or explicit header/query connection ID).
2. Fetch Token DB row by `connId`.
3. Verify row type/name (`kind=session`, and `name.startsWith("connection:")` on TokenData) and `session_binding_id == sid`.
   - both checks are intentional: `kind=session` enforces token class, and `name` prefix keeps compatibility with existing connection-row conventions
4. Reuse healthy cached client by key `sid:connId`.
5. If cache miss/unhealthy, recreate **only** from Token DB row + encrypted credential.
6. If row missing/mismatch → return `SESSION_INVALID` (or `CONNECTION_NOT_FOUND`) and force client re-auth/refresh path.

No reconnect from JWT host fields.

### 4) Connection switching contract

For `session.update({ activeConnectionId })`:

- Validate that requested `connId` belongs to current `sid` before accepting switch.
- JWT callback updates only `activeConnectionId`; all display metadata is fetched from Token DB.

### 5) Logout and cleanup semantics

- Sign-out deletes only rows for current `sid`.
- Optional background sweeper removes expired rows by `expires_at`.
- Cache eviction closes only clients for `sid:*`.

## Data Model Changes

Extend token storage schema (`TokenData`) for session rows:

- `session_binding_id: string` (required for `kind=session` after migration)
- Optional `connection_fingerprint` for diagnostics/integrity alerts:
  - value: `HMAC-SHA256(canonical(host|port|username|tls|caHash))`
  - key: server-side only, derived via HKDF from the same secret precedence already used by auth (`AUTH_SECRET`, fallback `NEXTAUTH_SECRET`)
  - secret-rotation note: fingerprint checks are best-effort diagnostics; after auth secret rotation, accept old fingerprints during a grace window and recompute on next successful connection resolution
  - canonicalization rules:
    - field order is fixed: `host|port|username|tls|caHash`
    - lower-case host
    - IPv6 normalized to RFC 5952 text without brackets
    - trim username and encode as UTF-8 length-prefixed segment (`<len>:<value>`, where `len` is UTF-8 byte length) to avoid delimiter ambiguity
    - normalize booleans as `true|false`
    - stringify port as base-10 integer without leading zeros (always include port, including defaults)
    - compute `caHash=SHA256(rawCA)` (or empty)
    - join normalized non-length-prefixed fields with literal `|`
  - never use client-provided key material

Backwards compatibility:

- Existing rows without `session_binding_id` are treated as legacy and migrated lazily on first successful authenticated connection resolution (first `getClient` path that resolves the row).
- Legacy-row guard before migration: row must still pass existing ownership checks (`user_id` match for current authenticated principal), and migration is performed under the same per-connection lock to prevent multi-session claim races.
- If the migration write fails:
  1. reject request with retryable `409` + `SESSION_MIGRATION_RETRY`
  2. emit telemetry/structured error
  3. fail closed (no JWT-host fallback)

`SESSION_MIGRATION_RETRY` is returned in the JSON body as `{ code: "SESSION_MIGRATION_RETRY", message: "..." }`.  
Client behavior: show a transient reconnect message and auto-retry with backoff; if retries are exhausted, force sign-in refresh.

## Migration Plan

### Phase 0: Guardrails (safe rollout start)
- Add runtime warning metric when JWT host fields differ from Token DB row for same `connId`.
- Keep existing behavior temporarily.
- Promotion gate to Phase 1: mismatch metric stays below 0.1% of authenticated requests for 7 consecutive days.

### Phase 1: Dual-write / dual-read
- On login and connection creation, write `session_binding_id`.
- Read path prefers `session_binding_id`; legacy rows still accepted with strict one-time migration.

### Phase 2: Remove JWT-host fallback
- Delete reconnect logic that uses `session.user.host/port/...`.
- Fail closed when `connId` cannot be resolved to a bound Token DB row.

### Phase 3: JWT cleanup
- Stop writing host/port/role/username/tls to JWT.
- Session callback resolves view metadata from Token DB.

### Phase 4: Enforcement
- Require `session_binding_id` on all `kind=session` rows.
- Remove legacy migration branch and related code paths.

## Validation Strategy

1. **Unit tests**
   - `getClient` rejects `connId` not bound to `sid`.
   - stale/missing row returns deterministic invalid-session error.
   - `session.update` cannot switch to foreign/unbound `connId`.
2. **Integration tests**
   - multi-connection switch uses Token DB metadata only.
   - sign-out removes current `sid` rows and invalidates cache keys.
3. **Security tests**
   - tampered/stale JWT metadata cannot change connection target.
   - replayed `connId` from another session fails binding check.
4. **Operational checks**
   - log/metric dashboards for migration fallback usage reach zero before legacy removal.

## Rollback Plan

- Keep feature flag `AUTH_STRICT_SESSION_BINDING` for phased activation.
- If incidents occur, disable strict mode to restore dual-read behavior while keeping migration data.
- Never roll back to JWT-host-only reconciliation.

## Rubber-Duck Review (Self-Critique)

### Q1: What is the single source of truth for connection target?
**Answer:** Token DB session connection row (`connId` + `sid`). JWT is only a pointer.

### Q2: Can a stale JWT host/role value influence runtime connection?
**Answer:** No. Runtime reconstruction uses Token DB only; JWT host fields are removed from authority path.

### Q3: How do we prevent one session from using another session’s connection row?
**Answer:** Enforce `session_binding_id == sid` during lookup and switch updates.

### Q4: What if Token DB row is missing?
**Answer:** Fail closed (`SESSION_INVALID`/`CONNECTION_NOT_FOUND`), force refresh/sign-in; do not reconstruct from JWT host.

### Q5: Is migration safe for existing users?
**Answer:** Yes, via dual-read and lazy migration phases, with observability before strict enforcement.

### Q6: Are we introducing excessive latency by always reading Token DB?
**Answer:** No major regression expected because healthy cache fast-path remains (`sid:connId`), and Token DB lookup is needed mainly on cache miss/switch.

### Q7: What remains as open risk?
**Answer:** If Token DB is unavailable, strict mode increases auth failures. Mitigation: phased rollout, retries, and explicit operational SLO monitoring.
