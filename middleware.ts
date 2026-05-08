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
        return { maxRequests: 60, windowMs: 60_000 }; // 60 req/min
    }

    // General API rate limit
    if (pathname.startsWith("/api/")) {
        return { maxRequests: 100, windowMs: 60_000 }; // 100 req/min
    }

    return null;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const config = getRateLimitConfig(pathname);
    if (!config) {
        return NextResponse.next();
    }

    const ip = getClientIP(request);
    const key = `${ip}:${pathname.split("/").slice(0, 4).join("/")}`;

    if (isRateLimited(key, config.maxRequests, config.windowMs)) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429, headers: { "Retry-After": "60" } }
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
