import { FalkorDB } from "falkordb";
import { FalkorDBOptions } from "falkordb/dist/src/falkordb";

/**
 * Dedicated FalkorDB instance for Personal Access Token (PAT) management
 * This instance stores token metadata in a graph structure separate from user data
 */

let patFalkorDBInstance: FalkorDB | null = null;

/**
 * Gets or creates a connection to the PAT FalkorDB instance
 * Uses environment variables for configuration
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

  // Get configuration from environment
  const host = process.env.PAT_FALKORDB_HOST || "localhost";
  const port = parseInt(process.env.PAT_FALKORDB_PORT || "6380", 10);
  const username = process.env.PAT_FALKORDB_USERNAME || "default";
  const password = process.env.PAT_FALKORDB_PASSWORD || undefined;
  const tls = process.env.PAT_FALKORDB_TLS === "true";
  const ca = process.env.PAT_FALKORDB_CA;

  // Build connection options
  const connectionOptions: FalkorDBOptions = tls
    ? {
        socket: {
          host,
          port,
          tls: true,
          checkServerIdentity: () => undefined,
          ca: ca ? [Buffer.from(ca, "base64").toString("utf8")] : undefined,
        },
        username: username || undefined,
        password: password || undefined,
      }
    : {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executePATQuery(query: string, params: Record<string, any> = {}) {
  const client = await getPATFalkorDBClient();
  const graph = client.selectGraph(getPATGraphName());
  
  // Replace parameters in query (simple replacement for now)
  let finalQuery = query;
  Object.keys(params).forEach((key) => {
    const value = params[key];
    let replacement: string;
    
    if (value === null || value === undefined) {
      replacement = "NULL";
    } else if (typeof value === "string") {
      // Escape single quotes in strings
      replacement = `'${value.replace(/'/g, "\\'")}'`;
    } else if (typeof value === "boolean") {
      replacement = value ? "true" : "false";
    } else if (typeof value === "number") {
      replacement = value.toString();
    } else {
      replacement = JSON.stringify(value);
    }
    
    finalQuery = finalQuery.replace(new RegExp(`\\$${key}`, "g"), replacement);
  });
  
  return graph.query(finalQuery);
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
          // eslint-disable-next-line no-console
          console.log(`Created index: ${indexQuery}`);
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

    // eslint-disable-next-line no-console
    console.log("PAT graph initialized successfully");
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
