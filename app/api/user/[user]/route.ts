import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClient } from "../../auth/[...nextauth]/options";
import { ROLE, roleValues } from "../model";

// Validation schema
const patchBodySchema = z.object({
  role: z.enum(roleValues, {
    required_error: "Role is required",
    invalid_type_error: "Invalid Role",
  }),
});

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ user: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;
    const { user: username } = await params;
    const validationResult = patchBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { role: roleName } = validationResult.data;
      const role = ROLE.get(roleName);

      if (!role) throw new Error("Invalid Role");

      await (await client.connection).aclSetUser(username, role);

      return NextResponse.json(
        { message: "User updated successfully" },
        { status: 200 }
      );
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
