import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildFixMessages,
  parseFixResponse,
  isAiFixSupported,
  getProviderModelName,
  getChatCompletionsUrl,
  resolveFixTarget,
} from "./aiFix.ts";

describe("buildFixMessages", () => {
  it("builds system + user messages with the query and error", () => {
    const msgs = buildFixMessages({ query: "MATCH (n) RETsURN n", errorMessage: "syntax error" });
    assert.equal(msgs.length, 2);
    assert.equal(msgs[0].role, "system");
    assert.ok(msgs[0].content.includes("strict JSON"));
    assert.ok(msgs[1].content.includes("MATCH (n) RETsURN n"));
    assert.ok(msgs[1].content.includes("syntax error"));
    assert.ok(!msgs[1].content.includes("Hint:"));
    assert.ok(!msgs[1].content.includes("Graph schema:"));
  });
  it("includes the hint and schema when provided", () => {
    const msgs = buildFixMessages({ query: "q", errorMessage: "e", hint: "did you mean length()?", schema: "(:Person)" });
    assert.ok(msgs[1].content.includes("Hint:\ndid you mean length()?"));
    assert.ok(msgs[1].content.includes("Graph schema:\n(:Person)"));
  });
});

describe("parseFixResponse", () => {
  it("parses strict JSON with a valid corrected query", () => {
    const r = parseFixResponse('{"explanation":"Typo in RETURN.","correctedQuery":"MATCH (n) RETURN n"}', "MATCH (n) RETsURN n");
    assert.equal(r.explanation, "Typo in RETURN.");
    assert.equal(r.correctedQuery, "MATCH (n) RETURN n");
  });
  it("parses JSON wrapped in a ```json fence", () => {
    const r = parseFixResponse('```json\n{"explanation":"x","correctedQuery":"RETURN 1"}\n```', "RETURN 2");
    assert.equal(r.correctedQuery, "RETURN 1");
  });
  it("drops a corrected query identical to the original", () => {
    const r = parseFixResponse('{"explanation":"x","correctedQuery":"MATCH (n) RETURN n"}', "MATCH (n) RETURN n");
    assert.equal(r.correctedQuery, undefined);
    assert.equal(r.explanation, "x");
  });
  it("drops a corrected query with no Cypher keyword", () => {
    assert.equal(parseFixResponse('{"explanation":"x","correctedQuery":"hello world"}', "q").correctedQuery, undefined);
  });
  it("drops an empty corrected query", () => {
    assert.equal(parseFixResponse('{"explanation":"x","correctedQuery":"   "}', "q").correctedQuery, undefined);
  });
  it("handles JSON with explanation only (no correctedQuery)", () => {
    const r = parseFixResponse('{"explanation":"Cannot fix automatically."}', "q");
    assert.deepEqual(r, { explanation: "Cannot fix automatically." });
  });
  it("falls back to prose + a ```cypher fence when not JSON", () => {
    const r = parseFixResponse("The variable is undefined.\n```cypher\nMATCH (n) RETURN n\n```", "RETURN x");
    assert.ok(r.explanation.includes("The variable is undefined."));
    assert.equal(r.correctedQuery, "MATCH (n) RETURN n");
  });
  it("returns explanation-only prose when there is no JSON and no code fence", () => {
    const r = parseFixResponse("Just an explanation, no query.", "q");
    assert.deepEqual(r, { explanation: "Just an explanation, no query." });
  });
  it("falls back when JSON's explanation is not a string", () => {
    const r = parseFixResponse('{"explanation":123}', "q");
    assert.equal(r.explanation, '{"explanation":123}');
  });
  it("ignores a non-object JSON array", () => {
    const r = parseFixResponse('[1,2,3]', "q");
    assert.equal(r.explanation, "[1,2,3]");
  });
});

