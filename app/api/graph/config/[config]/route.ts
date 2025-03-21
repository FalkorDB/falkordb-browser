import { getClient } from "@/app/api/auth/[...nextauth]/options"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ config: string }> }) {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { config: configName } = await params
    try {

        const config = await client.configGet(configName)
        return NextResponse.json({ config }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: (error as Error).message }, { status: 400 })
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ config: string }> }) {

    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { config: configName } = await params
    const value = request.nextUrl.searchParams.get("value")

    try {
        if (!value) throw new Error("Value is required")

        const parsedValue = configName === "CMD_INFO" ? value : parseInt(value, 10)

        if (configName !== "CMD_INFO" && Number.isNaN(parsedValue)) throw new Error("Invalid value")

        const config = await client.configSet(configName, parsedValue)
        return NextResponse.json({ config }, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}