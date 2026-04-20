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
            checkServerIdentity: () => undefined,
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

const authOptions: AuthOptions = {
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
          // Generate random UUID for this session
          const id = uuidv4();

          const { role } = await newClient(credentials, id);

          // Persist the password encrypted in the Token DB and keep only an
          // opaque credentialRef in the JWT. The password itself never enters
          // the JWT, the NextAuth session, or any client-visible payload.
          let credentialRef: string | undefined;
          if (credentials.password) {
            try {
              credentialRef = generateTimeUUID();
              const tokenHash = crypto
                .createHash("sha256")
                .update(`session:${credentialRef}`)
                .digest("hex");

              await storeEncryptedCredential({
                tokenHash,
                tokenId: credentialRef,
                userId: id,
                username: credentials.username || "default",
                name: `session:${id}`,
                role,
                host: credentials.host || "localhost",
                port: credentials.port ? parseInt(credentials.port, 10) : 6379,
                password: credentials.password,
                kind: 'session',
              });
            } catch (storageError) {
              // eslint-disable-next-line no-console
              console.error(
                "Failed to persist session credential; aborting login:",
                storageError
              );
              const conn = connections.get(id);
              if (conn) {
                connections.delete(id);
                try { await conn.close(); } catch { /* ignore */ }
              }
              return null;
            }
          }

          const res: User = {
            id,
            url: credentials.url,
            host: credentials.host || "localhost",
            port: credentials.port ? parseInt(credentials.port, 10) : 6379,
            credentialRef,
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
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          host: user.host,
          port: user.port,
          credentialRef: user.credentialRef,
          username: user.username,
          tls: user.tls,
          ca: user.ca,
          role: user.role,
          url: user.url,
        };
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, token }) {
      if (session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
            host: token.host as string,
            port: parseInt(token.port as string, 10),
            username: token.username as string,
            tls: token.tls as boolean,
            ca: token.ca,
            role: token.role as Role,
            url: token.url as string | undefined,
          },
        };
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      const t = token as Record<string, unknown> | null;
      const credentialRef = t?.credentialRef as string | undefined;
      const id = t?.id as string | undefined;

      // Session credentials are ephemeral and have no audit value beyond
      // the session itself, so we hard-delete the Token DB row on sign-out
      // rather than soft-revoking it (which is the PAT behavior).
      if (credentialRef) {
        try {
          const storage = StorageFactory.getStorage();
          await storage.deleteToken(credentialRef);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Failed to delete session credential on signOut:", e);
        }
      }

      if (id) {
        const conn = connections.get(id);
        if (conn) {
          connections.delete(id);
          try { await conn.close(); } catch { /* ignore */ }
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

  const { user } = session;

  // Resolve the password server-side from the Token DB via the JWT's
  // credentialRef. The password is never stored in the session/JWT payload.
  // Fail closed: if the session was minted with a credentialRef but we cannot
  // resolve it, refuse the request instead of continuing with an undefined
  // password (which would break chat URL building and could mint empty-
  // password PATs).
  let password: string | undefined;
  try {
    const jwt = await getToken({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const credentialRef = jwt?.credentialRef as string | undefined;
    if (credentialRef) {
      try {
        password = await getPasswordFromTokenDB(credentialRef);
      } catch (pwErr) {
        if (pwErr instanceof Error && pwErr.message.includes("ENCRYPTION_KEY")) {
          throw pwErr;
        }
        // eslint-disable-next-line no-console
        console.warn("Failed to resolve session credential from Token DB:", pwErr);
        return NextResponse.json(
          { message: "Session credential could not be resolved; please sign in again.", code: "SESSION_INVALID" },
          {
            status: 401,
            headers: {
              ...getCorsHeaders(request),
              "X-Session-Invalid": "1",
            },
          }
        );
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("ENCRYPTION_KEY")) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500, headers: getCorsHeaders(request) }
      );
    }
    // eslint-disable-next-line no-console
    console.warn("Failed to read JWT for session credential lookup:", err);
  }

  const userWithPassword: AuthenticatedUserWithPassword = { ...user, password };

  let connection = connections.get(id);

  // Health check: if connection exists, verify it's still alive
  if (connection) {
    try {
      const conn = await connection.connection;
      await conn.ping();

      // Connection is healthy, reuse it
      return { client: connection, user: userWithPassword };
    } catch (pingError) {
      // Connection is dead, remove from pool and recreate
      // eslint-disable-next-line no-console
      console.warn("Session connection health check failed, recreating:", pingError);
      connections.delete(id);

      try {
        await connection.close();
      } catch (closeError) {
        // Ignore close errors on dead connections
      }

      connection = undefined; // Will be recreated below
    }
  }

  // No existing connection or health check failed - create new one
  const { client } = await newClient(
    {
      host: user.host,
      port: (user.port || 6379).toString(),
      username: user.username,
      password,
      tls: String(user.tls),
      ca: user.ca,
      url: user.url,
    },
    user.id
  );

  return { client, user: userWithPassword };
}

export default authOptions;
