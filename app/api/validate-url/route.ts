import { FalkorDB } from "falkordb";
import { NextRequest, NextResponse } from "next/server";
import { validateBody, validateUrl } from "../validate-body";


export async function POST(request: NextRequest) {
    let body: unknown;
    
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: "Invalid JSON" },
            { status: 400 }
        );
    }

    const validation = validateBody(validateUrl, body);

    if (!validation.success) {
        return NextResponse.json(
            { message: validation.error },
            { status: 400 }
        );
    }

    const { url } = validation.data;
    const isMissingPasswordAndUsername = !url.includes("@");

    if (isMissingPasswordAndUsername) {
        try {
            await FalkorDB.connect({ url });
        } catch (err) {
            if (err instanceof Error && err.message.includes("NOAUTH")) {
                return NextResponse.json({ result: true }, { status: 200 });
            }
        }
    }

    return NextResponse.json({ result: false }, { status: 200 });
}