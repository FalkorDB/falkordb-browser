import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { formatAttribute } from "../utils";
import {
  updateSchemaNodeAttributeSchema,
  deleteSchemaNodeAttributeSchema,
  validateRequest,
} from "../../../../validation-schemas";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; node: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, node, key } = await params;
    const schemaName = `${schema}_schema`;
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(updateSchemaNodeAttributeSchema, {
      schema,
      node,
      key,
      ...body,
    });

    if (!validation.success) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }

    const { type, attribute } = validation.data;

    try {
      const [formattedKey, formattedValue] = formatAttribute([key, attribute]);
      const graph = client.selectGraph(schemaName);
      const q = type
        ? `MATCH (n) WHERE ID(n) = ${node} SET n.${formattedKey} = "${formattedValue}"`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = ${node} SET e.${formattedKey} = "${formattedValue}"`;

      if (user.role === "Read-Only") await graph.roQuery(q);
      else await graph.query(q);

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
  { params }: { params: Promise<{ schema: string; node: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, node, key } = await params;
    const schemaName = `${schema}_schema`;
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(deleteSchemaNodeAttributeSchema, {
      schema,
      node,
      key,
      ...body,
    });

    if (!validation.success) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }

    const { type } = validation.data;

    try {
      const graph = client.selectGraph(schemaName);
      const q = type
        ? `MATCH (n) WHERE ID(n) = ${node} SET n.${key} = NULL`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = ${node} SET e.${key} = NULL`;

      if (user.role === "Read-Only") await graph.roQuery(q);
      else await graph.query(q);

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
