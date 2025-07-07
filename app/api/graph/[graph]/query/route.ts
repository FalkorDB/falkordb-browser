import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest) {
  try {
    const session = await getClient();

    if (session instanceof NextResponse) {
      return session;
    }

    const { cache } = session;

    const resultId = request.nextUrl.searchParams.get("id");

    try {
      if (!resultId) throw new Error("Missing parameter id");

      const id = Number(resultId);
      // Get the result from the cache
      const cached = await cache.get(id.toString());

      if (typeof cached === "undefined")
        return NextResponse.json(
          { message: "No request found" },
          { status: 404 }
        );

      // If the result is still not in the cache, return the id
      if (!cached) {
        return NextResponse.json({ result: id }, { status: 200 });
      }

      // Delete the result from the cache
      cache.delete(id.toString());

      // If the result is an error, return the error
      if (cached instanceof Error) {
        return NextResponse.json(
          { error: cached.message },
          { status: 400 }
        );
      }

      // Return the result
      return NextResponse.json({ result: cached }, { status: 200 });
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
