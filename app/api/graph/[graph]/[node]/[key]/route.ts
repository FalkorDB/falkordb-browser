import { NextResponse, NextRequest } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; node: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, node, key } = await params;
    const nodeId = Number(node);
    const { value, type } = await request.json();

    try {
      if (type === undefined) throw new Error("Type is required");

      const graph = client.selectGraph(graphId);

      if (!value) throw new Error("Value is required");

      const query = type
        ? `MATCH (n) WHERE ID(n) = $nodeId SET n.${key} = $value`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $nodeId SET e.${key} = $value`;

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { nodeId, value } })
          : await graph.query(query, { params: { nodeId, value } });

      if (!result) throw new Error("Something went wrong");

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
  { params }: { params: Promise<{ graph: string; node: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;

    const { graph: graphId, node, key } = await params;
    const nodeId = Number(node);
    const { type } = await request.json();

    try {
      if (type === undefined) throw new Error("Type is required");

      const graph = client.selectGraph(graphId);

      const query = type
        ? `MATCH (n) WHERE ID(n) = $nodeId SET n.${key} = NULL`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $nodeId SET e.${key} = NULL`;

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { nodeId } })
          : await graph.query(query, { params: { nodeId } });

      if (!result) throw new Error("Something went wrong");

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
