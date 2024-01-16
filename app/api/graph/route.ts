import { NextRequest, NextResponse } from "next/server";
import { Graph } from 'falkordb';
import { getServerSession } from "next-auth/next";
import authOptions, { connections } from "../auth/[...nextauth]/options";

export async function GET(request: NextRequest) {

    const session = await getServerSession(authOptions)
    const id = session?.user?.id
    if(!id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    let client = connections.get(id)
    if(!client) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const graphID = request.nextUrl.searchParams.get("graph");
    try {
        if (graphID) {
            const query = request.nextUrl.searchParams.get("query");
            if (!query) {
                return NextResponse.json({ message: "Missing query parameter 'q'" }, { status: 400 })
            }
            const graph = new Graph(client, graphID);
            let result = await graph.query(query)
            return NextResponse.json({ result: result }, { status: 200 })
        } else {

            let result = await client.graph.list()
            return NextResponse.json({ result: { graphs: result } }, { status: 200 })
        }
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}
