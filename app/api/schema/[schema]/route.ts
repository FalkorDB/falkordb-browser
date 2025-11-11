import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getClient } from "../../auth/[...nextauth]/options";

// Validation schema
const patchBodySchema = z.object({
  sourceName: z.string({
    required_error: "SourceName is required",
    invalid_type_error: "Invalid SourceName",
  }),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema } = await params;
    const schemaName = `${schema}_schema`;
    const create = request.nextUrl.searchParams.get("create");

    try {
      const schemas = await client.list();

      if (create === "false" && !schemas.includes(schemaName))
        return NextResponse.json(
          { message: "Schema not found" },
          { status: 200 }
        );

      const graph = client.selectGraph(schemaName);
      const query = "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN * LIMIT 100";
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schema: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { client, user } = session;
    const { schema } = await params;
    const schemaName = `${schema}_schema`;

    try {
      const graph = client.selectGraph(schemaName);
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery("RETURN 1")
          : await graph.query("RETURN 1");

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

export async function DELETE(
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

    try {
      const graph = client.selectGraph(schemaName);

      await graph.delete();

      return NextResponse.json(
        { message: `Schema deleted successfully` },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: (error as Error).message },
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
    const validationResult = patchBodySchema.safeParse(await request.json());

    try {
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }

      const { sourceName: source } = validationResult.data;

      const sourceName = `${source}_schema`;
      const data = await (
        await client.connection
      ).renameNX(sourceName, schemaName);

      if (!data) throw new Error(`Schema Name already exists`);

      return NextResponse.json({ data });
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
