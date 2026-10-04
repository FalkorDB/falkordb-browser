/**
 * The parts of the server-side auth logic that decide which connection a
 * token or a stored record identifies, and whether it may still be used.
 *
 * Kept apart from `app/api/auth/[...nextauth]/options.ts` and deliberately
 * pure — no `next/*`, no `@/` alias — so it stays loadable by `node --test`.
 */

import type { TokenData } from "./token-storage/ITokenStorage";

/**
 * Marks tokens whose host/port were resolved from the connection URL rather
 * than defaulted. Bump this whenever a change makes older tokens unable to
 * identify their own connection; the jwt callback retires anything older.
 */
export const BINDING_VERSION = 2;

/**
 * The same marker for personal access tokens, under a claim of its own.
 *
 * It cannot share `bv`: `getToken` falls back to reading an `Authorization:
 * Bearer` header as a session token, and `getSessionFromRequest` admits anything
 * `isEndpointBound` accepts without consulting `isTokenActive`. A PAT carrying
 * `bv` would therefore authenticate on that path after it had been revoked.
 */
export const PAT_BINDING_VERSION = 1;

/**
 * True when a JWT carries the current endpoint binding.
 *
 * The `jwt` callback retires older tokens, but that only runs for callers that
 * go through NextAuth. Anything reading a token directly with `getToken` sees
 * the raw payload, pre-binding tokens included, so it has to ask here before
 * trusting `host`/`port`/`username` to identify a connection.
 */
export function isEndpointBound(
  token: Record<string, unknown> | null | undefined
): boolean {
  return token?.bv === BINDING_VERSION;
}

/**
 * How a verified personal access token's payload stands against the current
 * binding.
 *
 * `predates-binding` is a well-formed PAT minted before `pbv` existed. It is
 * refused all the same — its `host`/`port` may be the localhost defaults every
 * such token shares — but the holder is owed a reason they can act on, rather
 * than the "revoked" they would otherwise read.
 */
export type PatPayloadStatus = "valid" | "predates-binding" | "invalid";

export function patPayloadStatus(payload: unknown): PatPayloadStatus {
  if (!payload || typeof payload !== "object") return "invalid";
  const p = payload as Record<string, unknown>;
  // `host`/`port` are the connection's identity here — they pick the server to
  // talk to and seed the owner that ciphertext is bound to. A token minted
  // before those were resolved from the connection URL carries the localhost
  // defaults instead, which every such token shares. Refuse it: the holder must
  // issue a new one rather than act under an identity that is not theirs alone.
  if (!(p.sub && p.host && p.port)) return "invalid";
  if (p.pbv === PAT_BINDING_VERSION) return "valid";
  // Only a token with no marker at all is known to be older. A marker of any
  // other value is not one this server issued, so it gets no explanation.
  return p.pbv === undefined && p.jti ? "predates-binding" : "invalid";
}

/** `decodeURIComponent`, or `undefined` where a stray "%" makes it throw. */
function decodeOrUndefined(value: string): string | undefined {
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

/**
 * Pulls the connection parameters out of a `falkor[s]://` connection string.
 *
 * URL logins send only `url`, so without this every one of them was recorded as
 * `default@localhost:6379`. That identity is what `generateConsistentUserId`
 * hashes into the AAD that binds encrypted browser values to a connection, so
 * two unrelated servers reached by URL would have shared one binding and could
 * decrypt each other's values.
 *
 * The scheme and password come out too: the connection record outlives the URL
 * (which is deliberately never stored), and a record that kept the discrete
 * fields' empty `tls`/`password` would describe a plaintext, unauthenticated
 * connection that the user never asked for.
 *
 * Returns an empty object when the string does not parse, or names no host at
 * all (`unix://`, or a `redis://` with an empty authority); the caller refuses
 * the login rather than recording it under the defaults. A credential with a
 * "%" that starts no valid escape counts as not parsing: node-redis decodes
 * credentials with the same `decodeURIComponent`, so that URL cannot connect
 * either, and a literal "%" has to be written `%25`.
 */
export function parseConnectionUrl(url: string): {
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  tls?: boolean;
} {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {};
  }
  if (!parsed.hostname) return {};

  const username = parsed.username ? decodeOrUndefined(parsed.username) : undefined;
  const password = parsed.password ? decodeOrUndefined(parsed.password) : undefined;
  if ((parsed.username && username === undefined) || (parsed.password && password === undefined)) {
    return {};
  }

  return {
    // `URL` keeps the brackets around an IPv6 literal, but they are URL
    // syntax rather than part of the address: node-redis strips them before
    // handing the host to `net.connect` (same expression), so a record
    // holding `[::1]` would be recreated as a hostname that never resolves,
    // and would hash into a different identity than the very same server
    // reached through the discrete fields.
    host: parsed.hostname.replace(/^\[([0-9a-f:]+)\]$/i, "$1"),
    port: parsed.port || undefined,
    username,
    password,
    tls: parsed.protocol === "falkors:" || parsed.protocol === "rediss:",
  };
}

/**
 * True while the record still authorises this session to use the connection.
 *
 * A cached socket outlives its record: revoking a connection flips `is_active`
 * but cannot reach into the pool, so every path that hands back a pooled client
 * has to ask the record again rather than treat "the ping succeeded" as proof.
 *
 * Expiry is checked here too. Connection records are always written with a
 * finite `expires_at` (the session's max age), and `fetchTokenById` — unlike
 * `fetchTokensByUserId` — applies no filter of its own, so without this clause
 * an expired connection disappears from the connection list while still
 * serving requests.
 */
export function isUsableConnectionRecord(
  tokenData: TokenData | null | undefined,
  sessionId: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): tokenData is TokenData {
  return (
    !!tokenData &&
    tokenData.is_active &&
    (tokenData.expires_at === -1 || tokenData.expires_at > nowSeconds) &&
    tokenData.name.startsWith("connection:") &&
    tokenData.user_id === sessionId
  );
}
