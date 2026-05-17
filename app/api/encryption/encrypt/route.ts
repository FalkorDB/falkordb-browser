import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { encrypt } from "@/app/api/auth/encryption";

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

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
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
