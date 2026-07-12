# Implementation Plan — Idea #3: "Fix with AI" (Option B-lite)

Goal: for errors the static catalog can't cover, let the user **explicitly** click a button
on a failed query to get an **AI explanation + a corrected query** for that specific query +
error. Result is shown for review and inserted into the editor on demand — **never auto-run**.

---

## 0. Key constraint (drives the design)

The app's only LLM integration is **`@falkordb/text-to-cypher`**, which exposes only
question→Cypher methods (`textToCypher`, `cypherOnly`, `discoverSchema`, `listModels…`) — **no
generic "explain"/chat-completion**. The app has **no direct LLM completion code** at all (only
model-*listing* HTTP calls in `app/api/chat/models/route.ts`). So an "explain this error" feature
needs a new, small **direct chat-completion** path.

**Decision — Option B-lite:** a dedicated non-streaming completion endpoint, but **v1 supports
OpenAI-compatible providers only** — OpenAI, Groq, xAI, and local Ollama / LM Studio (all use
`POST /v1/chat/completions`). **Anthropic, Gemini, and Cohere are out of v1** (different request
shapes) — the button is **hidden** for them with a "not yet supported" note; full support is a
follow-up. This keeps the PR to **one** request/response shape and reuses the existing provider/
key/model detection (`lib/ai-provider-utils.ts`, `lib/local-llm-utils.ts`).

(Rejected: reusing `cypherOnly` with a "fix this" prompt — the library's prompt is built to
*answer questions about graph data*, quality is uncertain, and it returns no explanation. Kept as
a documented fallback in §7.)

---

## 1. Scope (v1)

**In scope**
- A **user-initiated "Fix with AI"** action on a failed query, shown only when AI is configured
  **with a supported (OpenAI-compatible) provider**.
- On click → POST `{ query, errorMessage, graphName, model, key, modelSource, localProvider,
  localEndpoint, hint? }` to a new endpoint → returns **`{ explanation, correctedQuery | null }`**.
- **Result surface:** a dedicated lightweight **AI-Fix dialog** (reusing `DialogComponent`) showing
  the explanation and, when a corrected query is returned, an **"Insert into editor"** button (sets
  the editor query; the user reviews and runs it). Explanation-only responses show no insert button
  and a clear "AI couldn't produce a corrected query" note. (We do **not** inject into `Chat.tsx` —
  it owns local `messages` state and may be unmounted while closed.)
- **Surfaces (both React, both have the query + error directly — no global registry):**
  - the **failed query-history item** (`QueryHistoryPanel`/`PaginationList` — has `item.text` +
    `item.errorMessage`),
  - a **"Fix with AI" button in the editor area**, shown when a query has failed (the idea-#2
    `DiagnosticsContext` signals failure; providers stores the last `errorMessage` alongside it).
  - (The error-toast `action` slot is a possible later surface; skipped in v1 to avoid plumbing a
    callback through `lib/utils`.)

**Out of scope / follow-up**
- Anthropic / Gemini / Cohere providers; streaming; auto-apply/auto-run; multi-turn "keep fixing".

---

## 2. Architecture

