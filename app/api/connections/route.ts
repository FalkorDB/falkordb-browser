import { NextResponse } from "next/server";
import { addSessionConnection, getSessionFromRequest, listSessionConnections } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders, isRequestOriginTrusted, rejectUntrustedOrigin, corsPreflight } from "@/app/api/utils";
import { addConnection, validateBody } from "@/app/api/validate-body";
import { classifyLoginError, LoginError } from "@/lib/login-errors";

export const OPTIONS = corsPreflight;

/**
 * GET /api/connections
 * Lists all additional connections for the current session.
 */
export async function GET(request: Request) {
  try {
    if (!isRequestOriginTrusted(request)) {
      return rejectUntrustedOrigin(request);
    }

    const session = await getSessionFromRequest(request);
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
 * Body: { host?, port?, username?, password?, tls?, ca?, cert?, key? }
 */
export async function POST(request: Request) {
  try {
    if (!isRequestOriginTrusted(request)) {
      return rejectUntrustedOrigin(request);
    }

    const session = await getSessionFromRequest(request);
    const id = session?.user?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401, headers: getCorsHeaders(request) }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const result = validateBody(addConnection, rawBody);
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    const { host, port, username, password, tls, ca, cert, key } = result.data;

    const connInfo = await addSessionConnection(id, {
      host: (host as string) || session.user.host,
      port: port?.toString() || session.user.port.toString(),
      username: username as string,
      password: password as string,
      tls: tls?.toString() || String(session.user.tls),
      ca: ca as string | undefined,
      cert: cert as string | undefined,
      key: key as string | undefined,
    });

    return NextResponse.json(
      { connection: connInfo },
      { status: 201, headers: getCorsHeaders(request) }
    );
  } catch (err) {
    const raw = (err as Error).message || "";
    // eslint-disable-next-line no-console
    console.error("Failed to add connection:", raw);

    const lower = raw.toLowerCase();
    let status = raw ? 400 : 500;
    const code = classifyLoginError(err);

    if (code === "connection_failed" &&
      (lower.includes("econnrefused") || lower.includes("connection refused") || lower.includes("connect etimedout"))) {
      status = 503;
    }

    return NextResponse.json(
      { message: new LoginError(code).message, code },
      { status, headers: getCorsHeaders(request) }
    );
  }
}
