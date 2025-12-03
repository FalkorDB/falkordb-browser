import { NextResponse, NextRequest } from "next/server";
import { getClient } from "../../auth/[...nextauth]/options";
import { renameSchema, validateBody } from "../../validate-body";

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
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery(
              "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN * LIMIT 100"
            )
          : await graph.query(
              "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN * LIMIT 100"
            );

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

    const { client } = session;
    const { schema } = await params;
    const schemaName = `${schema}_schema`;

    try {
      const graph = client.selectGraph(schemaName);

      await graph.query("RETURN 1");

      return NextResponse.json(
        { message: "Schema created successfully" },
        { status: 200 }
      );
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
        { message: `${schemaName} schema deleted` },
        { status: 200 }
      );
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

    try {
      const body = await request.json();

      // Validate request body
      const validation = validateBody(renameSchema, body);

      if (!validation.success) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }

      const { sourceName: source } = validation.data;
      const sourceName = `${source}_schema`;
      const data = await (
        await client.connection
      ).renameNX(sourceName, schemaName);

      if (!data) throw new Error(`${schema} already exists`);

      return NextResponse.json({ data });
    } catch (err: unknown) {
      console.error(err);
      return NextResponse.json(
        { message: (err as Error).message },
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
