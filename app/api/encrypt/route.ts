import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "../utils";
import { encryptForOwner, decryptForOwner, UnboundCiphertextError } from "../auth/encryption";
import { getClient, generateConsistentUserId } from "../auth/[...nextauth]/options";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * POST /api/encrypt
 * Body: { value: string, action: "encrypt" | "decrypt" }
 * Returns: { value: string }
 *
 * Ciphertext is bound to the caller's identity, so this endpoint cannot be used
 * to decrypt a blob lifted from another user's browser storage. The binding is
 * the stable per-connection id (username@host:port), not the per-login session
 * id, so a user keeps access to their own values across logins.
 */
export async function POST(request: NextRequest) {
  try {
    const corsHeaders = getCorsHeaders(request);

    const session = await getClient(request);
    
    if (session instanceof NextResponse) {
      return session;
    }

    // `getClient` returns a healthy cached client with empty connection
    // metadata when its Token DB lookup fails — it treats that lookup as
    // non-fatal because the connection itself still works. Hashing those
    // placeholders would bind every caller in that state to one shared
    // identity, and the values they store would stop decrypting the moment the
    // lookup recovers. Refuse instead, with a status the client treats as
    // transient so it keeps what it already has.
    if (!session.user.host || !session.user.port) {
      return NextResponse.json(
        { error: "Connection identity unavailable, please retry" },
        { status: 503, headers: corsHeaders }
      );
    }

    const owner = generateConsistentUserId(
      session.user.username ?? "",
      session.user.host,
      session.user.port
    );

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400, headers: corsHeaders }
      );
    }
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400, headers: corsHeaders }
      );
    }
    const { value, action } = body;

    if (typeof value !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'value'" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (action !== "encrypt" && action !== "decrypt") {
      return NextResponse.json(
        { error: "Action must be 'encrypt' or 'decrypt'" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (action === "encrypt") {
      if (!value) {
        return NextResponse.json({ value: "" }, { status: 200, headers: corsHeaders });
      }
      const encrypted = encryptForOwner(value, owner);
      return NextResponse.json({ value: encrypted }, { status: 200, headers: corsHeaders });
    }

    // decrypt
    if (!value) {
      return NextResponse.json({ value: "" }, { status: 200, headers: corsHeaders });
    }

    try {
      const decrypted = decryptForOwner(value, owner);
      return NextResponse.json({ value: decrypted }, { status: 200, headers: corsHeaders });
    } catch (err) {
      if (err instanceof UnboundCiphertextError) {
        // Pre-binding ciphertext. Unreadable by design — the client should drop
        // it and ask the user to re-enter the value.
        return NextResponse.json(
          { error: "Value predates owner binding and must be re-entered" },
          { status: 400, headers: corsHeaders }
        );
      }
      // Wrong owner or tampered input; GCM cannot tell them apart. 403 tells
      // the client to keep the value — it may belong to another connection.
      return NextResponse.json(
        { error: "Value does not belong to this connection" },
        { status: 403, headers: corsHeaders }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
