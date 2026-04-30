import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions, Role, User, getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { FalkorDB, type FalkorDBOptions } from "falkordb";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { getToken } from "next-auth/jwt";
import StorageFactory from "@/lib/token-storage/StorageFactory";
import { getCorsHeaders } from "../../utils";
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

const connections = new Map<string, FalkorDB>();

/**
 * Returns the map key for a connection.
 * All connections use the format: sessionId:connectionId
 */
function connectionKey(sessionId: string, connectionId: string): string {
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
    // Close coonection on error and remove from connections map
    // eslint-disable-next-line no-console
    console.error("FalkorDB Client Error", err);
    const connection = connections.get(id);
    if (connection) {
      connections.delete(id);
      connection.close().catch((e) => {
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
  const key = connectionKey(sessionId, connId);

  const { role } = await newClient(credentials, key);

  // Persist encrypted password in Token DB with kind='connection'
  const credentialRef = generateTimeUUID();
  const tokenHash = crypto
    .createHash("sha256")
    .update(`connection:${credentialRef}`)
    .digest("hex");

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
    kind: "connection" as "session",  // piggy-back on TokenKind; we filter by name prefix
    expiresAtUnix: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  });

  return {
    id: connId,
    username: credentials.username,
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
      tls: false,   // tls is not stored in TokenData; the client will reconnect with correct params
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
  const key = connectionKey(sessionId, connId);
  const client = connections.get(key);
  if (client) {
    connections.delete(key);
    try { await client.close(); } catch { /* ignore */ }
  }
  const storage = StorageFactory.getStorage();
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
  const key = connectionKey(sessionId, connId);
  let client = connections.get(key);

  // Health check
  if (client) {
    try {
      const conn = await client.connection;
      await conn.ping();
    } catch {
      connections.delete(key);
      try { await client.close(); } catch { /* ignore */ }
      client = undefined;
    }
  }

  if (!client) {
    // Recreate from Token DB
    const storage = StorageFactory.getStorage();
    const tokenData = await storage.fetchTokenById(connId);
    if (!tokenData || !tokenData.is_active || !tokenData.name.startsWith("connection:")) {
      return null;
    }

    const { decrypt } = await import("../encryption");
    const password = decrypt(tokenData.encrypted_password);

    const { role, client: newConn } = await newClient(
      {
        host: tokenData.host,
        port: tokenData.port.toString(),
        username: tokenData.username,
        password,
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
        tls: false,
      },
    };
  }

  // Get metadata from Token DB for role/host/port
  const storage = StorageFactory.getStorage();
  const tokenData = await storage.fetchTokenById(connId);
  if (!tokenData) return null;

  return {
    client,
    connInfo: {
      id: connId,
      username: tokenData.username,
      role: tokenData.role as Role,
      host: tokenData.host,
      port: tokenData.port,
      tls: false,
    },
  };
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
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
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

const authOptions: AuthOptions = {
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

        try {
          // Generate random UUID for this session and its first connection
          const id = uuidv4();
          const connId = uuidv4();
          const key = connectionKey(id, connId);

          const { role } = await newClient(credentials, key);

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
              username: credentials.username || "default",
              name: `connection:${connId}`,
              role,
              host: credentials.host || "localhost",
              port: credentials.port ? parseInt(credentials.port, 10) : 6379,
              password: credentials.password || "",
              kind: 'session',
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
            url: credentials.url,
            host: credentials.host || "localhost",
            port: credentials.port ? parseInt(credentials.port, 10) : 6379,
            username: credentials.username,
            tls: credentials.tls === "true",
            ca: credentials.url ? undefined : credentials.ca,
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
        // Build the initial connections array with the first connection
        const firstConnection = {
          id: user.connId!,
          username: user.username,
          role: user.role,
          host: user.host,
          port: user.port,
          tls: user.tls,
        };

        return {
          ...token,
          id: user.id,
          connections: [firstConnection],
          activeConnectionId: user.connId!,
        };
      }

      // Handle session.update() calls from the frontend
      if (trigger === "update" && updateData) {
        if (updateData.connections !== undefined) {
          token.connections = updateData.connections;
        }
        if (updateData.activeConnectionId !== undefined) {
          token.activeConnectionId = updateData.activeConnectionId;
        }
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, token }) {
      if (session.user) {
        const conns = token.connections as Array<{ id: string; username?: string; role: string; host: string; port: number; tls: boolean }> | undefined;
        const activeId = token.activeConnectionId as string | undefined;
        const activeConn = activeId ? conns?.find(c => c.id === activeId) : conns?.[0];

        return {
          ...session,
          connections: conns,
          activeConnectionId: activeId,
          user: {
            ...session.user,
            id: token.id as string,
            host: activeConn?.host ?? "localhost",
            port: activeConn?.port ?? 6379,
            username: activeConn?.username ?? "default",
            tls: activeConn?.tls ?? false,
            role: (activeConn?.role ?? "Read-Only") as Role,
          },
        };
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      const t = token as Record<string, unknown> | null;
      const id = t?.id as string | undefined;

      if (id) {
        // Close all connections belonging to this session
        // and remove their Token DB rows.
        try {
          const storage = StorageFactory.getStorage();
          const allTokens = await storage.fetchTokensByUserId(id);
          const connTokens = allTokens.filter(tk => tk.name.startsWith("connection:"));
          await Promise.all(connTokens.map(async (tk) => {
            const key = connectionKey(id, tk.token_id);
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

export async function getClient(
  request: Request
): Promise<
  | NextResponse
  | { client: FalkorDB; user: AuthenticatedUserWithPassword }
> {
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
  const session = await getServerSession(authOptions);
  const id = session?.user.id;

  if (!id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401, headers: getCorsHeaders(request) });
  }

  // The frontend sends the active connection ID via X-Connection-Id
  // header (or connectionId query param for SSE). If not provided
  // (e.g. first requests before the frontend has fetched the connection
  // list), fall back to the most recent connection stored in Token DB.
  let connId = getConnectionIdFromRequest(request);

  if (!connId) {
    try {
      const storage = StorageFactory.getStorage();
      const allTokens = await storage.fetchTokensByUserId(id);
      const connTokens = allTokens.filter(t => t.name.startsWith("connection:"));
      if (connTokens.length > 0) {
        connId = connTokens[connTokens.length - 1].token_id;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to look up session connections from Token DB:", e);
    }
  }

  if (!connId) {
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
  }

  // All connections (including the initial login one) go through the
  // same path: look up the token from the DB, health-check the cached
  // client, and reconnect if necessary.
  try {
    const connResult = await getConnectionClient(id, connId);
    if (connResult) {
      const { decrypt } = await import("../encryption");
      const storage = StorageFactory.getStorage();
      const tokenData = await storage.fetchTokenById(connId);
      let connPassword: string | undefined;
      if (tokenData?.encrypted_password) {
        connPassword = decrypt(tokenData.encrypted_password);
      }
      const connUser: AuthenticatedUserWithPassword = {
        id,
        username: connResult.connInfo.username,
        role: connResult.connInfo.role,
        host: connResult.connInfo.host,
        port: connResult.connInfo.port,
        tls: connResult.connInfo.tls,
        password: connPassword,
      };
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
}

export default authOptions;
