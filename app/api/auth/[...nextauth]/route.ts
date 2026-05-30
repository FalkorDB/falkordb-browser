import type { NextRequest } from "next/server";
import { enableAutoNextAuthUrl, firstHeaderValue, isRequestOriginTrusted, rejectUntrustedOrigin } from "../../utils";
import { handlers } from "@/auth";

enableAutoNextAuthUrl();

function sanitizeForwardedHeaders(request: NextRequest): Request {
  const headers = new Headers(request.headers);

  const forwardedHost = firstHeaderValue(headers.get("x-forwarded-host"));
  if (forwardedHost) {
    headers.set("x-forwarded-host", forwardedHost);
  }

  const forwardedProto = firstHeaderValue(headers.get("x-forwarded-proto"));
  if (forwardedProto === "http" || forwardedProto === "https") {
    headers.set("x-forwarded-proto", forwardedProto);
  } else {
    headers.delete("x-forwarded-proto");
  }

  return new Request(request, { headers });
}

async function authHandler(request: NextRequest) {
  if (!isRequestOriginTrusted(request)) {
    return rejectUntrustedOrigin(request);
  }

  const method = request.method === "POST" ? handlers.POST : handlers.GET;
  return method(sanitizeForwardedHeaders(request));
}

export { authHandler as GET, authHandler as POST };
