import { FalkorDB, type FalkorDBOptions } from "falkordb";

/**
 * Dedicated FalkorDB instance for Personal Access Token (PAT) management
 * This instance stores token metadata in a graph structure separate from user data
 */

let patFalkorDBInstance: FalkorDB | null = null;

/**
 * Parses API_TOKEN_FALKORDB_URL and returns connection configuration
 * Format: falkordb://[username:password@]host:port
 * Falls back to individual PAT_FALKORDB_* env vars if URL not provided
 */
export function parseFalkorDBUrl(): {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls: boolean;
} {
  const url = process.env.API_TOKEN_FALKORDB_URL;
  
  if (url) {
    let parsed: URL;
    try {
      // Parse URL (e.g., falkordb://localhost:6380 or falkordb://user:pass@localhost:6380)
      parsed = new URL(url);
    } catch {
      // URL errors contain the raw input, which can include a password.
      throw new Error("Invalid API_TOKEN_FALKORDB_URL: check scheme, host and port");
    }
    if (!["falkor:", "falkordb:", "falkors:", "redis:", "rediss:"].includes(parsed.protocol)) {
      throw new Error("Unsupported API_TOKEN_FALKORDB_URL scheme");
    }
    if (!parsed.hostname) {
      throw new Error("API_TOKEN_FALKORDB_URL must contain a database host");
    }
    if (!["", "/", "/0"].includes(parsed.pathname) || parsed.search || parsed.hash) {
      throw new Error("API_TOKEN_FALKORDB_URL may only select database 0 and cannot contain query options or fragments");
    }
    const host = parsed.hostname.replace(/^\[([0-9a-f:]+)\]$/i, "$1");
    const defaultPort = parsed.protocol === "redis:" || parsed.protocol === "rediss:" ? 6379 : 6380;
    const port = parsed.port ? parseInt(parsed.port, 10) : defaultPort;
    let username: string;
    let password: string | undefined;
    try {
      username = parsed.username ? decodeURIComponent(parsed.username) : "default";
      password = parsed.password ? decodeURIComponent(parsed.password) : undefined;
    } catch {
      throw new Error("Invalid API_TOKEN_FALKORDB_URL credential encoding");
    }

    return {
      host,
      port,
      username,
      password,
      tls: parsed.protocol === "falkors:" || parsed.protocol === "rediss:",
    };
  }
  
  // Fallback to individual env vars for backward compatibility
  return {
    host: process.env.PAT_FALKORDB_HOST || "localhost",
    port: parseInt(process.env.PAT_FALKORDB_PORT || "6380", 10),
    username: process.env.PAT_FALKORDB_USERNAME || "default",
    password: process.env.PAT_FALKORDB_PASSWORD || undefined,
    tls: false,
  };
}

/**
 * Gets or creates a connection to the PAT FalkorDB instance
 * Uses API_TOKEN_FALKORDB_URL or falls back to PAT_FALKORDB_* environment variables
 */
export async function getPATFalkorDBClient(): Promise<FalkorDB> {
  // Return existing connection if available and healthy
  if (patFalkorDBInstance) {
    try {
      const connection = await patFalkorDBInstance.connection;
      await connection.ping();
      return patFalkorDBInstance;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("PAT FalkorDB connection is dead, recreating:", err);
      patFalkorDBInstance = null;
    }
  }

  // Get configuration from API_TOKEN_FALKORDB_URL or individual env vars
  const { host, port, username, password, tls } = parseFalkorDBUrl();

  // Build connection options
  const connectionOptions: FalkorDBOptions = {
    socket: {
      host,
      port,
      ...(tls ? { tls: true as const } : {}),
    },
    username: username || undefined,
    password: password || undefined,
  };

  // Create new connection
  patFalkorDBInstance = await FalkorDB.connect(connectionOptions);

  // Verify connection
  try {
    const connection = await patFalkorDBInstance.connection;
    await connection.ping();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to connect to PAT FalkorDB instance:", err);
    throw new Error("Failed to connect to PAT FalkorDB instance");
  }

  return patFalkorDBInstance;
}

/**
 * Gets the graph name for token management
 */
export function getPATGraphName(): string {
  return process.env.PAT_FALKORDB_GRAPH_NAME || "token_management";
}

/**
 * Executes a Cypher query on the token management graph
 */
export async function executePATQuery(
  query: string,
  params: Record<string, string | number | boolean | null> = {}
) {
  const client = await getPATFalkorDBClient();
  const graph = client.selectGraph(getPATGraphName());

  return graph.query(query, { params });
}

/**
 * Initializes the token management graph with schema and indexes
 * Should be called once during setup or on first use
 */
export async function initializePATGraph() {
  try {
    const client = await getPATFalkorDBClient();
    const graph = client.selectGraph(getPATGraphName());

    // Create indexes for performance
    const indexes = [
      "CREATE INDEX FOR (t:Token) ON (t.token_hash)",
      "CREATE INDEX FOR (t:Token) ON (t.token_id)",
      "CREATE INDEX FOR (u:User) ON (u.username)",
    ];

    await Promise.all(
      indexes.map(async (indexQuery) => {
        try {
          await graph.query(indexQuery);
        } catch (err) {
          // Index might already exist, that's okay
          const error = err as Error;
          if (!error.message?.includes("already exists")) {
            // eslint-disable-next-line no-console
            console.warn(`Failed to create index: ${indexQuery}`, err);
          }
        }
      })
    );

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize PAT graph:", err);
    return false;
  }
}

/**
 * Closes the PAT FalkorDB connection
 */
export async function closePATFalkorDBClient() {
  if (patFalkorDBInstance) {
    try {
      await patFalkorDBInstance.close();
      patFalkorDBInstance = null;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error closing PAT FalkorDB connection:", err);
    }
  }
}
