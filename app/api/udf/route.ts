import { NextResponse } from "next/server";
import { UDF_VERSION_THRESHOLD } from "@/app/utils";
import { GET as getDBVersion } from "@/app/api/DBVersion/route";
import { getClient } from "../auth/[...nextauth]/options";
import { getCorsHeaders } from "../utils";

export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: Request) {
    try {
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return session;
        }

        const { client } = session;

        const res = await getDBVersion(request);

        if (!res.ok) {
            const err = await res.text();

            let message;

            try {
                message = JSON.parse(err).message;
            } catch {
                message = err;
            }

            return NextResponse.json(
                { message: `Failed to retrieve database version: ${message}` },
                { status: res.status, headers: getCorsHeaders(request) }
            );
        }

        const [name, version] = (await res.json()).result;

        if (name !== "graph" || version < UDF_VERSION_THRESHOLD) {
            return NextResponse.json(
                { message: `UDF feature requires graph module version ${UDF_VERSION_THRESHOLD.toString()} or higher. Current version: ${version}` },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }


        try {
            const result = await client.udfList();

            return NextResponse.json({ result }, { status: 200, headers: getCorsHeaders(request) });
        } catch (error) {
            console.error(error);
            return NextResponse.json(
                { message: "An error occurred while processing the request" },
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

async function checkUdfCompatibility(request: Request, corsHeaders: HeadersInit) {
    const res = await getDBVersion(request);

    if (!res.ok) {
        const err = await res.text();

        let message;

        try {
            message = JSON.parse(err).message;
        } catch {
            message = err;
        }

        return NextResponse.json(
            { message: `Failed to retrieve database version: ${message}` },
            { status: res.status, headers: corsHeaders }
        );
    }

    const [name, version] = (await res.json()).result;

    if (name !== "graph" || version < UDF_VERSION_THRESHOLD) {
        return NextResponse.json(
            { message: `UDF feature requires graph module version ${UDF_VERSION_THRESHOLD.toString()} or higher. Current version: ${version}` },
            { status: 400, headers: corsHeaders }
        );
    }

    return null;
}

export async function DELETE(request: Request) {
    try {
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return session;
        }

        const { client } = session;

        const compatError = await checkUdfCompatibility(request, getCorsHeaders(request));
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
                { message: "An error occurred while processing the request" },
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