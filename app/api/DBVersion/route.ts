/* eslint-disable @typescript-eslint/no-explicit-any */
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
      const result = await (await client.connection).moduleList() as any;

      const data = result.find((arr: any[]) => arr.some((mod: string, index: number) => mod === "name" && arr[index + 1] === "graph"));

      if (!data) {
        return NextResponse.json(
          { message: "Graph module not found" },
          { status: 404, headers: corsHeaders() }
        );
      }

      const nameIndex = data.findIndex((mod: string) => mod === "name");
      const verIndex = data.findIndex((mod: string) => mod === "ver");

      if (nameIndex === -1 || verIndex === -1 || !data[nameIndex + 1] || !data[verIndex + 1]) {
        return NextResponse.json(
          { message: "Invalid module metadata format" },
          { status: 500, headers: corsHeaders() }
        );
      }

      return NextResponse.json(
        { result: [data[nameIndex + 1], data[verIndex + 1]] },
        { status: 200, headers: corsHeaders() }
      );
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
