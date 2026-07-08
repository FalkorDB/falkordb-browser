import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders, resolveReadOnly } from "../../../utils";
import { getCsvStorageProvider } from "@/app/lib/csv-storage";

interface LoadCsvBody {
    key?: string;
    query?: string;
}

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * Execute a `LOAD CSV FROM '...' AS row` Cypher query against the graph, then
 * unconditionally delete the temporary CSV file — whether the query succeeds or
 * fails.  This keeps the temp storage clean without relying on the client to
 * issue a separate delete call.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ graph: string }> }
) {
    let keyToDelete: string | null = null;

    try {
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

        try {
            await graph.query(query);
        } catch (queryError) {
            console.error(queryError);
            return NextResponse.json(
                { message: (queryError as Error).message || "Failed to execute the LOAD CSV query." },
                { status: 422, headers: getCorsHeaders(request) }
            );
        }

        return NextResponse.json(
            { message: "LOAD CSV completed successfully." },
            { status: 200, headers: getCorsHeaders(request) }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to execute the LOAD CSV query." },
            { status: 500, headers: getCorsHeaders(request) }
        );
    } finally {
        // Always delete the stored file — success, failure, or thrown error.
        if (keyToDelete) {
            await getCsvStorageProvider().delete(keyToDelete);
        }
    }
}
