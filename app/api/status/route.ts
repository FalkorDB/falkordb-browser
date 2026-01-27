import { NextResponse } from "next/server";
import { getClient } from "../auth/[...nextauth]/options";
import { corsHeaders } from "../utils";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// eslint-disable-next-line import/prefer-default-export
export async function GET() {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    try {
      const { client } = session;

      await (await client.connection).ping();

      return NextResponse.json({ status: "online" }, { status: 200, headers: corsHeaders() });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ status: "offline" }, { status: 404, headers: corsHeaders() });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "offline" }, { status: 500, headers: corsHeaders() });
  }
}
