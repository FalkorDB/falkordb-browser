import { NextResponse } from "next/server";
import checkUdfCompatibility from "./compatibility";
import { getClient } from "../auth/[...nextauth]/options";
import { getCorsHeaders, corsPreflight } from "../utils";

export const OPTIONS = corsPreflight;

export async function GET(request: Request) {
    try {
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return session;
        }

        const { client } = session;

        const compatError = await checkUdfCompatibility(client, request);
        if (compatError) return compatError;

        try {
            const result = await client.udfList();

            return NextResponse.json({ result }, { status: 200, headers: getCorsHeaders(request) });
        } catch (error) {
            console.error(error);
            return NextResponse.json(
                { message: (error as Error).message },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return session;
        }

        const { client } = session;

        const compatError = await checkUdfCompatibility(client, request);
        if (compatError) return compatError;

        try {
            const result = await client.udfFlush();

            if (result !== "OK") {
                throw new Error(`Failed to flush UDFs: ${result}`);
            }

            return NextResponse.json({ result: "UDFs flushed successfully" }, { status: 200, headers: getCorsHeaders(request) });
        } catch (error) {
            console.error(error);
            return NextResponse.json(
                { message: (error as Error).message },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}