import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { decryptForOwner, UnboundCiphertextError } from "@/app/api/auth/encryption";
import { generateConsistentUserId } from "@/app/api/auth/[...nextauth]/options";

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

    // Only ciphertext bound to this caller's connection can be reopened here.
    // A token with no endpoint would share one owner with every other such
    // token, letting them read each other's values, so refuse it.
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

    // Handle server-encrypted values
    if (value.startsWith(ENCRYPTED_PREFIX)) {
      const raw = value.substring(ENCRYPTED_PREFIX.length);
      try {
        const decrypted = decryptForOwner(raw, owner);
        return NextResponse.json({ result: decrypted }, { status: 200 });
      } catch (error) {
        if (error instanceof UnboundCiphertextError) {
          return NextResponse.json(
            { message: "Value predates owner binding and must be re-entered" },
            { status: 400 }
          );
        }
        if (error instanceof Error && error.message.includes("ENCRYPTION_KEY")) {
          // A misconfigured server, not a rejected value.
          return NextResponse.json(
            { message: "Server configuration error" },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { message: "Value does not belong to this connection" },
          { status: 403 }
        );
      }
    }

    // Old client-side encrypted values (enc: prefix) can't be decrypted
    // server-side since the per-user key is lost — return empty to force re-entry
    if (value.startsWith("enc:")) {
      return NextResponse.json({ result: "" }, { status: 200 });
    }

    // Unrecognized format — treat as plain text (legacy migration)
    return NextResponse.json({ result: value }, { status: 200 });
  } catch (error) {
    console.error("Decrypt API error:", error);
    return NextResponse.json(
      { message: "Decryption operation failed" },
      { status: 500 }
    );
  }
}
