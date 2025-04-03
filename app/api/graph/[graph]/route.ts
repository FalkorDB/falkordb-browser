import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { prepareArg, securedFetch } from "@/lib/utils";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {

    const session = await getClient()
    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { graph: graphId } = await params;

    try {
        if (graphId) {

            const graph = client.selectGraph(graphId);

            await graph.delete()

            return NextResponse.json({ message: `${graphId} graph deleted` })
        }
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {

    const session = await getClient()
    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { graph: name } = await params;
    const sourceName = request.nextUrl.searchParams.get("sourceName")

    try {
        if (sourceName) {
            const graph = client.selectGraph(sourceName);
            const success = await graph.copy(name)
            if (!success) throw new Error("Failed to copy graph")
            return NextResponse.json({ success }, { status: 200 })
        }

        const type = request.nextUrl.searchParams.get("type")
        const openaikey = request.nextUrl.searchParams.get("key")
        const srcs = await request.json()


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { host, port } = (await client.connection).options?.socket as any

        if (!openaikey || !srcs || !host || !port || !type) throw new Error("Missing parameters")

        const res = await securedFetch(`http://localhost:5000/${prepareArg(type!)}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                host,
                port,
                name,
                srcs,
                openaikey,
            })
        })

        const result = await res.json()

        if (!res.ok) throw new Error(res.statusText)

        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {

    const session = await getClient()
    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { graph: graphId } = await params;
    const sourceName = request.nextUrl.searchParams.get("sourceName")

    try {
        if (!sourceName) throw new Error("Missing parameter sourceName")

        const data = await (await client.connection).renameNX(sourceName, graphId);

        if (!data) throw new Error(`${graphId} already exists`)

        return NextResponse.json({ data })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {

    const session = await getClient()
    if (session instanceof NextResponse) {
        return session
    }

    const { client, user } = session

    const { graph: graphId } = await params

    try {

        const query = request.nextUrl.searchParams.get("query")
        const timeout = request.nextUrl.searchParams.get("timeout")
        const create = request.nextUrl.searchParams.get("create")
        const { role } = user

        if (!query) throw new Error("Missing parameter query")

        if (create === "false" && !(await client.list()).some((g) => g === graphId))
            return NextResponse.json({}, { status: 200 })

        const graph = client.selectGraph(graphId)
        const timeoutNumber = timeout ? Number(timeout) * 1000 : undefined
        console.log(timeoutNumber)
        const result = role === "Read-Only"
            ? await graph.roQuery(query, { TIMEOUT: timeoutNumber })
            : await graph.query(query, { TIMEOUT: timeoutNumber })

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}