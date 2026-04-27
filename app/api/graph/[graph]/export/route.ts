import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "../../../utils";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
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
      const result = await (
        await client.connection
      ).dump(graphId);

      if (!result)
        throw new Error(`Failed to retrieve graph data for ID: ${graphId}`);

      return new NextResponse(result, {
        status: 200,
        headers: {
          ...getCorsHeaders(request),
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${graphId}.dump"`,
        },
      });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "An error occurred while processing the request" },
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
