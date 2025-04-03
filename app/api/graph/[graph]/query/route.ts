import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

const INITIAL = Number(process.env.INITIAL) || 0

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest) {
    const session = await getClient()
    if (session instanceof NextResponse) {
        return session
    }

    const { cache } = session

    const resultId = request.nextUrl.searchParams.get("id")

    try {
        if (!resultId) throw new Error("Missing parameter id")

        const id = Number(resultId)
        // Get the result from the cache
        const cached = cache.get(id)

        if (!cached) return NextResponse.json({ message: "No request found" }, { status: 404 })

        // If the result is not in the cache, wait for it to be in the cache
        if (!cached.result) {
            await new Promise<void>(resolve => {
                const timeout = setTimeout(() => {
                    resolve()
                }, INITIAL)

                cached.callback = () => {
                    clearTimeout(timeout)
                    resolve()
                }
            })

            // Delete the callback from the cache
            cached.callback = undefined

            // If the result is still not in the cache, return the id
            if (!cached.result) {
                return NextResponse.json({ result: id }, { status: 200 })
            }
        }

        // Delete the result from the cache
        cache.delete(id)

        // If the result is an error, return the error
        if (cached.result instanceof Error) {
            return NextResponse.json({ error: cached.result.message }, { status: 400 })
        }

        // Return the result
        return NextResponse.json({ result: cached.result }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: (error as Error).message }, { status: 400 })
    }
}