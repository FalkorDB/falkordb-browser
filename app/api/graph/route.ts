import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {

    const client = await getClient()

    if (client instanceof NextResponse) {
        return client
    }

    const configName = request.nextUrl.searchParams.get("config")

    if (configName) {
        const config = await client.configGet(configName)
        return NextResponse.json({ config }, { status: 200 })
    }

    try {
        const result = await client.list()
    
        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {

    const client = await getClient()

    if (client instanceof NextResponse) {
        return client
    }

    const configName = request.nextUrl.searchParams.get("config")
    const value = request.nextUrl.searchParams.get("value")

    
    try {
        if (configName && value) {
            const config = await client.configSet(configName, configName === "CMD_INFO" ? value : parseInt(value, 10))
            return NextResponse.json({ config }, { status: 200 })
        }
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}