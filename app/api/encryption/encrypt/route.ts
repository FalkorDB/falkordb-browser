import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/app/api/auth/encryption";

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

    const encrypted = ENCRYPTED_PREFIX + encrypt(value);
    return NextResponse.json({ result: encrypted }, { status: 200 });
  } catch (error) {
    console.error("Encrypt API error:", error);
    return NextResponse.json(
      { message: "Encryption operation failed" },
      { status: 500 }
    );
  }
}
