import { NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders } from "@/app/api/utils";

const fields = ["used_memory", "used_memory_rss"];

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: Request) {
  try {
    const session = await getClient(request);
    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    try {
      const infoMemory = await (await client.connection).info("memory");
      const infoGraph = await client.info();

      const dataMemory = infoMemory
        .split("\r\n")
        .map((item: string) => {
          const name = item.split(":")[0];
          const series = item.split(":")[1];
          return { name, series };
        })
        .filter((item: { name: string; series: string }) =>
          fields.find((field) => field === item.name)
        );
      const dataGraph: { name: string; series: number }[] = [];
      for (let i = 0; i < infoGraph.length; i += 2) {
        const name = (infoGraph[i] as string).substring(2);
        const series = (infoGraph[i + 1] as string[]).length;
        dataGraph.push({ name, series });
      }

      return NextResponse.json(
        { memory: dataMemory, graph: dataGraph },
        { status: 200, headers: getCorsHeaders(request) }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
