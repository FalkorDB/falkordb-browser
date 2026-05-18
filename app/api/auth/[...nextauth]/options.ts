import CredentialsProvider from "next-auth/providers/credentials";
import type { User } from "next-auth";
import type { Role } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { FalkorDB, type FalkorDBOptions } from "falkordb";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { getToken } from "next-auth/jwt";
import { LRUCache } from "lru-cache";
import StorageFactory from "@/lib/token-storage/StorageFactory";
import {
  enableAutoNextAuthUrl,
  getCorsHeaders,
  isRequestOriginTrusted,
  rejectUntrustedOrigin,
  shouldUseSecureCookies,
} from "../../utils";
import {
  isTokenActive,
  getPasswordFromTokenDB,
  storeEncryptedCredential,
} from "../tokenUtils";

interface CustomJWTPayload {
  sub: string;
  jti: string; // Token ID for fetching password from Token DB
  username?: string;
  role: Role;
  host: string;
  port: number;
  tls: boolean;
  ca?: string;
  url?: string;
}

interface AuthenticatedUser {
  id: string;
  username?: string;
  role: Role;
  host: string;
  port: number;
  tls: boolean;
  ca?: string;
  url?: string;
  credentialRef?: string;
}

interface AuthenticatedUserWithPassword extends AuthenticatedUser {
  password?: string;
}

/**
 * LRU-based connection cache. Evicts the least-recently-used connection
 * when the max size is reached, and automatically expires idle entries
 * after 30 minutes.
 *
 * IMPORTANT: `dispose` only auto-closes on `evict` (max-size) and `stale`
 * (TTL expiry). On `set` (overwrite) and `delete` we skip auto-close
 * because another in-flight request may still hold a reference to the old
 * client. Callers that `.delete()` are expected to close the client
 * themselves when safe.
 */
// Wire cache size to the MAX_CONNECTION_CACHE_SIZE env var (defaults to 100).
// Without this the env var has no effect even though it is documented.
const maxConnectionCacheSize = Math.max(
  1,
  Number.parseInt(process.env.MAX_CONNECTION_CACHE_SIZE ?? "100", 10) || 100
);

const connections = new LRUCache<string, FalkorDB>({
  max: maxConnectionCacheSize,
  ttl: 30 * 60 * 1000, // 30 minutes idle TTL
  dispose(client, _key, reason) {
    if (reason === 'set' || reason === 'delete') return;
    try { client.close(); } catch { /* ignore */ }
  },
});

enableAutoNextAuthUrl();

/**
 * Returns the map key for a session-scoped multi-connection entry.
 * Only used for connections stored via addSessionConnection / the
 * initial login flow — NOT for JWT/PAT clients (which are keyed by
 * payload.sub directly).
 */
function sessionConnectionKey(sessionId: string, connectionId: string): string {
  return `${sessionId}:${connectionId}`;
}

export async function newClient(
  credentials: {
    host?: string;
    port?: string;
    password?: string;
    username?: string;
    tls?: string;
    ca?: string;
    url?: string;
  },
  id: string
): Promise<{ role: Role; client: FalkorDB }> {
  let connectionOptions: FalkorDBOptions;

  // If URL is provided, use it directly
  if (credentials.url) {
    connectionOptions = {
      url: credentials.url ?? "falkor://localhost:6379",
    };
  } else {
    // Use individual connection parameters
    connectionOptions =
      credentials.tls === "true"
        ? {
          socket: {
            host: credentials.host ?? "localhost",
            port: credentials.port ? parseInt(credentials.port, 10) : 6379,
            tls: credentials.tls === "true",
            ...(process.env.SKIP_SERVER_IDENTITY_CHECK === "true" ? { checkServerIdentity: () => undefined } : {}),
            ca:
              !credentials.ca || credentials.ca === "undefined"
                ? undefined
                : [Buffer.from(credentials.ca, "base64").toString("utf8")],
          },
          password: credentials.password ?? undefined,
          username: credentials.username ?? undefined,
        }
        : {
          socket: {
            host: credentials.host || "localhost",
            port: credentials.port ? parseInt(credentials.port, 10) : 6379,
          },
          password: credentials.password ?? undefined,
          username: credentials.username ?? undefined,
        };
  }

  const client = await FalkorDB.connect(connectionOptions);

  // Save connection in connections map for later use
  connections.set(id, client);

  client.on("error", (err) => {
    // Close connection on error and remove from connections map.
    // Guard with identity check: if concurrent requests recreated the
    // connection under the same key, only close OUR client — not the
    // replacement that another request already stored.
    // eslint-disable-next-line no-console
    console.error("FalkorDB Client Error", err);
    const current = connections.get(id);
    if (current === client) {
      connections.delete(id);
      client.close().catch((e) => {
        // eslint-disable-next-line no-console
        console.warn("FalkorDB Client Disconnect Error", e);
      });
    }
  });

  // Verify connection and Role
  const connection = await client.connection;

  try {
    await connection.aclGetUser(credentials.username || "default");
    return { role: "Admin", client };
  } catch (err) {
    if ((err as Error).message.startsWith("NOPERM")) {
      // User is not admin, continue to check other roles
    } else throw err;
  }

  try {
    await connection.sendCommand(["GRAPH.QUERY"]);
  } catch (err) {
    if ((err as Error).message.includes("permissions")) {
      return { role: "Read-Only", client };
    }
    return { role: "Read-Write", client };
  }

  return { role: "Admin", client };
}

