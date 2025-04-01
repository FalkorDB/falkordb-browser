import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { GraphReply } from "falkordb/dist/src/graph";
import NodeCache from "node-cache";

const INITIAL = 3000

const results = new NodeCache();

function* generateId(): Generator<number, number, number> {
    let id = 0;
    while (true) {
        yield id;
        id += 1;
    }
}

const idGenerator = generateId()

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

    const { graph: graphId } = await params

    try {
        const graph = client.selectGraph(graphId)
        const result = await graph.query("RETURN 1")

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ message: "Graph created successfully" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
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

    const resultId = request.nextUrl.searchParams.get("id")

    try {
        if (resultId) {
            const id = Number(resultId)
            let result = results.get<GraphReply<unknown> | Error | undefined>(id)
            if (!result) {
                await new Promise(resolve => { setTimeout(resolve, INITIAL) })
                result = results.get<GraphReply<unknown> | Error | undefined>(id)
                if (!result) {
                    results.ttl(id, INITIAL * 2)
                    return NextResponse.json({ result: id }, { status: 200 })
                }
            }

            results.del(id)

            if (result instanceof Error) {
                return NextResponse.json({ error: result.message }, { status: 400 })
            }

            return NextResponse.json({ result }, { status: 200 })
        }

        const query = request.nextUrl.searchParams.get("query")
        const { role } = user

        if (!query) throw new Error("Missing parameter query")

        const graph = client.selectGraph(graphId)

        const result = await new Promise<GraphReply<unknown> | number>((resolve, reject) => {
            const id = idGenerator.next().value

            const timeout = setTimeout(() => {
                results.set(id, undefined, INITIAL * 2)
                resolve(id)
            }, INITIAL)

            const res = role === "Read-Only"
                ? graph.roQuery(query)
                : graph.query(query)

            res.then((r) => {
                if (!r) throw new Error("Something went wrong")

                if (results.has(id)) {
                    results.set(id, r)
                    return
                }

                clearTimeout(timeout)
                resolve(r)
            }).catch((error) => {
                if (results.has(id)) {
                    results.set(id, error as Error)
                    return
                }

                clearTimeout(timeout)
                reject(error)
            })
        })

        if (typeof result === "number") {
            return NextResponse.json({ result }, { status: 200 })
        }

        if (!result) throw new Error("Something went wrong")

        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}