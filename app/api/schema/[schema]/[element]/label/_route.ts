import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { addSchemaElementLabel, removeSchemaElementLabel, validateBody } from "@/app/api/validate-body";
import { NextRequest, NextResponse } from "next/server";

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
    const elementId = Number(node);
    const schemaName = `${schema}_schema`;
    const body = await request.json();

    try {
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
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { id: elementId } })
          : await graph.query(query, { params: { id: elementId } });

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
  { params }: { params: Promise<{ schema: string; node: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, node } = await params;
    const elementId = Number(node);
    const body = await request.json();
    const schemaName = `${schema}_schema`;

    try {
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
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { id: elementId } })
          : await graph.query(query, { params: { id: elementId } });

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
