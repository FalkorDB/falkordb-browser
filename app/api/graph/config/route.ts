import { NextResponse } from "next/server"
import { getClient } from "../../auth/[...nextauth]/options"

// eslint-disable-next-line import/prefer-default-export
export async function GET() {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session
    try {
        const configs = await client.configGet("*")
        return NextResponse.json({ configs }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to get configs" }, { status: 500 })
    }
}