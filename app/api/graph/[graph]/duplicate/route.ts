import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

// Validation schema
const patchBodySchema = z.object({
  sourceName: z.string({
    required_error: "SourceName is required",
    invalid_type_error: "Invalid SourceName",
  }),
});

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
    const { graph } = await params;
    const validationResult = patchBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { sourceName } = validationResult.data;

      const result = await client.selectGraph(sourceName).copy(graph);

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
