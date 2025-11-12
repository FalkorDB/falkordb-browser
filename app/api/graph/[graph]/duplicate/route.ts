import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse, NextRequest } from "next/server";
import { duplicateGraphSchema, validateRequest } from "../../../validation-schemas";

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
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(duplicateGraphSchema, {
      graph: graphId,
      ...body,
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    const { sourceName } = validation.data;

    try {
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
