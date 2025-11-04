import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handle GET requests to return memory usage for the specified graph.
 *
 * Calls the authenticated client, selects the requested graph, and returns its memory usage.
 *
 * @param request - The incoming NextRequest (unused by this handler but required by the route signature)
 * @param params - A promise resolving to an object with a `graph` property indicating which graph to inspect
 * @returns A JSON NextResponse:
 * - `200` with `{ result }` when memory usage is retrieved successfully
 * - `400` with `{ message }` when retrieving memory usage fails
 * - `500` with `{ message }` when obtaining the client/session fails
 * - or an authentication/redirect NextResponse returned directly by `getClient`
 */
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
      const result = await client.selectGraph(graph).memoryUsage()
      
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