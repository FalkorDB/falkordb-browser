import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { renameGraph, validateBody } from "../../validate-body";

// CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

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

        return NextResponse.json(
          { message: `${graphId} graph deleted` },
          { headers: corsHeaders() }
        );
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: corsHeaders() }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: corsHeaders() }
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

      if (user.role === "Read-Only") await graph.roQuery("RETURN 1");
      else await graph.query("RETURN 1");

      return NextResponse.json(
        { message: "Graph created successfully" },
        { status: 200, headers: corsHeaders() }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: corsHeaders() }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: corsHeaders() }
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

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(renameGraph, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: corsHeaders() }
        );
      }

      const { sourceName } = validation.data;
      const data = await (
        await client.connection
      ).renameNX(sourceName, graphId);

      if (!data) throw new Error(`${graphId} already exists`);

      return NextResponse.json({ data }, { headers: corsHeaders() });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: corsHeaders() }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: corsHeaders() }
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

      const writeDataLine = (chunk: string) => {
        writer.write(encoder.encode(`data: ${chunk}\n`));
      };

      const streamResult = () => {
        writer.write(encoder.encode("event: result\n"));
        writeDataLine("{");

        let isFirstField = true;

        const entries = Object.entries(result ?? {}).filter(
          ([, value]) => value !== undefined
        );

        for (let idx = 0; idx < entries.length; idx += 1) {
          const [key, value] = entries[idx];

          if (key === "data" && Array.isArray(value)) {
            writeDataLine(`${isFirstField ? "" : ","}"data":[`);
            isFirstField = false;

            for (let i = 0; i < value.length; i += 1) {
              const row = value[i];
              const rowChunk = JSON.stringify(row);
              writeDataLine(i < value.length - 1 ? `${rowChunk},` : rowChunk);
            }

            writeDataLine("]");
          } else {
            writeDataLine(
              `${isFirstField ? "" : ","}"${key}":${JSON.stringify(value)}`
            );
            isFirstField = false;
          }
        }

        writeDataLine("}");
        writer.write(encoder.encode("\n"));
      };

      streamResult();
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
      ...corsHeaders(),
    },
  });
}
