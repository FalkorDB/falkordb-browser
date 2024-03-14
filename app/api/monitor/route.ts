import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions, { getConnection } from "../auth/[...nextauth]/options";

const fileds = [
    "used_memory",
    "used_memory_rss",
]

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

    try {
        const memoryData: {name: string, series: string}[] = (await client.info("memory")).split('\r\n').map((item: string) => {
            const name = item.split(':')[0]
            const series = item.split(':')[1]
            const filed = fileds.find(filed => filed === name)
            if (filed) {
                return { name: name, series: series }
            }
            return
        })
        memoryData.splice(0, 1)
        
        // const graphData = (await client.graph)
        // .split('\r\n').map((item: string) => {
        //     const name = item.split(':')[0]
        //     const series = item.split(':')[1]
        //     const filed = fileds.find(filed => filed === name)
        //     if (filed) {
        //         return { name: name, series: series }
        //     }
        //     return
        // })
        // graphData.splice(0, 1)
        // console.log(graphData);
        return NextResponse.json({
            memory : memoryData.filter((item) => item != null),
            // graph : graphData.filter((item: null) => item != null),
        }, { status: 200 })
    } catch (e) {
        console.error(e);
    }
}
