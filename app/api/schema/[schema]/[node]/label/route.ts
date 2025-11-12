import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { addSchemaNodeLabelSchema, removeSchemaNodeLabelSchema, validateRequest } from "../../../../validation-schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; node: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, node } = await params;
    const schemaName = `${schema}_schema`;
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(addSchemaNodeLabelSchema, {
      schema,
      node,
      ...body,
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    const { label } = validation.data;

    try {
      const graph = client.selectGraph(schemaName);
      const q = `MATCH (n) WHERE ID(n) = ${node} SET n:${label}`;
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(q)
          : await graph.query(q);

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
  { params }: { params: Promise<{ schema: string; node: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, node } = await params;
    const schemaName = `${schema}_schema`;
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(removeSchemaNodeLabelSchema, {
      schema,
      node,
      ...body,
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    const { label } = validation.data;

    try {
      const graph = client.selectGraph(schemaName);

      const q = `MATCH (n) WHERE ID(n) = ${node} REMOVE n:${label}`;
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(q)
          : await graph.query(q);

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
