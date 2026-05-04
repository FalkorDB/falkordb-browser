import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { enableAutoNextAuthUrl, getCorsHeaders, isRequestOriginTrusted } from "../../utils";
import authOptions from "./options";

enableAutoNextAuthUrl();

const handler = NextAuth(authOptions);

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

async function authHandler(request: NextRequest, context: AuthRouteContext) {
  if (!isRequestOriginTrusted(request)) {
    return NextResponse.json(
      { message: "Untrusted request origin" },
      { status: 400, headers: getCorsHeaders(request) }
    );
  }

  return handler(request, context);
}

export { authHandler as GET, authHandler as POST };
