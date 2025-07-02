import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse, NextRequest } from "next/server";

// eslint-disable-next-line import/prefer-default-export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { graph } = await params;

    try {
      const query =
        "MATCH (n) OPTIONAL MATCH (n)-[e]->() WITH count(n) as nodes, count(e) as edges RETURN nodes, edges";

      // Use relative URL to prevent SSRF vulnerability
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const result = await fetch(
        `${baseUrl}/api/graph/${graph}?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (!result.ok) throw new Error("Something went wrong");

      const json = await result.json();

      const data =
        typeof json.result === "number"
          ? json.result
          : { data: [json.result.data[0] || { edges: 0, nodes: 0 }] };

      return NextResponse.json({ result: data }, { status: 200 });
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
