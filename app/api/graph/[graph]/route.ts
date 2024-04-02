import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions, { getConnection } from "../../auth/[...nextauth]/options";

interface Response {
    props: string[];
    rels: string[];
    lbls: string[];
}

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

            return NextResponse.json({ message: `${graphId} graph deleted` })
        }
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}

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

    const query = `CALL db.labels() yield label
    WITH collect(label) as lbls
    CALL db.relationshipTypes() yield relationshipType
    WITH collect(relationshipType) as rels, lbls
    CALL db.propertyKeys() yield propertyKey
    RETURN collect(propertyKey) as props, rels, lbls`

    const graphs = await client.list()

    const graph = client.selectGraph(graphId);
    try {
        const userQuery = request.nextUrl.searchParams.get("query");
        if (userQuery) {
            const result = await graph.query(userQuery)
            return NextResponse.json({ result }, { status: 200 })
        }

            const data = await graph.query(query).then((res) => {
                if (res.data) {
                    const data = res.data[0] as Response;
                    return {
                        props: data.props,
                        relationships: data.rels,
                        labels: data.lbls
                    }
                }
            })
        if (data) {
            return NextResponse.json(data, { status: 200 })
        }
        return NextResponse.json({ status: 500 })
    } catch (err: unknown) {
        return NextResponse.json({ message: (err as Error).message }, { status: 400 })
    }
}