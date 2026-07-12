import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "../../utils";
import { getCsvStorageProvider } from "@/app/lib/csv-storage";
import {
    getCsvTempCleanupCutoffMs,
    getCsvTempCleanupSecrets,
    getCsvTempTtlSeconds,
} from "@/app/lib/csv-temp-config";

function isAuthorized(request: NextRequest): boolean {
    const configured = getCsvTempCleanupSecrets();

    if (configured.length === 0) return true;

    const auth = request.headers.get("authorization") ?? "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const headerSecret = request.headers.get("x-csv-cleanup-secret") ?? "";

    return configured.includes(bearer) || configured.includes(headerSecret);
}

async function runCleanup(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401, headers: getCorsHeaders(request) }
        );
    }

    const ttlSeconds = getCsvTempTtlSeconds();
    const olderThanMs = getCsvTempCleanupCutoffMs();

    try {
        const deleted = await getCsvStorageProvider().cleanupExpired(olderThanMs);
        return NextResponse.json(
            { deleted, ttlSeconds },
            { status: 200, headers: getCorsHeaders(request) }
        );
    } catch (error) {
        console.error("[csv-temp-cleanup] failed:", error);
        return NextResponse.json(
            { message: "Cleanup failed" },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}

export async function POST(request: NextRequest) {
    return runCleanup(request);
}

export async function GET(request: NextRequest) {
    return runCleanup(request);
}
