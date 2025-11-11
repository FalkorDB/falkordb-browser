import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

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

    const { client, user } = session;
    const { graph: graphId } = await params;
    const type = request.nextUrl.searchParams.get("type");

    try {
      const query = (() => {
        switch (type) {
          case "(function)":
            return "CALL dbms.procedures() YIELD name as info";
          case "(property key)":
            return "CALL db.propertyKeys() YIELD propertyKey as info";
          case "(label)":
            return "CALL db.labels() YIELD label as info";
          case "(relationship type)":
            return "CALL db.relationshipTypes() YIELD relationshipType as info";
          default:
            throw new Error("Invalid Type");
        }
      })();

      const graph = client.selectGraph(graphId);

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(query)
          : await graph.query(query);

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
