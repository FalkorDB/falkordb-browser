import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/api/auth/encryption";

const ENCRYPTED_PREFIX = "senc:";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value } = body;

    if (typeof value !== "string") {
      return NextResponse.json(
        { message: "Missing required field: value" },
        { status: 400 }
      );
    }

    if (!value) {
      return NextResponse.json({ result: "" }, { status: 200 });
    }

    // Handle server-encrypted values
    if (value.startsWith(ENCRYPTED_PREFIX)) {
      const raw = value.substring(ENCRYPTED_PREFIX.length);
      const decrypted = decrypt(raw);
      return NextResponse.json({ result: decrypted }, { status: 200 });
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
