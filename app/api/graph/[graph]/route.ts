import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions, { getConnection } from "../../auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function DELETE(request: NextRequest, { params }: { params: { graph: string } }) {

    const session = await getServerSession(authOptions)
    const id = session?.user?.id
    if (!id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const client = await getConnection(session.user)
    if (!client) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const graphId = params.graph;

    try {
        if (graphId) {
            
            const graph = client.selectGraph(graphId);

            await graph.delete()
            console.log(client.list());
            
            return NextResponse.json({ message: `${graphId} graph deleted` })
        }
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}
