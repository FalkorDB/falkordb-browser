import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { encryptForOwner } from "@/app/api/auth/encryption";
import { generateConsistentUserId, isEndpointBound } from "@/app/api/auth/[...nextauth]/options";

const ENCRYPTED_PREFIX = "senc:";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Bind the ciphertext to the caller's connection, so the matching decrypt
    // route cannot reopen a value lifted from someone else's browser. A token
    // that carries no endpoint would collapse every such caller onto one shared
    // owner, which is the opposite of binding, so refuse it instead of guessing.
    // `getToken` hands back the raw payload, so a pre-binding token — whose
    // host/port are the localhost defaults, not the endpoint it reached — gets
    // here without the jwt callback's chance to retire it. Refuse it too.
    if (!isEndpointBound(token)) {
      return NextResponse.json(
        { message: "Session predates connection binding, please sign in again" },
        { status: 401 }
      );
    }
    const host = token.host as string | undefined;
    const port = Number(token.port);
    if (!host || !Number.isFinite(port) || port <= 0) {
      return NextResponse.json(
        { message: "Connection identity unavailable, please retry" },
        { status: 503 }
      );
    }
    const owner = generateConsistentUserId(
      (token.username as string | undefined) ?? "",
      host,
      port
    );

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { message: "Request body must be a JSON object" },
        { status: 400 }
      );
    }
    const { value } = body;

    if (typeof value !== "string") {
      return NextResponse.json(
        { message: "Missing required field: value" },
        { status: 400 }
      );
    }

    // Limit payload size to prevent resource exhaustion (max 10KB)
    if (value.length > 10240) {
      return NextResponse.json(
        { message: "Payload too large" },
        { status: 400 }
      );
    }

    if (!value) {
      return NextResponse.json({ result: "" }, { status: 200 });
    }

    const encrypted = ENCRYPTED_PREFIX + encryptForOwner(value, owner);
    return NextResponse.json({ result: encrypted }, { status: 200 });
  } catch (error) {
    console.error("Encrypt API error:", error);
    return NextResponse.json(
      { message: "Encryption operation failed" },
      { status: 500 }
    );
  }
}
