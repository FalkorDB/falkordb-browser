import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { formatAttributes } from "./utils";
import {
  createSchemaElement,
  deleteSchemaElement,
  validateBody,
} from "../../../validate-body";

// eslint-disable-next-line import/prefer-default-export
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema } = await params;
    const schemaName = `${schema}_schema`;

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(createSchemaElement, body);

      if (!validation.success) {
        return NextResponse.json({ message: validation.error }, { status: 400 });
      }

      const { type, label, attributes, selectedNodes } = validation.data;
      if (!type) {
        if (!selectedNodes || selectedNodes.length !== 2)
          throw new Error("Selected nodes are required");
        if (label.length !== 1)
          throw new Error("Label is required");
      }

      const formattedAttributes = formatAttributes(attributes);
      const graph = client.selectGraph(schemaName);
      const query = type
        ? `CREATE (n${label.length > 0 ? `:${label.join(":")}` : ""}${
            formattedAttributes?.length > 0
              ? ` {${formattedAttributes
                  .map(([k]) => `${k}: $attr_${k}`)
                  .join(",")}}`
              : ""
          }) RETURN n`
        : `MATCH (a), (b) WHERE ID(a) = $nodeA AND ID(b) = $nodeB CREATE (a)-[e:${label[0]}${
            formattedAttributes?.length > 0
              ? ` {${formattedAttributes
                  .map(([k]) => `${k}: $attr_${k}`)
                  .join(",")}}`
              : ""
          }]->(b) RETURN e`;
      
      const queryParams: Record<string, string | number> = {};
      if (!type && selectedNodes) {
        queryParams.nodeA = selectedNodes[0].id;
        queryParams.nodeB = selectedNodes[1].id;
      }
      if (formattedAttributes?.length > 0) {
        formattedAttributes.forEach(([k, v]) => {
          queryParams[`attr_${k}`] = v;
        });
      }
      
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: queryParams })
          : await graph.query(query, { params: queryParams });

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
  { params }: { params: Promise<{ schema: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element } = await params;
    const schemaName = `${schema}_schema`;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(deleteSchemaElement, body);

      if (!validation.success) {
        return NextResponse.json({ message: validation.error }, { status: 400 });
      }

      const { type } = validation.data;
      const graph = client.selectGraph(schemaName);
      const query = type
        ? `MATCH (n) WHERE ID(n) = $elementId DELETE n`
        : `MATCH ()-[e]-() WHERE ID(e) = $elementId DELETE e`;

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { elementId } });
      else await graph.query(query, { params: { elementId } });

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
