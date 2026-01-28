import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import {
  createGraphElement,
  deleteGraphElement,
  validateBody,
} from "../../../validate-body";
import { getCorsHeaders } from "../../../utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

// eslint-disable-next-line import/prefer-default-export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, element } = await params;
    const elementId = Number(element);

    try {
      const graph = client.selectGraph(graphId);

      // Get node's neighbors
      const query = `MATCH (n)-[e]-(m)
                          WHERE ID(n) = $id
                          RETURN *`;

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { id: elementId } })
          : await graph.query(query, { params: { id: elementId } });

      return NextResponse.json({ result }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId } = await params;

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(createGraphElement, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { type, label, attributes, selectedNodes } = validation.data;

      if (!type) {
        if (!selectedNodes || selectedNodes.length !== 2)
          throw new Error("Selected nodes are required");

        if (label.length === 0) throw new Error("Label is required");
      }

      const graph = client.selectGraph(graphId);
      const query = type
        ? `CREATE (n${label && label.length > 0 ? `:${label.join(":")}` : ""}${
            attributes.length > 0
              ? ` {${attributes.map(([k]) => `${k}: $attr_${k}`).join(",")}}`
              : ""
          }) RETURN n`
        : `MATCH (a), (b) WHERE ID(a) = $nodeA AND ID(b) = $nodeB CREATE (a)-[e:${
            label![0]
          }${
            attributes.length > 0
              ? ` {${attributes.map(([k]) => `${k}: $attr_${k}`).join(",")}}`
              : ""
          }]->(b) RETURN e`;

      const queryParams: Record<string, string | number | boolean> = {};
      if (!type && selectedNodes) {
        queryParams.nodeA = selectedNodes[0].id;
        queryParams.nodeB = selectedNodes[1].id;
      }
      if (attributes.length > 0) {
        attributes.forEach(([k, v]) => {
          queryParams[`attr_${k}`] = v;
        });
      }

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: queryParams })
          : await graph.query(query, { params: queryParams });

      return NextResponse.json({ result }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string; element: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { graph: graphId, element } = await params;
    const elementId = Number(element);

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(deleteGraphElement, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { type } = validation.data;
      const graph = client.selectGraph(graphId);
      const query = type
        ? `MATCH (n) WHERE ID(n) = $id DELETE n`
        : `MATCH ()-[e]->() WHERE ID(e) = $id DELETE e`;

      if (user.role === "Read-Only")
        await graph.roQuery(query, { params: { id: elementId } });
      else await graph.query(query, { params: { id: elementId } });

      return NextResponse.json(
        { message: "Element deleted successfully" },
        { status: 200, headers: getCorsHeaders(request) }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
