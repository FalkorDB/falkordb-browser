import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ graph: string, node: string }> }) {

    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { graph: graphId, node } = await params
    const nodeId = Number(node)
    const { label } = await request.json()

    try {
        if (!label) throw new Error("Label is required")

        const query = `MATCH (n) WHERE ID(n) = $nodeId REMOVE n:${label}`
        const graph = client.selectGraph(graphId);
        const result = await graph.query(query, { params: { nodeId } })

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ message: "Label removed successfully" }, { status: 200 });
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ graph: string, node: string }> }) {

    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { graph: graphId, node } = await params
    const nodeId = Number(node)
    const { label } = await request.json()

    try {
        if (!label) throw new Error("Label is required")

        const query = `MATCH (n) WHERE ID(n) = $nodeId SET n:${label}`
        const graph = client.selectGraph(graphId);
        const result = await graph.query(query, { params: { nodeId } })

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ message: "Label added successfully" }, { status: 200 });
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}