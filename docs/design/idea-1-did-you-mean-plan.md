# Implementation Plan — Idea #1: "Did you mean…?" suggestions

Goal: when a Cypher query fails with **Unknown function 'X'** or **'X' not defined**,
show the closest valid name ("💡 Did you mean `length()`?") instead of only a generic
tip. This turns "you're wrong" into "here's the fix."

---

## 1. Scope

**In scope (v1)**
- **Unknown function** typo → suggest the closest built‑in Cypher function.
- **Undefined variable** typo → suggest the closest identifier used in the same query.
- Surface the suggestion in the two places that already show error hints and have the
  query text available: the **error toast** and the **query‑history tooltip**.

**Out of scope (tracked under other ideas)**
- Editor squiggles / markers for these errors → **Idea #2** (only syntax errors are
  decorated in the editor today; these two are not syntax errors, so there is no editor
  decoration to attach a hover to yet).
- Proactive label/property suggestions (those don't produce a server error) → **Idea #2**.
- Including remote graph functions / UDFs as suggestion candidates → future enhancement.
  v1 uses the built‑in function list. Because the distance threshold is tight, a mistyped
  UDF/remote function rarely lands near a built‑in — but it *can*, so this is a known
  limitation (a wrong suggestion is possible for non‑built‑in functions), not a guarantee.
  Adding remote/UDF names to the candidate set later removes it.

---

## 2. Architecture & where each piece lives

The suggestion must be computed where we have **both** the raw error **and** the query
text. Today the toast is fired inside `getSSEGraphResult` (`lib/utils.ts`), which only
receives the request URL — not the parsed query or candidate lists. So we thread a small
optional **error context** down to that point.

### New pure module: `lib/cypherSuggestions.ts` (no React/Monaco — 100% unit‑tested)
```ts
export function levenshtein(a: string, b: string): number
export function closestMatch(
  target: string,
  candidates: string[],
): string | undefined                       // returns canonical candidate or undefined
export function extractVariableCandidates(query: string): string[]  // vars from binding positions only
export function suggestForError(
  rawError: string,
  ctx: { query?: string; functions?: string[] },
): string | undefined                       // ready-to-show plain-text hint, or undefined
```
- `suggestForError` recognizes exactly two error shapes (mirroring the catalog patterns):
  - `/unknown function '([^']+)'/i` → match group against `ctx.functions` →
    `"Did you mean length()?"`
  - `/'([^']+)' not defined/i` → match group against
    `extractVariableCandidates(ctx.query)` → `"Did you mean person?"`
  - Anything else → `undefined`.
- Variable extraction lives **inside** the module (called with `ctx.query`), so callers
  only ever pass `{ query, functions }` — no separately-computed candidate list to keep
  in sync (addresses "context field threaded but unused").
- Plain‑text output (no backticks/markdown) to match the existing hint style and render
  correctly in both the toast and the tooltip.

### New shared data module: `lib/cypherLang.ts`
- Move `KEYWORDS` and `FUNCTIONS` **out of** `app/components/CypherEditor.tsx` into
  `lib/cypherLang.ts` as `CYPHER_KEYWORDS` and `BUILTIN_FUNCTIONS` (single source of
  truth). `CypherEditor.tsx` imports them (behavior unchanged — it's a data‑only move).
- `extractVariableCandidates` uses these to exclude keyword tokens that can appear right
  after a paren (e.g. `(NOT …)`).

### `lib/utils.ts`
- Extend the signature **additively**:
  ```ts
  toUserFriendlyMessage(raw, status, ctx?: { query?: string; functions?: string[] })
  getSSEGraphResult(url, toast, setIndicator, errorContext?: { query: string; functions?: string[] })
  ```
- In `toUserFriendlyMessage`, after the existing catalog hint is computed, call
  `suggestForError(rawMessage, ctx)`; if it returns a suggestion, **use it as the hint**
  (it is strictly more specific than the generic catalog tip). Otherwise keep the catalog
  hint. All existing callers that pass no `ctx` keep working unchanged.
- `getSSEGraphResult` forwards `errorContext` into `toUserFriendlyMessage`.

### `app/providers.tsx` (the query runner)
- At the `getSSEGraphResult(url, …)` call (~line 547) pass:
  ```ts
  { query, functions: BUILTIN_FUNCTIONS }
  ```
  `query` is already in scope. Variable candidates are derived purely inside
  `suggestForError` from this query text — no access to the editor's Monaco‑parsed
  `boundVarsRef` is needed.

### `app/components/PaginationList.tsx` (history tooltip)
- It already has `item.errorMessage` **and** `item.text` (the `Query` type has both).
  Replace the current `getCypherErrorHint(item.errorMessage)?.hint` with:
  ```ts
  suggestForError(item.errorMessage, { query: item.text, functions: BUILTIN_FUNCTIONS })
    ?? getCypherErrorHint(item.errorMessage)?.hint
  ```

### `app/components/CypherEditor.tsx`
- Replace local `KEYWORDS`/`FUNCTIONS` with imports from `lib/cypherLang.ts`. No other
  change in v1 (editor markers are Idea #2).

---

## 3. The matching algorithm (precise)

`closestMatch(target, candidates)`:
1. Lowercase `target` and each candidate for comparison; keep the candidate's original
   casing for the returned suggestion.
2. Ignore targets shorter than 3 chars (too ambiguous → `undefined`).
3. Compute Levenshtein distance to each candidate. Keep only candidates with
   `distance <= maxDistance`, where **`maxDistance` is based on the longer of the two
   strings**: `maxLen = max(target.length, candidate.length)`, then
   `maxDistance = maxLen <= 4 ? 1 : 2`.
   - This is the fix for the headline example: `prsn`→`person` has distance **2** and
     `maxLen = 6`, so it qualifies. (The earlier "target.length ≤ 4 ⇒ 1" rule would have
     wrongly rejected it.) `lenght`→`length` is also distance 2, `maxLen = 6` ⇒ qualifies.
   - The absolute cap of 2 keeps long-word false positives away (e.g. `count`→`collect`
     is distance ~4 ⇒ rejected; `min`→`max` is distance 2 with `maxLen 3` ⇒ rejected).
4. Drop exact matches (`distance === 0`): a real match wouldn't have errored.
5. Choose the smallest distance; tie‑break by smaller length difference, then
   alphabetically (deterministic → stable tests).
6. Return the chosen candidate, or `undefined` if none qualify.

`suggestForError` formats the result: functions get `()` appended
(`"Did you mean length()?"`); variables are shown as‑is (`"Did you mean person?"`).

`extractVariableCandidates(query)` — extract only names in **binding positions**, not
every bare word (this is the fix for noisy/wrong variable suggestions):
1. Strip comments (`// …` line and `/* … */` block) and quoted string literals
   (`'…'`, `"…"`, handling escaped quotes) so their words can't pollute candidates.
2. Capture identifiers only where a variable is actually introduced/used as a binding:
   - node variable: `/\(\s*([A-Za-z_]\w*)/g` (the name right after `(` — skips `(:Label)`
     and `(123)`),
   - relationship variable: `/\[\s*([A-Za-z_]\w*)/g` (after `[` — skips `[:TYPE]`),
   - alias: `/\bAS\s+([A-Za-z_]\w*)/gi` (covers `UNWIND … AS x`, `WITH … AS x`,
     `RETURN … AS x`).
3. This deliberately **excludes** labels and relationship types (after `:`), property keys
   (after `.`), and function-namespace pieces (`vec.euclideanDistance`), so a typo'd
   variable is matched against real variables — e.g. `MATCH (person:Person) RETURN Persn`
   suggests the variable `person`, **not** the label `Person`.
4. Exclude `CYPHER_KEYWORDS` (e.g. a `(NOT …)` capture) and de‑duplicate.
5. **v1 limitations (documented):** backtick‑quoted identifiers (`` `weird name` ``) are
   not matched and simply won't get a suggestion (no wrong suggestion — just none). The
   `(`‑capture is intentionally simple, so it can also grab the first identifier of a
   *grouped expression* (e.g. `WHERE (person.age > 1)` → `person`); in practice that token
   is almost always a real bound variable, so it's a harmless over‑capture rather than a
   wrong suggestion. A negative test pins this behavior.

---

## 4. UX / display

```
Run:   RETURN lenght("hello")            Run:   MATCH (person) RETURN prsn

Toast:                                   Toast:
  Error                                    Error
  Unknown function 'lenght'                'prsn' not defined
  💡 Did you mean length()?                💡 Did you mean person?
  See more ▸                               See more ▸
```
- The same suggestion appears in the **history tooltip** for the failed query.
- When there is no close match, behavior is unchanged (the existing generic catalog
  hint shows). Conservative by design: **no guess ⇒ no suggestion**.

---

## 5. Edge cases & guardrails

- **No candidates / no close match** → `undefined` (fall back to generic hint).
- **Exact match** → `undefined` (guard; never "did you mean" the same word).
- **Very short token** (≤1 char) → `undefined`.
- **Case‑insensitive** compare (Cypher functions are case‑insensitive); suggest canonical
  casing.
- **Multiple candidates** → deterministic tie‑break (distance, then length diff, then
  alphabetical).
- **Privacy/safety**: suggestions come only from the built‑in function list or from
  identifiers in the user's **own** query — never from other users' data, and never the
  raw error verbatim. Nothing sensitive is introduced.
- **Performance**: a handful of short Levenshtein computations per failed query —
  negligible, and only on the error path.

---

## 6. Testing — **100% coverage of the new logic** + **real‑DB smoke tests**

### 6a. Unit tests (100% coverage, gated in CI)
- `lib/cypherSuggestions.test.ts` (node:test, `.ts`‑extension import) covering **every
  branch** of `levenshtein`, `closestMatch`, `extractVariableCandidates`, `suggestForError`:
  - function typo → suggestion; variable typo → suggestion (incl. the exact
    `prsn` → `person` headline case);
  - no‑match / empty candidates / exact match / too‑short token → `undefined`;
  - threshold boundaries (distance 1 vs 2, short vs long via `maxLen`);
  - tie‑break determinism; quoted‑literal **and comment** stripping; keyword exclusion;
  - unrecognized error shapes → `undefined`.
  - **False‑positive / behavior tests (explicit):**
    - `MATCH (person:Person) RETURN Persn` ⇒ suggests `person`, **not** label `Person`.
    - `MATCH (n) RETURN nam` ⇒ does **not** suggest property key `name` from `n.name`.
    - strings/comments containing `person` ⇒ no candidate created.
    - `vec.euclideanDistance` ⇒ no variable candidates `vec` / `euclideanDistance`.
    - grouped expression `WHERE (person.age > 1)` ⇒ only real bindings captured (pins the
      conservative `(`-capture behavior).
    - a mistyped UDF that's far from any built‑in ⇒ `undefined`.
- **Coverage gate** (verified working): a new script
  ```json
  "test:coverage": "node --test --experimental-test-coverage \
     --test-coverage-include='lib/cypherSuggestions.ts' \
     --test-coverage-lines=100 --test-coverage-functions=100 --test-coverage-branches=100 \
     \"app/**/*.test.ts\" \"lib/**/*.test.ts\""
  ```
  The `--test-coverage-include` filter scopes the 100% threshold to the new module only
  (the rest of the repo is unaffected). Confirmed: exits non‑zero below 100%, zero at
  100%. Wire `npm run test:coverage` into the **Build** CI workflow (alongside
  `npm test`). `lib/cypherLang.ts` is data‑only (covered by import; no branches).

### 6b. Smoke tests against a real FalkorDB (gated/opt‑in)
- `lib/cypherSuggestions.smoke.ts` (named `*.smoke.ts` so the normal `npm test` glob does
  **not** pick it up). Uses the `falkordb` npm client (already a dependency):
  ```ts
  const db = await FalkorDB.connect({ url: process.env.FALKORDB_URL ?? "redis://localhost:6379" });
  // run "RETURN lenght(1)" → catch → assert suggestForError(e.message, {functions}) === "Did you mean length()?"
  // run "MATCH (person) RETURN prsn" → catch → assert "Did you mean person?"
  ```
  This proves our patterns still match the **real** server wording (catches drift if a
  future FalkorDB version rephrases the error).
- `"test:smoke": "node --test lib/cypherSuggestions.smoke.ts"`. Skip‑vs‑fail behavior
  (so a green smoke job can't silently mean "tested nothing"):
  - `FALKORDB_SMOKE` **unset** → the suite skips (safe to run anywhere, incl. normal dev).
  - `FALKORDB_SMOKE=1` **and the connection fails** → the suite **fails** (does not skip).
  - **CI explicitly sets `FALKORDB_SMOKE=1`**, so a misconfigured service container fails
    the job instead of passing vacuously.
- **CI**: add an opt‑in job that starts a `falkordb/falkordb` service container and runs
  `npm run test:smoke` with `FALKORDB_SMOKE=1` (mirrors how the Playwright e2e gets a
  database). Document the local run (note `docker run -d` so it doesn't block the shell):
  ```bash
  docker run -d -p 6379:6379 falkordb/falkordb
  FALKORDB_SMOKE=1 npm run test:smoke
  ```

### 6c. E2E (Playwright)
- Add one assertion to `e2e/tests/errorToasts.spec.ts`: running `RETURN lenght(1)` shows a
  toast containing `Did you mean length()`.

---

## 7. Docs (browser)

- The in‑app `/docs` route is **Swagger/API** docs (not user‑facing feature docs), so the
  feature documentation goes in the **README**:
  - A short "Error help" note describing the actionable hints + "Did you mean?" feature.
  - Update the **Testing** section with `npm run test:coverage` and `npm run test:smoke`
    (and the `FALKORDB_SMOKE` env + how to point at a local DB).

---

## 8. PR & PR description

Two options — **decision needed from you**:
- **(Recommended) New PR**, e.g. `feat: "Did you mean?" suggestions for unknown functions
  and undefined variables`, branched so it stacks on the clear‑errors work. Keeps the
  already‑approved #1861 focused and reviewable.
- **Or extend #1861** and update its description.

Either way, the PR description (drafted now, finalized at implementation) will cover:
- Problem → solution with the before/after examples above.
- The pure `lib/cypherSuggestions.ts` design + conservative "no guess ⇒ no suggestion".
- Surfaces (toast + history tooltip) and why editor markers are deferred to Idea #2.
- Testing: 100% coverage gate on the new module + real‑DB smoke tests + e2e + how to run.
- Docs updated.

---

## 9. Step‑by‑step task list (implementation order)

1. `lib/cypherLang.ts` — move `BUILTIN_FUNCTIONS` + `CYPHER_KEYWORDS` out of CypherEditor;
   update `CypherEditor.tsx` imports. (build ✓)
2. `lib/cypherSuggestions.ts` — pure `levenshtein` / `closestMatch` /
   `extractVariableCandidates` / `suggestForError`.
3. `lib/cypherSuggestions.test.ts` — exhaustive tests → reach 100% on the module.
4. Wire suggestions into `toUserFriendlyMessage` + `getSSEGraphResult` (`lib/utils.ts`),
   and pass context from `app/providers.tsx`.
5. History tooltip suggestion in `app/components/PaginationList.tsx`.
6. `package.json` scripts (`test:coverage`, `test:smoke`); CI: add coverage step to Build,
   add opt‑in smoke job with a FalkorDB service.
7. `lib/cypherSuggestions.smoke.ts`; e2e assertion in `errorToasts.spec.ts`.
8. README updates (feature + testing).
9. Validate: `next build`, `npm run test:coverage` (100%), `npm run test:smoke` against a
   local FalkorDB, targeted e2e. Commit, push, update PR description, monitor AI review.

---

## 10. Open decisions for you
1. **New PR vs extend #1861?** (recommend new PR.)
2. **Coverage scope**: enforce 100% on `lib/cypherSuggestions.ts` only (recommended), or a
   wider set?
3. **Candidates in v1**: built‑in functions only (recommended), or also fetch remote/UDF
   function names for the suggestion?
