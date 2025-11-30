import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse, NextRequest } from "next/server";
import { duplicateGraph, validateBody } from "../../../validate-body";

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;
    const { graph: graphId } = await params;

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(duplicateGraph, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { sourceName } = validation.data;
      const result = await client.selectGraph(sourceName).copy(graphId);

      return NextResponse.json({ result });
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
