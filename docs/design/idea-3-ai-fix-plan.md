# Implementation Plan — Idea #3: "Fix with AI" (Option B-lite)

> **Status: shipped.** Fix with AI shipped with Option B-lite; the shared provider transport,
> hosted-OpenAI Responses routing and request cancellation/ownership described below shipped
> with "Optimize" query assistance. This document describes the code as it is now; the open
> decisions in §8 are resolved.

Goal: for errors the static catalog can't cover, let the user **explicitly** click a button
on a failed query to get an **AI explanation + a corrected query** for that specific query +
error. Result is shown for review and inserted into the editor on demand — **never auto-run**.

---

## 0. Key constraint (drives the design)

The chat feature's LLM integration is **`@falkordb/text-to-cypher`**, which exposes only
question→Cypher methods (`textToCypher`, `cypherOnly`, `discoverSchema`, `listModels…`) — **no
generic "explain"/chat-completion**. So "explain this error" needs its own small, **direct,
non-streaming completion** path.

**Decision — Option B-lite:** a dedicated endpoint that supports **OpenAI-compatible providers
only** — OpenAI, Groq, xAI, and local Ollama / LM Studio. **Anthropic, Gemini, and Cohere are not
supported** (different request shapes); for them the endpoint returns 400 and the UI offers
**Go to Settings** instead of a fix. Provider/key/model detection reuses `lib/ai-provider-utils.ts`
and `lib/local-llm-utils.ts`.

(Rejected: reusing `cypherOnly` with a "fix this" prompt — the library's prompt is built to
*answer questions about graph data*, quality is uncertain, and it returns no explanation. Kept as
a documented fallback in §7.)

---

## 1. Scope

**Shipped**
- A **user-initiated "Fix with AI"** action on a failed query.
- On click → POST `{ query, errorMessage, graphName, model, key, modelSource, localProvider,
  localEndpoint, hint? }` to `/api/chat/fix` → returns **`{ explanation, correctedQuery? }`**.
- **Result surface:** `app/components/AiFixDialogs.tsx` — a non-blocking "Asking the AI…"
  indicator with **Cancel**, then a resizable result panel with the explanation and, when a
  corrected query is returned, the shared suggested-query card (**Copy** / **Insert into editor**;
  neither runs the query). Explanation-only replies show a "couldn't produce a corrected query"
  note; errors show the provider message with **Go to Settings**.
- **Surfaces** (all call the same `requestAiFix` from `AiFixContext`):
  - the **error toast** for a failed run (`AiFixButton` in `components/ui/toaster.tsx`), shown
    while the editor still holds the failed query;
  - a **"✨ Fix with AI" Monaco quick fix** on grammar diagnostics
    (`lib/falkordb-cypher/monacoGrammarLint.ts`), in both the main editor and the query-history
    editor; grammar errors are blocked before execution, so they report the failure through
    `reportClientError`.

**Out of scope / follow-up**
- Anthropic / Gemini / Cohere providers; streaming; auto-apply/auto-run; multi-turn "keep fixing";
  sending the graph schema (supported by `buildFixMessages` but not sent by the endpoint).

---

## 2. Architecture

### Pure module `lib/aiFix.ts` (no React/Next/LLM — 100% unit-tested, in the coverage gate)
- `buildFixMessages({ query, errorMessage, hint?, schema? })` — strict-JSON prompt.
- `parseFixResponse(reply, originalQuery)` — JSON first, then fenced ```json / ```cypher
  fallback; drops a corrected query that is empty, not Cypher-like, or identical to the original.
- `isAiFixSupported(cfg)` — UI gating: a model is selected and either a local provider or an
  api-key with an OpenAI-compatible provider.
- `resolveFixTarget(...)` — server gating: local endpoint normalization, required key for hosted
  providers, unsupported provider → error, and a key/model provider mismatch guard (a key is never
  forwarded to a provider it was not issued for).
