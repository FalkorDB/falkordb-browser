import { NextResponse } from "next/server";
import type { FalkorDB } from "falkordb";
import { UDF_VERSION_THRESHOLD } from "@/app/utils";
import { getCorsHeaders } from "../utils";

/** Returns an error response when the connected graph module cannot run UDFs, else null. */
export default async function checkUdfCompatibility(client: FalkorDB, request: Request): Promise<NextResponse | null> {
    const headers = getCorsHeaders(request);
    let version: number;

    try {
        const modules = await (await client.connection).moduleList();
        const graph = modules.find((m) => m.name === "graph");

        if (!graph) {
            return NextResponse.json(
                { message: "Failed to retrieve database version: Graph module not found" },
                { status: 503, headers }
            );
        }

        version = Number(graph.ver);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: `Failed to retrieve database version: ${(error as Error).message}` },
            { status: 400, headers }
        );
    }

    if (!(version >= UDF_VERSION_THRESHOLD)) {
        return NextResponse.json(
            { message: `UDF feature requires graph module version ${UDF_VERSION_THRESHOLD} or higher. Current version: ${version}` },
            { status: 400, headers }
        );
    }

    return null;
}
