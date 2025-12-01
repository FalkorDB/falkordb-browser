import { FalkorDB } from "falkordb";
import { FalkorDBOptions } from "falkordb/dist/src/falkordb";

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
function parseFalkorDBUrl(): {
  host: string;
  port: number;
  username?: string;
  password?: string;
} {
  const url = process.env.API_TOKEN_FALKORDB_URL;
  
  if (url) {
    try {
      // Parse URL (e.g., falkordb://localhost:6380 or falkordb://user:pass@localhost:6380)
      const parsed = new URL(url);
      const host = parsed.hostname || "localhost";
      const port = parsed.port ? parseInt(parsed.port, 10) : 6380;
      const username = parsed.username || "default";
      const password = parsed.password || undefined;
      
      return { host, port, username, password };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to parse API_TOKEN_FALKORDB_URL, falling back to PAT_FALKORDB_* env vars:", err);
    }
  }
  
  // Fallback to individual env vars for backward compatibility
  return {
    host: process.env.PAT_FALKORDB_HOST || "localhost",
    port: parseInt(process.env.PAT_FALKORDB_PORT || "6380", 10),
    username: process.env.PAT_FALKORDB_USERNAME || "default",
    password: process.env.PAT_FALKORDB_PASSWORD || undefined,
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
  const { host, port, username, password } = parseFalkorDBUrl();

  // Build connection options
  const connectionOptions: FalkorDBOptions = {
    socket: {
      host,
      port,
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
  params: Record<string, unknown> = {}
) {
  const client = await getPATFalkorDBClient();
  const graph = client.selectGraph(getPATGraphName());

  return graph.query(query, params);
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
