import { NextRequest, NextResponse } from "next/server";
import { buildOptimizeMessages, parseOptimizeResponse } from "@/lib/aiOptimize";
import { resolveFixTarget } from "@/lib/aiFix";
import { getClient } from "../../auth/[...nextauth]/options";
import { optimizeRequest, validateBody } from "../../validate-body";
import { getCorsHeaders, corsPreflight } from "../../utils";
import { MAX_CHAT_BODY_BYTES, OVER_LIMIT, readChatBodyWithLimit } from "../requestBody";
import { getOptimizationContext } from "./context";
import { requestAiCompletion } from "../completion";

export const OPTIONS = corsPreflight;

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await getClient(request);
  } catch {
    console.error("Cypher optimizer auth error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: getCorsHeaders(request) });
  }

  if (session instanceof NextResponse) return session;

  const contentLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(contentLength) && contentLength > MAX_CHAT_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413, headers: getCorsHeaders(request) });
  }

  const raw = await readChatBodyWithLimit(request);
  if (raw === OVER_LIMIT) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413, headers: getCorsHeaders(request) });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: getCorsHeaders(request) });
  }

  const validation = validateBody(optimizeRequest, body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400, headers: getCorsHeaders(request) });
  }

  const { query, guidance, graphName, key, model, modelSource, localProvider, localEndpoint } = validation.data;
  const resolved = resolveFixTarget({ modelSource, model, key, localProvider, localEndpoint });
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400, headers: getCorsHeaders(request) });
  }

  let plan: readonly string[];
  let indexes: { available: boolean; entries: unknown[]; truncated: boolean; warning?: string };
  try {
    const graph = session.client.selectGraph(graphName);
    ({ plan, indexes } = await getOptimizationContext(graph, query));
  } catch (error) {
    console.error("Cypher optimizer plan lookup failed");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read the query plan." },
      { status: 400, headers: getCorsHeaders(request) },
    );
  }

  try {
    const completion = await requestAiCompletion({
      target: resolved.target,
      authHeader: resolved.authHeader,
      model,
      messages: buildOptimizeMessages({ query, plan, indexes, guidance }),
      signal: request.signal,
    });
    if (!completion.ok) {
      return NextResponse.json({ error: completion.error }, { status: completion.status, headers: getCorsHeaders(request) });
    }

    const result = parseOptimizeResponse(completion.reply, query);
    if (!result) {
      return NextResponse.json({ error: "The AI provider returned an invalid optimization response. Please try again." }, { status: 422, headers: getCorsHeaders(request) });
    }

    return NextResponse.json({
      ...result,
      executionPlan: plan,
      ...(indexes.available ? {} : { indexWarning: "Index metadata was unavailable; recommendations may be incomplete." }),
    }, { headers: getCorsHeaders(request) });
  } catch (error) {
    const name = (error as Error)?.name;
    const message = name === "TimeoutError"
      ? "The AI request timed out. Please try again."
      : name === "AbortError"
        ? "The AI request was canceled."
        : "Unable to reach the AI provider. Please try again.";
    console.error("Cypher optimizer provider error:", name);
    return NextResponse.json({ error: message }, { status: 422, headers: getCorsHeaders(request) });
  }
}
