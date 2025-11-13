import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import {
  deleteGraphElement,
  validateBody,
} from "../../../validate-body";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, element } = await params;
    const elementId = Number(element);

    try {
      const graph = client.selectGraph(graphId);

      // Get node's neighbors
      const query = `MATCH (src)-[e]-(n)
                          WHERE ID(src) = $elementId
                          RETURN e, n`;

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { elementId } })
          : await graph.query(query, { params: { elementId } });

      return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, element } = await params;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(deleteGraphElement, body);

      if (!validation.success) {
        return NextResponse.json({ message: validation.error }, { status: 400 });
      }

      const { type } = validation.data;
      const graph = client.selectGraph(graphId);
      const query = type
        ? `MATCH (n) WHERE ID(n) = $elementId DELETE n`
        : `MATCH ()-[e]-() WHERE ID(e) = $elementId DELETE e`;

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { elementId } });
      else await graph.query(query, { params: { elementId } });

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
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
