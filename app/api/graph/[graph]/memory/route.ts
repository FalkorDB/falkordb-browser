import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

// Track call counts per graph for debugging
const callCounts = new Map<string, number>();

// eslint-disable-next-line import/prefer-default-export
export async function GET(
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

    try {
      // Track how many times this graph has been called
      const currentCount = (callCounts.get(graph) || 0) + 1;
      callCounts.set(graph, currentCount);
      
      // eslint-disable-next-line no-console
      console.log(`[MEMORY-API] Request #${currentCount} for graph: ${graph}, timestamp: ${new Date().toISOString()}`);
      // eslint-disable-next-line no-console
      console.log(`[MEMORY-API] Total unique graphs tracked: ${callCounts.size}`);
      
      // eslint-disable-next-line no-console
      console.log(`[MEMORY-API] About to call memoryUsage() for graph: ${graph}`);
      const result = await client.selectGraph(graph).memoryUsage()
      
      // eslint-disable-next-line no-console
      console.log(`[MEMORY-API] ✓ SUCCESS - Call #${currentCount} completed for graph: ${graph}`);
      
      return NextResponse.json({ result }, { status: 200 });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[MEMORY-API-ERROR] Error for graph: ${graph}`);
        // eslint-disable-next-line no-console
        console.error(`[MEMORY-API-ERROR] Error message:`, (err as Error).message);
        // eslint-disable-next-line no-console
        console.error(`[MEMORY-API-ERROR] Error stack:`, (err as Error).stack);
        // eslint-disable-next-line no-console
        console.error(err);
        return NextResponse.json(
          { message: (err as Error).message },
          { status: 400 }
        );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