export function generateTimeUUID() {
  const timestamp = Date.now(); // Get current time in milliseconds
  const uuid = uuidv4(); // Generate a random UUID
  return `${timestamp}-${uuid}`; // Combine both
}

/**
 * Generates a consistent user ID based on credentials
 * This ensures the same user gets the same ID across multiple logins
 * Format: SHA-256 hash of "username@host:port"
 */
export function generateConsistentUserId(
  username: string,
  host: string,
  port: number
): string {
  const identifier = `${username || 'default'}@${host}:${port}`;
  return crypto.createHash('sha256').update(identifier).digest('hex');
}

// ---------------------------------------------------------------------------
// Multi-connection helpers
// ---------------------------------------------------------------------------

export interface ConnectionInfo {
  id: string;          // unique connection ID (also the Token DB tokenId)
  username?: string;
  role: Role;
  host: string;
  port: number;
  tls: boolean;
  ca?: string;
}

/**
 * Adds an additional connection to the current session.
 * The connection is stored both in the in-memory Map and in the Token DB.
 * Returns the ConnectionInfo for the newly created connection.
 */
export async function addSessionConnection(
  sessionId: string,
  credentials: {
    host?: string;
    port?: string;
    password?: string;
    username?: string;
    tls?: string;
    ca?: string;
  }
): Promise<ConnectionInfo> {
  const connId = uuidv4();
  const key = sessionConnectionKey(sessionId, connId);

  const { role } = await newClient(credentials, key);

  // Persist encrypted password in Token DB
  const tokenHash = crypto
    .createHash("sha256")
    .update(`connection:${connId}`)
    .digest("hex");

  try {
    await storeEncryptedCredential({
      tokenHash,
      tokenId: connId,                 // use connId as the Token DB row key
      userId: sessionId,               // links this credential to the session
      username: credentials.username || "default",
      name: `connection:${connId}`,
      role,
      host: credentials.host || "localhost",
      port: credentials.port ? parseInt(credentials.port, 10) : 6379,
      password: credentials.password || "",
      kind: "session",
      tls: credentials.tls === "true",
      ca: credentials.ca,
      expiresAtUnix: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    });
  } catch (storageError) {
    // Clean up the in-memory client that newClient() cached
    const conn = connections.get(key);
    if (conn) {
      connections.delete(key);
      try { await conn.close(); } catch { /* ignore */ }
    }
    throw storageError;
  }

  return {
    id: connId,
    username: credentials.username || "default",
    role,
    host: credentials.host || "localhost",
    port: credentials.port ? parseInt(credentials.port, 10) : 6379,
    tls: credentials.tls === "true",
    ca: credentials.ca,
  };
}

/**
 * Lists all additional connections for a session.
 * Reads from the Token DB where name starts with "connection:".
 */
export async function listSessionConnections(sessionId: string): Promise<ConnectionInfo[]> {
  const storage = StorageFactory.getStorage();
  const tokens = await storage.fetchTokensByUserId(sessionId);
  return tokens
    .filter(t => t.name.startsWith("connection:"))
    .map(t => ({
      id: t.token_id,
      username: t.username,
      role: t.role as Role,
      host: t.host,
      port: t.port,
      tls: t.tls ?? false,
      ca: t.ca || undefined,
    }));
}

/**
 * Removes an additional connection from the session.
 * Closes the FalkorDB client and deletes the Token DB row.
 */
export async function removeSessionConnection(
  sessionId: string,
  connId: string
): Promise<boolean> {
  // Verify the token belongs to this session before deleting
  const storage = StorageFactory.getStorage();
  const tokenData = await storage.fetchTokenById(connId);
  if (!tokenData || tokenData.user_id !== sessionId || !tokenData.name.startsWith("connection:")) {
    return false;
  }

  const key = sessionConnectionKey(sessionId, connId);
  const client = connections.get(key);
  if (client) {
    connections.delete(key);
    try { await client.close(); } catch { /* ignore */ }
  }
  return storage.deleteToken(connId);
}

/**
 * Retrieves the FalkorDB client for a specific additional connection.
 * If the in-memory client is stale, it will be recreated from the Token DB.
 */
