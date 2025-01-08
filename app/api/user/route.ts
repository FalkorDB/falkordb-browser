import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { User, CreateUser, ROLE } from "./model";

export async function GET() {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }
    try {
        const list = await (await client.connection).aclList()
        const result: User[] = list
            .map((userACL: string) => userACL.split(" "))
            .filter((userDetails: string[]) => userDetails.length > 1 && userDetails[0] === "user")
            .map((userDetails: string[]) => {
                // find key in ROLE that has a value equals to userDetails by comaring each array
                const role = Array
                    .from(ROLE.entries())
                    .find(([, value]) => {
                        const reversed = value.slice(1).reverse()
                        return reversed.every((val, index) => userDetails[userDetails.length - 1 - index] === val)
                    })

                return {
                    username: userDetails[1],
                    role: role ? role[0] : "Unknown",
                    selected: false,
                }
            })

        return NextResponse.json({ result }, { status: 200 })
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

export async function POST(req: NextRequest) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const connection = await client.connection
    const { username, password, role } = await req.json() as CreateUser
    
    const roleValue = ROLE.get(role)

    try {
        if (!username || !password || !roleValue) return console.error("Missing parameters")

        try {
            const user = await connection.aclGetUser(username)

            if (user) {
                return NextResponse.json({ message: `User ${username} already exists` }, { status: 409 })
            }
        } catch (err: unknown) {
            // Just a workaround for https://github.com/redis/node-redis/issues/2745
        }

        await connection.aclSetUser(username, roleValue.concat(`>${password}`))
        return NextResponse.json(
            { message: "Success" },
            {
                status: 201,
                headers: {
                    location: `/api/db/user/${username}`
                }
            }
        )
    } catch (err: unknown) {
        console.error(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

export async function DELETE(req: NextRequest) {

    const client = await getClient()

    if (client instanceof NextResponse) {
        return client
    }

    const connection = await client.connection
    const { users } = await req.json()

    try {
        await Promise.all(users.map(async (user: User) => {
            await connection.aclDelUser(user.username)
        }))

        return NextResponse.json({ message: "Users deleted" }, { status: 200 })
    } catch (err: unknown) {
        console.log(err)
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}