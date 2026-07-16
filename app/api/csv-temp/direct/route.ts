import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders, resolveReadOnly } from "../../utils";
import { getClient } from "../../auth/[...nextauth]/options";
import {
    getCsvStorageProvider,
    getResolvedCsvStorageMode,
    type CsvDirectUploadRequest,
    type CsvDirectUploadTarget,
} from "@/app/lib/csv-storage";
import { generateCsvKey, hashOwner } from "@/app/lib/csv-key";
import { CSV_UPLOAD_ENABLED } from "@/lib/graphUpload";
import { getCsvMaxUploadBytes } from "@/app/lib/csv-temp-config";

interface DirectUploadBody {
    filename?: string;
    contentType?: string;
    sizeBytes?: number;
}

function sanitizeDirectUploadRequest(body: unknown): CsvDirectUploadRequest | null {
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;

    const input = body as Record<string, unknown>;
    if (typeof input.filename !== "string" || !input.filename.trim()) return null;
    if (typeof input.sizeBytes !== "number" || !Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) return null;
    if (input.contentType !== undefined && typeof input.contentType !== "string") return null;

    const maxBytes = getCsvMaxUploadBytes();
    const filename = input.filename.trim();
    const contentType = (typeof input.contentType === "string" ? input.contentType : "text/csv").trim() || "text/csv";

    if (input.sizeBytes > maxBytes) {
        return {
            filename,
            contentType,
            sizeBytes: Number.POSITIVE_INFINITY,
        };
    }

    return {
        filename,
        contentType,
        sizeBytes: Math.floor(input.sizeBytes),
    };
}

export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function POST(request: NextRequest) {
    if (!CSV_UPLOAD_ENABLED) {
        return NextResponse.json(
            { message: "CSV upload is temporarily disabled." },
            { status: 403, headers: getCorsHeaders(request) }
        );
    }

    const session = await getClient(request);
    if (session instanceof NextResponse) return session;

    if (resolveReadOnly(request, session.user.role)) {
        return NextResponse.json(
            { message: "You do not have permission to upload files." },
            { status: 403, headers: getCorsHeaders(request) }
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: "Invalid request body." },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    const parsed = sanitizeDirectUploadRequest(body);
    if (!parsed) {
        return NextResponse.json(
            { message: "filename and sizeBytes are required." },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    if (!Number.isFinite(parsed.sizeBytes)) {
        const maxMb = Math.floor(getCsvMaxUploadBytes() / (1024 * 1024));
        return NextResponse.json(
            { message: `File exceeds the ${maxMb} MB limit.` },
            { status: 413, headers: getCorsHeaders(request) }
        );
    }

    const mode = getResolvedCsvStorageMode();
    if (mode === "local") {
        return NextResponse.json(
            { message: "Direct upload is not enabled for local CSV storage." },
            { status: 409, headers: getCorsHeaders(request) }
        );
    }

    const owner = hashOwner(session.user.id);
    const key = generateCsvKey();
    const provider = getCsvStorageProvider();

    let target: CsvDirectUploadTarget | null;
    try {
        target = await provider.createDirectUploadTarget?.(owner, key, parsed) ?? null;
    } catch (error) {
        console.error("[csv-temp/direct] failed to prepare direct upload target:", error);
        return NextResponse.json(
            { message: "Failed to prepare direct upload." },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }

    if (!target) {
        return NextResponse.json(
            { message: "Direct upload is not available for the configured CSV storage." },
            { status: 409, headers: getCorsHeaders(request) }
        );
    }

    return NextResponse.json(
        {
            key,
            mode,
            upload: target,
        },
        { status: 201, headers: getCorsHeaders(request) }
    );
}
