/* eslint-disable max-classes-per-file */
/* eslint-disable no-param-reassign */
import { FalkorDB } from "falkordb";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions, Role, User, getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { FalkorDBOptions } from "falkordb/dist/src/falkordb";
import { v4 as uuidv4 } from "uuid";

interface CustomJWTPayload {
  sub: string;
  username?: string;
  role: Role;
  host: string;
  port: number;
  tls: boolean;
  ca?: string;
}

interface AuthenticatedUser {
  id: string;
  username?: string;
  role: Role;
  host: string;
  port: number;
  tls: boolean;
  ca?: string;
}

const connections = new Map<string, FalkorDB>();

export async function newClient(
  credentials: {
    host: string;
    port: string;
    password: string;
    username: string;
    tls: string;
    ca: string;
  },
  id: string
): Promise<{ role: Role; client: FalkorDB }> {
  const connectionOptions: FalkorDBOptions =
    credentials.tls === "true"
      ? {
          socket: {
            host: credentials.host ?? "localhost",
            port: credentials.port ? parseInt(credentials.port, 10) : 6379,
            tls: credentials.tls === "true",
            checkServerIdentity: () => undefined,
            ca:
              credentials.ca === "undefined"
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

  const client = await FalkorDB.connect(connectionOptions);

  // Save connection in connections map for later use
  connections.set(id, client);

  client.on("error", (err) => {
    // Close coonection on error and remove from connections map
    console.error("FalkorDB Client Error", err);
    const connection = connections.get(id);
    if (connection) {
      connections.delete(id);
      connection.close().catch((e) => {
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
      console.debug("user is not admin", err);
    } else throw err;
  }

  try {
    await connection.sendCommand(["GRAPH.QUERY"]);
  } catch (err) {
    if ((err as Error).message.includes("permissions")) {
      console.debug("user is read-only", err);
      return { role: "Read-Only", client };
    }
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

      // Check for existing connection first
      const existingConnection = connections.get(payload.sub);

      if (existingConnection) {
        // Reuse existing JWT connection
        const user = createUserFromJWTPayload(payload);
        return { client: existingConnection, user };
      }

      // JWT authentication requires an existing connection
      // Cannot create new connection without password
      // Fall back to session authentication
      return null;
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
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        try {
          const id = generateTimeUUID();

          const { role } = await newClient(credentials, id);

          const res: User = {
            id,
            host: credentials.host,
            port: credentials.port ? parseInt(credentials.port, 10) : 6379,
            password: credentials.password,
            username: credentials.username,
            tls: credentials.tls === "true",
            ca: credentials.ca,
            role,
          };
          return res;
        } catch (err) {
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
          username: user.username,
          password: user.password,
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
  // Try JWT authentication first
  const jwtResult = await tryJWTAuthentication();
  if (jwtResult) {
    return jwtResult;
  }

  // Fall back to session authentication
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
