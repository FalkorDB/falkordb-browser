import { getClient } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/app/api/utils";
import { restoreGraphFromUrl, validateBody } from "@/app/api/validate-body";
import https from "https";
import { lookup as dnsLookup } from "dns";
import type { LookupAddress, LookupOptions } from "dns";
import net from "net";
import type { LookupFunction } from "net";

const DEFAULT_MAX_DUMP_BYTES = 512 * 1024 * 1024;

// A non-numeric FALKOR_RESTORE_MAX_BYTES would make every `size > NaN` check
// false and silently disable the cap, so fall back to the default in that case.
const parsedMaxBytes = Number(process.env.FALKOR_RESTORE_MAX_BYTES);
const MAX_DUMP_BYTES =
  Number.isFinite(parsedMaxBytes) && parsedMaxBytes > 0
    ? parsedMaxBytes
    : DEFAULT_MAX_DUMP_BYTES;

// Headroom for the multipart envelope (boundary lines + part headers) on top of
// the dump cap, so a within-limit file isn't rejected by envelope overhead.
const MULTIPART_ENVELOPE_ALLOWANCE = 8 * 1024;

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

// Reads a request/response body stream, aborting as soon as the accumulated
// size exceeds `limit` so an oversized upload can't be buffered in full.
async function readBoundedBody(
  body: ReadableStream<Uint8Array>,
  limit: number
): Promise<Buffer> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > limit) {
        try {
          await reader.cancel();
        } catch {
          // ignore cancellation failures; the size error below is the meaningful one
        }
        throw new Error(`Dump exceeds maximum size of ${MAX_DUMP_BYTES} bytes`);
      }
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks);
}

async function readUploadedDump(request: NextRequest): Promise<Buffer> {
  // Bound the multipart body while streaming so a huge upload isn't buffered in
  // full before the size check. formData() then parses the (now bounded) bytes.
  const raw = request.body
    ? await readBoundedBody(request.body, MAX_DUMP_BYTES + MULTIPART_ENVELOPE_ALLOWANCE)
    : Buffer.from(await request.arrayBuffer());

  const form = await new Response(raw as unknown as BodyInit, {
    headers: { "content-type": request.headers.get("content-type") ?? "" },
  }).formData();
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

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc * 256 + Number(oct)), 0);
}

function isPrivateIPv4(ip: string): boolean {
  const value = ipv4ToInt(ip);
  const inRange = (base: string, bits: number) => {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (value & mask) === (ipv4ToInt(base) & mask);
  };
  return (
    inRange("0.0.0.0", 8) || // "this" network / unspecified
    inRange("10.0.0.0", 8) || // private
    inRange("100.64.0.0", 10) || // carrier-grade NAT
    inRange("127.0.0.0", 8) || // loopback
    inRange("169.254.0.0", 16) || // link-local (incl. cloud metadata 169.254.169.254)
    inRange("172.16.0.0", 12) || // private
    inRange("192.168.0.0", 16) || // private
    inRange("224.0.0.0", 4) || // multicast
    inRange("240.0.0.0", 4) // reserved
  );
}

