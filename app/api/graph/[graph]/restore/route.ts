import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/app/api/utils";
import { restoreGraphFromUrl, validateBody } from "@/app/api/validate-body";

const MAX_DUMP_BYTES = Number(process.env.FALKOR_RESTORE_MAX_BYTES ?? 512 * 1024 * 1024);

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

async function readUploadedDump(request: NextRequest): Promise<Buffer> {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    throw new Error("Missing 'file' field in multipart upload");
  }

  if (file.size > MAX_DUMP_BYTES) {
    throw new Error(`Dump exceeds maximum size of ${MAX_DUMP_BYTES} bytes`);
  }

  return Buffer.from(await file.arrayBuffer());
}

const parsedTimeout = Number(process.env.FALKOR_RESTORE_FETCH_TIMEOUT_MS);
const FETCH_TIMEOUT_MS = Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 30_000;

async function fetchRemoteDump(source: string): Promise<Buffer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(source, { signal: controller.signal, redirect: "error" });

    if (!res.ok) {
      throw new Error(`Failed to fetch dump (${res.status} ${res.statusText})`);
    }

    const header = res.headers.get("content-length");
    if (header !== null && Number(header) > MAX_DUMP_BYTES) {
      throw new Error(`Remote dump exceeds maximum size of ${MAX_DUMP_BYTES} bytes`);
    }

    if (!res.body) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > MAX_DUMP_BYTES) {
        throw new Error(`Remote dump exceeds maximum size of ${MAX_DUMP_BYTES} bytes`);
      }
      return buf;
    }

    // Stream-bounded read: abort as soon as the accumulated size exceeds the cap
    // so a chunked response without a content-length can't exhaust memory.
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    for (;;) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.byteLength;
        if (received > MAX_DUMP_BYTES) {
          controller.abort();
          try {
            await reader.cancel();
          } catch {
            // ignore cancellation failures; the size error below is the meaningful one
          }
          throw new Error(`Remote dump exceeds maximum size of ${MAX_DUMP_BYTES} bytes`);
        }
        chunks.push(value);
      }
    }

    return Buffer.concat(chunks);
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ graph: string }> }
) {
  try {
    const session = await getClient(request);

    if (session instanceof NextResponse) {
      return session;
    }

    const { client } = session;
    const { graph: graphId } = await params;

    if (!graphId) {
      return NextResponse.json(
        { message: "Target graph name is required" },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    try {
      const contentType = request.headers.get("content-type") ?? "";
      const url = new URL(request.url);
      const replace = url.searchParams.get("replace") === "true";

      let dump: Buffer;
      let shouldReplace = replace;

      if (contentType.startsWith("multipart/form-data")) {
        dump = await readUploadedDump(request);
      } else {
        const body = await request.json();
        const validation = validateBody(restoreGraphFromUrl, body);
        if (!validation.success) {
          return NextResponse.json(
            { message: validation.error },
            { status: 400, headers: getCorsHeaders(request) }
          );
        }
        dump = await fetchRemoteDump(validation.data.source);
        shouldReplace = shouldReplace || validation.data.replace;
      }

      const connection = await client.connection;

      // RESTORE the serialized graph key. ttl=0 means no expiry.
      // REPLACE only when the caller opted in — otherwise Redis errors if the key exists.
      await connection.restore(graphId, 0, dump, shouldReplace ? { REPLACE: true } : undefined);

      // After RESTORE, the graph data exists as a Redis key but the FalkorDB module
      // doesn't always register it in GRAPH.LIST until a graph command touches it
      // (see FalkorDB/FalkorDB#482). Run a read-only no-op query to wake it up.
      try {
        await client.selectGraph(graphId).roQuery("RETURN 1");
      } catch (wakeErr) {
        console.warn(`Graph ${graphId} restored but wake-up query failed:`, wakeErr);
      }

      return NextResponse.json(
        { result: "OK", graph: graphId },
        { headers: getCorsHeaders(request) }
      );
    } catch (error) {
      const message = (error as Error).message ?? "Restore failed";
      const status = message.includes("BUSYKEY") ? 409 : 400;
      return NextResponse.json(
        { message },
        { status, headers: getCorsHeaders(request) }
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
