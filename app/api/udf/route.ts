import { NextResponse } from "next/server";
import { UDF_VERSION_THRESHOLD } from "@/app/utils";
import { GET as getDBVersion } from "@/app/api/DBVersion/route";
import { getClient } from "../auth/[...nextauth]/options";
import { getCorsHeaders } from "../utils";
import { loadUdf, validateBody } from "../validate-body";

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
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const [name, version] = (await res.json()).result;

        if (name !== "graph" || version < UDF_VERSION_THRESHOLD) {
            return NextResponse.json(
                { message: `Memory usage feature requires graph module version ${UDF_VERSION_THRESHOLD.toString()} or higher. Current version: ${version}` },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }


        try {
            const result = await client.udfList();

            console.log(result);

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
            { message: (err as Error).message },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return session;
        }

        const { client } = session;
        const body = await request.json();

        const validation = validateBody(loadUdf, body);

        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const { name, code, replace } = validation.data;

        try {
            await client.udfLoad(name, code, replace);
            return NextResponse.json({ message: "UDF created successfully" }, { status: 200, headers: getCorsHeaders(request) });
        }
        catch (error) {
            console.error(error);
            return NextResponse.json(
                { message: (error as Error).message },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: (err as Error).message },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}
