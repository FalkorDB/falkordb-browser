import { NextResponse } from "next/server";
import { getClient } from "../auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET() {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    try {
      await (await client.connection).ping();

      return NextResponse.json({ status: "online" }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ status: "offline" }, { status: 404 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "offline" }, { status: 500 });
  }
}
