import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest, { params }: { params: Promise<{ graph: string, node: string }> }) {

    const session = await getClient()
    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { graph: graphId, node } = await params
    const nodeId = Number(node)

    const graph = client.selectGraph(graphId);

    // Get node's neighbors    
    const query = `MATCH (src)-[e]-(n)
                      WHERE ID(src) = $nodeId
                      RETURN e, n`;

    try {
        const result = await graph.query(query, { params: { nodeId } });
        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}