import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse, NextRequest } from "next/server";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      throw new Error(await session.text());
    }

    const { client, user } = session;

    try {
      // Run two separate queries for optimal performance
      const nodes_query = "MATCH (n) RETURN count(n)";
      const edges_query = "MATCH ()-[e]->() RETURN count(e)";

      const { graph: graphId } = await params;
      const graph = client.selectGraph(graphId);

      // Execute both queries
      const nodesResult = user.role === "Read-Only" 
        ? await graph.roQuery(nodes_query)
        : await graph.query(nodes_query);
      
      const edgesResult = user.role === "Read-Only"
        ? await graph.roQuery(edges_query) 
        : await graph.query(edges_query);

      if (!nodesResult || !edgesResult) {
        throw new Error("Failed to execute count queries");
      }

      // Extract counts from results
      const nodesCount = nodesResult.data[0]["count(n)"];
      const edgesCount = edgesResult.data[0]["count(e)"];

      // Create combined response
      const combinedResult = {
        data: [{
          nodes: nodesCount,
          edges: edgesCount
        }],
        metadata: {
          resultSet: 1,
          runTimeMs: (nodesResult.metadata?.runTimeMs || 0) + (edgesResult.metadata?.runTimeMs || 0)
        }
      };

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `event: result\ndata: ${JSON.stringify(combinedResult)}\n\n`
            )
          );
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (error) {
      console.error(error);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                message: (error as Error).message,
                status: 400,
              })}\n\n`
            )
          );
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
  } catch (error) {
    console.error(error);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({
              message: (error as Error).message,
              status: 500,
            })}\n\n`
          )
        );
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
}
