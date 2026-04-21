import { NextRequest, NextResponse } from "next/server";
import { getClient } from "../../auth/[...nextauth]/options";
import { ROLE, getRoleWithKeys, extractKeysFromACL } from "../model";
import { updateUser, validateBody } from "../../validate-body";
import { getCorsHeaders } from "../../utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ user: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    const { user: username } = await params;
    
    try {
      const body = await request.json();
      
      // Validate request body
      const validation = validateBody(updateUser, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400, headers: getCorsHeaders(request) }
        );
      }

      const { role: roleKey, keys, password } = validation.data;
      const role = ROLE.get(roleKey);
      if (!role) throw new Error("Invalid role");

      const connection = await client.connection;

      // Preserve existing key permissions when keys not provided (true PATCH semantics)
      let effectiveKeys = keys;
      if (effectiveKeys === undefined) {
        const aclList = await connection.aclList();
        const userLine = aclList.find((line: string) => line.split(" ")[1] === username);
        if (userLine) {
          effectiveKeys = extractKeysFromACL(userLine.split(" "));
        }
      }

      const finalRole = getRoleWithKeys(role, effectiveKeys);
      if (password) {
        finalRole.push(`>${password}`);
      }
      await connection.aclSetUser(username, finalRole);
      return NextResponse.json({ message: "User role updated" }, { status: 200, headers: getCorsHeaders(request) });
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
