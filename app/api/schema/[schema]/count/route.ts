import { getClient } from "@/app/api/auth/[...nextauth]/options"
import { NextResponse, NextRequest } from "next/server"

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest, { params }: { params: Promise<{ schema: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { schema } = await params
    const schemaName = `${schema}_schema`

    try {
        const query = "MATCH (n) OPTIONAL MATCH (n)-[e]->() WITH count(n) as nodes, count(e) as edges RETURN nodes, edges"

        const result = await fetch(`${request.nextUrl.origin}/api/graph/${schemaName}/?query=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                cookie: request.headers.get('cookie') || '',
            }
        })

        if (!result.ok) throw new Error("Something went wrong")

        const json = await result.json()

        const data = json.result.data[0]

        return NextResponse.json({ result: data }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}