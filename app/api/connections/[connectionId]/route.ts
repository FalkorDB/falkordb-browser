import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions, { removeSessionConnection } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders } from "@/app/api/utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * DELETE /api/connections/[connectionId]
 * Removes an additional connection from the current session.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const id = session?.user?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401, headers: getCorsHeaders(request) }
      );
    }

    const { connectionId } = await params;

    if (!connectionId) {
      return NextResponse.json(
        { message: "Connection ID is required" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const deleted = await removeSessionConnection(id, connectionId);

    if (!deleted) {
      return NextResponse.json(
        { message: "Connection not found" },
        { status: 404, headers: getCorsHeaders(request) }
      );
    }

    return NextResponse.json(
      { message: "Connection removed" },
      { status: 200, headers: getCorsHeaders(request) }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to remove connection:", err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
