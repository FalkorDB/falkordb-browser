import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { commandOptions } from "redis";

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest, { params } : { params : { graph: string } }) {

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const graphId = params.graph

    try {
        
        const result = await client.connection.dump(
            commandOptions({ returnBuffers: true }),
            graphId
        )

        if (!result) throw new Error(`Failed to retrieve graph data for ID: ${graphId}`)

        return NextResponse.json({ result }, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}