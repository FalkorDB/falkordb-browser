import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse, NextRequest } from "next/server";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string }> }
) {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      throw new Error(await session.text());
    }

    const { client, user } = session;
    const { schema } = await params;
    const schemaName = `${schema}_schema`;
    const timeout = Number(request.nextUrl.searchParams.get("timeout")) || 5000;

    try {
      const graph = client.selectGraph(schemaName);

      // Execute two separate queries for optimization
      const nodeQuery = "MATCH (n) RETURN count(n) as nodes";
      const edgeQuery = "MATCH ()-[e]->() RETURN count(e) as edges";

      const nodeResult = user.role === "Read-Only"
        ? await graph.roQuery(nodeQuery, { TIMEOUT: timeout })
        : await graph.query(nodeQuery, { TIMEOUT: timeout });

      let edgeResult;
      try {
        edgeResult = user.role === "Read-Only"
          ? await graph.roQuery(edgeQuery, { TIMEOUT: timeout })
          : await graph.query(edgeQuery, { TIMEOUT: timeout });
      } catch (error) {
        // If edge query fails (e.g., no edges), create a result with count 0
        edgeResult = {
          data: [{ edges: 0 }],
          header: ["edges"],
          metadata: {}
        };
      }

      if (!nodeResult || !edgeResult) throw new Error("Something went wrong");

      // Combine results to match expected format
      const combinedResult = {
        data: [{
          nodes: nodeResult.data[0].nodes,
          edges: edgeResult.data[0].edges
        }],
        header: ["nodes", "edges"],
        metadata: {
          query_internal_execution_time: (nodeResult.metadata?.query_internal_execution_time || 0) + 
                                       (edgeResult.metadata?.query_internal_execution_time || 0)
        }
      };

      writer.write(
        encoder.encode(`event: result\ndata: ${JSON.stringify(combinedResult)}\n\n`)
      );
      writer.close();
    } catch (error) {
      console.error(error);
      writer.write(
        encoder.encode(
          `event: error\ndata: ${JSON.stringify({
            message: (error as Error).message,
            status: 400,
          })}\n\n`
        )
      );
      writer.close();
    }
  } catch (error) {
    console.error(error);
    writer.write(
      encoder.encode(
        `event: error\ndata: ${JSON.stringify({
          message: (error as Error).message,
          status: 500,
        })}\n\n`
      )
    );
    writer.close();
  }

  // Clean up if the client disconnects early
  request.signal.addEventListener("abort", () => {
    writer.close();
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
