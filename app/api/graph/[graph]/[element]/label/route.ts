import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import {
  addGraphElementLabel,
  removeGraphElementLabel,
  validateBody,
} from "../../../../validate-body";
import { getCorsHeaders } from "../../../../utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; element: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, element } = await params;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(removeGraphElementLabel, body);

      if (!validation.success) {
        return NextResponse.json({ message: validation.error }, { status: 400, headers: getCorsHeaders(request) });
      }

      const { label } = validation.data;
      const query = `MATCH (n) WHERE ID(n) = $id REMOVE n:${label}`;
      const graph = client.selectGraph(graphId);

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { id: elementId } });
      else await graph.query(query, { params: { id: elementId } });

      return NextResponse.json(
        { message: "Label removed successfully" },
        { status: 200, headers: getCorsHeaders(request) }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; element: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, element } = await params;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(addGraphElementLabel, body);

      if (!validation.success) {
        return NextResponse.json({ message: validation.error }, { status: 400, headers: getCorsHeaders(request) });
      }

      const { label } = validation.data;
      const query = `MATCH (n) WHERE ID(n) = $id SET n:${label}`;
      const graph = client.selectGraph(graphId);

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { id: elementId } });
      else
        await graph.query(query, { params: { id: elementId } });
      

      return NextResponse.json(
        { message: "Label added successfully" },
        { status: 200, headers: getCorsHeaders(request) }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
