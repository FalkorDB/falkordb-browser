import { NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function GET() {

    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    try {
        const result = await client.list()

        const graphNames = result.filter(name => !name.endsWith("_schema"))

        return NextResponse.json({ opts: graphNames }, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}