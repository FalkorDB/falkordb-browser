import { NextResponse } from "next/server";
import { UDF_VERSION_THRESHOLD } from "@/app/utils";
import { getCorsHeaders } from "../../utils";
import { GET as getDBVersion } from "../../DBVersion/route";
import { getClient } from "../../auth/[...nextauth]/options";
import { loadUdf, validateBody } from "../../validate-body";

export async function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: Request, { params }: { params: Promise<{ lib: string }> }) {
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

        const { lib } = await params;

        try {
            const result = await client.udfList(lib, true);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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

export async function POST(request: Request, { params }: { params: Promise<{ lib: string }> }) {
    try {
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return session;
        }

        const { client } = session;

        const compatError = await checkUdfCompatibility(request, getCorsHeaders(request));
        if (compatError) return compatError;

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON in request body" },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const validation = validateBody(loadUdf, body);

        if (!validation.success) {
            return NextResponse.json(
                { message: validation.error },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const { code, replace } = validation.data;
        const { lib } = (await params);
        try {
            const result = await client.udfLoad(lib, code, replace);

            if (!result) {
                throw new Error("Failed to create UDF");
            }

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

export async function DELETE(request: Request, { params }: { params: Promise<{ lib: string }> }) {
    try {
        const session = await getClient(request);

        if (session instanceof NextResponse) {
            return session;
        }

        const { client } = session;

        const compatError = await checkUdfCompatibility(request, getCorsHeaders(request));
        if (compatError) return compatError;

        const { lib } = (await params);

        try {
            const result = await client.udfDelete(lib);

            if (!result) {
                throw new Error("Failed to delete UDF");
            }

            return NextResponse.json({ message: "UDF deleted successfully" }, { status: 200, headers: getCorsHeaders(request) });
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
