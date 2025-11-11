import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { formatAttribute } from "../utils";

// Validation schemas
const patchBodySchema = z.object({
  type: z.boolean({
    required_error: "Type is required",
    invalid_type_error: "Invalid Type",
  }),
  attribute: z.array(z.string(), {
    required_error: "Attribute is required",
    invalid_type_error: "Invalid Attribute",
  }),
});

const deleteBodySchema = z.object({
  type: z.boolean({
    required_error: "Type is required",
    invalid_type_error: "Invalid Type",
  }),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element, key } = await params;
    const elementId = Number(element);
    const schemaName = `${schema}_schema`;
    const validationResult = patchBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { type, attribute } = validationResult.data;

      const [formattedKey, formattedValue] = formatAttribute([key, attribute]);
      const graph = client.selectGraph(schemaName);
      const q = type
        ? `MATCH (n) WHERE ID(n) = $elementId SET n.${formattedKey} = $value`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $elementId SET e.${formattedKey} = $value`;
      if (user.role === "Read-Only")
        await graph.roQuery(q, {
          params: { elementId, value: formattedValue },
        });
      else
        await graph.query(q, {
          params: { elementId, value: formattedValue },
        });

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
  { params }: { params: Promise<{ schema: string; element: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element, key } = await params;
    const elementId = Number(element);
    const schemaName = `${schema}_schema`;
    const validationResult = deleteBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { type } = validationResult.data;

      const graph = client.selectGraph(schemaName);
      const q = type
        ? `MATCH (n) WHERE ID(n) = $elementId SET n.${key} = NULL`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $elementId SET e.${key} = NULL`;

      if (user.role === "Read-Only")
        await graph.roQuery(q, { params: { elementId } });
      else await graph.query(q, { params: { elementId } });

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
