import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import {
  createSchemaElement,
  deleteSchemaElement,
  validateBody,
} from "@/app/api/validate-body";
import { getCorsHeaders, resolveReadOnly } from "@/app/api/utils";
import { formatAttributes } from "./utils";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema: schemaName, element } = await params;
    const schemaId = `${schemaName}_schema`;
    const elementId = Number(element);
    const isReadOnly = resolveReadOnly(request, user.role);

    try {
      const schema = client.selectGraph(schemaId);

      // Get node's neighbors
      const query = `MATCH (src)-[e]-(n)
                          WHERE ID(src) = $id
                          RETURN e, n`;

      const result =
        isReadOnly
          ? await schema.roQuery(query, { params: { id: elementId } })
          : await schema.query(query, { params: { id: elementId } });

      return NextResponse.json({ result }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema } = await params;
    const schemaName = `${schema}_schema`;
    const body = await request.json();

    const validation = validateBody(createSchemaElement, body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error }, { status: 400, headers: getCorsHeaders(request) });
    }

    const { type, label, attributes, selectedNodes } = validation.data;
    const isReadOnly = resolveReadOnly(request, user.role);

    if (isReadOnly) {
      return NextResponse.json(
        { message: "Forbidden: read-only connection" },
        { status: 403, headers: getCorsHeaders(request) }
      );
    }

    try {
      if (!type) {
        if (!selectedNodes || selectedNodes.length !== 2)
          throw new Error("Selected nodes are required");

        if (label.length === 0) throw new Error("Label is required");
      }

      const formattedAttributes = formatAttributes(attributes);
      const graph = client.selectGraph(schemaName);
      const query = type
        ? `CREATE (n${label.length > 0 ? `:${label.join(":")}` : ""}${
            formattedAttributes.length > 0
              ? ` {${formattedAttributes
                  .map(([k]) => `${k}: $attr_${k}`)
                  .join(",")}}`
              : ""
          }) RETURN n`
        : `MATCH (a), (b) WHERE ID(a) = $nodeA AND ID(b) = $nodeB CREATE (a)-[e:${
            label[0]
          }${
            formattedAttributes.length > 0
              ? ` {${formattedAttributes
                  .map(([k]) => `${k}: $attr_${k}`)
                  .join(",")}}`
              : ""
          }]->(b) RETURN e`;

      const queryParams: Record<string, string | number | boolean> = {};
      if (!type && selectedNodes) {
        queryParams.nodeA = selectedNodes[0].id;
        queryParams.nodeB = selectedNodes[1].id;
      }
      if (formattedAttributes.length > 0) {
        formattedAttributes.forEach(([k, v]) => {
          queryParams[`attr_${k}`] = v;
        });
      }

      const result = await graph.query(query, { params: queryParams });

      return NextResponse.json({ result }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string; element: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema, element } = await params;
    const schemaName = `${schema}_schema`;
    const elementId = Number(element);
    const body = await request.json();

    const validation = validateBody(deleteSchemaElement, body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error }, { status: 400, headers: getCorsHeaders(request) });
    }

    const { type } = validation.data;
    const isReadOnly = resolveReadOnly(request, user.role);

    if (isReadOnly) {
      return NextResponse.json(
        { message: "Forbidden: read-only connection" },
        { status: 403, headers: getCorsHeaders(request) }
      );
    }

    try {
      const graph = client.selectGraph(schemaName);
      const query = type
        ? `MATCH (n) WHERE ID(n) = $id DELETE n`
        : `MATCH ()-[e]->() WHERE ID(e) = $id DELETE e`;

      await graph.query(query, { params: { id: elementId } });

      return NextResponse.json(
        { message: "Element deleted successfully" },
        { status: 200, headers: getCorsHeaders(request) }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
