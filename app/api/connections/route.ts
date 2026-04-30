import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions, { addSessionConnection, listSessionConnections } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders } from "@/app/api/utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * GET /api/connections
 * Lists all additional connections for the current session.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const id = session?.user?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401, headers: getCorsHeaders(request) }
      );
    }

    const conns = await listSessionConnections(id);
    return NextResponse.json({ connections: conns }, { status: 200, headers: getCorsHeaders(request) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to list connections:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

/**
 * POST /api/connections
 * Adds a new connection (different ACL user) to the current session.
 * Body: { host?, port?, username?, password?, tls?, ca? }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const id = session?.user?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401, headers: getCorsHeaders(request) }
      );
    }

    if (session.user.role !== "Admin") {
      return NextResponse.json(
        { message: "Only admin users can add connections" },
        { status: 403, headers: getCorsHeaders(request) }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const { host, port, username, password, tls, ca } = body;

    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const connInfo = await addSessionConnection(id, {
      host: (host as string) || session.user.host,
      port: port?.toString() || session.user.port.toString(),
      username: username as string,
      password: password as string,
      tls: tls?.toString() || String(session.user.tls),
      ca: ca as string | undefined,
    });

    return NextResponse.json(
      { connection: connInfo },
      { status: 201, headers: getCorsHeaders(request) }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to add connection:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
