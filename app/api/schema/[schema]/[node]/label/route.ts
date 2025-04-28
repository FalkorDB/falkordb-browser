import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ schema: string, node: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client, user } = session
    const { schema, node } = await params
    const schemaName = `${schema}_schema`
    const { label } = await request.json()

    try {
        if (!label) throw new Error("Label is required")

        const graph = client.selectGraph(schemaName)
        const q = `MATCH (n) WHERE ID(n) = ${node} SET n:${label}`
        const result = user.role === "Read-Only"
            ? await graph.roQuery(q)
            : await graph.query(q)

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ result }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ schema: string, node: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client, user } = session
    const { schema, node } = await params
    const { label } = await request.json()
    const schemaName = `${schema}_schema`

    try {
        if (!label) throw new Error("Label is required")

        const graph = client.selectGraph(schemaName)

        const q = `MATCH (n) WHERE ID(n) = ${node} REMOVE n:${label}`
        const result = user.role === "Read-Only"
            ? await graph.roQuery(q)
            : await graph.query(q)

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ result }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}
