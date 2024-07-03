import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {

    const client = await getClient()

    if (client instanceof NextResponse) {
        return client
    }

    const type = request.nextUrl.searchParams.get("type")

    if (type === "config") {
        const config = await client.configGet("*")
        return NextResponse.json({ config }, { status: 200 })
    }

    try {
        const result = await client.list()
    
        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}
