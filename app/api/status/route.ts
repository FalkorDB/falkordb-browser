import { NextResponse } from "next/server";
import { getClient } from "../auth/[...nextauth]/options";
import { getCorsHeaders } from "../utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: Request) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    try {
      const { client } = session;

      await (await client.connection).ping();

      return NextResponse.json({ status: "online" }, { status: 200, headers: getCorsHeaders(request) });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ status: "offline" }, { status: 404, headers: getCorsHeaders(request) });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "offline" }, { status: 500, headers: getCorsHeaders(request) });
  }
}
