import { NextResponse, type NextRequest } from "next/server";

/**
 * Simple in-memory sliding-window rate limiter.
 * For production with multiple instances, replace with Redis-backed solution.
 */

type RateLimitEntry = {
    timestamps: number[];
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 60 seconds
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, entry] of rateLimitStore) {
        entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
        if (entry.timestamps.length === 0) {
            rateLimitStore.delete(key);
        }
    }
}

function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    cleanup(windowMs);

    const entry = rateLimitStore.get(key);
    if (!entry) {
        rateLimitStore.set(key, { timestamps: [now] });
        return false;
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
    
    if (entry.timestamps.length >= maxRequests) {
        return true;
    }

    entry.timestamps.push(now);
    return false;
}

function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return request.headers.get("x-real-ip") ?? "unknown";
}

// Rate limit configurations per route pattern
type RateLimitConfig = {
    maxRequests: number;
    windowMs: number;
};

function getRateLimitConfig(pathname: string): RateLimitConfig | null {
    // Auth callback - strict limit to prevent brute force
    if (pathname.startsWith("/api/auth/callback")) {
        return { maxRequests: 10, windowMs: 60_000 }; // 10 req/min
    }

    // Upload endpoint - prevent disk exhaustion
    if (pathname.startsWith("/api/upload")) {
        return { maxRequests: 20, windowMs: 60_000 }; // 20 req/min
    }

    // Chat/AI endpoints - prevent cost amplification
    if (pathname.startsWith("/api/chat")) {
        return { maxRequests: 30, windowMs: 60_000 }; // 30 req/min
    }

    // Graph query endpoints - prevent resource exhaustion
    if (pathname.startsWith("/api/graph")) {
        return { maxRequests: 200, windowMs: 60_000 }; // 200 req/min
    }

    // General API rate limit
    if (pathname.startsWith("/api/")) {
        return { maxRequests: 100, windowMs: 60_000 }; // 100 req/min
    }

    return null;
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Rate limiting (API routes only) ---
    const config = getRateLimitConfig(pathname);
    if (config) {
        const ip = getClientIP(request);
        const key = `${ip}:${pathname.split("/").slice(0, 4).join("/")}`;

        if (isRateLimited(key, config.maxRequests, config.windowMs)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429, headers: { "Retry-After": "60" } }
            );
        }
    }

    // --- CSP with nonce (all routes) ---
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const isDev = process.env.NODE_ENV === "development";

    // In development, Turbopack injects inline scripts that need nonces.
    // 'strict-dynamic' lets nonced scripts load further scripts.
    // 'unsafe-eval' is required by React dev mode for stack reconstruction.
    //
    // In production, Next.js also emits inline <script> tags (RSC data chunks)
    // that require nonces. We use nonce-based CSP in both modes.
    // 'strict-dynamic' makes browsers trust scripts loaded by nonced scripts,
    // but it also causes browsers to ignore 'self', so we keep 'self' as a
    // fallback for older browsers that don't support 'strict-dynamic'.
    const scriptSrc = isDev
        ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
        : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

    const cspHeader = [
        "default-src 'self'",
        scriptSrc,
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
        "img-src 'self' data: blob: https://*.googletagmanager.com",
        "font-src 'self' data: https://cdn.jsdelivr.net",
        "connect-src 'self' https://cdn.jsdelivr.net https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
        "form-action 'self'",
    ].join("; ");

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    // Next.js reads the CSP header from request headers to extract the nonce
    // and automatically apply it to inline <script> tags during rendering.
    requestHeaders.set("Content-Security-Policy", cspHeader);

    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });
    response.headers.set("Content-Security-Policy", cspHeader);

    return response;
}

export const config = {
    matcher: [
        // Match all routes except static files and images
        {
            source: "/((?!_next/static|_next/image|favicon.ico).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
        // Always match API routes for rate limiting
        "/api/:path*",
    ],
};
