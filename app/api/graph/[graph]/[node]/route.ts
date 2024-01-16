import { NextRequest, NextResponse } from "next/server";
import { Graph } from 'falkordb';
import { getServerSession } from "next-auth/next";
import authOptions, { connections } from "../../../auth/[...nextauth]/options";

export async function GET(request: NextRequest, { params }: { params: { graph: string, node: string } }) {

    const session = await getServerSession(authOptions)
    const id = session?.user?.id
    if (!id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    let client = connections.get(id)
    if (!client) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const nodeId = parseInt(params.node);
    const graphId = params.graph;

    const graph = new Graph(client, graphId);

    // Get node's neighbors    
    const query = `MATCH (src)-[e]-(n)
                      WHERE ID(src) = $nodeId
                      RETURN e, n`;

    try {
        let result: any = await graph.query(query, { params: { nodeId: nodeId } });
        return NextResponse.json({ result: result }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 })
    }
}
