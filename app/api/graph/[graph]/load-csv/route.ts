import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders, resolveReadOnly } from "../../../utils";
import { getCsvStorageProvider } from "@/app/lib/csv-storage";
import path from "path";
import { pathToFileURL } from "url";
import { getCsvTempDir } from "@/app/lib/csv-storage-local";
import { CSV_UPLOAD_ENABLED } from "@/lib/graphUpload";

interface LoadCsvBody {
    key?: string;
    query?: string;
}

function downgradeLoadCsvUrlToHttp(query: string): string {
    const pattern = /(LOAD\s+CSV(?:\s+WITH\s+HEADERS)?\s+FROM\s+')([^']+)('\s+AS\s+row)/i;
    const match = query.match(pattern);
    if (!match) return query;

    const originalUrl = match[2].trim();
    let downgradedUrl = originalUrl;

    try {
        const parsed = new URL(originalUrl);
        if (parsed.protocol === "https:") {
            parsed.protocol = "http:";
            downgradedUrl = parsed.toString();
        }
    } catch {
        // Keep original URL if parsing fails.
    }

    return query.replace(pattern, `$1${downgradedUrl}$3`);
}

function replaceLoadCsvUrl(query: string, nextUrl: string): string {
    const pattern = /(LOAD\s+CSV(?:\s+WITH\s+HEADERS)?\s+FROM\s+')([^']+)('\s+AS\s+row)/i;
    return query.replace(pattern, `$1${nextUrl}$3`);
}

function buildLocalCsvFileUri(key: string): string {
    const localUriMode = process.env.CSV_LOCAL_LOAD_URI_MODE?.toLowerCase();
    if (localUriMode === "file") {
        return `file://${key.toLowerCase()}.csv`;
    }

    const filePath = path.join(getCsvTempDir(), `${key.toLowerCase()}.csv`);
    return pathToFileURL(filePath).toString();
}

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * Execute a `LOAD CSV FROM '...' AS row` Cypher query against the graph.
 *
 * Temporary CSV files are deleted only after a successful import. On failure,
 * files are kept so users can adjust query options and retry.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ graph: string }> }
) {
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

        let body: LoadCsvBody;
        try {
            body = (await request.json()) as LoadCsvBody;
        } catch {
            return NextResponse.json(
                { message: "Invalid request body." },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const { key, query } = body;

        if (!key || !query?.trim()) {
            return NextResponse.json(
                { message: "key and query are required." },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        if (!UUID_PATTERN.test(key)) {
            return NextResponse.json(
                { message: "Invalid key." },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        if (resolveReadOnly(request, session.user.role)) {
            return NextResponse.json(
                { message: "You do not have permission to modify this graph." },
                { status: 403, headers: getCorsHeaders(request) }
            );
        }

        // Register before query execution so the finally block always cleans up.
        keyToDelete = key;

        const graph = session.client.selectGraph(graphId);
        const loadCsvQuery = query.trim();

        try {
            const result = await graph.query(loadCsvQuery);
            shouldDeleteTempFile = true;
            return NextResponse.json(
                { message: "LOAD CSV completed successfully.", result },
                { status: 200, headers: getCorsHeaders(request) }
            );
        } catch (queryError) {
            console.error(queryError);

            let message = (queryError as Error).message || "Failed to execute the LOAD CSV query.";
            const isUnsupportedUriError = /unsupported uri/i.test(message);

            // Some FalkorDB builds reject https URIs for LOAD CSV. Try a
            // one-time protocol downgrade and rerun.
            if (isUnsupportedUriError) {
                const httpFallbackQuery = downgradeLoadCsvUrlToHttp(loadCsvQuery);
                if (httpFallbackQuery !== loadCsvQuery) {
                    try {
                        const fallbackResult = await graph.query(httpFallbackQuery);
                        shouldDeleteTempFile = true;
                        return NextResponse.json(
                            {
                                message: "LOAD CSV completed successfully (using HTTP URL fallback).",
                                result: fallbackResult,
                            },
                            { status: 200, headers: getCorsHeaders(request) }
                        );
                    } catch (fallbackError) {
                        console.error(fallbackError);
                        message = (fallbackError as Error).message || message;
                    }
                }

                // Some local FalkorDB setups support file:// imports while
                // rejecting HTTP(S) URLs for LOAD CSV.
                try {
                    const fileUriFallbackQuery = replaceLoadCsvUrl(
                        loadCsvQuery,
                        buildLocalCsvFileUri(key)
                    );
                    if (fileUriFallbackQuery !== loadCsvQuery) {
                        const fileUriFallbackResult = await graph.query(fileUriFallbackQuery);
                        shouldDeleteTempFile = true;
                        return NextResponse.json(
                            {
                                message: "LOAD CSV completed successfully (using local file URI fallback).",
                                result: fileUriFallbackResult,
                            },
                            { status: 200, headers: getCorsHeaders(request) }
                        );
                    }
                } catch (fileUriFallbackError) {
                    console.error(fileUriFallbackError);
                    message = (fileUriFallbackError as Error).message || message;
                }
            }

            const isHeaderError = /failed reading csv header row/i.test(message);
            const isUnsupportedAfterFallback = /unsupported uri/i.test(message);
            const isErrorOpeningCsvUri = /error opening csv uri/i.test(message);
            const usesFileScheme = /LOAD\s+CSV(?:\s+WITH\s+HEADERS)?\s+FROM\s+'file:\/\//i.test(loadCsvQuery);
            return NextResponse.json(
                {
                    message: isHeaderError
                        ? "Failed reading CSV header row. Verify the file has a valid header row, or disable 'Use CSV headers' and access columns as row[0], row[1], ..."
                        : isErrorOpeningCsvUri && usesFileScheme
                            ? "FalkorDB could not open the file:// CSV in IMPORT_FOLDER. Ensure Docker mounts your local CSV directory into /var/lib/FalkorDB/import and that IMPORT_FOLDER is set to /var/lib/FalkorDB/import/."
                        : isUnsupportedAfterFallback
                            ? "Unsupported URI for LOAD CSV. This FalkorDB instance likely cannot fetch the URL scheme. re-upload the CSV, and retry."
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
        // Delete temp file only after a successful import. On failure, keep it
        // so the user can tweak the query/headers mode and retry; cron cleanup
        // removes stale leftovers.
        if (keyToDelete && shouldDeleteTempFile) {
            await getCsvStorageProvider().delete(keyToDelete);
        }
    }
}
