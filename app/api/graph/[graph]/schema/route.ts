import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions, { getConnection } from "../../../auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest, { params }: { params: { graph: string } }) {

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

    console.log(graphId);
    
    const queryN = `MATCH (n) WITH keys(n) as keys, labels(n) AS labels WITH CASE WHEN keys = [] THEN [NULL] ELSE keys END AS keys, labels UNWIND labels AS label UNWIND keys AS key WITH label, collect(DISTINCT key) AS keys RETURN {label:label, keys:keys} AS output`;
    
    const queryE = `MATCH ()-[r]->() WITH keys(r) as keys, type(r) AS types WITH CASE WHEN keys = [] THEN [NULL] ELSE keys END AS keys, types UNWIND types AS type UNWIND keys AS key WITH type, collect(DISTINCT key) AS keys RETURN {types:type, keys:keys} AS output`;
    
    try {
        if (graphId) {
            
            const graph = client.selectGraph(graphId);
            
            const resultN = await graph.query(queryN);
            const resultE = await graph.query(queryE);
            
            console.log(resultN);
            console.log(resultE);
            
            return NextResponse.json({ resultN, resultE }, { status: 200 })
        }
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}
