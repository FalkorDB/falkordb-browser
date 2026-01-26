import { NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { corsHeaders } from "@/app/api/utils";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function GET() {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    try {
      const result = await client.list();

      const graphNames = result.filter((name) => !name.endsWith("_schema"));

      return NextResponse.json({ opts: graphNames }, { status: 200, headers: corsHeaders() });
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
