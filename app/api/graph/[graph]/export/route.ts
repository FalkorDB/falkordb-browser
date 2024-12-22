import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { commandOptions } from "redis";

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest, props: { params : Promise<{ graph: string }> }) {
    const params = await props.params;

    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const graphId = params.graph

    try {
        
        const result = await (await client.connection).dump(
            commandOptions({ returnBuffers: true }),
            graphId
        )
        if (!result) throw new Error(`Failed to retrieve graph data for ID: ${graphId}`)
        
        return new NextResponse(result, {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${graphId}.dump"`
            }
        })
    } catch (err) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}