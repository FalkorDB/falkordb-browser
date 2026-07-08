import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCorsHeaders } from "../utils";
import { getClient } from "../auth/[...nextauth]/options";
import { MAX_FILE_SIZE } from "../upload/file-validation";
import { getCsvStorageProvider } from "@/app/lib/csv-storage";

export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * Upload a CSV file into a temporary public location.
 * Returns `{ tempId, url }` where `url` can be used directly in a
 * `LOAD CSV FROM '...' AS row` Cypher statement.
 * The file is deleted by the `/api/graph/[graph]/load-csv` endpoint after the
 * query finishes (success or failure).
 */
export async function POST(request: NextRequest) {
    const session = await getClient(request);
    if (session instanceof NextResponse) return session;

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json(
            { message: "Invalid multipart form data." },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json(
            { message: "No file provided." },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
        return NextResponse.json(
            { message: "Only .csv files are accepted." },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    if (file.size === 0) {
        return NextResponse.json(
            { message: "The file is empty." },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
            { message: `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.` },
            { status: 413, headers: getCorsHeaders(request) }
        );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    // Reject binary files — CSVs must be valid UTF-8 text.
    if (bytes.includes(0)) {
        return NextResponse.json(
            { message: "The file does not appear to be a valid CSV (contains binary data)." },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    try {
        new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
        return NextResponse.json(
            { message: "The file is not valid UTF-8." },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    const key = randomUUID();
    const provider = getCsvStorageProvider();
    const readUrl = await provider.store(key, bytes);

    return NextResponse.json(
        { key, readUrl },
        { status: 201, headers: getCorsHeaders(request) }
    );
}
