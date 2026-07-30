import { NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders } from "@/app/api/utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: Request) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    try {
      const stubs = await client.stubs();

      return NextResponse.json({ stubs }, { status: 200, headers: getCorsHeaders(request) });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
