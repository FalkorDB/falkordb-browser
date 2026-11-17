# Implementation Plan — Idea #5: more error coverage + a drift guard

On PR #1861, same drill/quality. Two parts:
- **Part 1 — Coverage:** add hints for more FalkorDB errors (we cover ~16 of ~130).
- **Part 2 — Drift guard:** a real‑FalkorDB test that fails CI if a future server version
  rewords a message so our matchers stop recognizing it (instead of users silently losing
  the hints).

---

## Part 1 — Grow the catalog

### What we have
`lib/cypherErrors.ts` is a pure, ordered catalog of `{ id, test: RegExp, hint }` entries (16
today), each anchored to a FalkorDB `EMSG_*` template (cited in a comment). `getCypherErrorHint(raw)`
returns the first match.

### Selection rubric (instead of telemetry)
Add an entry only if it is **(1)** a common authoring mistake, **(2)** has an *actionable* static
hint, **(3)** has a **stable, distinctive** message (anchorable without false positives), and
**(4)** is **query‑triggerable** (so the drift guard can verify it). Drop anything that fails these.

### Candidate entries (PROVISIONAL — each verified against a live FalkorDB at implementation;
rows that can't be made stable/distinctive get dropped). **Grouped templates are split when the
fix differs** (correctness over entry count):

| id | EMSG_ | note |
|----|-------|------|
| `redeclared-variable` | REDECLARE | "can't be redeclared in a … clause" |
| `variable-already-declared` | VAIABLE_ALREADY_DECLARED(_IN_OUTER_SCOPE) | CALL `{}` scope (separate fix from REDECLARE) |
| `duplicate-result-column` | SAME_RESULT_COLUMN_NAME | alias collision |
| `same-alias-node-rel` | SAME_ALIAS_NODE_RELATIONSHIP | one alias used for node + rel |
| `same-rel-var-multiple` | SAME_ALIAS_MULTIPLE_PATTERNS | reused rel variable |
| `union-mismatched-returns` | UNION_MISMATCHED_RETURNS | columns must match |
| `union-combination` | UNION_COMBINATION | mixing UNION / UNION ALL |
| `query-missing-return` | QUERY_INVALID_LAST_CLAUSE | needs RETURN/update/CALL |
| `clause-after-return` | UNEXPECTED_CLAUSE_FOLLOWING_RETURN | nothing after RETURN |
| `missing-with-after-update` | MISSING_WITH | WITH needed after an updating clause |
| `missing-with-after-optional-match` | MISSING_WITH_AFTER_MATCH | **separate**: about OPTIONAL MATCH |
| `delete-invalid-target` | DELETE_INVALID_ARGUMENTS | DELETE nodes/paths/rels only |
| `remove-invalid-target` | REMOVE_INVALID_INPUT | REMOVE node/rel/map only |
| `set-non-alias-lhs` | SET_LHS_NON_ALIAS | LHS of SET must be an alias |
| `foreach-non-updating` | FOREACH_INVALID_BODY | only updating clauses in FOREACH |
| `call-must-alias` | CALLSUBQUERY_ALIAS_EXPRESSION | CALL expression needs AS |
| `merge-map` | MERGE_MAP_ERROR | merge map vs non‑map |
| `missing-parameters` | MISSING_PARAMETERS | a `$param` with no params supplied |
| `invalid-parameter-value` | INVALID_PARAMETER_VALUE | **separate**: malformed param value |
| `integer-overflow` | INTEGER_OVERFLOW | **separate** from a generic numeric error |

Target ≈ **12–18** that survive the rubric + live verification. (Not all 130 — diminishing value,
maintenance, false‑positive risk.)

### Deferred (to avoid a UX regression)
**Do NOT** migrate the inline `EMSG_ONE_RELATIONSHIP_TYPE` → title "Invalid Relationship" mapping
into the catalog in this PR: the catalog path yields title "Error" + verbatim description, which
would *downgrade* that tailored message. Revisit only if the catalog contract is extended with
optional `title`/`description` overrides (separate change, with a `toUserFriendlyMessage`
regression test).

---

## Part 2 — Drift guard (real‑FalkorDB)

### Shared pure data module `lib/cypherErrorDriftCases.ts`
Plain data only (no `falkordb`, no React), so both the smoke (real DB) and the unit meta‑test can
import it:
```ts
export type DriftCase = { id: string; query: string; expectedMessage: RegExp };
export const DRIFT_CASES: DriftCase[];                 // one per query-triggerable entry
export const NOT_DRIFT_TESTABLE: Record<string,string>; // id -> reason (timeout/OOM/constraint/CSV/vector…)
```

