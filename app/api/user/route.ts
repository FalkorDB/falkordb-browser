import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

const ROLE = new Map<string, string[]>(
    [
        ["Admin", ["on", "allkeys", "+@all"]],
        ["Read-Write", ["on", "allkeys", "+GRAPH.QUERY", "+GRAPH.PROFILE", "+GRAPH.EXPLAIN", "+GRAPH.LIST", "+PING"]],
        ["Read-Only", ["on", "allkeys", "+GRAPH.RO_QUERY", "+GRAPH.EXPLAIN", "+GRAPH.LIST", "+PING"]]
    ]
)

interface User {
    username: string
    password: string
    role: string
}

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

    const { username, password, role } = await req.json() as User

    const roleValue = ROLE.get(role)
    try {
        if (!username || !password || !roleValue) throw (new Error("Missing parameters"))
        
        await client.connection.aclSetUser(username, roleValue.concat(`>${password}`))
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