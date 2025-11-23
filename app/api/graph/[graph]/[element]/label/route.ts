import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import {
  addGraphElementLabel,
  removeGraphElementLabel,
  validateBody,
} from "../../../../validate-body";

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
      const validation = validateBody(removeGraphElementLabel, body);

      if (!validation.success) {
        return NextResponse.json({ message: validation.error }, { status: 400 });
      }

      const { label } = validation.data;
      const query = `MATCH (n) WHERE ID(n) = $elementId REMOVE n:${label}`;
      const graph = client.selectGraph(graphId);

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { elementId } });
      else await graph.query(query, { params: { elementId } });

      return NextResponse.json(
        { message: "Label removed successfully" },
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

export async function POST(
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
      const validation = validateBody(addGraphElementLabel, body);

      if (!validation.success) {
        return NextResponse.json({ message: validation.error }, { status: 400 });
      }

      const { label } = validation.data;
      const query = `MATCH (n) WHERE ID(n) = $elementId SET n:${label}`;
      const graph = client.selectGraph(graphId);

      if (user.role === "Read-Only") 
        await graph.roQuery(query, { params: { elementId } });
       else 
        await graph.query(query, { params: { elementId } });
      

      return NextResponse.json(
        { message: "Label added successfully" },
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
