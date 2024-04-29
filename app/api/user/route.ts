import { NextResponse } from "next/server";
import { getClient } from "../auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET() {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }
    try {
        const users = await client.connection.aclUsers()
        return NextResponse.json({ result: { users } }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}
