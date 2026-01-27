import { NextResponse, NextRequest } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import {
  updateGraphElementAttribute,
  deleteGraphElementAttribute,
  validateBody,
} from "../../../../validate-body";
import { corsHeaders } from "../../../../utils";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

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
          { status: 400, headers: corsHeaders() }
        );
      }

      const { value, type } = validation.data;
      const graph = client.selectGraph(graphId);

      const query = type
        ? `MATCH (n) WHERE ID(n) = $id SET n.${key} = $value`
        : `MATCH ()-[e]->() WHERE ID(e) = $id SET e.${key} = $value`;

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { id: elementId, value } });
      else await graph.query(query, { params: { id: elementId, value } });

      return NextResponse.json(
        { message: "Attribute updated successfully" },
        { status: 200, headers: corsHeaders() }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: corsHeaders() }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: corsHeaders() }
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
          { status: 400, headers: corsHeaders() }
        );
      }

      const { type } = validation.data;
      const graph = client.selectGraph(graphId);

      const query = type
        ? `MATCH (n) WHERE ID(n) = $id SET n.${key} = NULL`
        : `MATCH ()-[e]->() WHERE ID(e) = $id SET e.${key} = NULL`;

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { id: elementId } });
      else await graph.query(query, { params: { id: elementId } });

      return NextResponse.json(
        { message: "Attribute deleted successfully" },
        { status: 200, headers: corsHeaders() }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: corsHeaders() }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
