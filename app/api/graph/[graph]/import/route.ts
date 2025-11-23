import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line import/prefer-default-export
export async function POST(
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

    // Read the file from FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const replaceFlag = formData.get("replace");

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const shouldReplace = replaceFlag === "true";
      const connection = await client.connection;

      // If replace is requested, delete the existing graph first
      // GRAPH.RESTORE doesn't support REPLACE option
      if (shouldReplace) {
        try {
          await connection.falkordb.delete(graphId);
        } catch (deleteError) {
          // Ignore error if graph doesn't exist
          if (!(deleteError as Error).message.includes("not exist")) {
            throw deleteError;
          }
        }
      }

      // Call GRAPH.RESTORE with binary payload
      // GRAPH.RESTORE <graph> <payload>
      const result = await connection.sendCommand([
        "GRAPH.RESTORE",
        graphId,
        buffer
      ]);

      if (result !== "OK") {
        throw new Error(`Failed to restore graph: ${graphId}`);
      }

      return NextResponse.json(
        { message: `Graph ${graphId} restored successfully` },
        { status: 200 }
      );
    } catch (error) {
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
