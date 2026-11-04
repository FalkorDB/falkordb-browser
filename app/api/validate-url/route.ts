import { FalkorDB } from "falkordb";
import { NextRequest, NextResponse } from "next/server";
import { validateBody, validateUrl } from "../validate-body";
import { getCorsHeaders, isRequestOriginTrusted, rejectUntrustedOrigin } from "../utils";


export async function POST(request: NextRequest) {
    if (!isRequestOriginTrusted(request)) {
        return rejectUntrustedOrigin(request);
    }

    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
        return NextResponse.json(
            { message: "Content-Type must be application/json" },
            { status: 415, headers: getCorsHeaders(request) }
        );
    }

    let body: unknown;
    
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: "Invalid JSON" },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    const validation = validateBody(validateUrl, body);

    if (!validation.success) {
        return NextResponse.json(
            { message: validation.error },
            { status: 400, headers: getCorsHeaders(request) }
        );
    }

    const { url } = validation.data;
    const isMissingPasswordAndUsername = !url.includes("@");

    if (isMissingPasswordAndUsername) {
        try {
            const client = await FalkorDB.connect({ url });
            // Only the attempt matters; don't leave the connection open.
            await client.close().catch(() => { /* already closed */ });
        } catch (err) {
            if (err instanceof Error && err.message.includes("NOAUTH")) {
                return NextResponse.json({ result: true }, { status: 200, headers: getCorsHeaders(request) });
            }
        }
    }

    return NextResponse.json({ result: false }, { status: 200, headers: getCorsHeaders(request) });
}