async function getConnectionClient(
  sessionId: string,
  connId: string
): Promise<{ client: FalkorDB; connInfo: ConnectionInfo } | null> {
  const key = sessionConnectionKey(sessionId, connId);
  let client = connections.get(key);

  // Health check
  if (client) {
    try {
      const conn = await client.connection;
      await conn.ping();
    } catch {
      // Remove from cache but don't close — another request may still
      // hold a reference. The socket error handler will clean it up.
      connections.delete(key);
      client = undefined;
    }
  }

  if (!client) {
    // Recreate from Token DB
    const storage = StorageFactory.getStorage();
    const tokenData = await storage.fetchTokenById(connId);
    if (!tokenData || !tokenData.is_active || !tokenData.name.startsWith("connection:") || tokenData.user_id !== sessionId) {
      return null;
    }

    const { decrypt } = await import("../encryption");
    // Use `|| undefined` so an empty stored password (no-auth connections)
    // connects anonymously — exactly as the original passwordless login did.
    // Only pass username when a real password is present; otherwise both
    // credentials are omitted so no AUTH command is sent to FalkorDB.
    const password = decrypt(tokenData.encrypted_password) || undefined;
    const username = password ? (tokenData.username || undefined) : undefined;

    const { role, client: newConn } = await newClient(
      {
        host: tokenData.host,
        port: tokenData.port.toString(),
        username,
        password,
        tls: (tokenData.tls ?? false).toString(),
        ca: tokenData.ca || undefined,
      },
      key
    );

    return {
      client: newConn,
      connInfo: {
        id: connId,
        username: tokenData.username,
        role: role as Role,
        host: tokenData.host,
        port: tokenData.port,
        tls: tokenData.tls ?? false,
        ca: tokenData.ca || undefined,
      },
    };
  }

  // Get metadata from Token DB for role/host/port.
  // If the Token DB query fails or the entry is missing, we still have a
  // healthy cached client — return it with minimal info rather than
  // invalidating the session.
  try {
    const storage = StorageFactory.getStorage();
    const tokenData = await storage.fetchTokenById(connId);
    if (!tokenData) {
      // Entry missing but client is alive — use fallback metadata.
      // eslint-disable-next-line no-console
      console.warn("Token DB entry not found for connId (non-fatal, using cached client):", connId);
      return {
        client,
        connInfo: {
          id: connId,
          username: "",
          role: "Read-Write" as Role,
          host: "",
          port: 0,
          tls: false,
        },
      };
    }

    return {
      client,
      connInfo: {
        id: connId,
        username: tokenData.username,
        role: tokenData.role as Role,
        host: tokenData.host,
        port: tokenData.port,
        tls: tokenData.tls ?? false,
        ca: tokenData.ca || undefined,
      },
    };
  } catch (metaErr) {
    // eslint-disable-next-line no-console
    console.warn("Failed to fetch connection metadata (non-fatal, using cached client):", metaErr);
    return {
      client,
      connInfo: {
        id: connId,
        username: "",
        role: "Read-Write" as Role,
        host: "",
        port: 0,
        tls: false,
      },
    };
  }
}

/**
 * Retrieves the X-Connection-Id header from the request, if present.
 */
/**
 * Retrieves the X-Connection-Id from headers or query parameters.
 * SSE/EventSource requests can't set custom headers, so the frontend
 * passes the connectionId as a query param.
 */
function getConnectionIdFromRequest(request: Request): string | null {
  // Try header first
  const fromHeader = request.headers.get("X-Connection-Id");
  if (fromHeader) return fromHeader;

  // Fall back to query parameter (for SSE/EventSource)
  try {
    const url = new URL(request.url);
    return url.searchParams.get("connectionId");
  } catch {
    return null;
  }
}


/**
 * Retrieves the Authorization header from the request
 */
async function getAuthorizationHeader(): Promise<string | null> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    return headersList.get("Authorization");
  } catch (e) {
    // Headers not available, continue with session auth only
    return null;
  }
}

/**
 * Checks if the request requires JWT-only authentication
 */
async function isJWTOnlyRequest(): Promise<boolean> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    return headersList.get("X-JWT-Only") === "true";
  } catch (e) {
    return false;
  }
}

/**
 * Verifies and decodes a JWT token
 */
async function verifyJWTToken(token: string): Promise<CustomJWTPayload> {
  const { jwtVerify } = await import('jose');
  // Validate that the secret is set before encoding — an empty or undefined
  // secret would let jwtVerify succeed with any token (fail-open vulnerability).
  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!authSecret) {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required but not set");
  }
  const secret = new TextEncoder().encode(authSecret);
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as CustomJWTPayload;
}

/**
 * Validates JWT payload structure
 */
function isValidJWTPayload(payload: unknown): payload is CustomJWTPayload {
  const p = payload as Record<string, unknown>;
  return Boolean(p.sub && p.host && p.port);
}

/**
 * Creates a user object from JWT payload
 */
function createUserFromJWTPayload(payload: CustomJWTPayload): AuthenticatedUser {
  return {
    id: payload.sub,
    username: payload.username,
    role: payload.role,
    host: payload.host,
    port: payload.port,
    tls: payload.tls || false,
    ca: payload.ca,
    url: payload.url,
  };
}

/**
 * Attempts JWT authentication and returns client and user if successful
 */
