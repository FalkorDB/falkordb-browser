import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse, NextRequest } from "next/server";
import { GET as sendQuery } from "../route";
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

    try {
      const query =
        "MATCH (n) OPTIONAL MATCH (n)-[e]->() WITH count(n) as nodes, count(e) as edges RETURN nodes, edges";

      request.nextUrl.searchParams.set("query", query);

      const result = await sendQuery(request, { params });

      if (!result.ok) throw new Error("Something went wrong");

      return result
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
