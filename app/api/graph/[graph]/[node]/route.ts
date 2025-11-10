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

    // Validate node ID
    if (!Number.isInteger(nodeId) || nodeId < 0) {
      return NextResponse.json(
        { message: "Invalid node ID" },
        { status: 400 }
      );
    }

    // Validate graph ID
    if (!graphId || typeof graphId !== 'string' || graphId.trim().length === 0) {
      return NextResponse.json(
        { message: "Invalid graph ID" },
        { status: 400 }
      );
    }

    try {
      const graph = client.selectGraph(graphId);

      // Get node's neighbors (using parameterized query to prevent injection)
      const query = `MATCH (src)-[e]-(n)
                          WHERE ID(src) = $nodeId
                          RETURN e, n`;

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { nodeId } })
          : await graph.query(query, { params: { nodeId } });

      return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to fetch node neighbors" },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error" },
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

    // Validate node ID
    if (!Number.isInteger(nodeId) || nodeId < 0) {
      return NextResponse.json(
        { message: "Invalid node ID" },
        { status: 400 }
      );
    }

    // Validate graph ID
    if (!graphId || typeof graphId !== 'string' || graphId.trim().length === 0) {
      return NextResponse.json(
        { message: "Invalid graph ID" },
        { status: 400 }
      );
    }

    try {
      if (type === undefined) {
        return NextResponse.json(
          { message: "Type is required" },
          { status: 400 }
        );
      }

      const graph = client.selectGraph(graphId);
      const query = type
        ? `MATCH (n) WHERE ID(n) = $nodeId DELETE n`
        : `MATCH ()-[e]-() WHERE ID(e) = $nodeId DELETE e`;
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { nodeId } })
          : await graph.query(query, { params: { nodeId } });

      if (!result) {
        return NextResponse.json(
          { message: "Failed to delete node" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: "Node deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to delete node" },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}