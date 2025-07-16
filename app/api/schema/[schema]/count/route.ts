import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { GET as sendQuery } from "@/app/api/graph/[graph]/route";
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

    const { schema } = await params;
    const schemaName = `${schema}_schema`;

    try {
      const query =
        "MATCH (n) OPTIONAL MATCH (n)-[e]->() WITH count(n) as nodes, count(e) as edges RETURN nodes, edges";

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
