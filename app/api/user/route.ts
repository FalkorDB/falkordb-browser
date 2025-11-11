import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { User, ROLE, roleValues } from "./model";

// Validation schemas
const postBodySchema = z.object({
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Invalid Username",
  }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Invalid Password",
  }),
  role: z.enum(roleValues, {
    required_error: "Role is required",
    invalid_type_error: "Invalid Role",
  }),
});

const deleteBodySchema = z.object({
  users: z.array(
    z.object({
      username: z.string(),
      role: z.enum(roleValues),
    }),
    {
      required_error: "Users is required",
      invalid_type_error: "Invalid users",
    }
  ),
});

export async function GET() {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    try {
      const list = await (await client.connection).aclList();
      const result: User[] = list
        .map((userACL: string) => userACL.split(" "))
        .filter(
          (userDetails: string[]) =>
            userDetails.length > 1 && userDetails[0] === "user"
        )
        .map((userDetails: string[]) => {
          // find key in ROLE that has a value equals to userDetails by comaring each array
          const role = Array.from(ROLE.entries()).find(([, value]) => {
            const reversed = value.slice(1).reverse();
            return reversed.every(
              (val, index) =>
                userDetails[userDetails.length - 1 - index] === val
            );
          });

          return {
            username: userDetails[1],
            role: role ? role[0] : "Unknown",
            selected: false,
          };
        });

      return NextResponse.json({ result }, { status: 200 });
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

export async function POST(req: NextRequest) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;
    const connection = await client.connection;
    const validationResult = postBodySchema.safeParse(await req.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { username, password, role: roleName } = validationResult.data;
      const role = ROLE.get(roleName);

      if (!role) throw new Error("Invalid Role");

      try {
        const user = await connection.aclGetUser(username);

        if (user) {
          return NextResponse.json(
            { message: `User already exists` },
            { status: 409 }
          );
        }
      } catch (err: unknown) {
        // Just a workaround for https://github.com/redis/node-redis/issues/2745
      }

      await connection.aclSetUser(username, role.concat(`>${password}`));

      return NextResponse.json(
        { message: "User created successfully" },
        {
          status: 201,
          headers: {
            location: `/api/db/user/${username}`,
          },
        }
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;
    const connection = await client.connection;
    const validationResult = deleteBodySchema.safeParse(await req.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { users } = validationResult.data;

      await Promise.all(
        users.map(async (user: User) => {
          await connection.aclDelUser(user.username);
        })
      );

      return NextResponse.json(
        { message: "Users deleted successfully" },
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