### New pure module `lib/aiFix.ts` (no React/Next/LLM — 100% unit-tested)
```ts
// Instructs the model to reply as STRICT JSON, so parsing is reliable.
export function buildFixMessages(input: { query: string; errorMessage: string; hint?: string; schema?: string }):
  { role: "system" | "user"; content: string }[];

// Parse the model reply: try JSON first ({ explanation, correctedQuery }); fall back to a fenced
// ```cypher/```json block; validate correctedQuery (non-empty, contains a Cypher keyword, and not
// identical to the original query) else drop it. Returns { explanation, correctedQuery? }.
export function parseFixResponse(reply: string, originalQuery: string):
  { explanation: string; correctedQuery?: string };

// v1 gating: a model is selected AND (local provider OR an api-key is present) AND the resolved
// provider is OpenAI-compatible (openai/groq/xai/ollama/lmstudio).
export function isAiFixSupported(cfg: { model?: string; key?: string; source?: "api-key" | "local"; localProvider?: string }): boolean;

// Provider URL + model normalization (pure, fully tested — the rubber-duck flagged these as the
// easiest things to get wrong):
//   getChatCompletionsUrl returns the exact completions URL per provider:
//     openai → https://api.openai.com/v1/chat/completions
//     groq   → https://api.groq.com/openai/v1/chat/completions   (note the /openai/ segment)
//     xai    → https://api.x.ai/v1/chat/completions
//     ollama → <localEndpoint or http://localhost:11434>/v1/chat/completions
//     lmstudio → <localEndpoint (already ends in /v1)>/chat/completions   (avoid /v1/v1)
//   getProviderModelName strips the app's "provider::" prefix so the API gets the raw model id
//     (e.g. "groq::llama-3.1-8b" → "llama-3.1-8b", "gpt-4o-mini" → "gpt-4o-mini").
export function getChatCompletionsUrl(cfg: { source: "api-key" | "local"; provider: string; localEndpoint?: string }): string;
export function getProviderModelName(model: string): string;
```
- Deterministic + fully testable. The prompt is fixed text + the user's own query/error.
- `parseFixResponse` is the riskiest seam → JSON-first with validation, tolerant fallback,
  exhaustive tests (valid JSON; JSON in a fence; corrected == original → dropped; non-Cypher →
  dropped; explanation-only; junk → explanation = raw, no query).

### New endpoint `app/api/chat/fix/route.ts`
- POST, validated by a new `fixRequest` schema in `app/api/validate-body.ts` with **Zod `.max()`
  limits** (`query` ≤ ~8 KB, `errorMessage` ≤ ~4 KB, `hint`/`schema` bounded). Auth via `getClient`.
- **Provider gating:** resolve the provider from model/source; if not OpenAI-compatible → **400**
  "Fix with AI isn't supported for <provider> yet."
- Build `messages = buildFixMessages(...)`; optionally prepend `discoverSchema(graphName)` **only if
  the graph exists** (improves semantic fixes) — but **do NOT require graph data** (no `EMPTY_GRAPH`
  guard; syntax fixes need no schema).
