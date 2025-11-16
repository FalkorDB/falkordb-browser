import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { formatAttribute } from "../utils";
import {
  updateSchemaElementAttribute,
  deleteSchemaElementAttribute,
  validateBody,
} from "../../../../validate-body";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ schema: string; element: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element, key } = await params;
    const schemaName = `${schema}_schema`;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(updateSchemaElementAttribute, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { type, attribute } = validation.data;
      const [formattedKey, formattedValue] = formatAttribute([key, attribute]);
      const graph = client.selectGraph(schemaName);
      const q = type
        ? `MATCH (n) WHERE ID(n) = $id SET n[$formattedKey] = $value`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $id SET e[$formattedKey] = $value`;

      if (user.role === "Read-Only")
        await graph.roQuery(q, {
          params: { id: elementId, value: formattedValue, key: formattedKey },
        });
      else
        await graph.query(q, {
          params: { id: elementId, value: formattedValue, key: formattedKey },
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
  {
    params,
  }: { params: Promise<{ schema: string; element: string; key: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element, key } = await params;
    const schemaName = `${schema}_schema`;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(deleteSchemaElementAttribute, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { type } = validation.data;
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
