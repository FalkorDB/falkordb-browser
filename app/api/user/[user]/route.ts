import { NextRequest, NextResponse } from "next/server";
import { getClient } from "../../auth/[...nextauth]/options";
import { ROLE } from "../model";
import { updateUserRoleSchema, validateRequest } from "../../validation-schemas";

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
    const body = await req.json();
    
    // Validate request body
    const validation = validateRequest(updateUserRoleSchema, {
      user: username,
      ...body,
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    const { role: roleKey } = validation.data;
    const role = ROLE.get(roleKey);
    
    try {
      if (!role) throw new Error("Invalid role");

      await (await client.connection).aclSetUser(username, role);
      return NextResponse.json({ message: "User role updated" }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
