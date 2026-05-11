import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "../../../utils";

/**
 * Handle GET requests to return memory usage for the specified graph.
 *
 * The frontend only calls this endpoint when showMemoryUsage=true (i.e. the
 * DBVersion check already passed), so we do NOT call getDBVersion again here.
 * Calling getClient twice in the same handler caused the second getConnectionClient
 * health-check PING to interfere with the subsequent memoryUsage() command.
 *
 * @param request - The incoming NextRequest
 * @param params - A promise resolving to an object with a `graph` property
 * @returns A JSON NextResponse:
 * - `200` with `{ result }` on success
 * - `400` with `{ message }` when memoryUsage() fails
 * - or an auth NextResponse from `getClient`
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  const session = await getClient(request);

  if (session instanceof NextResponse) {
    return session;
  }

  const { client } = session;
  const { graph } = await params;

  try {
    const result = await client.selectGraph(graph).memoryUsage();
    return NextResponse.json({ result }, { status: 200, headers: getCorsHeaders(request) });
  } catch (err) {
    console.error(`[memory] memoryUsage failed for graph="${graph}": ${(err as Error).message}`);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 400, headers: getCorsHeaders(request) }
    );
  }
}
