import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "../../utils";
import { getCsvStorageProvider } from "@/app/lib/csv-storage";
import {
    getCsvTempCleanupCutoffMs,
    getCsvTempCleanupSecrets,
    getCsvTempTtlSeconds,
} from "@/app/lib/csv-temp-config";
import { CSV_UPLOAD_ENABLED } from "@/lib/graphUpload";

function isAuthorized(request: NextRequest): boolean {
    const configured = getCsvTempCleanupSecrets();

    if (configured.length === 0) return true;

    const auth = request.headers.get("authorization") ?? "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const headerSecret = request.headers.get("x-csv-cleanup-secret") ?? "";

    return configured.includes(bearer) || configured.includes(headerSecret);
}

async function runCleanup(request: NextRequest) {
    // While CSV upload is gated off no temp files are created, so the scheduled
    // cleanup cron has nothing to do. Return a 200 no-op (not 403) so Vercel Cron
    // does not record continuous failures while the feature is disabled.
    if (!CSV_UPLOAD_ENABLED) {
        return NextResponse.json(
            { deleted: 0, disabled: true },
            { status: 200, headers: getCorsHeaders(request) }
        );
    }

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
