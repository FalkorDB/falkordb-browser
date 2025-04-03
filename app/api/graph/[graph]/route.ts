import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { GraphReply } from "falkordb/dist/src/graph";

const INITIAL = Number(process.env.INITIAL) || 0

// Generate a unique id for each request
function* generateId(): Generator<number, number, number> {
    let id = 0;
    while (true) {
        yield id;
        id += 1;
    }
}

// create a generator for the unique ids
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

// send a query to the graph and return the result
// if the query is taking too long, return a timeout and save the result in the cache
export async function GET(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {
    const session = await getClient()
    if (session instanceof NextResponse) {
        return session
    }

    const { client, user, cache } = session
    const { graph: graphId } = await params
    const query = request.nextUrl.searchParams.get("query")
    const { role } = user

    try {
        if (!query) throw new Error("Missing parameter query")

        const graph = client.selectGraph(graphId)

        // Create a promise to resolve the result
        const result = await new Promise<GraphReply<unknown> | number>((resolve, reject) => {
            const id = idGenerator.next().value

            // Set a timeout to resolve the result if it takes too long
            const timeout = setTimeout(() => {
                cache.set(id, { callback: undefined, result: undefined })
                console.log("Setting timeout");
                resolve(id)
            }, INITIAL)

            setTimeout(() => {
                const res = role === "Read-Only"
                    ? graph.roQuery(query)
                    : graph.query(query)

                res.then((r) => {
                    if (!r) throw new Error("Something went wrong")

                    // If the result is already in the cache, save it
                    const cached = cache.get(id)
                    if (cached) {
                        cached.result = r
                        console.log("Setting result");
                        if (typeof cached.callback === "function") {
                            cached.callback()
                        }
                        return
                    }

                    clearTimeout(timeout)
                    resolve(r)
                }).catch((error) => {
                    // If the error is already in the cache, save it
                    const cached = cache.get(id)
                    if (cached) {
                        cached.result = error as Error
                        console.log("Setting error");
                        if (typeof cached.callback === "function") {
                            cached.callback()
                        }
                        return
                    }

                    clearTimeout(timeout)
                    reject(error)
                })
            }, INITIAL * 2)
        })

        // If the result is a number, return the id
        if (typeof result === "number") {
            return NextResponse.json({ result }, { status: 200 })
        }

        // If the result is does not exist, throw an error
        if (!result) throw new Error("Something went wrong")

        // Return the result
        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}