import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { securedFetch } from "@/lib/utils";

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
    const sourceName = request.nextUrl.searchParams.get("sourceName")
    const type = request.nextUrl.searchParams.get("type")
    const key = request.nextUrl.searchParams.get("key")
    const srcs = await request.json()

    try {
        if (sourceName) {
            const graph = client.selectGraph(sourceName);
            const success = await graph.copy(graphId)
            if (!success) throw new Error("Failed to copy graph")
            return NextResponse.json({ success }, { status: 200 })
        }


        if (!key) console.error("Missing parameter 'key'")

        if (!srcs) console.error("Missing parameter 'srcs'")

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const socket = client.connection.options?.socket as any

        if (!socket) console.error("socket not found")

        const data = {
            host: socket.host,
            port: socket.port,
            name: graphId,
            srcs,
            openaikey: key,
        }

        if (!type) console.error("Missing parameter 'type'")

        const res = await securedFetch(`http://localhost:5000/${type}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        const result = await res.json()

        if (!res.ok) throw new Error(res.statusText)

        return NextResponse.json({ result }, { status: 200 })
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
    const sourceName = request.nextUrl.searchParams.get("sourceName")

    try {
        if (!sourceName) throw (new Error("Missing parameter 'sourceName'"))

        const data = await client.connection.renameNX(sourceName, graphId);

        if (!data) throw new Error(`${graphId} already exists`)

        return NextResponse.json({ data })
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
    
    if (query) {
        const graph = client.selectGraph(graphId)
        const result = await graph.query(query)

        if (!result) throw new Error("something went wrong")

        return NextResponse.json({ result }, { status: 200 })
    }

    const exists = request.nextUrl.searchParams.get("exists")
    
    if (exists) {
        const data = await client.connection.exists(graphId)
        return NextResponse.json({ exists: data }, { status: 200 })
    }


    try {
        const ID = request.nextUrl.searchParams.get("ID")
        if (!ID) throw new Error("Missing parameter 'ID'")
        // const result = await securedFetch(`https://localhost:5000/progress/?ID=${ID}`, {
        //     method: "GET"
        // })
        // if (!result.ok) throw new Error("something went wrong")
        // const json = await result.json()
        return NextResponse.json({ progress: 10 }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}
