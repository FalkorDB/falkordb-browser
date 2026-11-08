import { NextRequest, NextResponse } from "next/server";
import type { FalkorDB } from "falkordb";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { renameGraph, validateBody } from "../../validate-body";
import { getCorsHeaders, resolveReadOnly, runQuery, corsPreflight } from "../../utils";
import { QueryInputError, queryStream, queryStreamError } from "../../query-stream";

export const OPTIONS = corsPreflight;

async function streamQuery(
  request: NextRequest,
  client: FalkorDB,
  graphId: string,
  query: string | null,
  timeout: number,
  isReadOnly: boolean,
): Promise<Response> {
  return queryStream(request.signal, async () => {
    if (!query) throw new QueryInputError("Missing parameter query");
    if (Number.isNaN(timeout)) throw new QueryInputError("Invalid parameter timeout");

    const graph = client.selectGraph(graphId);
    return runQuery(graph, query, isReadOnly, { TIMEOUT: timeout });
  }, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...getCorsHeaders(request),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient(request);

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
          { headers: getCorsHeaders(request) }
        );
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;

    const { graph: graphId } = await params;
    const isReadOnly = resolveReadOnly(request, user.role);

    try {
      if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/json") {
        const body = await request.json() as { query?: unknown; timeout?: unknown };
        if (body && typeof body === "object" && body.query !== undefined) {
          if (typeof body.query !== "string") {
            return NextResponse.json(
              { message: "Invalid parameter query" },
              { status: 400, headers: getCorsHeaders(request) }
            );
          }
          const timeout = Number(body.timeout ?? 0) * 1000;
          return streamQuery(request, client, graphId, body.query, timeout, isReadOnly);
        }
      }

      const graph = client.selectGraph(graphId);

      if (isReadOnly) await graph.roQuery("RETURN 1");
      else await graph.query("RETURN 1");

      return NextResponse.json(
        { message: "Graph created successfully" },
        { status: 200, headers: getCorsHeaders(request) }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient(request);

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
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { sourceName } = validation.data;
      const data = await (
        await client.connection
      ).renameNX(sourceName, graphId);

      if (!data) throw new Error(`${graphId} already exists`);

      return NextResponse.json({ data }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request)  }
    );
  }
}

// GET is always read-only; both query transports share the same SSE lifecycle.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    ...getCorsHeaders(request),
  };

  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return queryStreamError(session, headers);
    }

    const { client } = session;
    const { graph: graphId } = await params;
    const query = request.nextUrl.searchParams.get("query");
    const timeout = Number(request.nextUrl.searchParams.get("timeout")) * 1000;
    return streamQuery(request, client, graphId, query, timeout, true);
  } catch (error) {
    console.error(error);
    return queryStreamError(Response.json({ message: "Internal server error" }, { status: 500 }), headers);
  }
}
