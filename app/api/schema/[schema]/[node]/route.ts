import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { formatAttributes } from "./utils";
import {
  createSchemaNodeSchema,
  deleteSchemaNodeSchema,
  validateRequest,
} from "../../../validation-schemas";

// eslint-disable-next-line import/prefer-default-export
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
    const { schema } = await params;
    const schemaName = `${schema}_schema`;
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(createSchemaNodeSchema, {
      schema,
      ...body,
    });

    if (!validation.success) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }

    const { type, label, attributes, selectedNodes } = validation.data;

    try {
      if (!type) {
        if (!selectedNodes || selectedNodes.length !== 2)
          throw new Error("Selected nodes are required");
      }

      const formattedAttributes = formatAttributes(Object.entries(attributes));
      const graph = client.selectGraph(schemaName);
      const query = type
        ? `CREATE (n${label.length > 0 ? `:${label.join(":")}` : ""}${
            formattedAttributes?.length > 0
              ? ` {${formattedAttributes
                  .map(([k, v]) => `${k}: "${v}"`)
                  .join(",")}}`
              : ""
          }) RETURN n`
        : `MATCH (a), (b) WHERE ID(a) = ${selectedNodes![0].id} AND ID(b) = ${
            selectedNodes![1].id
          } CREATE (a)-[e:${label[0]}${
            formattedAttributes?.length > 0
              ? ` {${formattedAttributes
                  .map(([k, v]) => `${k}: "${v}"`)
                  .join(",")}}`
              : ""
          }]->(b) RETURN e`;
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query)
          : await graph.query(query);

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
    const nodeId = Number(node);
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(deleteSchemaNodeSchema, {
      schema,
      node,
      ...body,
    });

    if (!validation.success) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }

    const { type } = validation.data;

    try {
      const graph = client.selectGraph(schemaName);
      const query = type
        ? `MATCH (n) WHERE ID(n) = $nodeId DELETE n`
        : `MATCH ()-[e]-() WHERE ID(e) = $nodeId DELETE e`;

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { nodeId } });
      else await graph.query(query, { params: { nodeId } });

      return NextResponse.json(
        { message: "Node deleted successfully" },
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
