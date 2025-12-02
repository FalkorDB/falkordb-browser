import { getClient } from "@/app/api/auth/[...nextauth]/options";
import {
  deleteSchemaElementAttribute,
  updateSchemaElementAttribute,
  validateBody,
} from "@/app/api/validate-body";
import { NextRequest, NextResponse } from "next/server";
import { formatAttribute } from "../utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema: schemaName, element } = await params;
    const schemaId = `${schemaName}_schema`;
    const elementId = Number(element);

    try {
      const schema = client.selectGraph(schemaId);

      // Get node's neighbors
      const query = `MATCH (src)-[e]-(n)
                          WHERE ID(src) = $id
                          RETURN e, n`;

      const result =
        user.role === "Read-Only"
          ? await schema.roQuery(query, { params: { id: elementId } })
          : await schema.query(query, { params: { id: elementId } });

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
    const elementId = Number(node);
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
      const q = type
        ? `MATCH (n) WHERE ID(n) = $id SET n.${formattedKey} = $value`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $id SET e.${formattedKey} = $value`;
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(q, {
              params: { id: elementId, value: formattedValue },
            })
          : await graph.query(q, {
              params: { id: elementId, value: formattedValue },
            });

      if (!result) throw new Error("Something went wrong");

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
    const elementId = Number(node);
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
      const q = type
        ? `MATCH (n) WHERE ID(n) = $id SET n.${key} = NULL`
        : `MATCH (n)-[e]-(m) WHERE ID(e) = $id SET e.${key} = NULL`;
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(q, { params: { id: elementId } })
          : await graph.query(q, { params: { id: elementId } });

      if (!result) throw new Error("Something went wrong");

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
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