- `getChatCompletionsUrl(target)` — the exact Chat Completions URL per provider (Groq's
  `/openai/v1`, LM Studio's endpoint already ending in `/v1`); `getProviderModelName(model)` strips
  the app's `provider::` / `provider:` prefix.

### Shared transport `app/api/chat/completion.ts` (`requestAiCompletion`)
Used by both `/api/chat/fix` and `/api/chat/optimize`.
- **Hosted OpenAI → Responses API** (`POST https://api.openai.com/v1/responses`,
  `{ model, input: messages, store: false }`, no `temperature`), with a **240 s** timeout. GPT-5
  and o-series reasoning models reject Chat Completions sampling options (and `*-pro` models are
  Responses-only), so Responses is the default; new reasoning families need no code change.
- **Exception — Chat Completions-era OpenAI families** (`CHAT_COMPLETIONS_OPENAI_MODEL`:
  `gpt-3.5*`, `gpt-4*` incl. GPT-4o/4.1, `chatgpt-*`, `gpt-audio*`, and `ft:` fine-tunes of them)
  keep Chat Completions with `temperature: 0` for deterministic JSON; the audio models are not
  available on Responses.
- **Groq, xAI, Ollama, LM Studio → Chat Completions** with `temperature: 0` and a **30 s** timeout.
- The provider body is read with a 256 KB cap (`readChatBodyWithLimit`); an oversized or non-JSON
  failure body still reports the HTTP error (401 stays 401). Responses `incomplete`/`failed` and
  empty replies are 422. Provider errors map to actionable messages (key, quota, rate limit, model
  access, context length, temperature, outage); **provider bodies are never logged or echoed**.
- The request's `AbortSignal` is combined with the timeout, so a client cancel aborts the
  provider call. The 240 s deadline leaves headroom under common 300 s platform limits; hosts with
  a shorter execution limit cut Responses requests short.

### Endpoint `app/api/chat/fix/route.ts`
- POST, auth via `getClient`, body capped (`MAX_CHAT_BODY_BYTES`) and validated by `fixRequest`
  in `app/api/validate-body.ts` (Zod `.max()` limits on query, error, hint, model, key).
- `resolveFixTarget` failure → **400**; then `requestAiCompletion`; failures return its status
  (**401** for a rejected key, otherwise **422**); timeouts/aborts/network errors → 422 with a
  generic message. Only the error *name* is logged, never the query/error/prompt.
- Returns `parseFixResponse(reply, query)`. Documented in `app/api/swagger/swagger-spec.ts`.

### UI wiring (`app/providers.tsx`)
- **Gating:** `aiFixSupported = isAiFixSupported(...)` from the chat model/key/source state.
- **`requestAiFix(query, errorMessage)`** first calls `dismissAiFix()` (a new request supersedes
  the old one), shows the hosted-provider consent if needed (§3), then `doAiFix` POSTs to
  `/api/chat/fix` with `X-Connection-Id`.
- **Cancellation and ownership:** each request gets an `AbortController` and an owner token and
  captures the connection ID and connection epoch (see
  [idea-6](idea-6-connection-epoch-pinning-plan.md)). Every state write re-checks them, so a cancelled,
  superseded or cross-connection reply is dropped. `dismissAiFix` (Cancel, closing the panel, a
  new request, running a query, a new client-side failure) aborts the fetch and resets the state;
  layout effects also call it when the query text, tab, graph, connection (including a pending
  switch), page, or AI model settings change.
- **Insert into editor** sets the editor query via `setHistoryQuery` — **no run** — and only
  while the result's request is still current.

---

## 3. Privacy & consent

- The action **never** fires automatically; only on an explicit click.
- **Hosted providers:** a consent dialog — "Your query and its error message will be sent to
  <Provider>" — with **"Don't ask again for this provider"**, stored in `localStorage` as
  `aiFixConsent-<provider>`. The provider is captured when the dialog opens, so a model change
  can't alter what the user agreed to. Local providers (Ollama/LM Studio) skip the dialog: data
  stays on the configured local endpoint.
- **Optimize** has no remembered consent: every analysis needs an explicit **Analyze** click.
  `CypherEditor` deletes the retired global `aiOptimizeConsent-<provider>` flags on mount
  (`removeLegacyOptimizeConsent` in `lib/aiOptimize.ts`).
- Only the query, its error and an optional hint are sent — no schema or graph data.
- **Payload limits** (Zod `.max()` + request body cap) prevent uploading a huge query/error.
- No telemetry of query/error content; no full-content server logging.

---

## 4. Testing

- **Unit, 100% gate:** `lib/aiFix.test.ts` (prompt, parsing, gating, target resolution, URL matrix,
  model-name normalization).
- **Unit, transport, 100% gate:** `app/api/chat/completion.test.ts` with `fetch` mocked — Responses vs Chat
  Completions routing per model family and provider, payload shape (`store: false`, no
  `temperature` on Responses), timeouts, error mapping without leaking provider bodies, body caps,
  incomplete/failed Responses, and abort propagation.
- **E2E (Playwright, provider mocked):** `e2e/tests/errorToasts.spec.ts` (toast button),
  `e2e/tests/aiOwnership.spec.ts` (Cancel/dismissal aborts the request; stale 200/422/401 replies
  can't replace a newer result), `e2e/tests/aiSettingsDrafts.spec.ts` (route-level provider status
  mapping with a real authenticated request, Copy/Insert without execution, Settings round trips).
- **No real-LLM test runs in CI** (no keys, cost, non-determinism).

---

## 5. Docs

- **README:** "Error help" (what Fix with AI sends and to which providers) and "AI query
  optimization and drafts" (Responses routing, timeouts, Cancel and stale-reply handling).
- **OpenAPI:** `/api/chat/fix` and `/api/chat/optimize` request/response contracts.

---

## 6. Risks & mitigations
- **LLM output format** → strict-JSON prompt + tolerant `parseFixResponse` + Cypher-keyword
  validation; never auto-run; always show the explanation.
- **Provider/API drift** → OpenAI-compatible providers only; hosted OpenAI defaults to Responses
  so new reasoning models work; only an explicit list of older families keeps Chat Completions.
- **Latency / stale results** → up to 240 s for Responses, so every request is cancellable and
  ownership-checked; a newer request, Cancel, or a context change drops the old reply.
- **Hosting limits** → the 240 s deadline still needs a platform request limit above it.
- **Sensitive data** → hosted-provider consent with "don't ask again"; no provider-body or prompt
  logging.

---

## 7. Option A fallback (not used)
- Extend `/api/chat` with a `fix` mode: skip **only** `EMPTY_GRAPH` (keep `GRAPH_NOT_FOUND`), build
  the question from `buildFixMessages`' user text, call `cypherOnly(graphName, question)`, return
  `{ correctedQuery: result.cypherQuery }`. Smaller, but quality is uncertain and there's no prose
  explanation.

---

## 8. Resolved decisions
1. **Option B-lite** (direct completion endpoint), not Option A.
2. **Providers:** OpenAI-compatible only (OpenAI/Groq/xAI/Ollama/LM Studio); others get
   Go to Settings.
3. **Surfaces:** error toast + Monaco quick fix (main and history editors).
4. **Result UX:** dedicated AI-Fix result panel with explanation + Copy / "Insert into editor".
5. **Consent:** hosted-provider confirmation with "don't ask again" per provider.
