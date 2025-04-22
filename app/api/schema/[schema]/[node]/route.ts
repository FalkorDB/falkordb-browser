import { NextRequest, NextResponse } from "next/server"
import { getClient } from "@/app/api/auth/[...nextauth]/options"
import { formatAttributes } from "./utils"

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest, { params }: { params: Promise<{ schema: string, node: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { schema } = await params
    const schemaName = `${schema}_schema`
    const { type, label, attributes, selectedNodes } = await request.json()

    try {
        if (!label) throw new Error("Label is required")
        if (!attributes) throw new Error("Attributes are required")
        if (type === undefined) {
            throw new Error("Type is required")
        } else if (!type && !selectedNodes) {
            throw new Error("Selected nodes are required")
        }
        const formateAttributes = formatAttributes(attributes)
        const graph = client.selectGraph(schemaName)
        const query = type
            ? `CREATE (n${label ? `:${label.join(":")}` : ""}${formateAttributes?.length > 0 ? ` {${formateAttributes.map(([k, v]) => `${k}: "${v}"`).join(",")}}` : ""}) RETURN n`
            : `MATCH (a), (b) WHERE ID(a) = ${selectedNodes[0].id} AND ID(b) = ${selectedNodes[1].id} CREATE (a)-[e${label[0] ? `:${label[0]}` : ""}${formateAttributes?.length > 0 ? ` {${formateAttributes.map(([k, v]) => `${k}: "${v}"`).join(",")}}` : ""}]->(b) RETURN e`
        const result = await graph.query(query)

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

    const { client } = session

    const { schema, node } = await params
    const schemaName = `${schema}_schema`
    const nodeId = Number(node)
    const { type } = await request.json()

    try {
        if (type === undefined) throw new Error("Type is required")

        const graph = client.selectGraph(schemaName)
        const query = type
            ? `MATCH (n) WHERE ID(n) = $nodeId DELETE n`
            : `MATCH ()-[e]-() WHERE ID(e) = $nodeId DELETE e`
        const result = await graph.query(query, { params: { nodeId } })

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ message: "Node deleted successfully" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}