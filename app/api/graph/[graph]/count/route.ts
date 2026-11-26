import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { runQuery, getCorsHeaders, writeGetClientErrorAsSSE } from "@/app/api/utils";
import { NextResponse, NextRequest } from "next/server";
import { endStream } from "@/app/api/sse";

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
      await writeGetClientErrorAsSSE(session, writer, encoder);
      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          ...getCorsHeaders(request),
        },
      });
    }

    const { client } = session;
    const { graph: graphId } = await params;

    try {
      const graph = client.selectGraph(graphId);
      // Always read-only: a writable GRAPH.QUERY on a missing key creates an
      // empty graph, so a count racing a delete would resurrect the graph.

      // Execute two separate queries for accurate counts
      const nodesQuery = "MATCH (n) RETURN count(n) as nodes";
      const edgesQuery = "MATCH ()-[e]->() RETURN count(e) as edges";

      // Execute nodes count query
      const nodesResult = await runQuery(graph, nodesQuery, true);

      // Execute edges count query  
      const edgesResult = await runQuery(graph, edgesQuery, true);

      if (!nodesResult || !edgesResult) throw new Error("Something went wrong");

      // Combine results into expected format
      const nodes = (nodesResult.data && nodesResult.data[0] && (nodesResult.data[0] as { nodes: number }).nodes) || 0;
      const edges = (edgesResult.data && edgesResult.data[0] && (edgesResult.data[0] as { edges: number }).edges) || 0;

      endStream(
        writer,
        encoder.encode(`event: result\ndata: ${JSON.stringify({ nodes, edges })}\n\n`)
      );
    } catch (error) {
      console.error(error);
      endStream(
        writer,
        encoder.encode(
          `event: error\ndata: ${JSON.stringify({
            message: (error as Error).message || "Internal server error",
            status: 400,
          })}\n\n`
        )
      );
    }
  } catch (error) {
    console.error(error);
    endStream(
      writer,
      encoder.encode(
        `event: error\ndata: ${JSON.stringify({
          message: "Internal server error",
          status: 500,
        })}\n\n`
      )
    );
  }

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...getCorsHeaders(request),
    },
  });
}