async function tryJWTAuthentication(): Promise<{ client: FalkorDB; user: AuthenticatedUserWithPassword } | null> {
  // Try to get authorization header
  const authorizationHeader = await getAuthorizationHeader();

  // Try JWT authentication first if Authorization header exists
  if (authorizationHeader?.startsWith("Bearer ")) {
    try {
      const token = authorizationHeader.substring(7);
      const payload = await verifyJWTToken(token);
      // Validate JWT payload structure
      if (!isValidJWTPayload(payload)) {
        return null;
      }

      // Validate token is active in FalkorDB (not revoked)
      const tokenActive = await isTokenActive(token);

      if (!tokenActive) {
        // eslint-disable-next-line no-console
        console.warn("JWT authentication failed: token is not active (revoked or expired)");

        // Clean up stale connection to prevent connection leak
        const staleClient = connections.get(payload.sub);
        if (staleClient) {
          connections.delete(payload.sub);
          try {
            await staleClient.close();
          } catch (closeError) {
            // eslint-disable-next-line no-console
            console.warn("Failed to close revoked JWT connection", closeError);
          }
        }
        return null;
      }

      // Resolve password server-side from Token DB (never from the JWT payload).
      // Fail closed: if the jti is known but password resolution fails, the
      // session is unusable downstream (reconnect, URL building, PAT issuance),
      // so we refuse the request rather than returning a partially-authenticated
      // user.
      let password: string;
      try {
        password = await getPasswordFromTokenDB(payload.jti);
      } catch (pwErr) {
        if (pwErr instanceof Error && pwErr.message.includes("ENCRYPTION_KEY")) {
          throw pwErr;
        }
        // eslint-disable-next-line no-console
        console.warn("Failed to resolve JWT credential from Token DB:", pwErr);
        return null;
      }

      // Try to reuse existing connection (performance optimization)
      let client = connections.get(payload.sub);

      if (client) {
        // Health check: verify connection is still alive
        try {
          const connection = await client.connection;
          await connection.ping();

          // Connection is healthy, reuse it
          const user: AuthenticatedUserWithPassword = {
            ...createUserFromJWTPayload(payload),
            password,
          };
          return { client, user };
        } catch (pingError) {
          // Connection is dead, remove from pool and recreate
          // eslint-disable-next-line no-console
          console.warn("Connection health check failed, recreating:", pingError);
          connections.delete(payload.sub);

          try {
            await client.close();
          } catch (closeError) {
            // Ignore close errors on dead connections
          }

          client = undefined; // Will be recreated below
        }
      }

      // No existing connection or health check failed - reconnect with decrypted password
      try {
        // Create new connection with retrieved password
        const { client: reconnectedClient } = await newClient(
          {
            host: payload.host,
            port: payload.port.toString(),
            username: payload.username,
            password,
            tls: payload.tls.toString(),
            ca: payload.ca || undefined,
          },
          payload.sub
        );

        client = reconnectedClient;
        // Connection is already cached in connections Map by newClient()
      } catch (connectionError) {
        // Re-throw ENCRYPTION_KEY errors to surface server misconfigurations
        if (connectionError instanceof Error && connectionError.message.includes("ENCRYPTION_KEY")) {
          throw connectionError;
        }

        // eslint-disable-next-line no-console
        console.error("Failed to create connection from Token DB:", connectionError);

        return null;
      }

      // At this point, client is guaranteed to be defined (either reused or recreated)
      const user: AuthenticatedUserWithPassword = {
        ...createUserFromJWTPayload(payload),
        password,
      };

      return { client, user };
    } catch (error) {
      // Fall back to session auth if JWT fails
      // eslint-disable-next-line no-console
      console.warn("JWT authentication failed, falling back to session:", error);

      return null;
    }
  }

  return null;
}

const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60; // 24 hours; keep in sync with session.maxAge below

