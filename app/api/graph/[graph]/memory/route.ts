import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

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
    const { graph } = await params;

    try {
      // Use direct Redis command instead of client.selectGraph(graph).memoryUsage()
      // The memoryUsage() method causes "Socket closed unexpectedly" after multiple calls in CI
      // See logs: works for first 2 calls, crashes on 3rd call
      const connection = await client.connection;
      const result = await connection.sendCommand(["GRAPH.MEMORY", "USAGE", graph]);
      
      return NextResponse.json({ result }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
          { message: (err as Error).message },
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
