import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { GET as sendQuery } from "@/app/api/graph/[graph]/route";
import { NextResponse, NextRequest } from "next/server";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { schema } = await params;
    const schemaName = `${schema}_schema`;

    try {
      const query =
        "MATCH (n) OPTIONAL MATCH (n)-[e]->() WITH count(n) as nodes, count(e) as edges RETURN nodes, edges";

      request.nextUrl.searchParams.set("query", query);

      const result = await sendQuery(request, {
        params: new Promise((resolve) => {
          resolve({ graph: schemaName });
        }),
      });

      if (!result.ok) throw new Error("Something went wrong");

      return NextResponse.json({ result }, { status: 200 });
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
