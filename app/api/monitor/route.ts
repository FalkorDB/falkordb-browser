import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions, { getConnection } from "../auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET() {

    const session = await getServerSession(authOptions)
    const id = session?.user?.id
    if (!id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const client = await getConnection(session.user)
    if (!client) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const data = (await client.info("memory")).split('\r\n').map((data) => {
        const name = data.split(':')[0]
        const num = data.split(':')[1]
        return { name: name, data: num }
    })

    data.splice(0, 1)

    return NextResponse.json(data, { status: 200 })

}
