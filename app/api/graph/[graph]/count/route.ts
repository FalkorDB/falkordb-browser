import { getClient } from "@/app/api/auth/[...nextauth]/options"
import { NextResponse, NextRequest } from "next/server"

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client, user } = session
    const { graph: graphId } = await params

    try {
        const graph = client.selectGraph(graphId)
        const query = "MATCH (n) OPTIONAL MATCH (n)-[e]->() WITH count(n) as nodes, count(e) as edges RETURN nodes, edges"
        const { data } = user.role === "Read-Only"
            ? await graph.roQuery(query)
            : await graph.query(query)

        if (!data) throw new Error("Something went wrong")

        const result = data.length === 0 ? { nodes: 0, edges: 0 } : data[0]

        return NextResponse.json({ result }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}
