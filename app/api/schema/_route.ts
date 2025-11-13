import { NextResponse } from "next/server";
import { getClient } from "../auth/[...nextauth]/options";

// eslint-disable-next-line import/prefer-default-export
export async function GET() {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    try {
      const result = await client.list();
      const schemaNames = result
        .filter((name) => name.endsWith("_schema"))
        .map((name) => {
          let graphName = name.replace(/_schema(?=[^_]*$)/, "");
          if (graphName.startsWith("{") && graphName.endsWith("}")) {
            graphName = graphName.substring(1, graphName.length - 1);
          }
          return graphName;
        });

      return NextResponse.json({ opts: schemaNames }, { status: 200 });
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
