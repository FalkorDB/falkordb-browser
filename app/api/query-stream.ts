import { ErrorReply } from "@redis/client";

export class QueryInputError extends Error {}

function queryErrorStatus(error: unknown): number {
  if (error instanceof QueryInputError) return 400;
  if (error instanceof ErrorReply && !/^(?:OOM|LOADING|MASTERDOWN|CLUSTERDOWN|TRYAGAIN)\b/.test(error.message)) return 400;
  return 500;
}

export function queryStream(
  signal: AbortSignal,
  execute: () => Promise<unknown>,
  headers: HeadersInit,
): Response {
  const encoder = new TextEncoder();
  let stopped = false;
  let stop: () => void = () => {};
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      stop = () => {
        if (stopped) return;
        stopped = true;
        signal.removeEventListener("abort", stop);
        controller.close();
      };
      if (signal.aborted) {
        stop();
        return;
      }
      signal.addEventListener("abort", stop, { once: true });
      try {
        const result = await execute();
        if (!stopped) {
          controller.enqueue(encoder.encode(`event: result\ndata: ${JSON.stringify(result ?? {})}\n\n`));
        }
      } catch (error) {
        if (!stopped) {
          console.error("Graph query failed:", error);
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({
            message: error instanceof Error ? error.message : "Internal server error",
            status: queryErrorStatus(error),
          })}\n\n`));
        }
      } finally {
        stop();
      }
    },
    cancel() {
      stopped = true;
      signal.removeEventListener("abort", stop);
    },
  });
  return new Response(stream, { headers });
}

export async function queryStreamError(response: Response, headers: HeadersInit): Promise<Response> {
  let payload: { message?: string; code?: string };
  try {
    payload = await response.clone().json();
  } catch (error) {
    console.warn("Could not parse query authentication response:", error);
    payload = { message: await response.text() || "Unauthorized" };
  }
  return new Response(`event: error\ndata: ${JSON.stringify({ ...payload, status: response.status })}\n\n`, { headers });
}
