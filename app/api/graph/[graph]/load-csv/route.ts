import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders, resolveReadOnly } from "../../../utils";
import { getCsvStorageProvider } from "@/app/lib/csv-storage";
import { hashOwner, isValidCsvKey, normalizeCsvKey } from "@/app/lib/csv-key";
import { assertFalkorFetchableCsvUrl, CsvUrlConfigError } from "@/app/lib/csv-load-url";
import { CSV_UPLOAD_ENABLED, containsLoadCsv } from "@/lib/graphUpload";

/**
 * Interval for keep-alive heartbeat bytes streamed while a (potentially long,
 * atomic) LOAD CSV runs, so idle proxies/load balancers don't drop the request.
 */
const HEARTBEAT_INTERVAL_MS = 15_000;

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

        if (typeof key !== "string" || typeof body !== "string" || !body.trim()) {
            return NextResponse.json(
                { message: "key and a query body are required." },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }
        if (withHeaders !== undefined && typeof withHeaders !== "boolean") {
            return NextResponse.json(
                { message: "withHeaders must be a boolean." },
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

        // Fail fast with a clear message when the storage is misconfigured to
        // produce a URL FalkorDB cannot fetch (e.g. MinIO/S3 over http, or a
        // non-HTTPS local serve base) — otherwise LOAD CSV silently reads 0 rows
        // or errors opaquely.
        try {
            assertFalkorFetchableCsvUrl(csvUrl);
        } catch (configError) {
            if (configError instanceof CsvUrlConfigError) {
                console.error("[load-csv] unsupported CSV storage URL:", configError.message);
                return NextResponse.json(
                    { message: configError.message },
                    { status: 422, headers: getCorsHeaders(request) }
                );
            }
            throw configError;
        }

        const graph = session.client.selectGraph(graphId);
        const withHeadersClause = withHeaders ? "WITH HEADERS " : "";
        const loadCsvQuery = `LOAD CSV ${withHeadersClause}FROM $csvUrl AS row\n${body.trim()}`;

        // LOAD CSV is a single atomic query with no observable row-by-row progress
        // and can run long on large files. Stream a keep-alive heartbeat
        // (JSON-safe whitespace) while it runs so idle proxies/load balancers don't
        // drop the connection, then emit exactly one final JSON object:
        // `{ message, result }` on success or `{ error: { message, status } }` on a
        // query error. The temp object is deleted only on success (kept for retry
        // otherwise). Pre-query validation above still returns normal status codes.
        const ownerForDelete = owner;
        const keyForDelete = keyToDelete;
        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
                const heartbeat = setInterval(() => {
                    try {
                        controller.enqueue(encoder.encode("\n"));
                    } catch {
                        // stream already closed
                    }
                }, HEARTBEAT_INTERVAL_MS);

                let importSucceeded = false;
                try {
                    const result = await graph.query(loadCsvQuery, { params: { csvUrl } });
                    importSucceeded = true;
                    controller.enqueue(
                        encoder.encode(
                            JSON.stringify({ message: "LOAD CSV completed successfully.", result })
                        )
                    );
                } catch (queryError) {
                    console.error(queryError);
                    const raw = (queryError as Error).message || "Failed to execute the LOAD CSV query.";
                    const isHeaderError = /failed reading csv header row/i.test(raw);
                    const isFetchError = /(unsupported uri|error opening csv uri)/i.test(raw);
                    const message = isHeaderError
                        ? "Failed reading CSV header row. Verify the file has a valid header row, or turn off 'Use CSV headers' and access columns as row[0], row[1], ..."
                        : isFetchError
                            ? "FalkorDB could not fetch the uploaded CSV. Check the CSV storage configuration (CSV_STORAGE / CSV_SERVE_BASE_URL / IMPORT_FOLDER) so the database can reach the file."
                            : raw;
                    controller.enqueue(encoder.encode(JSON.stringify({ error: { message, status: 422 } })));
                } finally {
                    clearInterval(heartbeat);
                    controller.close();
                    if (importSucceeded && ownerForDelete && keyForDelete) {
                        await getCsvStorageProvider().delete(ownerForDelete, keyForDelete).catch(() => undefined);
                    }
                }
            },
        });

        return new Response(stream, {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store",
                ...getCorsHeaders(request),
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to execute the LOAD CSV query." },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}
