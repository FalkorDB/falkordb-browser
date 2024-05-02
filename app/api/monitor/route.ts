import { NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

const fileds = [
    "used_memory",
    "used_memory_rss"
]
// eslint-disable-next-line import/prefer-default-export
export async function GET() {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const infoMemory = await client.connection.info("memory")
    const infoGraph = await client.info()

    const dataMemory = infoMemory.split('\r\n').map((item: string) => {
        const name = item.split(':')[0]
        const series = item.split(':')[1]
        return { name, series }
    }).filter((item: {name: string, series: string}) => fileds.find(filed => filed === item.name))
    const dataGraph: {name: string, series: number}[] = []
    for (let i = 0; i < infoGraph.length; i += 2) {
        const name = (infoGraph[i] as string).substring(2)
        const series = (infoGraph[i + 1] as string[]).length
        dataGraph.push({name, series})
    }
        
    return NextResponse.json({ memory: dataMemory, graph: dataGraph }, { status: 200 })

}
