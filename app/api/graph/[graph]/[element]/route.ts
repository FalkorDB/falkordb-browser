import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// Validation schema
const deleteBodySchema = z.object({
  type: z.boolean({
    required_error: "Type is required",
    invalid_type_error: "Invalid Type",
  }),
});

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
    const nodeId = Number(element);

    try {
      const graph = client.selectGraph(graphId);

      // Get node's neighbors
      const query = `MATCH (src)-[e]-(n)
                          WHERE ID(src) = $nodeId
                          RETURN e, n`;

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { nodeId } })
          : await graph.query(query, { params: { nodeId } });

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
    const validationResult = deleteBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { type } = validationResult.data;

      const graph = client.selectGraph(graphId);
      const query = type
        ? "MATCH (n) WHERE ID(n) = $elementId DELETE n"
        : "MATCH ()-[e]-() WHERE ID(e) = $elementId DELETE e";
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { params: { elementId } })
          : await graph.query(query, { params: { elementId } });

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
