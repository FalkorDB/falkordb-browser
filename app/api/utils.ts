import { Role } from "next-auth";
import type { Graph } from "falkordb";

export const runQuery = async (graph: Graph, query: string, role: Role) => {
    const result = role === "Read-Only" ? await graph.roQuery(query) : await graph.query(query);
    return result;
};

/**
 * Build FalkorDB connection URL from user session
 * Handles URL, authentication credentials, TLS, and default falkor:// protocol
 */
export function buildFalkorDBConnection(user: {
    host: string;
    port: number;
    url?: string;
    username?: string;
    password?: string;
    tls?: boolean;
    ca?: string;
}): string {
    // Use URL if provided
    if (user.url) {
        return user.url;
    }

    // Build falkor:// or falkors:// URL from host and port
    const protocol = user.tls ? "falkors://" : "falkor://";
    const auth = user.username && user.password
        ? `${encodeURIComponent(user.username)}:${encodeURIComponent(user.password)}@`
        : "";
    return `${protocol}${auth}${user.host}:${user.port}`;
}

export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}