import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse, NextRequest } from "next/server";
import { duplicateGraph, validateBody } from "../../../validate-body";
import { corsHeaders } from "../../../utils";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/**
 * Copies data from the source specified by the JSON body property `sourceName` into the destination `graph` provided by route params.
 *
 * @param request - The incoming request; must include `sourceName` in the JSON body indicating the source graph to copy from.
 * @param params - A promise resolving to an object `{ graph: string }` where `graph` is the destination graph name.
 * @returns On success, a JSON object containing `result`. If `sourceName` is missing or the copy operation fails, returns a JSON `{ message }` with status 400. If authentication/session handling yields a `NextResponse`, that response is returned as-is. On unexpected errors, returns a JSON `{ message }` with status 500.
 */
export async function PATCH(
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
      const body = await request.json();

      // Validate request body
      const validation = validateBody(duplicateGraph, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: corsHeaders() }
        );
      }

      const { sourceName } = validation.data;
      const result = await client.selectGraph(sourceName).copy(graphId);

      return NextResponse.json({ result }, { headers: corsHeaders() });
    } catch (error) {
      console.error(error);
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