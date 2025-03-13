import { NextRequest, NextResponse } from "next/server"
import { getClient } from "../../auth/[...nextauth]/options"

export async function GET() {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const configs = await client.configGet("*")

    return NextResponse.json({ configs }, { status: 200 })
}

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {

    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const configName = request.nextUrl.searchParams.get("config")
    const value = request.nextUrl.searchParams.get("value")


    try {
        if (configName && value) {
            const config = await client.configSet(configName, configName === "CMD_INFO" ? value : parseInt(value, 10))
            return NextResponse.json({ config }, { status: 200 })
        }
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}