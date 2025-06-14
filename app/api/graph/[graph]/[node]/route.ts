import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; node: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, node } = await params;
    const nodeId = Number(node);

    try {
      const graph = client.selectGraph(graphId);

      // Get node's neighbors
      const query = `MATCH (src)-[e]-(n)
                          WHERE ID(src) = $nodeId
                          RETURN e, n`;

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { nodeId } })
          : await graph.query(query, { params: { nodeId } });

      return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; node: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, node } = await params;
    const nodeId = Number(node);
    const { type } = await request.json();

    try {
      if (type === undefined) throw new Error("Type is required");

      const graph = client.selectGraph(graphId);
      const query = type
        ? `MATCH (n) WHERE ID(n) = $nodeId DELETE n`
        : `MATCH ()-[e]-() WHERE ID(e) = $nodeId DELETE e`;
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { nodeId } })
          : await graph.query(query, { params: { nodeId } });

      if (!result) throw new Error("Something went wrong");

      return NextResponse.json(
        { message: "Node deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}