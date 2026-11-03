import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { requestAiCompletion } from "./completion.ts";
import { buildOptimizeMessages, parseOptimizeResponse } from "../../../lib/aiOptimize.ts";
import { buildFixMessages, parseFixResponse } from "../../../lib/aiFix.ts";

const originalQuery = "UNWIND $rows AS row MATCH (a:Attribute {entityId: row.entityId}) WHERE a.refType <> '' MATCH (t:Entity {uniqueId: a.value}) MERGE (a)-[:REFERENCES]->(t) RETURN count(a) AS linked";
const optimizedQuery = "UNWIND $rows AS row MATCH (a:Attribute {entityId: row.entityId}) WHERE a.refType <> '' WITH a MATCH (t:Entity {uniqueId: a.value}) MERGE (a)-[:REFERENCES]->(t) RETURN count(a) AS linked";
const input = {
  target: { source: "api-key", provider: "openai" } as const,
  authHeader: { Authorization: "Bearer test-placeholder" },
  model: "openai::gpt-5-pro",
  messages: buildOptimizeMessages({ query: originalQuery, plan: ["Results", "Merge"], indexes: { entries: [] } }),
  signal: new AbortController().signal,
};

function responsesBody(text: string) {
  return {
    status: "completed",
    output: [
      { type: "reasoning", summary: [] },
      { type: "message", role: "assistant", content: [{ type: "output_text", text }] },
    ],
  };
}

describe("shared AI completion transport", () => {
  it("routes GPT-5 Pro optimization through Responses with a compatible payload", async (t) => {
    const reply = JSON.stringify({ explanation: "Review index coverage.", suggestions: [], optimizedQuery });
    t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      assert.equal(url, "https://api.openai.com/v1/responses");
      assert.equal(body.model, "gpt-5-pro");
      assert.equal(body.temperature, undefined);
      assert.equal(body.messages, undefined);
      assert.equal(body.store, false);
      assert.deepEqual(body.input, input.messages);
      return Response.json(responsesBody(reply));
    });
    const result = await requestAiCompletion(input);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(parseOptimizeResponse(result.reply, originalQuery)?.optimizedQuery, optimizedQuery);
  });

  it("uses the same compatible transport for Fix with AI", async (t) => {
    const messages = buildFixMessages({ query: "RETRUN 1", errorMessage: "Syntax error" });
    t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      assert.deepEqual(JSON.parse(String(init.body)).input, messages);
      return Response.json(responsesBody('{"explanation":"Typo","correctedQuery":"RETURN 1"}'));
    });
    const result = await requestAiCompletion({ ...input, messages });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(parseFixResponse(result.reply, "RETRUN 1").correctedQuery, "RETURN 1");
  });

  for (const model of ["gpt-5", "openai:gpt-5-mini", "openai::gpt-5-pro-2025-10-06", "gpt-5.1", "o1", "o3-pro", "o4-mini"]) {
    it(`omits unsupported sampling options for ${model} and allows reasoning time`, async (t) => {
      const timeout = t.mock.method(AbortSignal, "timeout", () => new AbortController().signal);
      t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
        assert.equal(url, "https://api.openai.com/v1/responses");
        assert.equal("temperature" in JSON.parse(String(init.body)), false);
        return Response.json(responsesBody("reply"));
      });
      assert.deepEqual(await requestAiCompletion({ ...input, model }), { ok: true, reply: "reply" });
      assert.equal(timeout.mock.calls[0].arguments[0], 300_000);
    });
  }

  for (const config of [
    { target: input.target, model: "gpt-4o-mini", url: "https://api.openai.com/v1/chat/completions" },
    { target: { source: "api-key", provider: "groq" } as const, model: "groq::llama-3.3-70b", url: "https://api.groq.com/openai/v1/chat/completions" },
    { target: { source: "api-key", provider: "xai" } as const, model: "xai::grok-3", url: "https://api.x.ai/v1/chat/completions" },
    { target: { source: "local", localProvider: "ollama", localEndpoint: "http://localhost:11434" } as const, model: "ollama::gpt-5-custom", url: "http://localhost:11434/v1/chat/completions" },
    { target: { source: "local", localProvider: "lmstudio", localEndpoint: "http://localhost:1234/v1" } as const, model: "local-model", url: "http://localhost:1234/v1/chat/completions" },
  ]) {
    it(`preserves Chat Completions for ${config.model}`, async (t) => {
      t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
        assert.equal(url, config.url);
        const body = JSON.parse(String(init.body));
        assert.equal(body.temperature, 0);
        assert.deepEqual(body.messages, input.messages);
        assert.equal(body.input, undefined);
        return Response.json({ choices: [{ message: { content: "reply" } }] });
      });
      assert.deepEqual(await requestAiCompletion({ ...input, ...config }), { ok: true, reply: "reply" });
    });
  }

  for (const example of [
    { status: 401, error: {}, expected: /API key/ },
    { status: 429, error: { code: "insufficient_quota" }, expected: /quota.*billing/ },
    { status: 429, error: {}, expected: /rate limit/ },
    { status: 404, error: { code: "model_not_found" }, expected: /model is unavailable/ },
    { status: 403, error: {}, expected: /permission/ },
    { status: 400, error: { code: "context_length_exceeded" }, expected: /input limit/ },
    { status: 400, error: { param: "temperature" }, expected: /temperature/ },
    { status: 503, error: {}, expected: /temporarily unavailable/ },
    { status: 400, error: {}, expected: /HTTP 400/ },
  ]) {
    it(`reports actionable ${example.status} provider errors without leaking response content`, async (t) => {
      t.mock.method(console, "warn", () => {});
      t.mock.method(globalThis, "fetch", async () => Response.json({
        error: { ...example.error, message: "private query and key" },
      }, { status: example.status }));
      const result = await requestAiCompletion(input);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.match(result.error, example.expected);
        assert.doesNotMatch(result.error, /private query and key/);
        assert.equal(result.status, example.status === 401 ? 401 : 422);
      }
    });
  }

  for (const body of [
    { status: "incomplete", output: [] },
    { status: "failed", error: { message: "private" } },
    { status: "completed", output: [{ type: "reasoning", summary: [] }] },
  ]) {
    it(`rejects ${body.status} responses without assistant output`, async (t) => {
      t.mock.method(globalThis, "fetch", async () => Response.json(body));
      assert.equal((await requestAiCompletion(input)).ok, false);
    });
  }

  it("caps streamed provider bodies, including unsuccessful responses", async (t) => {
    let cancelled = false;
    t.mock.method(globalThis, "fetch", async () => new Response(new ReadableStream({
      start(controller) { controller.enqueue(new Uint8Array(256 * 1024 + 1)); },
      cancel() { cancelled = true; },
    }), { status: 400 }));
    const result = await requestAiCompletion(input);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /too large/);
    assert.equal(cancelled, true);
  });

  it("rejects malformed success bodies and handles non-JSON provider failures", async (t) => {
    t.mock.method(console, "warn", () => {});
    const mock = t.mock.method(globalThis, "fetch", async () => new Response("not JSON"));
    let result = await requestAiCompletion(input);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /invalid JSON/);
    mock.mock.mockImplementation(async () => new Response("private proxy response", { status: 502 }));
    result = await requestAiCompletion(input);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /temporarily unavailable/);
  });

  it("propagates cancellation so dismissed requests do not continue", async (t) => {
    const controller = new AbortController();
    controller.abort();
    t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
      init.signal?.throwIfAborted();
      throw new Error("Expected an aborted signal");
    });
    await assert.rejects(requestAiCompletion({ ...input, signal: controller.signal }), { name: "AbortError" });
  });
});
