import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const graphID = request.nextUrl.searchParams.get("graph");
    try {
        if (graphID) {
            const query = request.nextUrl.searchParams.get("query");
            if (!query) {
                return NextResponse.json({ message: "Missing query parameter 'q'" }, { status: 400 })
            }
            const graph = client.selectGraph(graphID);
            const result = await graph.query(query)
            return NextResponse.json({ result }, { status: 200 })
        }
        const result = await client.list()
        return NextResponse.json({ result: { graphs: result } }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}
