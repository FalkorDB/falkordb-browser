import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "../../../utils";

// eslint-disable-next-line import/prefer-default-export
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return NextResponse.json(
        { message: "Content-Type must be application/json" },
        { status: 415, headers: getCorsHeaders(request) }
      );
    }

    let body: { query?: unknown };
    try {
      body = await request.json() as { query?: unknown };
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
    if (typeof body?.query !== "string" || !body.query) {
      return NextResponse.json(
        { message: "Missing parameter query" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const { client } = session;
    const { graph: graphId } = await params;

    try {
      const graph = client.selectGraph(graphId);
      // The plan's lines, which the UI renders, as before falkordb 7
      const result = (await graph.profile(body.query)).steps;

      return NextResponse.json({ result }, { headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
