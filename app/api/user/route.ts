import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { User, ROLE } from "./model";
import { createUser, deleteUsers, validateBody } from "../validate-body";

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

    try {
      const body = await req.json();

      // Validate request body
      const validation = validateBody(createUser, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { username, password, role } = validation.data;
      const roleValue = ROLE.get(role);
      if (!roleValue)
        throw new Error("Invalid role");

      try {
        const user = await connection.aclGetUser(username);

        if (user) {
          return NextResponse.json(
            { message: `User ${username} already exists` },
            { status: 409 }
          );
        }
      } catch (err: unknown) {
        // Just a workaround for https://github.com/redis/node-redis/issues/2745
      }

      await connection.aclSetUser(username, roleValue.concat(`>${password}`));
      return NextResponse.json(
        { message: "Success" },
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

    try {
      const body = await req.json();

      // Validate request body
      const validation = validateBody(deleteUsers, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { users } = validation.data;
      await Promise.all(
        users.map(async (user) => {
          await connection.aclDelUser(user.username);
        })
      );

      return NextResponse.json({ message: "Users deleted" }, { status: 200 });
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
