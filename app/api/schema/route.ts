import { NextResponse } from "next/server"
import { getClient } from "../auth/[...nextauth]/options"

// eslint-disable-next-line import/prefer-default-export
export async function GET() {
    const session = await getClient()

    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    try {
        const result = await client.list()
        const schemaNames = result
            .filter(name => name.endsWith("_schema"))
            .map(name => {
                let graphName = name.split("_")[0]
                if (graphName.startsWith("{") && graphName.endsWith("}")) {
                    graphName = graphName.substring(1, graphName.length - 1)
                }
                return graphName
            })

        return NextResponse.json({ opts: schemaNames }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}
