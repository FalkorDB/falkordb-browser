// Pure logic for the "Fix with AI" feature (Idea #3). No React/Next/LLM imports, so it is
// unit-testable to 100% and reused by the /api/chat/fix endpoint and the UI gating.
//
// v1 supports OpenAI-compatible providers only: openai / groq / xai (hosted) and
// ollama / lmstudio (local) — all speak `POST /v1/chat/completions`.

import { detectProviderFromModel, getProviderDisplayName, KNOWN_PROVIDERS, type AIProvider } from "./ai-provider-utils.ts";
import { normalizeLocalEndpoint } from "./local-llm-utils.ts";

export type ChatMessage = { role: "system" | "user"; content: string };

const OPENAI_COMPATIBLE_HOSTED = new Set<AIProvider>(["openai", "groq", "xai"]);

const CYPHER_KEYWORD = /\b(MATCH|RETURN|CREATE|MERGE|WITH|WHERE|DELETE|SET|UNWIND|CALL|OPTIONAL|REMOVE|FOREACH)\b/i;

/** Builds the chat-completion messages. The model is instructed to reply as strict JSON so the
 *  response can be parsed reliably. Only the user's own query/error (+ optional hint/schema) are
 *  included — no other data. */
export function buildFixMessages(input: { query: string; errorMessage: string; hint?: string; schema?: string }): ChatMessage[] {
  const system =
    "You are a FalkorDB Cypher expert. The user's Cypher query failed. " +
    'Respond ONLY with a strict JSON object of the form {"explanation": string, "correctedQuery": string | null}. ' +
    '"explanation" is a short plain-English description of what went wrong and how to fix it. ' +
    '"correctedQuery" is a corrected Cypher query string, or null if you cannot produce one. ' +
    "Do not include any prose or code fences outside the JSON object.";

  const parts = [`Query:\n${input.query}`, `Error:\n${input.errorMessage}`];
  if (input.hint) parts.push(`Hint:\n${input.hint}`);
  if (input.schema) parts.push(`Graph schema:\n${input.schema}`);

  return [
    { role: "system", content: system },
    { role: "user", content: parts.join("\n\n") },
  ];
}

function tryParseJsonObject(text: string): { explanation?: unknown; correctedQuery?: unknown } | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as { explanation?: unknown; correctedQuery?: unknown })
      : null;
  } catch {
    return null;
  }
}

/** Parses a model reply into `{ explanation, correctedQuery? }`. Tries strict JSON first (whole
 *  reply, then a ```json/``` fenced block), falling back to "the prose is the explanation, the first
 *  ```cypher block is the query". A corrected query is kept only if it is non-empty, contains a
 *  Cypher keyword, and differs from the original (so junk/echoes are dropped). */
export function parseFixResponse(reply: string, originalQuery: string): { explanation: string; correctedQuery?: string } {
  const fenced = reply.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const json = tryParseJsonObject(reply.trim()) ?? (fenced ? tryParseJsonObject(fenced[1].trim()) : null);

  let explanation: string;
  let corrected: string | undefined;

  if (json && typeof json.explanation === "string") {
    explanation = json.explanation.trim();
    if (typeof json.correctedQuery === "string") corrected = json.correctedQuery.trim();
  } else {
    explanation = reply.trim();
    const cypherFence = reply.match(/```(?:cypher)?\s*([\s\S]*?)```/i);
    if (cypherFence) corrected = cypherFence[1].trim();
  }

  if (corrected !== undefined) {
    const valid = corrected.length > 0 && CYPHER_KEYWORD.test(corrected) && corrected !== originalQuery.trim();
    if (!valid) corrected = undefined;
  }

  return corrected ? { explanation, correctedQuery: corrected } : { explanation };
}

/** Whether "Fix with AI" can run with the current config: a model is selected AND either a local
 *  OpenAI-compatible provider is chosen, or an api-key is present for an OpenAI-compatible hosted
 *  provider. */
export function isAiFixSupported(cfg: { model?: string; key?: string; source?: "api-key" | "local"; localProvider?: string }): boolean {
  if (!cfg.model) return false;
  if (cfg.source === "local") return cfg.localProvider === "ollama" || cfg.localProvider === "lmstudio";
  if (!cfg.key) return false;
  return OPENAI_COMPATIBLE_HOSTED.has(detectProviderFromModel(cfg.model));
}

/** Strips the app's `provider::model` (or legacy `provider:model`) prefix so the provider API
 *  receives the raw model id. Date suffixes are preserved (unlike the display formatter). */
export function getProviderModelName(model: string): string {
  const doubleSep = model.indexOf("::");
  if (doubleSep !== -1) return model.substring(doubleSep + 2);

  const singleSep = model.indexOf(":");
  if (singleSep !== -1 && (KNOWN_PROVIDERS as readonly string[]).includes(model.substring(0, singleSep))) {
    return model.substring(singleSep + 1);
  }

  return model;
}

export type ChatCompletionsTarget =
  | { source: "api-key"; provider: AIProvider }
  | { source: "local"; localProvider: "ollama" | "lmstudio"; localEndpoint: string };

/** Resolves the provider target + auth header for a fix request, or an error string when the
 *  request can't be served (unsupported provider, missing key, or an invalid local endpoint).
 *  Pure (no I/O) so the endpoint's gating is fully unit-tested. */
export function resolveFixTarget(input: {
  modelSource: "api-key" | "local";
  model: string;
  key?: string;
  localProvider: "ollama" | "lmstudio";
  localEndpoint?: string;
}): { ok: true; target: ChatCompletionsTarget; authHeader: Record<string, string> } | { ok: false; error: string } {
  if (input.modelSource === "local") {
    try {
      const localEndpoint = normalizeLocalEndpoint(input.localProvider, input.localEndpoint);
      return { ok: true, target: { source: "local", localProvider: input.localProvider, localEndpoint }, authHeader: {} };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }

  if (!input.key) {
    return { ok: false, error: "An API key is required for hosted models." };
  }

  const provider = detectProviderFromModel(input.model);
  if (provider !== "openai" && provider !== "groq" && provider !== "xai") {
    return {
      ok: false,
      error: `Fix with AI isn't supported for ${getProviderDisplayName(provider)} yet. Use an OpenAI, Groq, xAI, Ollama, or LM Studio model.`,
    };
  }

  return { ok: true, target: { source: "api-key", provider }, authHeader: { Authorization: `Bearer ${input.key}` } };
}

/** The exact `/chat/completions` URL per provider. Note the provider-specific shapes: Groq nests
 *  under `/openai/v1`, and the LM Studio endpoint already ends in `/v1` (so we must not append a
 *  second `/v1`). `localEndpoint` is expected to be the normalized base (see normalizeLocalEndpoint). */
export function getChatCompletionsUrl(target: ChatCompletionsTarget): string {
  if (target.source === "local") {
    return target.localProvider === "lmstudio"
      ? `${target.localEndpoint}/chat/completions`
      : `${target.localEndpoint}/v1/chat/completions`;
  }

  switch (target.provider) {
    case "openai":
      return "https://api.openai.com/v1/chat/completions";
    case "groq":
      return "https://api.groq.com/openai/v1/chat/completions";
    case "xai":
      return "https://api.x.ai/v1/chat/completions";
    default:
      throw new Error(`Fix with AI is not supported for provider '${target.provider}'.`);
  }
}
