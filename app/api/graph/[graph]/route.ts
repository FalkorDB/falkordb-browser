import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function DELETE(request: NextRequest, { params }: { params: { graph: string } }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const graphId = params.graph;

    try {
        if (graphId) {

            const graph = client.selectGraph(graphId);

            await graph.delete()

            return NextResponse.json({ message: `${graphId} graph deleted` })
        }
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: NextRequest, { params }: { params: { graph: string } }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const graphId = params.graph;
    const newName = request.nextUrl.searchParams.get("newName")

    try {
        if (!newName) throw (new Error("Missing parameter 'newName'"))

        const graph = client.selectGraph(graphId);
        await graph.copy(newName)

        return NextResponse.json({ success: true })

    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(request: NextRequest, { params }: { params: { graph: string } }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const graphId = params.graph;
    const newName = request.nextUrl.searchParams.get("newName")

    try {
        if (!newName) throw (new Error("Missing parameter 'newName'"))

        const data = await client.connection.renameNX(graphId, newName);

        if (!data) throw (new Error(`${newName} already exists`))

        return NextResponse.json({ message: data })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

export async function GET(request: NextRequest, { params }: { params: { graph: string } }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const graphId = params.graph
    const query = request.nextUrl.searchParams.get("query")

    try {

        if (!graphId) throw new Error("graphId missing")
        if (!query) throw new Error("query missing")

        const graph = client.selectGraph(graphId)
        const result = await graph.query(query)

        if (!result) throw new Error("something went wrong")

        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}