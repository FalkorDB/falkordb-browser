import { getChatCompletionsUrl, getProviderModelName, type ChatCompletionsTarget, type ChatMessage } from "../../../lib/aiFix.ts";
import { OVER_LIMIT, readChatBodyWithLimit } from "./requestBody.ts";

type CompletionResult =
  | { ok: true; reply: string }
  | { ok: false; error: string; status: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function providerError(status: number, data: unknown): string {
  const error = isRecord(data) && isRecord(data.error) ? data.error : {};
  if (status === 401) return "The AI provider rejected your API key. Check it in Settings.";
  if (error.code === "insufficient_quota") return "Your AI provider quota is exhausted. Check your provider's billing and usage limits.";
  if (status === 429) return "The AI provider rate limit was reached. Please wait and try again.";
  if (error.code === "model_not_found" || status === 404) return "The selected AI model is unavailable or your account does not have access. Choose an available model in Settings.";
  if (status === 403) return "Your AI provider account does not have permission to use this model. Check model access or select another model in Settings.";
  if (error.code === "context_length_exceeded") return "The query context exceeds this model's input limit. Try a model with a larger context window.";
  if (error.param === "temperature") return "The selected AI model does not support this request's temperature setting. Choose another model in Settings.";
  if (status >= 500) return "The AI provider is temporarily unavailable. Please try again later.";
  return `The AI provider rejected the request (HTTP ${status}). Check the selected model and your provider account.`;
}

export async function requestAiCompletion(input: {
  target: ChatCompletionsTarget;
  authHeader: Record<string, string>;
  model: string;
  messages: ChatMessage[];
  signal: AbortSignal;
}): Promise<CompletionResult> {
  const model = getProviderModelName(input.model);
  const responses = input.target.source === "api-key"
    && input.target.provider === "openai"
    && /^(?:gpt-5(?:[.-]|$)|o[134](?:-|$))/.test(model);
  const url = responses ? "https://api.openai.com/v1/responses" : getChatCompletionsUrl(input.target);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...input.authHeader },
    body: JSON.stringify(responses
      ? { model, input: input.messages, store: false }
      : { model, messages: input.messages, temperature: 0 }),
    signal: AbortSignal.any([input.signal, AbortSignal.timeout(responses ? 240_000 : 30_000)]),
  });
  const raw = await readChatBodyWithLimit(response, 256 * 1024);
  if (raw === OVER_LIMIT) {
    if (!response.ok) {
      console.warn("AI completion provider rejected request:", response.status);
      return { ok: false, error: providerError(response.status, undefined), status: response.status === 401 ? 401 : 422 };
    }
    return { ok: false, error: "The AI provider response was too large. Please try again.", status: 422 };
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    if (response.ok) return { ok: false, error: "The AI provider returned invalid JSON. Please try again.", status: 422 };
  }
  if (!response.ok) {
    // Never log provider bodies: they may echo API keys, queries, or graph metadata.
    console.warn("AI completion provider rejected request:", response.status);
    return { ok: false, error: providerError(response.status, data), status: response.status === 401 ? 401 : 422 };
  }
  if (responses && isRecord(data) && (data.status === "incomplete" || data.status === "failed")) {
    return { ok: false, error: "The AI provider could not complete its response. Please try again or choose another model.", status: 422 };
  }
  let reply = "";
  if (isRecord(data)) {
    if (responses && Array.isArray(data.output)) {
      reply = data.output
        .filter(isRecord)
        .filter(item => item.type === "message" && item.role === "assistant")
        .flatMap(item => Array.isArray(item.content) ? item.content : [])
        .filter(isRecord)
        .filter(content => content.type === "output_text" && typeof content.text === "string")
        .map(content => content.text)
        .join("");
    } else if (!responses && Array.isArray(data.choices)) {
      const choice: unknown = data.choices[0];
      if (isRecord(choice) && isRecord(choice.message) && typeof choice.message.content === "string") {
        reply = choice.message.content;
      }
    }
  }
  return reply.trim()
    ? { ok: true, reply }
    : { ok: false, error: "The AI provider returned an empty response.", status: 422 };
}
