import { NextRequest, NextResponse } from "next/server";
import { getClient } from "../../auth/[...nextauth]/options";
import { ROLE } from "../model";

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ user: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    const { user: username } = await params;
    const role = ROLE.get(req.nextUrl.searchParams.get("role") || "");
    try {
      if (!role) throw new Error("Role is missing");

      await (await client.connection).aclSetUser(username, role);
      return NextResponse.json({ message: "User created" }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