function mappedIPv4(lower: string): string | null {
  // Returns the embedded IPv4 of an IPv4-mapped IPv6 address (`::ffff:*`),
  // handling both the dotted (`::ffff:127.0.0.1`) and hex (`::ffff:7f00:1`)
  // forms that URL parsing can produce. Returns "" when the mapped form can't
  // be decoded so the caller can fail closed.
  if (!lower.startsWith("::ffff:")) return null;
  const tail = lower.slice("::ffff:".length);
  if (/^\d+\.\d+\.\d+\.\d+$/.test(tail)) return tail;
  const groups = tail.split(":");
  if (
    groups.length === 2 &&
    /^[0-9a-f]{1,4}$/.test(groups[0]) &&
    /^[0-9a-f]{1,4}$/.test(groups[1])
  ) {
    const hi = parseInt(groups[0], 16);
    const lo = parseInt(groups[1], 16);
    return `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
  }
  return "";
}

function isPrivateIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("::ffff:")) {
      const mapped = mappedIPv4(lower);
      // Undecodable mapped form -> block (fail closed).
      return mapped === "" ? true : isPrivateIPv4(mapped as string);
    }
    if (/^fe[89ab]/.test(lower)) return true; // fe80::/10 link-local
    if (/^f[cd]/.test(lower)) return true; // fc00::/7 unique-local
  }
  return false;
}

// Best-effort SSRF guard used at *connect* time: Node calls this custom lookup
// to resolve the host, and we validate the very addresses the socket will use.
// Pinning the guard here (rather than a separate pre-fetch lookup) closes the
// DNS-rebinding/TOCTOU gap where a second resolution could return a private IP.
// Presigned S3/GCS URLs resolve to public IPs, so legitimate use is unaffected.
const validatingLookup: LookupFunction = (host, options, callback) => {
  dnsLookup(host, { ...(options as LookupOptions), all: true }, (err, addresses) => {
    if (err) {
      callback(err, "", 0);
      return;
    }

    const list = addresses as LookupAddress[];
    if (!list || list.length === 0) {
      callback(
        new Error(`Could not resolve host for remote dump: ${host}`) as NodeJS.ErrnoException,
        "",
        0
      );
      return;
    }

    if (list.some(({ address }) => isPrivateIp(address))) {
      callback(
        new Error(
          "Refusing to fetch dump from a private or reserved network address"
        ) as NodeJS.ErrnoException,
        "",
        0
      );
      return;
    }

    if ((options as LookupOptions).all) {
      callback(null, list as unknown as string, 0);
    } else {
      callback(null, list[0].address, list[0].family);
    }
  });
};

function fetchRemoteDump(source: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    // Node does not invoke the custom `lookup` for literal IP hosts, so guard
    // those statically here. Hostnames are validated at connect time by
    // `validatingLookup` (which closes the DNS-rebinding/TOCTOU gap).
    const host = new URL(source).hostname.replace(/^\[|\]$/g, "");
    if (net.isIP(host) && isPrivateIp(host)) {
      settle(() =>
        reject(new Error("Refusing to fetch dump from a private or reserved network address"))
      );
      return;
    }

    // Node's https module does not follow redirects, so a 3xx is surfaced here
    // and rejected — this also blocks redirect-based SSRF bypasses.
    const req = https.get(
      source,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), lookup: validatingLookup },
      (res) => {
        const status = res.statusCode ?? 0;

        if (status >= 300 && status < 400) {
          res.resume();
          settle(() => reject(new Error("Refusing to follow redirect while fetching remote dump")));
          return;
        }

        if (status < 200 || status >= 300) {
          res.resume();
          settle(() =>
            reject(new Error(`Failed to fetch dump (${status} ${res.statusMessage ?? ""})`.trim()))
          );
          return;
        }

        const header = res.headers["content-length"];
        if (header !== undefined && Number(header) > MAX_DUMP_BYTES) {
          res.destroy();
          settle(() => reject(new Error(`Remote dump exceeds maximum size of ${MAX_DUMP_BYTES} bytes`)));
          return;
        }

        const chunks: Buffer[] = [];
        let received = 0;

        res.on("data", (chunk: Buffer) => {
          received += chunk.length;
          // Stream-bounded read: abort as soon as the accumulated size exceeds
          // the cap so a chunked response without a content-length can't
          // exhaust memory.
          if (received > MAX_DUMP_BYTES) {
            res.destroy();
            settle(() =>
              reject(new Error(`Remote dump exceeds maximum size of ${MAX_DUMP_BYTES} bytes`))
            );
            return;
          }
          chunks.push(chunk);
        });

        res.on("end", () => settle(() => resolve(Buffer.concat(chunks))));
        res.on("error", (err) => settle(() => reject(err)));
      }
    );

    req.on("error", (err) => settle(() => reject(err)));
  });
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
      const isMultipart = contentType.startsWith("multipart/form-data");

      // For the JSON/URL path the content-length maps directly to the body
      // request.json() buffers, so reject oversized bodies up front. Multipart
      // uploads are bounded while streaming in readUploadedDump instead — their
      // content-length includes envelope overhead and can't be compared to the
      // dump cap directly.
      if (!isMultipart) {
        const contentLength = request.headers.get("content-length");
        if (contentLength !== null && Number(contentLength) > MAX_DUMP_BYTES) {
          return NextResponse.json(
            { message: `Request body exceeds maximum size of ${MAX_DUMP_BYTES} bytes` },
            { status: 400, headers: getCorsHeaders(request) }
          );
        }
      }

      let dump: Buffer;
      let shouldReplace = replace;

      if (isMultipart) {
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
      // (see FalkorDB/FalkorDB#482). Run a read-only no-op query to wake it up — this
      // also validates that the restored payload is actually a usable FalkorDB graph
      // rather than some other Redis type.
      try {
        await client.selectGraph(graphId).roQuery("RETURN 1");
      } catch (wakeErr) {
        const wakeMessage = (wakeErr as Error)?.message ?? "";

        // A WRONGTYPE error means RESTORE wrote a non-graph value (string/list/etc.)
        // under this key — the payload is not a FalkorDB graph. Fail closed and
        // always remove the bogus key: whether or not REPLACE was set, leaving a
        // non-graph value under the graph key would break later graph operations.
        if (/WRONGTYPE/i.test(wakeMessage)) {
          try {
            await connection.del(graphId);
          } catch (cleanupErr) {
            console.warn(`Failed to clean up invalid restored key ${graphId}:`, cleanupErr);
          }

          return NextResponse.json(
            { message: "Restored data is not a valid FalkorDB graph" },
            { status: 400, headers: getCorsHeaders(request) }
          );
        }

        // Any other failure (transient connection/timeout/module error) is NOT proof
        // the restore is invalid, so we must not delete the key. Report that the
        // restore could not be verified and let the caller retry/refresh.
        console.warn(`Graph ${graphId} restored but wake-up verification failed:`, wakeErr);
        return NextResponse.json(
          { message: "Graph restored but could not be verified; please refresh" },
          { status: 503, headers: getCorsHeaders(request) }
        );
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
