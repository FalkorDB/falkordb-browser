import { FalkorDB } from "falkordb";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions, Role, User, getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { FalkorDBOptions } from "falkordb/dist/src/falkordb";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { isTokenActive } from "../tokenUtils";
import { decrypt } from "../encryption";

interface CustomJWTPayload {
  sub: string;
  username?: string;
  role: Role;
  host: string;
  port: number;
  tls: boolean;
  ca?: string;
  url?: string;
  pwd?: string; // Encrypted password for connection recreation
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
}

const connections = new Map<string, FalkorDB>();

// Admin connection for token management operations
let adminConnectionForTokens: FalkorDB | null = null;

/**
 * Gets or creates an Admin Redis connection for token management
 * This connection is used to store/retrieve/delete tokens for all users
 * since non-admin users don't have SET/GET/DEL permissions
 */
export async function getAdminConnectionForTokens(
  host: string = "localhost",
  port: number = 6379,
  tls: boolean = false,
  ca?: string
): Promise<FalkorDB> {
  // Return existing connection if available
  if (adminConnectionForTokens) {
    try {
      // Test if connection is still alive
      const connection = await adminConnectionForTokens.connection;
      await connection.ping();
      return adminConnectionForTokens;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Admin token connection is dead, recreating:", err);
      adminConnectionForTokens = null;
    }
  }

  // Create new Admin connection
  // Note: Default user has "nopass" so we don't provide credentials
  const connectionOptions: FalkorDBOptions = tls
    ? {
        socket: {
          host,
          port,
          tls: true,
          checkServerIdentity: () => undefined,
          ca: ca ? [Buffer.from(ca, "base64").toString("utf8")] : undefined,
        },
        username: undefined,
        password: undefined,
      }
    : {
        socket: {
          host,
          port,
        },
        username: undefined,
        password: undefined,
      };

  adminConnectionForTokens = await FalkorDB.connect(connectionOptions);
  
  // Verify this is actually an admin connection
  try {
    const connection = await adminConnectionForTokens.connection;
    await connection.aclGetUser("default");
  } catch (err) {
    throw new Error("Failed to create admin connection for token management. The default user must have admin privileges.");
  }

  return adminConnectionForTokens;
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
      // eslint-disable-next-line no-console
      console.debug("user is not admin", err);
    } else throw err;
  }

  try {
    await connection.sendCommand(["GRAPH.QUERY"]);
  } catch (err) {
    if ((err as Error).message.includes("permissions")) {
      // eslint-disable-next-line no-console
      console.debug("user is read-only", err);
      return { role: "Read-Only", client };
    }
    // eslint-disable-next-line no-console
    console.debug("user is read-write", err);
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
 * Creates a new FalkorDB connection from JWT payload
 * Decrypts the password from the JWT and establishes connection
 * @param payload - JWT payload containing encrypted credentials
 * @returns FalkorDB client instance
 */
async function createConnectionFromJWT(payload: CustomJWTPayload): Promise<FalkorDB> {
  // Decrypt password from JWT
  if (!payload.pwd) {
    throw new Error('JWT does not contain encrypted password. Cannot create connection.');
  }
  
  const password = decrypt(payload.pwd);
  
  // Create connection using newClient
  const { client } = await newClient(
    {
      host: payload.host,
      port: payload.port.toString(),
      username: payload.username || '',
      password,
      tls: payload.tls.toString(),
      ca: payload.ca || undefined,
    },
    payload.sub
  );
  
  return client;
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
async function tryJWTAuthentication(): Promise<{ client: FalkorDB; user: AuthenticatedUser } | null> {
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
          const user = createUserFromJWTPayload(payload);
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

      // No existing connection or health check failed - create new connection from JWT
      if (!client) {
        // eslint-disable-next-line no-console
        console.log("Creating new FalkorDB connection from JWT for user:", payload.sub);
        
        try {
          client = await createConnectionFromJWT(payload);
          // Connection is already cached in connections Map by newClient()
        } catch (connectionError) {
          // eslint-disable-next-line no-console
          console.error("Failed to create connection from JWT:", connectionError);
          return null;
        }
      }

      const user = createUserFromJWTPayload(payload);
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
          // Use consistent user ID instead of random UUID
          // Extract host/port from URL if provided, otherwise use host/port fields
          let hostname: string;
          let port: number;
          let username: string;

          if (credentials.url) {
            // Parse URL to extract host, port, and username
            try {
              const parsed = new URL(credentials.url);
              hostname = parsed.hostname || "localhost";
              port = parsed.port ? parseInt(parsed.port, 10) : 6379;
              username = parsed.username || credentials.username || "default";
            } catch {
              // URL parsing failed, fall back to host/port
              hostname = credentials.host || "localhost";
              port = credentials.port ? parseInt(credentials.port, 10) : 6379;
              username = credentials.username || "default";
            }
          } else {
            // Use individual connection parameters
            hostname = credentials.host || "localhost";
            port = credentials.port ? parseInt(credentials.port, 10) : 6379;
            username = credentials.username || "default";
          }

          // Generate consistent user ID from normalized hostname, port, and username
          const id = generateConsistentUserId(username, hostname, port);

          const { role } = await newClient(credentials, id);

          const res: User = {
            id,
            url: credentials.url,
            host: credentials.host,
            port: credentials.port ? parseInt(credentials.port, 10) : 6379,
            password: credentials.password,
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
          password: user.password,
          username: user.username,
          tls: user.tls,
          ca: user.ca,
          role: user.role,
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
            password: token.password as string,
            tls: token.tls as boolean,
            ca: token.ca,
            role: token.role as Role,
          },
        };
      }
      return session;
    },
  },
};

export async function getClient() {
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
    }, { status: 401 });
  }

  // Fall back to session authentication for regular app requests
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;

  if (!id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { user } = session;

  let connection = connections.get(id);

  // If client is not found, create a new one
  if (!connection) {
    const { client } = await newClient(
      {
        host: user.host,
        port: user.port.toString() ?? "6379",
        username: user.username,
        password: user.password,
        tls: String(user.tls),
        ca: user.ca,
      },
      user.id
    );

    connection = client;
  }

  const client = connection;

  if (!client) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  return { client, user };
}

export default authOptions;