- `POST getChatCompletionsUrl(...)` (the per-provider URL matrix above — **not** a naive
  `<base>/v1/chat/completions`, which breaks Groq's `/openai/v1` and LM Studio's existing `/v1`),
  sending `model: getProviderModelName(model)` (strip the app's `provider::` prefix) + `messages`,
  with `request.signal` **and a server-side timeout/abort**.
- Map provider/auth/network errors with the same style as `createUserFriendlyErrorMessage`; return
  **400/401/422** appropriately. **Do not log** the full query/error/prompt.
- Returns `parseFixResponse(reply, query)`.

### UI wiring (client)
- **Gating:** `isAiFixSupported(...)` from the existing chat model/key/source state in `providers.tsx`;
  render the action only when true.
- **Handler:** a `requestAiFix(query, errorMessage)` function in `providers.tsx` (passed via context
  to the history panel + editor). It: (1) enforces **in-flight + dedupe** (disabled while running;
  ignores a repeat of the same `{query,error}` within the session; optional short cooldown);
  (2) shows the **first-use consent** for hosted providers (see §3); (3) POSTs to `/api/chat/fix`
  with the `X-Connection-Id` header; (4) sets `pendingAiFix` state → the AI-Fix dialog renders it.
- **Insert into editor:** sets the editor query (`setHistoryQuery`/`urlQueryText`) — **no run**.

---

## 3. Privacy & consent (must-have)

- The action **never** fires automatically; only on an explicit click, only when a supported
  provider is configured.
- **First-use consent for hosted providers:** a one-time dialog — "Send this query, its error,
  **and your graph's schema/labels** to <Provider> to get a fix?" with **"Don't ask again"** stored
  locally (per provider). Local providers (Ollama/LM Studio) get a lighter inline note (data is sent
  only to the configured local provider endpoint). The wording explicitly covers the schema because
  `discoverSchema` may be included.
- **Payload limits** (Zod `.max()`) prevent accidentally uploading a huge query/error; the discovered
  **schema is truncated to a size cap** before sending (and can be omitted entirely in v1 if we prefer
  to keep the prompt to query+error only).
- No telemetry of query/error content; no full-content server logging.

---

## 4. Testing

- **Unit (100% on `lib/aiFix.ts`)**, gated via `--test-coverage-include`: `buildFixMessages`
  (with/without hint + schema), `parseFixResponse` (valid JSON; JSON-in-fence; fenced cypher;
  corrected==original dropped; non-Cypher dropped; explanation-only; junk), `isAiFixSupported`
  (api-key supported/unsupported provider; local; missing key; no model), **`getChatCompletionsUrl`
  (exact output for openai/groq/xai/ollama/lmstudio — incl. Groq's `/openai/v1` and LM Studio's
  no-double-`/v1`)**, and **`getProviderModelName` (prefixed `groq::…`/`xai::…`/`ollama::…` → raw id;
  unprefixed unchanged)**.
- **Endpoint tests with the provider fetch MOCKED** (no real key): body validation + `.max()`
  limits, auth rejection, **unsupported-provider → 400**, the **no-`EMPTY_GRAPH`** behavior, and a
  mocked happy path → `{ explanation, correctedQuery }`.
- **UI tests with `/api/chat/fix` MOCKED** (the app-specific risk, testable without keys): button is
  **hidden** when unconfigured/unsupported and **shown** when supported; clicking sends `{query,
  errorMessage}` (+ `X-Connection-Id`); the dialog shows the result; **"Insert into editor" updates
  the editor but does NOT run**; explanation-only hides the insert button; the button is disabled
  while in-flight.
- **Real-LLM smoke is opt-in only** (not CI): a tolerant `AI_SMOKE=1`-gated local test that asserts
  the endpoint returns a parseable shape for `RETURN lenght(1)`. CI keeps the FalkorDB smoke; the AI
  smoke never runs in CI (no keys, cost, non-determinism).

---

## 5. Docs + PR

- **README:** a "Fix with AI" note — what it does, that it sends the **query, error, and (optionally)
  your graph's schema/labels** to your configured (OpenAI-compatible) provider, which providers are
  supported in v1, and how to run the opt-in AI smoke.
- **PR:** extends #1861 (same drill). Description covers the constraint, Option B-lite, provider
  gating, the privacy/consent model, payload limits/timeout, and the testing/coverage story.

---

## 6. Risks & mitigations
- **LLM output format** → strict-JSON prompt + tolerant `parseFixResponse` + Cypher-keyword
  validation; never auto-run; always show the explanation.
- **Provider sprawl** → v1 OpenAI-compatible only, gated by provider; others = follow-up.
- **Cost / latency / abuse** → user-initiated; in-flight disable + same-query dedupe + cooldown;
  server timeout/abort; payload `.max()` limits.
- **Sensitive data** → first-use hosted-provider consent + "don't ask again"; no full logging.
- **Untestable AI in CI** → 100%-cover the pure prompt/parse/gating; mock the provider + endpoint for
  the endpoint/UI tests.

---

## 7. Option A fallback (only if we choose the low-effort path)
- Extend `/api/chat` with a `fix` mode: skip **only** `EMPTY_GRAPH` (keep `GRAPH_NOT_FOUND`), build
  the question from `buildFixMessages`' user text, call `cypherOnly(graphName, question)`, return
  `{ correctedQuery: result.cypherQuery }`. Label **experimental, fix-only** (no explanation). Smaller,
  but quality is uncertain and there's no prose explanation.

---

## 8. Open decisions for you
1. **Option B-lite (recommended) vs Option A?**
2. **v1 providers = OpenAI-compatible only (openai/groq/xai/ollama/lmstudio), others hidden** — OK,
   or must Anthropic/Gemini ship in this PR (much larger)?
3. **Surfaces:** history item + editor button (recommended). Add the toast action too, or later?
4. **Result UX:** dedicated AI-Fix dialog with explanation + "Insert into editor" (recommended).
5. **Consent:** first-use hosted-provider confirmation with "don't ask again" (recommended).
