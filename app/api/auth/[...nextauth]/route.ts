import { NextResponse, type NextRequest } from "next/server";
import StorageFactory from "@/lib/token-storage/StorageFactory";
import {
  readReauthenticationHandoffId,
  REAUTHENTICATION_HANDOFF_COOKIE,
  REAUTHENTICATION_HANDOFF_PREFIX,
} from "@/lib/reauthentication-handoff";
import { enableAutoNextAuthUrl, isRequestOriginTrusted, rejectUntrustedOrigin, shouldUseSecureCookies } from "../../utils";
import { handlers } from "@/auth";

enableAutoNextAuthUrl();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function isSuccessfulCredentialsCallback(request: NextRequest, response: Response): Promise<boolean> {
  let destination = response.headers.get("location");
  if (!destination && response.headers.get("content-type")?.includes("application/json")) {
    const body: unknown = await response.clone().json();
    if (isRecord(body) && typeof body.url === "string") destination = body.url;
  }
  return destination !== null
    && destination !== undefined
    && !new URL(destination, request.url).searchParams.has("error");
}

async function authHandler(request: NextRequest) {
  if (!isRequestOriginTrusted(request)) {
    return rejectUntrustedOrigin(request);
  }

  const isCredentialsCallback = request.method === "POST"
    && new URL(request.url).pathname.endsWith("/callback/credentials");
  const handoffReference = isCredentialsCallback
    ? readReauthenticationHandoffId(request.headers.get("cookie") ?? undefined)
    : undefined;

  const method = request.method === "POST" ? handlers.POST : handlers.GET;
  const response = await method(request);
  if (!handoffReference || !(await isSuccessfulCredentialsCallback(request, response))) {
    return response;
  }

  const tokenId = `${REAUTHENTICATION_HANDOFF_PREFIX}${handoffReference}`;
  try {
    const deleted = await StorageFactory.getStorage().deleteToken(tokenId);
    if (!deleted) console.warn("Password reauthentication handoff was missing during successful sign-in cleanup");
  } catch (error) {
    console.error("Failed to delete the consumed password reauthentication handoff:", error);
  }

  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  nextResponse.cookies.set(REAUTHENTICATION_HANDOFF_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(request),
    path: "/api/auth",
    maxAge: 0,
  });
  return nextResponse;
}

export { authHandler as GET, authHandler as POST };
