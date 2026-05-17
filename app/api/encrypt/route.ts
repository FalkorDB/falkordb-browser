import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getCorsHeaders } from "../utils";
import { encrypt, decrypt } from "../auth/encryption";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * POST /api/encrypt
 * Body: { value: string, action: "encrypt" | "decrypt" }
 * Returns: { value: string }
 */
export async function POST(request: NextRequest) {
  try {
    const corsHeaders = getCorsHeaders(request);

    // Lightweight auth check via JWT
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: corsHeaders }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
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
      const encrypted = encrypt(value);
      return NextResponse.json({ value: encrypted }, { status: 200, headers: corsHeaders });
    }

    // decrypt
    if (!value) {
      return NextResponse.json({ value: "" }, { status: 200, headers: corsHeaders });
    }

    try {
      const decrypted = decrypt(value);
      return NextResponse.json({ value: decrypted }, { status: 200, headers: corsHeaders });
    } catch {
      return NextResponse.json(
        { error: "Decryption failed" },
        { status: 400, headers: corsHeaders }
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
