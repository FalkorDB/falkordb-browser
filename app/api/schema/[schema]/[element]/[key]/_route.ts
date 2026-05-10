import { getClient } from "@/app/api/auth/[...nextauth]/options";
import {
  deleteSchemaElementAttribute,
  updateSchemaElementAttribute,
  validateBody,
} from "@/app/api/validate-body";
import { NextRequest, NextResponse } from "next/server";
import { formatAttribute } from "../utils";
import { resolveReadOnly } from "@/app/api/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string; key: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element, key } = await params;
    const schemaName = `${schema}_schema`;
    const elementId = Number(element);
    const body = await request.json();

    try {
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

      const query = type
        ? `MATCH (n) WHERE ID(n) = $id SET n.${formattedKey} = $value`
        : `MATCH ()-[e]->() WHERE ID(e) = $id SET e.${formattedKey} = $value`;

      const isReadOnly = resolveReadOnly(request, user.role);

      if (isReadOnly) {
        return NextResponse.json(
          { message: "Forbidden: read-only connection" },
          { status: 403 }
        );
      }

      await graph.query(query, {
        params: { id: elementId, value: formattedValue },
      });

      return NextResponse.json(
        { message: "Attribute updated successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string; key: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element, key } = await params;
    const schemaName = `${schema}_schema`;
    const elementId = Number(element);
    const body = await request.json();

    try {
      const validation = validateBody(deleteSchemaElementAttribute, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { type } = validation.data;

      const graph = client.selectGraph(schemaName);
      const query = type
        ? `MATCH (n) WHERE ID(n) = $id SET n.${key} = NULL`
        : `MATCH ()-[e]->() WHERE ID(e) = $id SET e.${key} = NULL`;

      const isReadOnly = resolveReadOnly(request, user.role);

      if (isReadOnly) {
        return NextResponse.json(
          { message: "Forbidden: read-only connection" },
          { status: 403 }
        );
      }

      await graph.query(query, { params: { id: elementId } });

      return NextResponse.json(
        { message: "Attribute deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
