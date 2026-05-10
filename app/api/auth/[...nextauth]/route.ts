import type { NextRequest } from "next/server";
import { enableAutoNextAuthUrl, isRequestOriginTrusted, rejectUntrustedOrigin } from "../../utils";
import { handlers } from "@/auth";

enableAutoNextAuthUrl();

async function authHandler(request: NextRequest) {
  if (!isRequestOriginTrusted(request)) {
    return rejectUntrustedOrigin(request);
  }

  const method = request.method === "POST" ? handlers.POST : handlers.GET;
  return method(request);
}

export { authHandler as GET, authHandler as POST };
