import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { runQuery, getCorsHeaders } from "@/app/api/utils";
import { NextResponse, NextRequest } from "next/server";

/**
 * Stream the node count for a graph as Server-Sent Events.
 *
 * Authenticates the request, runs a node-count query for the specified graph, and emits an SSE `result` event with the node count on success or an SSE `error` event with an error message and status on failure.
 *
 * @param params - A promise resolving to an object containing the `graph` id to query
 * @returns A Response whose body is an SSE-readable stream that emits a `result` event with `{ nodes: number }` on success or an `error` event with `{ message: string, status: number }` on failure; response includes appropriate SSE headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      throw new Error(await session.text());
    }

    const { client, user } = session;
    const { graph: graphId } = await params;

    try {
      const graph = client.selectGraph(graphId);

      // Execute nodes count query
      const nodesQuery = "MATCH (n) RETURN count(n) as nodes";
      const nodesResult = await runQuery(graph, nodesQuery, user.role);

      if (!nodesResult) throw new Error("Something went wrong");

      // Extract nodes count from result
      const nodes = (nodesResult.data && nodesResult.data[0] && (nodesResult.data[0] as { nodes: number }).nodes) || 0;

      writer.write(
        encoder.encode(`event: result\ndata: ${JSON.stringify({ nodes })}\n\n`)
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
      ...getCorsHeaders(request),
    },
  });
}