describe("isAiFixSupported", () => {
  it("is false without a model", () => {
    assert.equal(isAiFixSupported({ source: "api-key", key: "sk-x", model: "" }), false);
  });
  it("is true for a local ollama/lmstudio provider with a model", () => {
    assert.equal(isAiFixSupported({ source: "local", localProvider: "ollama", model: "llama3" }), true);
    assert.equal(isAiFixSupported({ source: "local", localProvider: "lmstudio", model: "x" }), true);
    assert.equal(isAiFixSupported({ source: "local", localProvider: "other", model: "x" }), false);
  });
  it("requires an api-key for hosted providers", () => {
    assert.equal(isAiFixSupported({ source: "api-key", model: "gpt-4o-mini" }), false);
  });
  it("is true for OpenAI-compatible hosted providers, false otherwise", () => {
    assert.equal(isAiFixSupported({ source: "api-key", key: "k", model: "gpt-4o-mini" }), true);
    assert.equal(isAiFixSupported({ source: "api-key", key: "k", model: "groq::llama-3.1-8b" }), true);
    assert.equal(isAiFixSupported({ source: "api-key", key: "k", model: "xai::grok-2" }), true);
    assert.equal(isAiFixSupported({ source: "api-key", key: "k", model: "anthropic::claude-3" }), false);
  });
});

describe("getProviderModelName", () => {
  it("strips the double-colon provider prefix", () => {
    assert.equal(getProviderModelName("groq::llama-3.1-8b"), "llama-3.1-8b");
  });
  it("strips a legacy single-colon known-provider prefix", () => {
    assert.equal(getProviderModelName("openai:gpt-4o-mini"), "gpt-4o-mini");
  });
  it("leaves a single-colon non-provider value and unprefixed models unchanged", () => {
    assert.equal(getProviderModelName("foo:bar"), "foo:bar");
    assert.equal(getProviderModelName("gpt-4o-mini"), "gpt-4o-mini");
  });
});

describe("getChatCompletionsUrl", () => {
  it("returns the correct URL for hosted providers (incl. Groq's /openai/v1)", () => {
    assert.equal(getChatCompletionsUrl({ source: "api-key", provider: "openai" }), "https://api.openai.com/v1/chat/completions");
    assert.equal(getChatCompletionsUrl({ source: "api-key", provider: "groq" }), "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(getChatCompletionsUrl({ source: "api-key", provider: "xai" }), "https://api.x.ai/v1/chat/completions");
  });
  it("throws for an unsupported hosted provider", () => {
    assert.throws(() => getChatCompletionsUrl({ source: "api-key", provider: "anthropic" }), /not supported/);
  });
  it("appends /v1/chat/completions for Ollama and /chat/completions for LM Studio", () => {
    assert.equal(getChatCompletionsUrl({ source: "local", localProvider: "ollama", localEndpoint: "http://localhost:11434" }), "http://localhost:11434/v1/chat/completions");
    assert.equal(getChatCompletionsUrl({ source: "local", localProvider: "lmstudio", localEndpoint: "http://localhost:1234/v1" }), "http://localhost:1234/v1/chat/completions");
  });
});

describe("resolveFixTarget", () => {
  it("resolves a supported hosted provider with an auth header", () => {
    const r = resolveFixTarget({ modelSource: "api-key", model: "gpt-4o-mini", key: "sk-x", localProvider: "ollama" });
    assert.ok(r.ok);
    assert.deepEqual(r.target, { source: "api-key", provider: "openai" });
    assert.equal(r.authHeader.Authorization, "Bearer sk-x");
  });
  it("rejects a missing api key and an unsupported hosted provider", () => {
    const noKey = resolveFixTarget({ modelSource: "api-key", model: "gpt-4o-mini", localProvider: "ollama" });
    assert.equal(noKey.ok, false);
    const unsupported = resolveFixTarget({ modelSource: "api-key", model: "anthropic::claude-3", key: "k", localProvider: "ollama" });
    assert.equal(unsupported.ok, false);
    if (!unsupported.ok) assert.ok(unsupported.error.includes("isn't supported"));
  });
  it("resolves a valid local endpoint and rejects an invalid one", () => {
    const ok = resolveFixTarget({ modelSource: "local", model: "llama3", localProvider: "ollama", localEndpoint: "http://localhost:11434" });
    assert.ok(ok.ok);
    if (ok.ok) assert.equal(ok.target.source, "local");
    const bad = resolveFixTarget({ modelSource: "local", model: "llama3", localProvider: "ollama", localEndpoint: "http://evil.example.com" });
    assert.equal(bad.ok, false);
  });
});
