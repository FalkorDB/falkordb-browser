import { getClient } from "@/app/api/auth/[...nextauth]/options"
import { NextRequest, NextResponse } from "next/server"

const formatAttribute = (att: [string, string[]]) => {
    const [key, [t, d, u, r]] = att
    let val = `${t}`
    if (u === "true") val += "!"
    if (r === "true") val += "*"
    if (d) val += `-${d}`
    return [key, val]
}

const formatAttributes = (attributes: [string, string[]][]) => attributes.map((att) => formatAttribute(att))

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
            : `MATCH (a), (b) WHERE ID(a) = ${selectedNodes[0].id} AND ID(b) = ${selectedNodes[1].id} CREATE (a)-[e${label ? `:${label}` : ""}${formateAttributes?.length > 0 ? ` {${formateAttributes.map(([k, v]) => `${k}: "${v}"`).join(",")}}` : ""}]->(b) RETURN e`
        const result = await graph.query(query)

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ result }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ schema: string, node: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { schema, node } = await params
    const schemaName = `${schema}_schema`
    const { type, attribute } = await request.json()

    try {
        if (!attribute) throw new Error("Attribute is required")
        if (type === undefined) throw new Error("Type is required")

        const [formattedKey, formattedValue] = formatAttribute(attribute)
        const graph = client.selectGraph(schemaName)
        const q = type
            ? `MATCH (n) WHERE ID(n) = ${node} SET n.${formattedKey} = "${formattedValue}"`
            : `MATCH (n)-[e]-(m) WHERE ID(e) = ${node} SET e.${formattedKey} = "${formattedValue}"`
        const result = await graph.query(q)

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
    const { type, key } = await request.json()

    try {
        if (!key) throw new Error("Key is required")
        if (type === undefined) throw new Error("Type is required")

        const graph = client.selectGraph(schemaName)
        const q = type
            ? `MATCH (n) WHERE ID(n) = ${node} SET n.${key} = NULL`
            : `MATCH (n)-[e]-(m) WHERE ID(e) = ${node} SET e.${key} = NULL`
        const result = await graph.query(q)

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ result }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}
