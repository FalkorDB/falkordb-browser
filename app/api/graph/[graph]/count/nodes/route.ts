import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { runQuery } from "@/app/api/utils";
import { NextResponse, NextRequest } from "next/server";

// eslint-disable-next-line import/prefer-default-export
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

    console.log(`[NODES_COUNT] Starting nodes count for graph: ${graphId}`);

    try {
      const graph = client.selectGraph(graphId);

      // Execute nodes count query
      const nodesQuery = "MATCH (n) RETURN count(n) as nodes";
      console.log(`[NODES_COUNT] Running query for graph: ${graphId}`);
      const nodesResult = await runQuery(graph, nodesQuery, user.role);
      console.log(`[NODES_COUNT] Query complete for graph: ${graphId}`, nodesResult);

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
    },
  });
}