const authOptions: NextAuthConfig = {
  // The app performs its own origin validation (isRequestOriginTrusted),
  // so we trust the host unconditionally to avoid v5's strict host check
  // breaking setups where only NEXTAUTH_URL is configured.
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        host: { label: "Host", type: "text", placeholder: "localhost" },
        port: { label: "Port", type: "number", placeholder: "6379" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        tls: { label: "tls", type: "boolean" },
        ca: { label: "ca", type: "string" },
        url: { label: "url", type: "string" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        // In next-auth v5, credential values are `unknown`. Cast to strings.
        const creds = {
          host: (credentials.host as string) || undefined,
          port: (credentials.port as string) || undefined,
          password: (credentials.password as string) || undefined,
          username: (credentials.username as string) || undefined,
          tls: (credentials.tls as string) || undefined,
          ca: (credentials.ca as string) || undefined,
          url: (credentials.url as string) || undefined,
        };

        try {
          // Generate random UUID for this session and its first connection
          const id = uuidv4();
          const connId = uuidv4();
          const key = sessionConnectionKey(id, connId);

          const { role } = await newClient(creds, key);

          // Opportunistically clean up expired tokens from storage.
          // Non-blocking: fire-and-forget so login isn't delayed.
          StorageFactory.getStorage().cleanupExpiredTokens?.().catch(() => {});

          // Store the connection entry in Token DB. Every connection
          // (including the initial login) is stored as a "connection:"
          // entry so they all appear in listSessionConnections and are
          // treated equally.
          try {
            const tokenHash = crypto
              .createHash("sha256")
              .update(`connection:${connId}`)
              .digest("hex");

            await storeEncryptedCredential({
              tokenHash,
              tokenId: connId,
              userId: id,
              username: creds.username || "default",
              name: `connection:${connId}`,
              role,
              host: creds.host || "localhost",
              port: creds.port ? parseInt(creds.port, 10) : 6379,
              password: creds.password || "",
              kind: 'session',
              tls: creds.tls === "true",
              ca: creds.url ? undefined : creds.ca,
              expiresAtUnix: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
            });
          } catch (storageError) {
            // eslint-disable-next-line no-console
            console.error(
              "Failed to persist connection credential; aborting login:",
              storageError
            );
            const conn = connections.get(key);
            if (conn) {
              connections.delete(key);
              try { await conn.close(); } catch { /* ignore */ }
            }
            return null;
          }

          const res: User = {
            id,
            connId,
            url: creds.url || "",
            host: creds.host || "localhost",
            port: creds.port ? parseInt(creds.port, 10) : 6379,
            username: creds.username || "default",
            tls: creds.tls === "true",
            ca: creds.url ? undefined : creds.ca,
            role,
          };
          return res;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("FalkorDB Client Connect Error", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        // Store only the active connection's flat fields + its ID.
        // The full list of connections lives in the Token DB and is
        // fetched via GET /api/connections — never stored in the JWT.
        // IMPORTANT: Only keep the minimal set of fields to prevent
        // cookie bloat (Vercel 494 error). Do NOT spread ...token here.
        return {
          // NextAuth required fields (iat/exp/jti are added automatically)
          sub: user.id,
          // Our custom fields
          id: user.id,
          activeConnectionId: user.connId!,
          host: user.host,
          port: user.port,
          username: user.username || "default",
          role: user.role,
          tls: user.tls,
        };
      }

      // ── Strip any accumulated bloat from old tokens ──
      // Remove fields that are no longer needed and inflate the cookie.
      // These may have been set by old code or NextAuth defaults.
      // Save credentialRef before deletion — needed for legacy migration below.
      const legacyCredentialRef = token.credentialRef as string | undefined;

      // If the token still carries a connections[] array (from old code that
      // stored all connections in the JWT), extract the active connection's
      // flat fields BEFORE deleting the array so we don't lose them.
      if (token.connections) {
        const conns = token.connections as Array<{ id: string; username?: string; role: string; host: string; port: number; tls: boolean }>;
        const activeId = token.activeConnectionId as string | undefined;
        const activeConn = activeId ? conns.find(c => c.id === activeId) : conns[0];
        if (activeConn) {
          token.host = activeConn.host;
          token.port = activeConn.port;
          token.username = activeConn.username || "default";
          token.role = activeConn.role;
          token.tls = activeConn.tls;
          if (!token.activeConnectionId) {
            token.activeConnectionId = activeConn.id;
          }
        }
      }

      delete token.connections;
      delete token.name;
      delete token.email;
      delete token.picture;
      delete token.image;
      delete token.ca;          // CA certs are large; stored in Token DB
      delete token.url;         // Connection URL; stored in Token DB
      delete token.credentialRef; // Legacy field replaced by Token DB

      // ── Migrate old flat-format JWT tokens that have no activeConnectionId ──
      // Old tokens have host/port/username/role/tls directly on the token
      // but no activeConnectionId. Persist the connection to Token DB so
      // GET /api/connections returns it immediately.
      if (!token.activeConnectionId && token.host) {
        const legacyConnId = uuidv4();
        const sessionId = token.id as string;
        const connHost = (token.host as string) || "localhost";
        const connPort = typeof token.port === "string" ? parseInt(token.port, 10) : (token.port as number) || 6379;
        const connUsername = (token.username as string) || "default";
        const connRole = (token.role as string) || "Read-Only";
        const connTls = token.tls as boolean;

        token.activeConnectionId = legacyConnId;

        // Persist to Token DB so the connection appears in the connections
        // list before any API call triggers the getClient() legacy fallback.
        try {
          let password = "";
          if (legacyCredentialRef) {
            try {
              password = await getPasswordFromTokenDB(legacyCredentialRef);
            } catch { /* passwordless fallback — leave password empty */ }
          }

          const tokenHash = crypto
            .createHash("sha256")
            .update(`connection:${legacyConnId}`)
            .digest("hex");

          await storeEncryptedCredential({
            tokenHash,
            tokenId: legacyConnId,
            userId: sessionId,
            username: connUsername,
            name: `connection:${legacyConnId}`,
            role: connRole,
            host: connHost,
            port: connPort,
            password,
            kind: "session",
            tls: connTls,
            expiresAtUnix: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
          });

          // Move old in-memory client (stored under bare session ID)
          // to the new connection-key format so getClient() finds it.
          const oldClient = connections.get(sessionId);
          if (oldClient) {
            const newKey = sessionConnectionKey(sessionId, legacyConnId);
            connections.delete(sessionId);
            connections.set(newKey, oldClient);
          }
        } catch (migrateErr) {
          // Non-fatal: getClient() legacy fallback will retry persistence.
          // eslint-disable-next-line no-console
          console.warn("JWT migration: failed to persist connection to Token DB:", migrateErr);
        }
      }

      // Handle session.update() calls from the frontend.
      // Only activeConnectionId is sent; we look up the connection details
      // from Token DB to keep the token small.
      if (trigger === "update" && updateData) {
        if (updateData.activeConnectionId !== undefined) {
          const newConnId = updateData.activeConnectionId as string;
          token.activeConnectionId = newConnId;

          // Look up the connection details from Token DB
          try {
            const storage = StorageFactory.getStorage();
            const tokenData = await storage.fetchTokenById(newConnId);
            if (tokenData && tokenData.name.startsWith("connection:")) {
              token.host = tokenData.host;
              token.port = tokenData.port;
              token.username = tokenData.username || "default";
              token.role = tokenData.role;
              token.tls = tokenData.tls ?? false;
            }
          } catch (lookupErr) {
            // Non-fatal: session.user will use stale values until next refresh
            // eslint-disable-next-line no-console
            console.warn("JWT update: failed to look up connection from Token DB:", lookupErr);
          }
        }
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, token }) {
      if (session.user) {
        const activeId = token.activeConnectionId as string | undefined;

        return {
          ...session,
          activeConnectionId: activeId,
          user: {
            ...session.user,
            id: token.id as string,
            host: (token.host as string | undefined) ?? "localhost",
            port: (typeof token.port === "string" ? parseInt(token.port, 10) : (token.port as number | undefined)) ?? 6379,
            username: (token.username as string | undefined) ?? "default",
            tls: (token.tls as boolean | undefined) ?? false,
            role: ((token.role as string | undefined) ?? "Read-Only") as Role,
          },
        };
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const t = ("token" in message ? message.token : null) as Record<string, unknown> | null;
      const id = t?.id as string | undefined;

      if (id) {
        // Close all connections belonging to this session
        // and remove their Token DB rows.
        try {
          const storage = StorageFactory.getStorage();
          const allTokens = await storage.fetchTokensByUserId(id);
          const connTokens = allTokens.filter(tk => tk.name.startsWith("connection:"));
          await Promise.all(connTokens.map(async (tk) => {
            const key = sessionConnectionKey(id, tk.token_id);
            const c = connections.get(key);
            if (c) {
              connections.delete(key);
              try { await c.close(); } catch { /* ignore */ }
            }
            try { await storage.deleteToken(tk.token_id); } catch { /* ignore */ }
          }));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Failed to clean up connections on signOut:", e);
        }
      }
    },
  },
};

/**
 * Replacement for getServerSession (which doesn't exist in next-auth v5).
 * Uses getToken to read the JWT and builds a session-like object.
 */
export async function getSessionFromRequest(
  request: Request
): Promise<{ user: User; activeConnectionId?: string } | null> {
  const token = await getToken({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: request as any,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: shouldUseSecureCookies(request),
  });

  if (!token?.sub) return null;

  return {
    user: {
      id: (token.id as string) || token.sub,
      role: ((token.role as string) || "Read-Only") as Role,
      host: (token.host as string) || "localhost",
      port: (typeof token.port === "string" ? parseInt(token.port, 10) : (token.port as number)) || 6379,
      username: (token.username as string) || "default",
      tls: (token.tls as boolean) ?? false,
      url: "",
    },
    activeConnectionId: token.activeConnectionId as string | undefined,
  };
}

/**
 * Per-key mutex for connection resolution.
 * Ensures only one request at a time can resolve/reconnect a given connection key.
 * Subsequent requests for the same key wait for the first to finish, then reuse the result.
 */
const connectionLocks = new Map<string, Promise<unknown>>();

/** Maximum time (ms) to wait for an in-flight lock before giving up and proceeding. */
const LOCK_WAIT_TIMEOUT_MS = 10_000;

async function withConnectionLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  // Use a promise-chain approach to guarantee exclusive execution.
  // Reading the current tail and immediately installing our chained promise
  // is synchronous — there is no await between the two steps — so there is
  // no TOCTOU window where two callers can both see an empty slot and both
  // call fn() concurrently.
  const previous = connectionLocks.get(key) ?? Promise.resolve<unknown>(undefined);

  // Chain fn() so it runs only after the previous occupant finishes.
  // We wrap fn() with a timeout so a hung previous caller cannot block
  // subsequent callers indefinitely.
  const chain: Promise<T> = Promise.race([
    previous,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("lock timeout")), LOCK_WAIT_TIMEOUT_MS)
    ),
  ])
    .catch(() => {
      // eslint-disable-next-line no-console
      console.warn("Connection lock wait timed out for key:", key, "— proceeding without lock");
    })
    .then(() => fn())
    .finally(() => {
      // Only clean up if our chain is still the current tail so a newer
      // waiter that replaced us doesn't accidentally clear its own lock.
      if (connectionLocks.get(key) === chain) {
        connectionLocks.delete(key);
      }
    }) as Promise<T>;

  // Install atomically before any await so no concurrent caller can slip in.
  connectionLocks.set(key, chain);
  return chain;
}

