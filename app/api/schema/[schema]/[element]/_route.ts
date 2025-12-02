import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import {
  createSchemaElement,
  deleteSchemaElement,
  validateBody,
} from "@/app/api/validate-body";
import { formatAttributes } from "./utils";

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

    const validation = validateBody(createSchemaElement, body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }

    const { type, label, attributes, selectedNodes } = validation.data;

    try {
      if (!type) {
        if (!label) throw new Error("Label is required");

        if (!selectedNodes || selectedNodes.length !== 2)
          throw new Error("Selected nodes are required");
      }

      const formattedAttributes = formatAttributes(attributes);
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
    const schemaName = `${schema}_schema`;
    const nodeId = Number(node);
    const body = await request.json();

    const validation = validateBody(deleteSchemaElement, body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }

    const { type } = validation.data;

    try {
      const graph = client.selectGraph(schemaName);
      const query = type
        ? `MATCH (n) WHERE ID(n) = $nodeId DELETE n`
        : `MATCH ()-[e]-() WHERE ID(e) = $nodeId DELETE e`;
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { nodeId } })
          : await graph.query(query, { params: { nodeId } });

      if (!result) throw new Error("Something went wrong");

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
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
