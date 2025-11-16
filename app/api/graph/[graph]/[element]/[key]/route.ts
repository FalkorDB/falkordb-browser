import { NextResponse, NextRequest } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import {
  updateGraphElementAttribute,
  deleteGraphElementAttribute,
  validateBody,
} from "../../../../validate-body";

export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ graph: string; element: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, element, key } = await params;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(updateGraphElementAttribute, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { value, type } = validation.data;
      const graph = client.selectGraph(graphId);

      const query = type
        ? `MATCH (n) WHERE ID(n) = $elementId SET n.${key} = $value`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $elementId SET e.${key} = $value`;

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { elementId, value } })
          : await graph.query(query, { params: { elementId, value } });

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
  {
    params,
  }: { params: Promise<{ graph: string; element: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;

    const { graph: graphId, element, key } = await params;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(deleteGraphElementAttribute, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { type } = validation.data;
      const graph = client.selectGraph(graphId);

      const query = type
        ? `MATCH (n) WHERE ID(n) = $id SET n.[$key] = NULL`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $id SET e[$key] = NULL`;

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { id: elementId, key } })
          : await graph.query(query, { params: { id: elementId, key } });

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
