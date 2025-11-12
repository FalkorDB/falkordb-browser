import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse, NextRequest } from "next/server";
import { duplicateSchemaSchema, validateRequest } from "../../../validation-schemas";

// eslint-disable-next-line import/prefer-default-export
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;
    const { schema } = await params;
    const schemaName = `${schema}_schema`;
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(duplicateSchemaSchema, {
      schema,
      ...body,
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    const { sourceName: source } = validation.data;

    try {
      const sourceName = `${source}_schema`;
      const result = await client.selectGraph(sourceName).copy(schemaName);

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
