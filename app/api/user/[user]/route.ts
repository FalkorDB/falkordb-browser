import { NextRequest, NextResponse } from "next/server";
import { getClient } from "../../auth/[...nextauth]/options";
import { ROLE } from "../model";
import { updateUserRole, validateBody } from "../../validate-body";
import { corsHeaders } from "../../utils";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

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
    
    try {
      const body = await req.json();
      
      // Validate request body
      const validation = validateBody(updateUserRole, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: corsHeaders() }
        );
      }

      const { role: roleKey } = validation.data;
      const role = ROLE.get(roleKey);
      if (!role) throw new Error("Invalid role");

      await (await client.connection).aclSetUser(username, role);
      return NextResponse.json({ message: "User role updated" }, { status: 200, headers: corsHeaders() });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: corsHeaders() }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
