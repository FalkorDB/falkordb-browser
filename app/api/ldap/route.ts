import { NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders } from "@/app/api/utils";
import { LDAP_SERVERS_CONFIG } from "@/lib/enterprise";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * Reads the enterprise module's LDAP servers config and passes the raw value
 * through. Callers decide what it means — see `hasLdapServers`. Only the
 * enterprise module registers this parameter, so the browser should ask for it
 * only after `MODULE LIST` reported `falkordbe`.
 *
 * Note this is the Redis `CONFIG GET` on the underlying connection, not
 * `client.configGet` — that one issues `GRAPH.CONFIG GET`, which only knows
 * FalkorDB's own unprefixed fields and rejects module parameters.
 */
export async function GET(request: Request) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    try {
      const config = await (await client.connection).configGet(LDAP_SERVERS_CONFIG);

      return NextResponse.json({ config }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
