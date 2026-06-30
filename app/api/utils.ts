import type { Graph } from "falkordb";
import { QueryOptions } from "falkordb/dist/src/commands";
import { NextResponse, type NextRequest } from "next/server";

const AUTO_NEXTAUTH_URL = "auto";
const UNTRUSTED_REQUEST_ORIGIN_MESSAGE = "Untrusted request origin";
const TRUST_PROXY_HEADERS = "true";
const LOCALHOST_ORIGINS = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]);

export const runQuery = async (graph: Graph, query: string, isReadOnly: boolean, options?: QueryOptions) => {
    if (isReadOnly) {
        return await graph.roQuery(query, options);
    }
    try {
        return await graph.query(query);
    } catch (error) {
        // Replica returns "READONLY You can't write against a read only replica."
        // Fall back to roQuery so reads still work when isReadOnly detection races.
        if ((error as Error).message?.includes("READONLY")) {
            return await graph.roQuery(query);
        }
        throw error;
    }
};

/**
 * Determine whether a request must use read-only queries.
 * Returns true when the frontend sends `readOnly=true` OR
 * when the authenticated user's role is "Read-Only".
 * This prevents NOPERM errors caused by stale frontend state.
 */
export function resolveReadOnly(request: NextRequest, userRole?: string): boolean {
    return request.nextUrl.searchParams.get("readOnly") === "true"
        || userRole === "Read-Only";
}

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

function normalizeOrigin(origin: string): string | null {
    try {
        const parsed = new URL(origin);

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return null;
        }

        return parsed.origin;
    } catch {
        return null;
    }
}

function firstHeaderValue(value: string | null): string | null {
    return value?.split(",")[0]?.trim() || null;
}

function getHeaderOrigin(request: Request): string | null {
    const origin = request.headers.get("origin");
    return origin ? normalizeOrigin(origin) : null;
}

function isSafeHost(host: string): boolean {
    return Boolean(host)
        && !host.includes("/")
        && !host.includes("\\")
        && !host.includes("@")
        && !/\s/.test(host);
}

function shouldTrustProxyHeaders(): boolean {
    return process.env.TRUST_PROXY_HEADERS === TRUST_PROXY_HEADERS;
}

function isSameOriginBrowserRequest(request: Request): boolean {
    return request.headers.get("sec-fetch-site") === "same-origin";
}

export function isAutoNextAuthUrl(): boolean {
    return process.env.NEXTAUTH_URL === AUTO_NEXTAUTH_URL;
}

export function enableAutoNextAuthUrl(): void {
    if (isAutoNextAuthUrl()) {
        process.env.AUTH_TRUST_HOST ??= "true";
    }
}

export function getRequestOrigin(request?: Request): string | null {
    if (!request) {
        return null;
    }

    const trustProxyHeaders = shouldTrustProxyHeaders();
    const forwardedHost = trustProxyHeaders
        ? firstHeaderValue(request.headers.get("x-forwarded-host"))
        : null;
    const host = forwardedHost ?? request.headers.get("host");

    if (!host || !isSafeHost(host)) {
        return null;
    }

    const forwardedProto = trustProxyHeaders
        ? firstHeaderValue(request.headers.get("x-forwarded-proto"))
        : null;
    if (forwardedProto && forwardedProto !== "https" && forwardedProto !== "http") {
        return null;
    }

    const requestProtocol = (() => {
        try {
            return new URL(request.url).protocol.replace(":", "");
        } catch {
            return null;
        }
    })();
    const protocol = forwardedProto ?? requestProtocol;

    if (protocol !== "https" && protocol !== "http") {
        return null;
    }

    return normalizeOrigin(`${protocol}://${host}`);
}

/**
 * Get allowed origins from environment variable or use defaults
 */
function getAllowedOrigins(): string[] {
    const envOrigins = process.env.ALLOWED_ORIGINS;
    if (envOrigins) {
        return envOrigins
            .split(',')
            .map(origin => normalizeOrigin(origin.trim()))
            .filter((origin): origin is string => Boolean(origin));
    }

    const defaults = [...LOCALHOST_ORIGINS];

    // Add AUTH_URL / NEXTAUTH_URL if configured
    const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
    if (authUrl && !isAutoNextAuthUrl()) {
        const authOrigin = normalizeOrigin(authUrl);
        if (authOrigin) {
            defaults.push(authOrigin);
        }
    }

    return [...new Set(defaults)];
}

export function isOriginAllowed(requestOrigin?: string | null, request?: Request): boolean {
    if (!requestOrigin) {
        return false;
    }

    const origin = normalizeOrigin(requestOrigin);
    if (!origin) {
        return false;
    }

    const allowedOrigins = getAllowedOrigins();

    if (allowedOrigins.includes(origin)) {
        return true;
    }

    if (!process.env.ALLOWED_ORIGINS && isAutoNextAuthUrl()) {
        return origin === getRequestOrigin(request);
    }

    return false;
}

export function isRequestOriginTrusted(request: Request): boolean {
    if (!isAutoNextAuthUrl()) {
        return true;
    }

    const requestOrigin = getRequestOrigin(request);
    if (!requestOrigin) {
        return false;
    }

    const callerOrigin = getHeaderOrigin(request);

    if (process.env.ALLOWED_ORIGINS) {
        return isOriginAllowed(requestOrigin, request)
            && (!callerOrigin || isOriginAllowed(callerOrigin, request));
    }

    return !callerOrigin || callerOrigin === requestOrigin || isSameOriginBrowserRequest(request);
}

export function shouldUseSecureCookies(request: Request): boolean {
    const nextAuthUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
    if (nextAuthUrl && !isAutoNextAuthUrl()) {
        return nextAuthUrl.startsWith("https://");
    }

    return getRequestOrigin(request)?.startsWith("https://") ?? false;
}

/**
 * Generate CORS headers with origin validation
 * @param requestOrigin - The origin from the request headers
 * @returns CORS headers object
 */
export function corsHeaders(requestOrigin?: string | null): Record<string, string> {
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Vary': 'Origin',
    };

    const origin = requestOrigin ? normalizeOrigin(requestOrigin) : null;
    const allowedOrigins = getAllowedOrigins();

    if (origin && allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
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
    const headers = corsHeaders(origin);
    const normalizedOrigin = origin ? normalizeOrigin(origin) : null;

    if (
        normalizedOrigin
        && !headers['Access-Control-Allow-Origin']
        && !process.env.ALLOWED_ORIGINS
        && isAutoNextAuthUrl()
        && request
        && (normalizedOrigin === getRequestOrigin(request) || isSameOriginBrowserRequest(request))
    ) {
        headers['Access-Control-Allow-Origin'] = normalizedOrigin;
        headers['Access-Control-Allow-Credentials'] = 'true';
    }

    return headers;
}

export function rejectUntrustedOrigin(request: Request): NextResponse<{ message: string }> {
    return NextResponse.json(
        { message: UNTRUSTED_REQUEST_ORIGIN_MESSAGE },
        { status: 400, headers: getCorsHeaders(request) }
    );
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
