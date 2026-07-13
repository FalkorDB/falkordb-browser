import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { getCsvStorageProvider } from "@/app/lib/csv-storage";
import { openLocalCsvReadStream } from "@/app/lib/csv-storage-local";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders, resolveReadOnly } from "@/app/api/utils";
import { hashOwner, isValidCsvKey, normalizeCsvKey, verifyCsvCapability } from "@/app/lib/csv-key";
import { CSV_UPLOAD_ENABLED } from "@/lib/graphUpload";

/**
 * Serve a temporarily uploaded CSV for FalkorDB's `LOAD CSV` in local HTTP mode.
 *
 * FalkorDB fetches this without a session, so access is gated by a short-lived
 * signed capability token bound to (owner, key). The owner is not derivable from
 * the URL alone — only a URL we generated (via the storage provider) carries a
 * valid `o` + `t` pair.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!CSV_UPLOAD_ENABLED) {
        return new NextResponse("Not found.", { status: 404 });
    }

    const { id } = await params;
    if (!isValidCsvKey(id)) {
        return new NextResponse("Not found.", { status: 404 });
    }
    const key = normalizeCsvKey(id);

    const url = new URL(request.url);
    const owner = url.searchParams.get("o") ?? "";
    const token = url.searchParams.get("t") ?? "";

    if (!verifyCsvCapability(owner, key, token)) {
        return new NextResponse("Not found.", { status: 404 });
    }

    const stream = openLocalCsvReadStream(owner, key);
    if (!stream) {
        return new NextResponse("Not found.", { status: 404 });
    }

    // Stream the file (with backpressure) rather than buffering it in memory.
    return new NextResponse(Readable.toWeb(stream) as unknown as ReadableStream, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `inline; filename="${key}.csv"`,
            "Cache-Control": "no-store",
        },
    });
}

/**
 * Best-effort delete for a temp CSV when a user cancels/closes the upload flow
 * after uploading. Authenticated + owner-scoped so a user can only delete their
 * own temp files.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
            { message: "You do not have permission to delete files." },
            { status: 403, headers: getCorsHeaders(request) }
        );
    }

    const { id } = await params;
    if (!isValidCsvKey(id)) {
        return NextResponse.json(
            { message: "Invalid key." },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    const owner = hashOwner(session.user.id);
    await getCsvStorageProvider().delete(owner, normalizeCsvKey(id));

    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}
