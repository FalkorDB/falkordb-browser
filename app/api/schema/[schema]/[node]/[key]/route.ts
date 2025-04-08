import { getClient } from "@/app/api/auth/[...nextauth]/options"
import { NextRequest, NextResponse } from "next/server"

export const formatAttribute = (att: [string, string[]]) => {
    const [key, [t, d, u, r]] = att
    let val = `${t}`
    if (u === "true") val += "!"
    if (r === "true") val += "*"
    if (d) val += `-${d}`
    return [key, val]
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ schema: string, node: string, key: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { schema, node, key } = await params
    const schemaName = `${schema}_schema`
    const { type, attribute } = await request.json()

    try {
        if (!attribute) throw new Error("Attribute is required")
        if (type === undefined) throw new Error("Type is required")

        const [formattedKey, formattedValue] = formatAttribute([key, attribute])
        const graph = client.selectGraph(schemaName)
        const q = type
            ? `MATCH (n) WHERE ID(n) = ${node} SET n.${formattedKey} = "${formattedValue}"`
            : `MATCH (n)-[e]-(m) WHERE ID(e) = ${node} SET e.${formattedKey} = "${formattedValue}"`
        const result = await graph.query(q)

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ message: "Attribute updated successfully" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ schema: string, node: string, key: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { schema, node, key } = await params
    const schemaName = `${schema}_schema`
    const { type } = await request.json()

    try {
        if (type === undefined) throw new Error("Type is required")

        const graph = client.selectGraph(schemaName)
        const q = type
            ? `MATCH (n) WHERE ID(n) = ${node} SET n.${key} = NULL`
            : `MATCH (n)-[e]-(m) WHERE ID(e) = ${node} SET e.${key} = NULL`
        const result = await graph.query(q)

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ message: "Attribute deleted successfully" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}
