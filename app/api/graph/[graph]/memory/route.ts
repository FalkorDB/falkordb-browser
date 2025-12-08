import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { GET as getDBVersion } from "@/app/api/auth/DBVersion/route";
import { MEMORY_USAGE_VERSION_THRESHOLD } from "@/lib/utils";

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

    const res = await getDBVersion();

    if (!res.ok) {
      return NextResponse.json(
        {
          message: `Failed to retrieve database version: ${await res.text()}`,
        },
        { status: 400 }
      );
    }

    const [name, version] = (await res.json()).result || ["", 0];

    if (name !== "graph" || version < MEMORY_USAGE_VERSION_THRESHOLD) {
      return NextResponse.json(
        {
          message: `Memory usage feature requires graph module version ${MEMORY_USAGE_VERSION_THRESHOLD} or higher. Current version: ${version}`,
        },
        { status: 400 }
      );
    }

    const { client } = session;
    const { graph } = await params;

    try {
      const result = await client.selectGraph(graph).memoryUsage();

      return NextResponse.json({ result }, { status: 200 });
    } catch (err) {
      return NextResponse.json(
        { message: (err as Error).message },
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