import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { ROLE } from "../route";

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(req: NextRequest, { params }: { params: { user: string } }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const username = params.user
    const role = req.nextUrl.searchParams.get("role")

    try {
        if (!username || !role) throw (new Error("Missing parameters"))

        await client.connection.aclSetUser(username, ROLE.get(role) as string[])

        return NextResponse.json({ message: "User updated" }, { status: 200 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}