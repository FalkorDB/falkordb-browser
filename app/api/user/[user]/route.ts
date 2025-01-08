import { NextRequest, NextResponse } from "next/server"
import { getClient } from "../../auth/[...nextauth]/options"
import { ROLE } from "../model"

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ user: string }> }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const { user: username } = await params
    const role = ROLE.get(req.nextUrl.searchParams.get("role") || "")
    try {
        if (!role) return console.log("Role is missing")

        await (await client.connection).aclSetUser(username, role)
        return NextResponse.json({ message: "User created" }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}