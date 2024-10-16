import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest, { params }: { params: { graph: string, node: string } }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const nodeId = parseInt(params.node, 10);
    const graphId = params.graph;

    const graph = client.selectGraph(graphId);

    // Get node's neighbors    
    const query = `MATCH (src)-[e]->(n)
                      WHERE ID(src) = $nodeId
                      RETURN e, n`;

    try {
        const result = await graph.query(query, { params: { nodeId } });
        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}