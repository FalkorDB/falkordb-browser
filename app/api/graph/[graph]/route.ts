import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { GraphReply } from "falkordb/dist/src/graph";

const INITIAL = Number(process.env.INITIAL) || 0;

// Generate a unique id for each request
function* generateId(): Generator<number, number, number> {
  let id = 0;
  while (true) {
    yield id;
    id += 1;
  }
}

// create a generator for the unique ids
const idGenerator = generateId();

export async function DELETE(
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
      if (graphId) {
        const graph = client.selectGraph(graphId);

        await graph.delete();

        return NextResponse.json({ message: `${graphId} graph deleted` });
      }
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

export async function POST(
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

    try {
      const graph = client.selectGraph(graphId);
      const result =
        user.role === "Read-Only"
          ? await graph.roQuery("RETURN 1")
          : await graph.query("RETURN 1");

      if (!result) throw new Error("Something went wrong");

      return NextResponse.json(
        { message: "Graph created successfully" },
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
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}

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
    const sourceName = request.nextUrl.searchParams.get("sourceName");

    try {
      if (!sourceName) throw new Error("Missing parameter sourceName");

      const data = await (
        await client.connection
      ).renameNX(sourceName, graphId);

      if (!data) throw new Error(`${graphId} already exists`);

      return NextResponse.json({ data });
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

// send a query to the graph and return the result
// if the query is taking too long, return a timeout and save the result in the cache
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const {
      client,
      cache,
      user: { role },
    } = session;
    const { graph: graphId } = await params;
    const query = request.nextUrl.searchParams.get("query");
    const timeout = request.nextUrl.searchParams.get("timeout");

    try {
      if (!query) throw new Error("Missing parameter query");

      const graph = client.selectGraph(graphId);

      // Create a promise to resolve the result
      const result = await new Promise<GraphReply<unknown> | number>(
        (resolve, reject) => {
          const id = idGenerator.next().value;

          // Set a timeout to resolve the result if it takes too long
          const timeoutHook = setTimeout(() => {
            cache.set(id.toString(), null);
            resolve(id);
          }, INITIAL);

          const timeoutNumber =
            timeout === "undefined" ? 0 : Number(timeout) * 1000;
          const res =
            role === "Read-Only"
              ? graph.roQuery(query, { TIMEOUT: timeoutNumber })
              : graph.query(query, { TIMEOUT: timeoutNumber });

          res
            .then(async (r) => {
              if (!r) throw new Error("Something went wrong");

              const cached = await cache.get(id.toString());

              // If the result is already in the cache, save it
              if (typeof cached !== "undefined") {
                cache.set(id.toString(), r);
              }

              clearTimeout(timeoutHook);
              resolve(r);
            })
            .catch(async (error) => {
              const cached = await cache.get(id.toString());

              // If the error is already in the cache, save it
              if (typeof cached !== "undefined") {
                cache.set(id.toString(), error as Error);
              }

              clearTimeout(timeoutHook);
              reject(error);
            });
        }
      );

      // If the result is a number, return the id
      if (typeof result === "number") {
        return NextResponse.json({ result }, { status: 200 });
      }

      // If the result is does not exist, throw an error
      if (!result) throw new Error("Something went wrong");

      // Return the result
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
