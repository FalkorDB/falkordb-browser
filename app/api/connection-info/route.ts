import { NextResponse } from "next/server";
import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { getCorsHeaders } from "@/app/api/utils";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

function parseInfoField(info: string, field: string): string | undefined {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = info.match(new RegExp(`${escaped}:(.+?)\\r?\\n`));
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
        const lines = clusterNodesRaw.split("\n").filter(line => line.trim().length > 0);
        result.clusterNodes = lines.map(line => {
          const parts = line.split(" ");
          const addressPart = parts[1] ?? "";
          const [addrWithPort, hostname] = addressPart.split(",");
          const address = addrWithPort?.split("@")[0] ?? "";
          const [ip, portStr] = address.split(":");
          const host = hostname || ip;
          const flags = parts[2] ?? "";
          const flagList = flags.split(",");
          // Skip nodes with non-standard flags (e.g., fail, handshake, noaddr)
          const isMaster = flagList.includes("master") || flagList.includes("myself,master");
          const isSlave = flagList.includes("slave") || flagList.includes("myself,slave");
          if (!isMaster && !isSlave) return null;
          const nodeRole = isMaster ? "master" : "slave";
          const port = Number(portStr);
          if (!Number.isFinite(port) || port <= 0) return null;
          const slots = nodeRole === "master" ? parts.slice(8).join(" ") : undefined;
          return { host, port, role: nodeRole, slots };
        }).filter(Boolean);
      } catch (err) {
        console.error("Failed to get cluster details:", err);
      }
    } else if (role === "master" && connectedSlaves > 0) {
      result.sentinelRole = "master";
      result.sentinelReplicas = connectedSlaves;
    } else if (role === "slave") {
      result.sentinelRole = "slave";
      result.sentinelMasterHost = parseInfoField(replicationInfo, "master_host");
      const parsedPort = Number(parseInfoField(replicationInfo, "master_port") ?? "0");
      result.sentinelMasterPort = Number.isFinite(parsedPort) ? parsedPort : 0;
    }

    return NextResponse.json({ result }, { status: 200, headers: getCorsHeaders(request) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}
