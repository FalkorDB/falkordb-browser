import { getClient } from "@/app/api/auth/[...nextauth]/options"
import { NextResponse, NextRequest } from "next/server"

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session
    const { graph: graphId } = await params
    const sourceName = request.nextUrl.searchParams.get("sourceName")

    try {
        if (!sourceName) throw new Error("Missing parameter sourceName")

        const result = await client.selectGraph(sourceName).copy(graphId)

        return NextResponse.json({ result })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
}