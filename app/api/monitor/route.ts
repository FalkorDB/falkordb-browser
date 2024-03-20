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


    const info = await client.info("memory")
    
    if(typeof info === 'string') {

        const data = (info as string).split('\r\n').map((item) => {
            const name = item.split(':')[0]
            const num = item.split(':')[1]
            return { name, series: num }
        })

        data.splice(0, 1)
        return NextResponse.json(data, { status: 200 })
    } 

    return NextResponse.json({message: "Failed to retrive info"}, { status: 500 })

}
