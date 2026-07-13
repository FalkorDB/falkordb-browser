import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders, resolveReadOnly } from "../../../utils";
import { getCsvStorageProvider } from "@/app/lib/csv-storage";
import { hashOwner, isValidCsvKey, normalizeCsvKey } from "@/app/lib/csv-key";
import { CSV_UPLOAD_ENABLED, containsLoadCsv } from "@/lib/graphUpload";

interface LoadCsvBody {
    key?: string;
    withHeaders?: boolean;
    body?: string;
}

export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * Execute a native `LOAD CSV [WITH HEADERS] FROM $csvUrl AS row <body>` query.
 *
 * The client sends only `{ key, withHeaders, body }` — never the URL. The server
 * resolves the owner-scoped URL from the storage provider and passes it as a
 * query PARAMETER (`$csvUrl`), so the fetched URL can never be attacker
 * controlled (SSRF-safe) and cannot be injected into the Cypher. The user body
 * may not contain its own `LOAD CSV` clause.
 *
 * The temp file is deleted only after a successful import; failures keep it so
 * the user can adjust and retry, and the scheduled cleanup removes leftovers.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ graph: string }> }
) {
    let owner: string | null = null;
    let keyToDelete: string | null = null;
    let shouldDeleteTempFile = false;

    try {
        if (!CSV_UPLOAD_ENABLED) {
            return NextResponse.json(
                { message: "CSV upload is temporarily disabled." },
                { status: 403, headers: getCorsHeaders(request) }
            );
        }

        const session = await getClient(request);
        if (session instanceof NextResponse) return session;

        const { graph: graphId } = await params;

        let parsed: LoadCsvBody;
        try {
            parsed = (await request.json()) as LoadCsvBody;
        } catch {
            return NextResponse.json(
                { message: "Invalid request body." },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const { key, withHeaders, body } = parsed;

        if (!key || !body?.trim()) {
            return NextResponse.json(
                { message: "key and a query body are required." },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }
        if (!isValidCsvKey(key)) {
            return NextResponse.json(
                { message: "Invalid key." },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }
        if (containsLoadCsv(body)) {
            return NextResponse.json(
                { message: "The query must not contain its own LOAD CSV clause." },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        if (resolveReadOnly(request, session.user.role)) {
            return NextResponse.json(
                { message: "You do not have permission to modify this graph." },
                { status: 403, headers: getCorsHeaders(request) }
            );
        }

        owner = hashOwner(session.user.id);
        const safeKey = normalizeCsvKey(key);
        const provider = getCsvStorageProvider();

        let csvUrl: string;
        try {
            csvUrl = await provider.resolveReadUrl(owner, safeKey);
        } catch {
            return NextResponse.json(
                { message: "Uploaded CSV not found. Please re-upload and try again." },
                { status: 404, headers: getCorsHeaders(request) }
            );
        }

        keyToDelete = safeKey;

        const graph = session.client.selectGraph(graphId);
        const withHeadersClause = withHeaders ? "WITH HEADERS " : "";
        const loadCsvQuery = `LOAD CSV ${withHeadersClause}FROM $csvUrl AS row\n${body.trim()}`;

        try {
            const result = await graph.query(loadCsvQuery, { params: { csvUrl } });
            shouldDeleteTempFile = true;
            return NextResponse.json(
                { message: "LOAD CSV completed successfully.", result },
                { status: 200, headers: getCorsHeaders(request) }
            );
        } catch (queryError) {
            console.error(queryError);
            const message = (queryError as Error).message || "Failed to execute the LOAD CSV query.";
            const isHeaderError = /failed reading csv header row/i.test(message);
            const isFetchError = /(unsupported uri|error opening csv uri)/i.test(message);
            return NextResponse.json(
                {
                    message: isHeaderError
                        ? "Failed reading CSV header row. Verify the file has a valid header row, or turn off 'Use CSV headers' and access columns as row[0], row[1], ..."
                        : isFetchError
                            ? "FalkorDB could not fetch the uploaded CSV. Check the CSV storage configuration (CSV_STORAGE / CSV_SERVE_BASE_URL / IMPORT_FOLDER) so the database can reach the file."
                            : message,
                },
                { status: 422, headers: getCorsHeaders(request) }
            );
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to execute the LOAD CSV query." },
            { status: 500, headers: getCorsHeaders(request) }
        );
    } finally {
        if (owner && keyToDelete && shouldDeleteTempFile) {
            await getCsvStorageProvider().delete(owner, keyToDelete).catch(() => undefined);
        }
    }
}
