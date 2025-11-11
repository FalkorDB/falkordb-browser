import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClient } from "@/app/api/auth/[...nextauth]/options";

// Validation schemas
const patchBodySchema = z.object({
  sourceName: z.string({
    required_error: "SourceName is required",
    invalid_type_error: "Invalid SourceName",
  }),
});

const queryParamsSchema = z.object({
  query: z.string({
    required_error: "Query is required",
    invalid_type_error: "Invalid Query",
  }),
  timeout: z.number({
    required_error: "Timeout is required",
    invalid_type_error: "Invalid Timeout",
  }),
});

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
      const graph = client.selectGraph(graphId);

      await graph.delete();

      return NextResponse.json({ message: `Graph deleted successfully` });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error(err);
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

      if (user.role === "Read-Only") await graph.roQuery("RETURN 1");
      else await graph.query("RETURN 1");

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
    console.error(err);
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
    const validationResult = patchBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { sourceName } = validationResult.data;

      const data = await (
        await client.connection
      ).renameNX(sourceName, graphId);

      if (!data) throw new Error(`Graph Name already exists`);

      return NextResponse.json({ data });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}

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
      const validationResult = queryParamsSchema.safeParse({ query, timeout });

      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const validatedQuery = validationResult.data.query;
      const validatedTimeout = validationResult.data.timeout;

      const graph = client.selectGraph(graphId);
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(validatedQuery, { TIMEOUT: validatedTimeout })
          : await graph.query(validatedQuery, { TIMEOUT: validatedTimeout });

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
