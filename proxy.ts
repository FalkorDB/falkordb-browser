import { NextResponse, type NextRequest } from "next/server";
import {
    DEFAULT_TRUSTED_PROXY_HOPS,
    clientAddressFromForwardedFor,
    readNonNegativeInt,
} from "@/lib/rateLimitKey";

/**
 * Simple in-memory sliding-window rate limiter.
 * State is per process: with multiple instances each replica keeps its own
 * budget. For a shared limit, replace with a Redis-backed solution.
 */

type RateLimitEntry = {
    timestamps: number[];
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 60 seconds
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();
const DEFAULT_CONNECT_SRC = [
    "'self'",
    "https://cdn.jsdelivr.net",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    // Required by @vercel/blob/client multipart upload control-plane calls.
    "https://vercel.com",
    "https://*.vercel.com",
];

// Parse and cache CSP_CONNECT_SRC once at module load time
const EXTRA_CONNECT_SRC = getExtraConnectSrc();

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

// Reverse proxies in front of the browser that append to X-Forwarded-For.
const TRUSTED_PROXY_HOPS = readNonNegativeInt(process.env.TRUSTED_PROXY_HOPS, DEFAULT_TRUSTED_PROXY_HOPS);

function getClientIP(request: NextRequest): string {
    return (
        clientAddressFromForwardedFor(request.headers.get("x-forwarded-for"), TRUSTED_PROXY_HOPS) ??
        // Next.js fills X-Forwarded-For whenever it is absent, so this is only
        // reached on a platform that sets X-Real-IP instead.
        request.headers.get("x-real-ip") ??
        "unknown"
    );
}

// Rate limit configurations per route pattern
type RateLimitConfig = {
    maxRequests: number;
    windowMs: number;
};

const PRECONFIGURED_SIGN_IN_PATH = "/api/auth/callback/credentials";
const DEFAULT_PRECONFIGURED_SIGN_IN_MAX_REQUESTS = 10;
// A preconfigured sign-in body is a few short form fields.
const SIGN_IN_BODY_CAP = 16 * 1024;

/** The body as text, or `null` once it runs past `cap` bytes. */
async function readBodyUpTo(request: NextRequest, cap: number): Promise<string | null> {
    // Proxy buffers the body, so the route handler still reads its own copy.
    const reader = request.clone().body?.getReader();
    if (!reader) return "";

    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > cap) {
            await reader.cancel();
            return null;
        }
        chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
}

/**
 * True for a credentials sign-in that asks for the operator's preconfigured
 * connection. That sign-in needs no secret, yet each one opens a FalkorDB
 * client and writes a Token DB row, so it gets a far smaller budget than the
 * general API limit. Only this one small form body is read; upload routes
 * never reach the body parse.
 *
 * A body with no Content-Length, or one over the cap, is not read at all and
 * counts as preconfigured: the real form is always small and sized, so this
 * charges a client padding or streaming its way around the budget (and, at
 * worst, a manual login with an unusually large CA bundle).
 */
async function isPreconfiguredSignIn(request: NextRequest): Promise<boolean> {
    if (request.method !== "POST" || request.nextUrl.pathname !== PRECONFIGURED_SIGN_IN_PATH) return false;

    const length = readNonNegativeInt(request.headers.get("content-length") ?? undefined, -1);
    if (length < 0 || length > SIGN_IN_BODY_CAP) return true;

    try {
        const body = await readBodyUpTo(request, SIGN_IN_BODY_CAP);
        if (body === null) return true;
        if (request.headers.get("content-type")?.includes("application/json")) {
            return (JSON.parse(body) as { preconfigured?: unknown } | null)?.preconfigured === "true";
        }
        return new URLSearchParams(body).get("preconfigured") === "true";
    } catch {
        // A body this cannot read is one Auth.js cannot read either, so it is
        // not a preconfigured sign-in.
        return false;
    }
}

function tooManyRequests() {
    return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
    );
}

function getExtraConnectSrc(): string[] {
    const raw = process.env.CSP_CONNECT_SRC;
    if (!raw) return [];

    return raw
        .split(",")
        .map(source => source.trim())
        .filter(Boolean)
        .map(source => {
            try {
                const url = new URL(source);
                if (url.protocol !== "https:" && url.protocol !== "http:") {
                    console.warn(`Ignoring invalid CSP_CONNECT_SRC entry with unsupported protocol: ${source}`);
                    return null;
                }
                return url.origin;
            } catch {
                console.warn(`Ignoring invalid CSP_CONNECT_SRC entry: ${source}`);
                return null;
            }
        })
        .filter((source): source is string => Boolean(source));
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Rate limiting (API routes only) ---
    // Set RATE_LIMIT_MAX_REQUESTS=0 to disable the general limit. A value that
    // is not a whole non-negative number falls back to the default, not "off".
    const maxRequests = readNonNegativeInt(process.env.RATE_LIMIT_MAX_REQUESTS, 200);
    const config: RateLimitConfig | null = maxRequests !== 0 ? { maxRequests, windowMs: 60_000 } : null;
    if (config) {
        const ip = getClientIP(request);
        const key = `${ip}:${pathname.split("/").slice(0, 4).join("/")}`;

        if (isRateLimited(key, config.maxRequests, config.windowMs)) {
            return tooManyRequests();
        }
    }

    // A separate budget, so it holds even where the general limit is raised or
    // disabled. Set PRECONFIGURED_SIGN_IN_MAX_REQUESTS=0 to disable it.
    const preconfiguredMax = readNonNegativeInt(
        process.env.PRECONFIGURED_SIGN_IN_MAX_REQUESTS,
        DEFAULT_PRECONFIGURED_SIGN_IN_MAX_REQUESTS
    );
    if (preconfiguredMax !== 0 && await isPreconfiguredSignIn(request)) {
        if (isRateLimited(`${getClientIP(request)}:preconfigured-sign-in`, preconfiguredMax, 60_000)) {
            return tooManyRequests();
        }
    }

    // Do not mutate request headers for API routes. On some production edge
    // paths this can interfere with streaming multipart parsing (Busboy) and
    // surface as "Failed to parse upload." while localhost still works.
    // Keep API rate limiting above, but skip CSP nonce/header mutation here.
    if (pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // --- CSP with nonce (non-API routes) ---
    const nonce = btoa(crypto.randomUUID());
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
    const connectSrc = [...new Set([...DEFAULT_CONNECT_SRC, ...EXTRA_CONNECT_SRC])].join(" ");

    const cspHeader = [
        "default-src 'self'",
        scriptSrc,
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
        "img-src 'self' data: blob: https://*.googletagmanager.com",
        "font-src 'self' data: https://cdn.jsdelivr.net",
        `connect-src ${connectSrc}`,
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
