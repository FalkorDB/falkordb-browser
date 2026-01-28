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

/**
 * Get allowed origins from environment variable or use defaults
 */
function getAllowedOrigins(): string[] {
    const envOrigins = process.env.ALLOWED_ORIGINS;
    if (envOrigins) {
        return envOrigins.split(',').map(origin => origin.trim());
    }
    
    // Default allowed origins for development
    const defaults = ['http://localhost:3000'];
    
    // Add NEXTAUTH_URL if configured
    if (process.env.NEXTAUTH_URL) {
        defaults.push(process.env.NEXTAUTH_URL.replace(/\/$/, '')); // Remove trailing slash
    }
    
    return defaults;
}

/**
 * Generate CORS headers with origin validation
 * @param requestOrigin - The origin from the request headers
 * @returns CORS headers object
 */
export function corsHeaders(requestOrigin?: string | null): Record<string, string> {
    const allowedOrigins = getAllowedOrigins();
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Vary': 'Origin',
    };

    // Debug logging (remove in production after testing)
    if (process.env.NODE_ENV !== 'production' || process.env.CORS_DEBUG === 'true') {
        console.log('[CORS Debug] Request origin:', requestOrigin);
        console.log('[CORS Debug] Allowed origins:', allowedOrigins);
        console.log('[CORS Debug] NODE_ENV:', process.env.NODE_ENV);
    }

    // Check if the request origin is in the allowlist
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        headers['Access-Control-Allow-Origin'] = requestOrigin;
        headers['Access-Control-Allow-Credentials'] = 'true';
    } else if (process.env.NODE_ENV === 'development' && !process.env.ALLOWED_ORIGINS) {
        // In development, allow all origins if ALLOWED_ORIGINS is not explicitly set
        headers['Access-Control-Allow-Origin'] = '*';
    }
    // If origin is not allowed and not in development, no CORS headers are added
    // This will cause the browser to block the request

    return headers;
}

/**
 * Get CORS headers from a Request object
 * @param request - The Next.js Request object
 * @returns CORS headers object with validated origin
 */
export function getCorsHeaders(request?: Request): Record<string, string> {
    const origin = request?.headers.get('origin');
    return corsHeaders(origin);
}