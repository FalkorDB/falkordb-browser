import { NextRequest, NextResponse } from "next/server";
import { getClient } from "../../auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET(_request: NextRequest, { params }: { params: {schema: string} }) {
    const client = await getClient()
    if (client instanceof NextResponse) {
        return client
    }

    const schemaId = params.schema;

    try {
        if (!schemaId) throw new Error("Missing SchemaID")

        const graph = client.selectGraph(schemaId);

        const query = `MATCh (n)-[e]-(m) return n,e,m`

        const result = await graph.query(query)

        return NextResponse.json({ result })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}