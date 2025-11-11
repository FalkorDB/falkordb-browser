import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// Validation schemas
const postBodySchema = z.object({
  type: z.boolean({
    required_error: "Type is required",
    invalid_type_error: "Invalid Type",
  }),
  value: z.string({
    required_error: "Value is required",
    invalid_type_error: "Invalid Value",
  }),
});

const deleteBodySchema = z.object({
  type: z.boolean({
    required_error: "Type is required",
    invalid_type_error: "Invalid Type",
  }),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; element: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, element, key } = await params;
    const elementId = Number(element);
    const validationResult = postBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { value, type } = validationResult.data;

      const graph = client.selectGraph(graphId);
      const query = type
        ? `MATCH (n) WHERE ID(n) = $elementId SET n.${key} = $value`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $elementId SET e.${key} = $value`;
      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { elementId, value } });
      else await graph.query(query, { params: { elementId, value } });

      return NextResponse.json(
        { message: "Attribute updated successfully" },
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
  { params }: { params: Promise<{ graph: string; element: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, element, key } = await params;
    const elementId = Number(element);
    const validationResult = deleteBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { type } = validationResult.data;

      const graph = client.selectGraph(graphId);

      const query = type
        ? `MATCH (n) WHERE ID(n) = $elementId SET n.\`${key}\` = NULL`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $elementId SET e.\`${key}\` = NULL`;

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { elementId } });
      else await graph.query(query, { params: { elementId } });

      return NextResponse.json(
        { message: "Attribute deleted successfully" },
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
