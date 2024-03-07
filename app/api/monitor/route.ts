import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions, { connections } from "../auth/[...nextauth]/options";

const fileds = [
    "used_memory",
    "used_memory_human",
    "used_memory_rss",
]

// eslint-disable-next-line import/prefer-default-export
export async function GET() {

    const session = await getServerSession(authOptions)
    const id = session?.user?.id
    if (!id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const client = connections.get(id)
    if (!client) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    try {
        const data = (await client.info("memory")).split('\r\n').map((item) => {
            const name = item.split(':')[0]
            const series = item.split(':')[1]
            const filed = fileds.find(filed => filed === name)
            if (filed) {
                return { name: name, series: series }
            }
            return
        })
        data.splice(0, 1)

        return NextResponse.json(data.filter(item => item != null), { status: 200 })
    } catch (e) {
        console.error(e);
    }
}
