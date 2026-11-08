import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders, isRequestOriginTrusted, rejectUntrustedOrigin } from "@/app/api/utils";
import { isUsableConnectionRecord } from "@/lib/connectionBinding";
import StorageFactory from "@/lib/token-storage/StorageFactory";

// Old clients may still call this endpoint. Cookie fields cannot recreate
// authority when stored connection records are absent or have been revoked.
export async function POST(request: Request) {
  if (!isRequestOriginTrusted(request)) return rejectUntrustedOrigin(request);
  try {
    const session = await getSessionFromRequest(request);
    if (session?.activeConnectionId) {
      const record = await StorageFactory.getStorage().fetchTokenById(session.activeConnectionId);
      if (isUsableConnectionRecord(record, session.user.id)) {
        return NextResponse.json({
          connection: {
            id: record.token_id, username: record.username, role: record.role,
            host: record.host, port: record.port, tls: record.tls ?? false,
            ca: record.ca || undefined, cert: record.cert || undefined,
          },
        }, { headers: getCorsHeaders(request) });
      }
    }
  } catch (error) {
    console.error("Failed to validate stored session connection:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
  return NextResponse.json(
    { message: "No active connection. Please sign in again.", code: "SESSION_INVALID" },
    { status: 401, headers: { ...getCorsHeaders(request), "X-Session-Invalid": "1" } },
  );
}
