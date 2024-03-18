import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions, { getConnection } from "../auth/[...nextauth]/options";

const fileds = [
    "used_memory",
    "used_memory_rss"
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

    const infoMemory = await client.connection.info("memory")
    const infoGraph = await client.info()

    const dataMemory = infoMemory.split('\r\n').map((item) => {
        const name = item.split(':')[0]
        const series = item.split(':')[1]
        return { name, series: series }
    }).filter(item => {
        return fileds.find(filed => filed == item.name)
    })
    const dataGraph: {name: string, series: number}[] = []
    for (let i = 0; i < infoGraph.length; i += 2) {
        const name = (infoGraph[i] as string).substring(2)
        const series = infoGraph[i + 1] as string[]
        dataGraph.push({name, series: series.length})
    }
        
    return NextResponse.json({ memory: dataMemory, graph: dataGraph }, { status: 200 })

}
