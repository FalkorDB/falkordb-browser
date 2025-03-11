import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest, { params }: { params: Promise<{ graph: string }> }) {

    const session = await getClient()
    if (session instanceof NextResponse) {
        return session
    }

    const { client } = session

    const { graph: graphId } = await params;
    const query = request.nextUrl.searchParams.get("query")

    try {
        if (!query) throw new Error("Missing parameter query")

        const graph = client.selectGraph(graphId)
        const result = await graph.explain(query);

        return NextResponse.json({ result })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: (error as Error).message }, { status: 400 })
    }
}
