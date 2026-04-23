import { NextResponse } from "next/server";
import { getClient } from "../../auth/[...nextauth]/options";
import { getCorsHeaders } from "../../utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: Request) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    try {
      await (await client.connection).aclSave();
      return NextResponse.json(
        { message: "ACL saved to disk" },
        { status: 200, headers: getCorsHeaders(request) }
      );
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
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
