import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders, resolveReadOnly } from "../utils";
import { getClient } from "../auth/[...nextauth]/options";
import { getCsvStorageProvider, getResolvedCsvStorageMode } from "@/app/lib/csv-storage";
import { generateCsvKey, hashOwner } from "@/app/lib/csv-key";
import { CSV_UPLOAD_ENABLED } from "@/lib/graphUpload";
import { streamCsvUpload } from "./stream-csv";

export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * Upload a CSV file into per-user temporary storage.
 *
 * The file is STREAMED to storage (never fully buffered in memory), so large
 * CSVs are handled with constant memory; it is size-capped (getCsvMaxUploadBytes)
 * and rejected mid-stream with 413 if exceeded, and BOM-stripped / binary-checked
 * before being persisted.
 *
 * Returns `{ key }` — an opaque UUID. The caller never receives (nor controls)
 * the storage URL; `/api/graph/[graph]/load-csv` resolves the owner-scoped URL
 * server-side. The file is deleted after a successful import; failed imports
 * keep it for retry and rely on the scheduled cleanup.
 */
export async function POST(request: NextRequest) {
    if (!CSV_UPLOAD_ENABLED) {
        return NextResponse.json(
            { message: "CSV upload is temporarily disabled." },
            { status: 403, headers: getCorsHeaders(request) }
        );
    }

    const session = await getClient(request);
    if (session instanceof NextResponse) return session;

    // Storing a temp CSV is a write; reject Read-Only users like /api/upload.
    if (resolveReadOnly(request, session.user.role)) {
        return NextResponse.json(
            { message: "You do not have permission to upload files." },
            { status: 403, headers: getCorsHeaders(request) }
        );
    }

    const owner = hashOwner(session.user.id);
    const key = generateCsvKey();

    // In cloud modes, CSV bytes must go directly from browser -> storage via
    // /api/csv-temp/direct. Reject proxied multipart uploads here to prevent
    // accidental backend buffering/streaming fallback.
    if (getResolvedCsvStorageMode() !== "local") {
        return NextResponse.json(
            { message: "Direct upload required: use /api/csv-temp/direct for cloud CSV storage." },
            { status: 409, headers: getCorsHeaders(request) }
        );
    }

    const provider = getCsvStorageProvider();

    const result = await streamCsvUpload(request, (body) => provider.store(owner, key, body));
    if (!result.ok) {
        await provider.delete(owner, key).catch(() => undefined);
        return NextResponse.json(
            { message: result.error },
            { status: result.status, headers: getCorsHeaders(request) }
        );
    }

    return NextResponse.json({ key }, { status: 201, headers: getCorsHeaders(request) });
}
