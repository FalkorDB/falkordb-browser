import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "../../../utils";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
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
      const result = await (
        await client.connection
      ).dump(graphId);

      if (!result)
        throw new Error(`Failed to retrieve graph data for ID: ${graphId}`);

      return new NextResponse(result, {
        status: 200,
        headers: {
          ...corsHeaders(),
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${graphId}.dump"`,
        },
      });
    } catch (error) {
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
