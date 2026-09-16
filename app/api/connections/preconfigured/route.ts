import { NextResponse } from "next/server";
import { getCorsHeaders, isRequestOriginTrusted, rejectUntrustedOrigin } from "@/app/api/utils";
import { readPreconfiguredConnection, toPreconfiguredConnectionInfo } from "@/lib/preconfiguredConnection";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * GET /api/connections/preconfigured
 *
 * Reports the connection the operator baked into the environment, so the login
 * page knows whether to sign in automatically or merely prefill its fields.
 *
 * Deliberately unauthenticated — it is consulted before anyone can log in — so
 * it returns only what the existing `?host=&port=&username=` login links
 * already expose. The password and CA certificate stay on the server.
 */
export async function GET(request: Request) {
  if (!isRequestOriginTrusted(request)) {
    return rejectUntrustedOrigin(request);
  }

  try {
    const info = toPreconfiguredConnectionInfo(readPreconfiguredConnection(process.env));
    return NextResponse.json(info, { status: 200, headers: getCorsHeaders(request) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Invalid preconfigured connection environment:", err);
    return NextResponse.json(
      { message: "The preconfigured connection environment is invalid. Check the server logs." },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
