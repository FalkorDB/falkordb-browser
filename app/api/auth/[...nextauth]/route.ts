import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { enableAutoNextAuthUrl, isRequestOriginTrusted, rejectUntrustedOrigin } from "../../utils";
import authOptions from "./options";

enableAutoNextAuthUrl();

const handler = NextAuth(authOptions);

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

async function authHandler(request: NextRequest, context: AuthRouteContext) {
  if (!isRequestOriginTrusted(request)) {
    return rejectUntrustedOrigin(request);
  }

  return handler(request, context);
}

export { authHandler as GET, authHandler as POST };
