import { NextResponse } from "next/server"
import { getClient } from "../../auth/[...nextauth]/options"

// eslint-disable-next-line import/prefer-default-export
export async function GET() {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const configs = await client.configGet("*")

    return NextResponse.json({ configs }, { status: 200 })
}