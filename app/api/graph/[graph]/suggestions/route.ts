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
    const type = request.nextUrl.searchParams.get("type") as
      | "(function)"
      | "(property key)"
      | "(label)"
      | "(relationship type)"
      | undefined;

    try {
      const getQuery = () => {
        switch (type) {
          case "(function)":
            return "CALL dbms.procedures() YIELD name as sug";
          case "(property key)":
            return "CALL db.propertyKeys() YIELD propertyKey as sug";
          case "(label)":
            return "CALL db.labels() YIELD label as sug";
          case "(relationship type)":
            return "CALL db.relationshipTypes() YIELD relationshipType as sug";
          default:
            throw new Error("Type is required");
        }
      };

      const graph = client.selectGraph(graphId);

      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(getQuery())
          : await graph.query(getQuery());

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
