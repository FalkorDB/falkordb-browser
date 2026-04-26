import type { Graph } from "falkordb";

export const runQuery = async (graph: Graph, query: string, isReadOnly: boolean) => {
    const result = isReadOnly ? await graph.roQuery(query) : await graph.query(query);
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

    // Only set CORS headers when the request origin is in the allowlist
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        headers['Access-Control-Allow-Origin'] = requestOrigin;
        headers['Access-Control-Allow-Credentials'] = 'true';
    }
    // If origin is not allowed, no CORS headers are added
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

/**
 * Forwards a NextResponse returned by getClient() into an SSE error event
 * so the streaming client can surface the same status/code that the
 * non-streaming path would. Preserves status (e.g. 401) and the
 * SESSION_INVALID code needed to trigger auto-signOut on the client.
 */
export async function writeGetClientErrorAsSSE(
    response: Response,
    writer: WritableStreamDefaultWriter<Uint8Array>,
    encoder: TextEncoder,
): Promise<void> {
    const { status } = response;
    let message = "Unauthorized";
    let code: string | undefined;
    try {
        const body = await response.clone().json() as { message?: string; code?: string };
        if (body.message) message = body.message;
        if (body.code) code = body.code;
    } catch {
        try { message = await response.text(); } catch { /* ignore */ }
    }
    const payload: Record<string, unknown> = { message, status };
    if (code) payload.code = code;
    writer.write(
        encoder.encode(`event: error\ndata: ${JSON.stringify(payload)}\n\n`)
    );
    writer.close();
}