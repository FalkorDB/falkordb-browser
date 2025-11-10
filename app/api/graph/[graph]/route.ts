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

    // Validate graph ID
    if (!graphId || typeof graphId !== 'string' || graphId.trim().length === 0) {
      return NextResponse.json(
        { message: "Invalid graph ID" },
        { status: 400 }
      );
    }

    try {
      const graph = client.selectGraph(graphId);
      await graph.delete();

      return NextResponse.json({ message: "Graph deleted successfully" });
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to delete graph" },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error" },
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

    // Validate graph ID
    if (!graphId || typeof graphId !== 'string' || graphId.trim().length === 0) {
      return NextResponse.json(
        { message: "Invalid graph ID" },
        { status: 400 }
      );
    }

    // Validate source name
    if (!sourceName || typeof sourceName !== 'string' || sourceName.trim().length === 0) {
      return NextResponse.json(
        { message: "Invalid source name" },
        { status: 400 }
      );
    }

    try {
      const data = await (
        await client.connection
      ).renameNX(sourceName, graphId);

      if (!data) {
        return NextResponse.json(
          { message: "Graph name already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json({ data });
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to rename graph" },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error" },
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
      // Validate query parameter
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new Error("Invalid query parameter");
      }

      // Validate timeout
      if (Number.isNaN(timeout) || timeout < 0) {
        throw new Error("Invalid timeout parameter");
      }

      // Validate graph ID
      if (!graphId || typeof graphId !== 'string' || graphId.trim().length === 0) {
        throw new Error("Invalid graph ID");
      }

      const graph = client.selectGraph(graphId);

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query, { TIMEOUT: timeout })
          : await graph.query(query, { TIMEOUT: timeout });

      if (!result) throw new Error("Query returned no result");

      writer.write(
        encoder.encode(`event: result\ndata: ${JSON.stringify(result)}\n\n`)
      );
      writer.close();
    } catch (error) {
      writer.write(
        encoder.encode(
          `event: error\ndata: ${JSON.stringify({
            message: error instanceof Error ? error.message : "Query execution failed",
            status: 400,
          })}\n\n`
        )
      );
      writer.close();
    }
  } catch (error) {
    writer.write(
      encoder.encode(
        `event: error\ndata: ${JSON.stringify({
          message: "Internal server error",
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
