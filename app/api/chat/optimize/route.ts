import { NextRequest, NextResponse } from "next/server";
import { buildOptimizeMessages, parseOptimizeResponse } from "@/lib/aiOptimize";
import { getProviderModelName, getChatCompletionsUrl, resolveFixTarget } from "@/lib/aiFix";
import { getClient } from "../../auth/[...nextauth]/options";
import { optimizeRequest, validateBody } from "../../validate-body";
import { getCorsHeaders, corsPreflight } from "../../utils";
import { MAX_CHAT_BODY_BYTES, OVER_LIMIT, readChatBodyWithLimit } from "../requestBody";

export const OPTIONS = corsPreflight;

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_INDEX_ROWS = 256;

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

  const { query, graphName, key, model, modelSource, localProvider, localEndpoint } = validation.data;
  const resolved = resolveFixTarget({ modelSource, model, key, localProvider, localEndpoint });
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400, headers: getCorsHeaders(request) });
  }

  let plan: readonly string[];
  let indexes: unknown;
  try {
    const graph = session.client.selectGraph(graphName);
    const [explainResult, indexResult] = await Promise.all([
      graph.explain(query),
      graph.roQuery("CALL db.indexes() YIELD label, types, entitytype RETURN label, types, entitytype"),
    ]);
    plan = explainResult.steps;
    const rows = Array.isArray(indexResult.data) ? indexResult.data : [];
    indexes = {
      entries: rows.slice(0, MAX_INDEX_ROWS),
      truncated: rows.length > MAX_INDEX_ROWS,
    };
  } catch (error) {
    console.error("Cypher optimizer plan/index lookup failed");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read the query plan and graph indexes." },
      { status: 400, headers: getCorsHeaders(request) },
    );
  }

  try {
    const response = await fetch(getChatCompletionsUrl(resolved.target), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...resolved.authHeader },
      body: JSON.stringify({
        model: getProviderModelName(model),
        messages: buildOptimizeMessages({
          query,
          plan,
          indexes,
        }),
        temperature: 0,
      }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
    });

    if (!response.ok) {
      const error = response.status === 401
        ? "The AI provider rejected your API key. Check it in Settings."
        : "The AI provider couldn't process the optimization request. Please try again.";
      return NextResponse.json({ error }, { status: response.status === 401 ? 401 : 422, headers: getCorsHeaders(request) });
    }

    const data = await response.json();
    const reply: unknown = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json({ error: "The AI provider returned an empty response." }, { status: 422, headers: getCorsHeaders(request) });
    }

    const result = parseOptimizeResponse(reply, query);
    if (!result) {
      return NextResponse.json({ error: "The AI provider returned an invalid optimization response. Please try again." }, { status: 422, headers: getCorsHeaders(request) });
    }

    return NextResponse.json({ ...result, executionPlan: plan }, { headers: getCorsHeaders(request) });
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
