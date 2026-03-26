import { NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders } from "@/app/api/utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

function parseInfoField(info: string, field: string): string | undefined {
  const match = info.match(new RegExp(`${field}:(.+?)\\r?\\n`));
  return match?.[1]?.trim();
}

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: Request) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;
    const connection = await client.connection;

    const info = await connection.info();
    const clusterEnabled = parseInfoField(info, "redis_mode") === "cluster";
    const replicationInfo = await connection.info("replication");
    const connectedSlaves = Number(parseInfoField(replicationInfo, "connected_slaves") ?? "0");
    const role = parseInfoField(replicationInfo, "role") ?? "master";

    const result: Record<string, unknown> = {};

    if (clusterEnabled) {
      try {
        const clusterNodesRaw: string = await connection.sendCommand(["CLUSTER", "NODES"]) as string;
        result.clusterNodes = clusterNodesRaw.split("\n").filter(line => line.trim().length > 0).length;
      } catch (err) {
        console.error("Failed to get cluster details:", err);
      }
    } else if (role === "master" && connectedSlaves > 0) {
      result.sentinelRole = "master";
      result.sentinelReplicas = connectedSlaves;
    } else if (role === "slave") {
      result.sentinelRole = "slave";
      result.sentinelMasterHost = parseInfoField(replicationInfo, "master_host");
      result.sentinelMasterPort = Number(parseInfoField(replicationInfo, "master_port") ?? "0");
    }

    return NextResponse.json({ result }, { status: 200, headers: getCorsHeaders(request) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
