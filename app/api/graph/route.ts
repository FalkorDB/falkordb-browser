import { NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders } from "@/app/api/utils";
import { buildGraphListEntries, extractCount, isEnterpriseModuleLoaded, toGraphNames } from "./listing-utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;

    try {
      const [activeGraphs, modules] = await Promise.all([
        client.list(),
        (await client.connection).moduleList()
      ]);

      const enterpriseLoaded = isEnterpriseModuleLoaded(modules);

      const graphCounts = new Map<string, { nodes: number | null; edges: number | null }>(
        await Promise.all(activeGraphs.map(async (graphName) => {
          try {
            const graph = client.selectGraph(graphName);
            const [nodesResult, edgesResult] = await Promise.all([
              graph.roQuery("MATCH (n) RETURN count(n) as nodes"),
              graph.roQuery("MATCH ()-[e]->() RETURN count(e) as edges"),
            ]);

            return [graphName, {
              nodes: extractCount(nodesResult, "nodes"),
              edges: extractCount(edgesResult, "edges"),
            }] as const;
          } catch {
            return [graphName, { nodes: null, edges: null }] as const;
          }
        }))
      );

      let stubGraphs: string[] = [];
      if (enterpriseLoaded) {
        try {
          const rawStubs = await (await client.connection).sendCommand(["GRAPH.STUBS"]);
          stubGraphs = toGraphNames(rawStubs);
        } catch {
          stubGraphs = [];
        }
      }

      const graphs = buildGraphListEntries(activeGraphs, stubGraphs, graphCounts);
      const graphNames = graphs.map((entry) => entry.name);

      return NextResponse.json({ opts: graphNames, graphs }, { status: 200, headers: getCorsHeaders(request) });
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
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
