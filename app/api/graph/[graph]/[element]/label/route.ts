import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const bodySchema = z.object({
  label: z.string({
    required_error: "Label is required",
    invalid_type_error: "Invalid Label",
  }),
});

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
    const nodeId = Number(element);
    const validationResult = bodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { label } = validationResult.data;

      const query = `MATCH (n) WHERE ID(n) = $nodeId REMOVE n:${label}`;
      const graph = client.selectGraph(graphId);
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { nodeId } })
          : await graph.query(query, { params: { nodeId } });

      if (!result) throw new Error("Failed to delete label");

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
    const nodeId = Number(element);
    const validationResult = bodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { label } = validationResult.data;

      const query = `MATCH (n) WHERE ID(n) = $nodeId SET n:${label}`;
      const graph = client.selectGraph(graphId);
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { nodeId } })
          : await graph.query(query, { params: { nodeId } });

      if (!result) throw new Error("Failed to set label");

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
