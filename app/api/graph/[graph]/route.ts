import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    const { graph: graphId } = await params;

    try {
      if (graphId) {
        const graph = client.selectGraph(graphId);

        await graph.delete();

        return NextResponse.json({ message: `${graphId} graph deleted` });
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;

    const { graph: graphId } = await params;

    try {
      const graph = client.selectGraph(graphId);
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery("RETURN 1")
          : await graph.query("RETURN 1");

      if (!result) throw new Error("Something went wrong");

      return NextResponse.json(
        { message: "Graph created successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    const { graph: graphId } = await params;
    const sourceName = request.nextUrl.searchParams.get("sourceName");

    try {
      if (!sourceName) throw new Error("Missing parameter sourceName");

      const data = await (
        await client.connection
      ).renameNX(sourceName, graphId);

      if (!data) throw new Error(`${graphId} already exists`);

      return NextResponse.json({ data });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}

// send a query to the graph and return the result
// if the query is taking too long, return a timeout and save the result in the cache
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
    const query = request.nextUrl.searchParams.get("query");
    const timeout = Number(request.nextUrl.searchParams.get("timeout"));

    try {
      if (!query) throw new Error("Missing parameter query");
      if (Number.isNaN(timeout)) throw new Error("Invalid parameter timeout");

      const graph = client.selectGraph(graphId);

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { TIMEOUT: timeout })
          : await graph.query(query, { TIMEOUT: timeout });

      if (!result) throw new Error("Something went wrong");

      writer.write(
        encoder.encode(`event: result\ndata: ${JSON.stringify(result)}\n\n`)
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
