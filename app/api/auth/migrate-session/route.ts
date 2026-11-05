import { NextResponse } from "next/server";
import { getCorsHeaders, isRequestOriginTrusted, rejectUntrustedOrigin } from "@/app/api/utils";

// Old clients may still call this endpoint. Cookie fields cannot recreate
// authority when stored connection records are absent or have been revoked.
export async function POST(request: Request) {
  if (!isRequestOriginTrusted(request)) return rejectUntrustedOrigin(request);
  return NextResponse.json(
    { message: "No active connection. Please sign in again.", code: "SESSION_INVALID" },
    { status: 401, headers: { ...getCorsHeaders(request), "X-Session-Invalid": "1" } },
  );
}
