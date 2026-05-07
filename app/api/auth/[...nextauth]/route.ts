import type { NextRequest } from "next/server";
import { enableAutoNextAuthUrl, isRequestOriginTrusted, rejectUntrustedOrigin } from "../../utils";
import { handlers } from "@/auth";

enableAutoNextAuthUrl();

async function authHandler(request: NextRequest) {
  if (!isRequestOriginTrusted(request)) {
    return rejectUntrustedOrigin(request);
  }

  if (request.method === "GET") {
    return handlers.GET(request);
  }
  return handlers.POST(request);
}

export { authHandler as GET, authHandler as POST };
