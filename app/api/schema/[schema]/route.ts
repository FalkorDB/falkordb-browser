import { NextResponse, NextRequest } from "next/server"
import { getClient } from "../../auth/[...nextauth]/options"

export async function GET(request: NextRequest, { params }: { params: Promise<{ schema: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { schema } = await params
    const schemaName = `${schema}_schema`

    try {
        const schemas = await client.list()

        if (!schemas.includes(schemaName)) return NextResponse.json({ message: "Schema not found" }, { status: 200 })

        const graph = client.selectGraph(schemaName)
        const result = await graph.query("MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN * LIMIT 100")

        return NextResponse.json({ result }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ schema: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { schema } = await params
    const schemaName = `${schema}_schema`

    try {
        const graph = client.selectGraph(schemaName)
        const result = await graph.query("RETURN 1")

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ result }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}