export async function getClient(
  request: Request
): Promise<
  | NextResponse
  | { client: FalkorDB; user: AuthenticatedUserWithPassword }
> {
  if (!isRequestOriginTrusted(request)) {
    return rejectUntrustedOrigin(request);
  }

  // Check if this is a JWT-only request (from /docs)
  const jwtOnlyRequired = await isJWTOnlyRequest();

  // Try JWT authentication first
  const jwtResult = await tryJWTAuthentication();
  if (jwtResult) {
    return jwtResult;
  }

  // If JWT-only is required and JWT failed, return 401 immediately
  if (jwtOnlyRequired) {
    return NextResponse.json({
      message: "JWT authentication required for API documentation. Please use the login endpoint to get a token and authorize in Swagger UI."
    }, { status: 401, headers: getCorsHeaders(request) });
  }

  // Fall back to session authentication for regular app requests
  const session = await getSessionFromRequest(request);
  const id = session?.user.id;

  if (!id) {
    // eslint-disable-next-line no-console
    console.warn("getClient: returning 401 — session has no user id");
    return NextResponse.json({ message: "Not authenticated" }, { status: 401, headers: getCorsHeaders(request) });
  }

  // The frontend sends the active connection ID via X-Connection-Id
  // header (or connectionId query param for SSE).
  //
  // When no header is present, fall back to the Token DB connection list.
  // If session.activeConnectionId (from the JWT) matches one of the Token DB
  // entries, prefer it over the default (newest-first) order — but ONLY if it
  // actually exists in the Token DB. This prevents a stale session.activeConnectionId
  // (e.g. after another test signs out and deletes connections) from bypassing
  // the legacy reconnect fallback and triggering an unexpected SESSION_INVALID.
  let connId = getConnectionIdFromRequest(request);

  if (!connId) {
    try {
      const storage = StorageFactory.getStorage();
      const allTokens = await storage.fetchTokensByUserId(id);
      const connTokens = allTokens.filter(t => t.name.startsWith("connection:"));
      if (connTokens.length > 0) {
        // Default: first entry from Token DB
        connId = connTokens[0].token_id;
        // Prefer session.activeConnectionId if it exists in the Token DB list
        // (ensures the correct connection is used after a switch, even when
        // the Token DB sort order would pick a different entry).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessionActiveId = (session as any).activeConnectionId as string | undefined;
        if (sessionActiveId && connTokens.some(t => t.token_id === sessionActiveId)) {
          connId = sessionActiveId;
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to look up session connections from Token DB:", e);
    }
  }

  if (!connId) {
    // ── Legacy session fallback ──
    // Old sessions (before multi-connection) stored the FalkorDB client
    // keyed by session ID and credentials via `credentialRef` in the JWT.
    // Try to reuse the old-style connection so users don't get kicked out.
    return withConnectionLock(id, async () => {
    try {
      const jwt = await getToken({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: request as any,
        secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
        secureCookie: shouldUseSecureCookies(request),
      });
      const credentialRef = jwt?.credentialRef as string | undefined;

      // Resolve the password: either from Token DB (if credentialRef exists)
      // or undefined (passwordless connection, e.g. default local FalkorDB).
      let password: string | undefined;
      if (credentialRef) {
        try {
          password = await getPasswordFromTokenDB(credentialRef);
        } catch (pwErr) {
          // Non-fatal: Token DB may be temporarily unavailable (e.g. due
          // to server-wide config changes). Proceed with undefined password
          // which works for passwordless connections (common in dev/CI).
          // eslint-disable-next-line no-console
          console.warn("Legacy password resolution failed (non-fatal):", pwErr);
        }
      }

      // Migrate the legacy connection into the new connection-key
      // scheme so it appears in listSessionConnections() and all
      // subsequent requests go through the normal path.
      const legacyConnId = uuidv4();
      const legacyKey = sessionConnectionKey(id, legacyConnId);

      // Check for a live connection stored under the old key (session ID)
      let client = connections.get(id);
      if (client) {
        try {
          const conn = await client.connection;
          await conn.ping();
          // Move from old key to new connection-keyed entry
          connections.delete(id);
          connections.set(legacyKey, client);
        } catch {
          connections.delete(id);
          client = undefined;
        }
      }

      // actualRole tracks the role determined by newClient() (via aclGetUser)
      // so we always store and return the REAL FalkorDB role, not the
      // potentially-stale session.user.role which defaults to "Read-Only"
      // before the JWT migration has run.
      let actualRole: Role = session.user.role;

      if (!client) {
        // Reconnect using session user credentials
        const { user } = session;
        // Only pass username when password is present; otherwise omit both
        // so no AUTH command is sent to passwordless FalkorDB instances.
        const legacyUsername = password ? (user.username || undefined) : undefined;
        const { client: reconnected, role: reconnectedRole } = await newClient(
          {
            host: user.host,
            port: user.port.toString(),
            username: legacyUsername,
            password,
            tls: user.tls.toString(),
          },
          legacyKey
        );
        client = reconnected;
        actualRole = reconnectedRole;
      }

      // Persist the migrated connection in Token DB so it shows up
      // in listSessionConnections and future getClient calls use the
      // normal connection-token path instead of this legacy fallback.
      try {
        const tokenHash = crypto
          .createHash("sha256")
          .update(`connection:${legacyConnId}`)
          .digest("hex");

        await storeEncryptedCredential({
          tokenHash,
          tokenId: legacyConnId,
          userId: id,
          username: session.user.username || "default",
          name: `connection:${legacyConnId}`,
          role: actualRole,
          host: session.user.host || "localhost",
          port: session.user.port || 6379,
          password: password || "",
          kind: "session",
          tls: session.user.tls ?? false,
          expiresAtUnix: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
        });
      } catch (persistErr) {
        // Non-fatal: the connection works in-memory; it just won't
        // appear in listSessionConnections until next login.
        // eslint-disable-next-line no-console
        console.warn("Failed to persist legacy connection to Token DB:", persistErr);
      }

      return {
        client,
        user: {
          id,
          username: session.user.username,
          role: actualRole,
          host: session.user.host,
          port: session.user.port,
          tls: session.user.tls,
          password,
        },
      };
    } catch (legacyErr) {
      // eslint-disable-next-line no-console
      console.warn("Legacy session fallback failed:", legacyErr);
    }
    // eslint-disable-next-line no-console
    console.warn("getClient: returning SESSION_INVALID (legacy path) for session:", id);
    return NextResponse.json(
      { message: "No active connection. Please sign in again.", code: "SESSION_INVALID" },
      {
        status: 401,
        headers: {
          ...getCorsHeaders(request),
          "X-Session-Invalid": "1",
        },
      }
    );
    });
  }

  // All connections (including the initial login one) go through the
  // same path: look up the token from the DB, health-check the cached
  // client, and reconnect if necessary.
  //
  // Fast path (no lock): if the connection is already in the cache and
  // healthy, return it immediately. This avoids serializing every
  // concurrent request for the same user through the lock, which would
  // add latency when multiple browser tabs / parallel tests share a
  // session.
  const connKey = sessionConnectionKey(id, connId);
  const cachedClient = connections.get(connKey);
  if (cachedClient) {
    try {
      const conn = await cachedClient.connection;
      await conn.ping();
      // Cache hit + healthy → return without lock
      const connUser: AuthenticatedUserWithPassword = {
        id,
        username: "",
        role: "Read-Write" as Role,
        host: "",
        port: 0,
        tls: false,
        password: undefined,
      };
      try {
        const storage = StorageFactory.getStorage();
        const tokenData = await storage.fetchTokenById(connId);
        if (tokenData) {
          connUser.username = tokenData.username;
          connUser.role = tokenData.role as Role;
          connUser.host = tokenData.host;
          connUser.port = tokenData.port;
          connUser.tls = tokenData.tls ?? false;
          if (tokenData.encrypted_password) {
            const { decrypt } = await import("../encryption");
            connUser.password = decrypt(tokenData.encrypted_password) || undefined;
          }
        }
      } catch {
        // Non-fatal: metadata lookup failed but connection works
      }
      return { client: cachedClient, user: connUser };
    } catch {
      // Health check failed — fall through to locked recreation path.
      // Only remove from cache; do NOT close the client here because
      // another concurrent request may still hold a reference to it.
      // The underlying socket error handler or GC will clean it up.
      connections.delete(connKey);
    }
  }

  // Slow path (with lock): connection is not in the cache or unhealthy.
  // Use the lock to prevent multiple simultaneous recreation attempts.
  return withConnectionLock(connKey, async () => {
  try {
    const connResult = await getConnectionClient(id, connId);
    if (connResult) {
      const connUser: AuthenticatedUserWithPassword = {
        id,
        username: connResult.connInfo.username,
        role: connResult.connInfo.role,
        host: connResult.connInfo.host,
        port: connResult.connInfo.port,
        tls: connResult.connInfo.tls,
        password: undefined,
      };
      try {
        const { decrypt } = await import("../encryption");
        const storage = StorageFactory.getStorage();
        const tokenData = await storage.fetchTokenById(connId);
        if (tokenData?.encrypted_password) {
          connUser.password = decrypt(tokenData.encrypted_password) || undefined;
        }
      } catch (pwErr) {
        // eslint-disable-next-line no-console
        console.warn("Failed to resolve connection password (non-fatal):", pwErr);
      }
      return { client: connResult.client, user: connUser };
    }
  } catch (connErr) {
    if (connErr instanceof Error && connErr.message.includes("ENCRYPTION_KEY")) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500, headers: getCorsHeaders(request) }
      );
    }
    // eslint-disable-next-line no-console
    console.warn("Failed to resolve connection:", connErr);
  }

  // Before returning SESSION_INVALID, attempt a direct reconnect using session
  // credentials. This handles transient Token DB issues without accumulating
  // new Token DB entries (the connection is stored in cache only).
  try {
    const { user: sessionUser } = session;
    // Try to resolve password from Token DB (best-effort; works without for
    // passwordless connections which are common in dev/CI).
    let reconnectPassword: string | undefined;
    try {
      const { decrypt } = await import("../encryption");
      const storage = StorageFactory.getStorage();
      const tokenData = await storage.fetchTokenById(connId);
      if (tokenData?.encrypted_password) {
        reconnectPassword = decrypt(tokenData.encrypted_password) || undefined;
      }
    } catch { /* proceed without password */ }
    const reconnectUsername = reconnectPassword ? (sessionUser.username || undefined) : undefined;
    const { client: reconnected, role: reconnectedRole } = await newClient(
      {
        host: sessionUser.host,
        port: sessionUser.port.toString(),
        username: reconnectUsername,
        password: reconnectPassword,
        tls: sessionUser.tls.toString(),
      },
      connKey
    );
    return {
      client: reconnected,
      user: {
        id,
        username: sessionUser.username,
        role: reconnectedRole,
        host: sessionUser.host,
        port: sessionUser.port,
        tls: sessionUser.tls,
        password: reconnectPassword,
      },
    };
  } catch (reconnectErr) {
    // eslint-disable-next-line no-console
    console.warn("connId reconnect fallback failed:", reconnectErr);
  }

  // eslint-disable-next-line no-console
  console.warn("getClient: returning SESSION_INVALID (connId path) for session:", id, "connId:", connId);
  return NextResponse.json(
    { message: "Connection could not be resolved; please sign in again.", code: "SESSION_INVALID" },
    {
      status: 401,
      headers: {
        ...getCorsHeaders(request),
        "X-Session-Invalid": "1",
      },
    }
  );
  });
}

export default authOptions;
