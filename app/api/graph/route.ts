import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    try {
        const result = await client.list()
        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}
