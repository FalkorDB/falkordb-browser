import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { addSchemaElementLabel, removeSchemaElementLabel, validateBody } from "../../../../validate-body";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element } = await params;
    const schemaName = `${schema}_schema`;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(addSchemaElementLabel, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { label } = validation.data;
      const graph = client.selectGraph(schemaName);
      const query = `MATCH (n) WHERE ID(n) = $id SET n:${label}`;

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { id: elementId } });
      else await graph.query(query, { params: { id: elementId } });

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element } = await params;
    const schemaName = `${schema}_schema`;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(removeSchemaElementLabel, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { label } = validation.data;
      const graph = client.selectGraph(schemaName);

      const query = `MATCH (n) WHERE ID(n) = $id REMOVE n:${label}`;

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { id: elementId } });
      else await graph.query(query, { params: { id: elementId } });

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
