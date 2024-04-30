import { NextRequest, NextResponse } from "next/server";
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

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: NextRequest) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const { username, password } = await req.json()
    try {
        await client.connection.aclSetUser(username, ["on", "allkeys", "+@all", `>${password}`])
        return NextResponse.json(
            { message: "User created" },
            {
                status: 201,
                headers: {
                    location: `/api/db/user/${username}`
                }
            }
        )
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

// eslint-disable-next-line import/prefer-default-export
export async function DELETE(req: NextRequest) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const { users } = await req.json()
    try {
        await Promise.all(users.map(async (username: string) => {
            await client.connection.aclDelUser(username)
        }))
        return NextResponse.json({ message: "Users deleted" }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}