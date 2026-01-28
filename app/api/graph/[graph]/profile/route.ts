import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "../../../utils";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;
    const { graph: graphId } = await params;
    const query = req.nextUrl.searchParams.get("query");

    try {
      if (!query) throw new Error("Missing parameter query");

      const graph = client.selectGraph(graphId);
      const result = await graph.profile(query);

      return NextResponse.json({ result }, { headers: getCorsHeaders(req) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(req) }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}
