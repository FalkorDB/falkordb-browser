import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { runQuery, getCorsHeaders } from "@/app/api/utils";
import { NextResponse, NextRequest } from "next/server";

/**
 * Streams the edge count for a specified graph using Server-Sent Events (SSE).
 *
 * @param params - Promise resolving to route parameters; must include `graph` (the graph identifier)
 * @returns A Response with `Content-Type: text/event-stream` that emits an `event: result` with `{ edges }` on success or an `event: error` with `{ message, status }` on failure
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
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
    const { graph: graphId } = await params;

    try {
      const graph = client.selectGraph(graphId);

      // Execute edges count query
      const edgesQuery = "MATCH ()-[e]->() RETURN count(e) as edges";
      const edgesResult = await runQuery(graph, edgesQuery, user.role);

      if (!edgesResult) throw new Error("Something went wrong");

      // Extract edges count from result
      const edges = (edgesResult.data && edgesResult.data[0] && (edgesResult.data[0] as { edges: number }).edges) || 0;

      writer.write(
        encoder.encode(`event: result\ndata: ${JSON.stringify({ edges })}\n\n`)
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
