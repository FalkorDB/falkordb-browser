import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// eslint-disable-next-line import/prefer-default-export
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const { graph: graphId } = await params;

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
export async function POST(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {

    const toast = useToast()
    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const { graph: graphId } = await params;
    const sourceName = request.nextUrl.searchParams.get("sourceName")

    try {
        if (sourceName) {
            const graph = client.selectGraph(sourceName);
            const success = await graph.copy(graphId)
            if (!success) throw new Error("Failed to copy graph")
            return NextResponse.json({ success }, { status: 200 })
        }

        const type = request.nextUrl.searchParams.get("type")
        const key = request.nextUrl.searchParams.get("key")
        const srcs = await request.json()

        if (!key) return console.error("Missing parameter 'key'")

        if (!srcs) return console.error("Missing parameter 'srcs'")

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const socket = (await client.connection).options?.socket as any

        if (!socket) return console.error("socket not found")

        const data = {
            host: socket.host,
            port: socket.port,
            name: graphId,
            srcs,
            openaikey: key,
        }

        if (!type) return console.error("Missing parameter 'type'")

        const res = await securedFetch(`http://localhost:5000/${prepareArg(type!)}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }, toast)

        const result = await res.json()

        if (!res.ok) throw new Error(res.statusText)

        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const { graph: graphId } = await params;
    const sourceName = request.nextUrl.searchParams.get("sourceName")

    try {
        if (!sourceName) return console.error("Missing parameter sourceName")

        const data = await (await client.connection).renameNX(sourceName, graphId);

        if (!data) throw new Error(`${graphId} already exists`)

        return NextResponse.json({ data })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const { graph: graphId } = await params

    const ID = request.nextUrl.searchParams.get("ID")

    try {
        if (ID) {
            // const result = await securedFetch(`https://localhost:5000/progress/?ID=${ID}`, {
            //     method: "GET"
            // })
            // if (!result.ok) throw new Error("something went wrong")
            // const json = await result.json()
            return NextResponse.json({ progress: 10 }, { status: 200 })
        }

        const query = request.nextUrl.searchParams.get("query")
        const create = request.nextUrl.searchParams.get("create")
        const role = request.nextUrl.searchParams.get("role")

        if (!query) return console.log("Missing parameter query")

        if (create === "false" && !(await client.list()).some((g) => g === graphId))
            return NextResponse.json({}, { status: 200 })

        const graph = client.selectGraph(graphId)

        const result = role === "Read-Only"
            ? await graph.roQuery(query)
            : await graph.query(query)

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}