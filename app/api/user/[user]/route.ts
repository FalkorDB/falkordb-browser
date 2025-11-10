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
    
    // Validate username to prevent injection attacks
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json(
        { message: "Invalid username" },
        { status: 400 }
      );
    }

    const roleParam = req.nextUrl.searchParams.get("role");
    const role = ROLE.get(roleParam || "");
    
    try {
      if (!role) {
        return NextResponse.json(
          { message: "Invalid or missing role" },
          { status: 400 }
        );
      }

      await (await client.connection).aclSetUser(username, role);
      return NextResponse.json({ message: "User updated" }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to update user" },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
