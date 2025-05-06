import { getClient } from "@/app/api/auth/[...nextauth]/options"
import { NextResponse, NextRequest } from "next/server"

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ schema: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session
    const { schema } = await params
    const schemaName = `${schema}_schema`
    const source = request.nextUrl.searchParams.get("sourceName")

    try {
        if (!source) throw new Error("Missing parameter sourceName")

        const sourceName = `${source}_schema`
        const result = await client.selectGraph(sourceName).copy(schemaName)

        return NextResponse.json({ result })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}