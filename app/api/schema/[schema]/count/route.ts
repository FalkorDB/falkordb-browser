import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { GET as sendQuery } from "@/app/api/graph/[graph]/route";
import { NextResponse, NextRequest } from "next/server";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      throw new Error(await session.text());
    }

    const { schema } = await params;
    const schemaName = `${schema}_schema`;

    try {
      // Use optimized single query that avoids cartesian product
      // This counts nodes once, then separately counts edges
      const query = "MATCH (n) WITH count(n) as nodes OPTIONAL MATCH ()-[e]->() RETURN nodes, count(e) as edges";

      request.nextUrl.searchParams.set("query", query);

      const result = await sendQuery(request, {
        params: new Promise((resolve) => {
          resolve({ graph: schemaName });
        }),
      });

      if (!result.ok) throw new Error("Something went wrong");

      return result;
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
