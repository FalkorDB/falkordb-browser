import { getClient } from "@/app/api/auth/[...nextauth]/options";
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

    const { client } = session;

    try {
      const nodesQuery = "MATCH (n) RETURN count(n)";
      const edgesQuery = "MATCH ()-[e]->() RETURN count(e)";

      const { graph: graphId } = await params;
      const graph = client.selectGraph(graphId);

      const nodesResult = await graph.roQuery(nodesQuery);
      
      const edgesResult = await graph.roQuery(edgesQuery);

      const nodesCount = nodesResult.data[0][0];
      const edgesCount = edgesResult.data[0][0];

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

      const resultEncoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            resultEncoder.encode(
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
