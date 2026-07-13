import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "../../utils";
import { getCsvStorageProvider } from "@/app/lib/csv-storage";
import {
    getCsvTempCleanupCutoffMs,
    getCsvTempCleanupSecrets,
    getCsvTempTtlSeconds,
} from "@/app/lib/csv-temp-config";
import { CSV_UPLOAD_ENABLED } from "@/lib/graphUpload";

type AuthResult = { ok: true } | { ok: false; status: number; message: string };

/**
 * Fail closed: a cleanup secret MUST be configured. Missing configuration is a
 * server/config error (503), a wrong/absent caller credential is 401. An
 * authenticated GET is kept because Vercel Cron invokes scheduled routes with GET.
 */
function authorize(request: NextRequest): AuthResult {
    const configured = getCsvTempCleanupSecrets();

    if (configured.length === 0) {
        return {
            ok: false,
            status: 503,
            message:
                "Cleanup is not configured. Set CSV_TEMP_CLEANUP_SECRET or CRON_SECRET to enable this endpoint.",
        };
    }

    const auth = request.headers.get("authorization") ?? "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const headerSecret = request.headers.get("x-csv-cleanup-secret") ?? "";

    if (configured.includes(bearer) || configured.includes(headerSecret)) {
        return { ok: true };
    }
    return { ok: false, status: 401, message: "Unauthorized" };
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

    const auth = authorize(request);
    if (!auth.ok) {
        return NextResponse.json(
            { message: auth.message },
            { status: auth.status, headers: getCorsHeaders(request) }
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
