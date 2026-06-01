import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { RESP_TYPES } from "@redis/client";
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
      // DUMP returns a binary BLOB_STRING. Without this type mapping,
      // node-redis decodes it as UTF-8, corrupting any byte that isn't
      // a valid UTF-8 sequence — which breaks RESTORE round-trips.
      const connection = (await client.connection).withTypeMapping({
        [RESP_TYPES.BLOB_STRING]: Buffer,
      });
      const result = await connection.dump(graphId);

      if (!result || !Buffer.isBuffer(result))
        throw new Error(`Failed to retrieve graph data for ID: ${graphId}`);

      return new NextResponse(new Uint8Array(result), {
        status: 200,
        headers: {
          ...getCorsHeaders(request),
          "Content-Type": "application/octet-stream",
          "Content-Length": String(result.byteLength),
          "Content-Disposition": `attachment; filename="${graphId}.dump"`,
        },
      });
    } catch (error) {
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