### `lib/cypherErrors.smoke.ts` (real DB, gated)
For each `DriftCase`: run `query` against a real FalkorDB, capture the thrown message, and assert
**both** (fixing the "passes for the wrong reason" risk):
1. the live message **matches `expectedMessage`** (the intended `EMSG_*` template is still produced), and
2. `getCypherErrorHint(liveMessage)?.id === id` (our matcher still recognizes it).
Assertion failures include the raw query + live message. Gated exactly like today's smoke (skips
unless `FALKORDB_SMOKE=1`; **fails** if set but unreachable). Uses a throwaway graph name; trigger
queries are designed to fail at parse/validation (no data needed). `test:smoke` becomes a glob
(`node --test "lib/**/*.smoke.ts"`) so all smoke files run.

### Completeness meta‑test (unit, no DB)
Asserts **every catalog `id` is either in `DRIFT_CASES` or in `NOT_DRIFT_TESTABLE`** — so adding a
catalog entry *forces* a drift row or an explicit not‑testable reason. Imports only the pure data +
the catalog ids. `cypherErrors.ts` exposes a **safe id list** for this (`export const
CYPHER_ERROR_IDS: string[]`) rather than exporting the mutable `CATALOG`.

### CI: deterministic gate + drift canary
The smoke job's FalkorDB service currently uses `falkordb/falkordb:latest`. **Pin the PR smoke job
to a fixed supported tag/digest** so an upstream FalkorDB release rewording a message can't fail
unrelated PRs. Add a **separate scheduled (cron) + manual "drift canary" job on `:latest`** that
runs the same smoke and reports early when upstream changes wording — that's the *right* place for
the noisy‑but‑useful signal. The canary is explicitly **allowed to fail** (non‑required / named
"drift canary") so it never blocks unrelated PRs; only the pinned PR gate is required.

> `expectedMessage` regexes are **template‑specific** — they include the distinctive full phrase of
> the `EMSG_*` (not a broad keyword), so real wording drift is actually caught.

---

## Testing
- **Unit matrix (extend `lib/cypherErrors.test.ts`), not just one‑per‑entry:**
  - every **positive** frozen sample asserts its **exact** `id` via `getCypherErrorHint`;
  - **near‑miss** samples from *adjacent* `EMSG_*` templates assert `undefined` or the correct
    *different* id (guards first‑match ordering / shadowing);
  - keep connection/auth/API negatives.
- **Add `lib/cypherErrors.ts` to the 100% coverage gate** (pure, small): forces a test per entry,
  plus explicit `parseSyntaxError` tests (no‑match, multiline/context, trim, line/column clamping),
  and a few `toUserFriendlyMessage` tests for the allowlist↔catalog resolution path.
- **Drift guard:** `lib/cypherErrors.smoke.ts` + the completeness meta‑test.
- The layers are complementary: unit = "matches frozen sample, no false positive"; drift = "still
  matches the *live* server wording, for the *right* template".
- `next build` ✓, `npm run test:coverage` ✓ (100%), `FALKORDB_SMOKE=1 npm run test:smoke` ✓.

## Docs + PR
- **README:** the smoke job is also a drift guard; how to run it locally; the pinned‑tag vs
  `:latest`‑canary distinction.
- **PR:** extends #1861. Description covers the new coverage, the message+id drift contract, the
  completeness meta‑test, and the pinned/canary CI split.

## Risks & mitigations
- **False positives** → conservative anchoring + a **near‑miss matrix** (not just one negative).
- **Passes for the wrong reason** → assert the **expected message** *and* the id.
- **Nondeterministic CI** → pin the PR gate; put `:latest` on a scheduled canary.
- **Flaky/non‑portable triggers** → table is provisional; record the observed live message per row
  at implementation; drop rows that can't be made stable with a minimal query.
- **Wrong hint text (recognized but unhelpful)** → reviewed at implementation; near‑miss + a short
  human check of each hint.
- **Parts 1 & 2 drifting apart** → the completeness meta‑test enforces lock‑step.

## Open decisions for you
1. **Coverage scope** — the rubric‑filtered ~12–18 (recommended), broader, or narrower?
2. **Pin the PR smoke FalkorDB tag** + add a scheduled `:latest` canary (recommended) — OK, and any
   preferred pinned version?
3. **Add `lib/cypherErrors.ts` to the 100% coverage gate** (recommended)?
4. **Defer the "Invalid Relationship" migration** (recommended) — agreed?
