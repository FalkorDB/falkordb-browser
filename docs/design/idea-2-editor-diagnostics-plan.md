# Implementation Plan — Idea #2: Show errors in the editor

Goal: bring query errors to where the user is typing. Today only **syntax** errors are
highlighted (via a Monaco *decoration*), and everything else lives in a toast far from
the code. This adds proper **Monaco markers** (red squiggles + hover) on the exact
offending token for the errors we can locate, plus **quick fixes**, while honestly
leaving query-wide errors in the toast.

---

## 1. Scope

**In scope (v1)**
- **Markers foundation** — render editor errors as Monaco *model markers*
  (`setModelMarkers`) instead of a hand-rolled decoration. Markers give the standard
  red squiggle, native hover, and built-in marker navigation (F8).
- **Token-local markers** for the errors we can pin to a token:
  - syntax errors (already carry line/column),
  - `Unknown function 'X'` → underline `X`,
  - `'X' not defined` → underline `X`.
  The hover shows the message **and** the Idea #1 hint / "Did you mean…?" suggestion.
- **Quick fixes** (`registerCodeActionProvider`) — **v1 ships only the safe one:**
  - "Replace `lenght` with `length`" / "Replace `prsn` with `person`" (from the
    Idea #1 suggestion) — a single, unambiguous text replacement over the marked token.
  - **Deferred to stretch** (each needs a Cypher-aware locator and conservative rules,
    and several of these errors have *no* server token location): "Add `AS <name>`" for
    an unaliased `WITH`, "Add direction `->`" for an undirected `CREATE` (direction is
    semantically ambiguous — `->` vs `<-`), "Wrap with `toInteger(...)`" for a type
    mismatch. Do **not** build these in v1.

**Out of scope / stretch (call out, don't build in v1)**
- **Whole-query errors** (timeout, out-of-memory, write-queue-full, constraint
  violations, a type mismatch we can't localize) → stay in the toast / history; **no
  fake token marker**.
- **Proactive label/property lint** (warn about unknown labels/properties *as you type*,
  using the schema) — these don't produce a server error, so they're a separate
  "as-you-type" analysis. Phase 4 (stretch).
- A VS Code-style **Problems panel** — standalone Monaco does **not** ship one; markers
  give squiggles + hover + F8 navigation, but a panel would be custom UI. Deferred.

**Depends on:** Idea #1 (#1861) — reuses `suggestForError` / `extractVariableCandidates`
and the comment/string-stripping for token location. Should land after #1861 merges.

---

## 2. Architecture & where each piece lives

### New pure module: `lib/cypherDiagnostics.ts` (no React/Monaco — 100% unit-tested)
```ts
export type EditorDiagnostic = {
  message: string;
  hint?: string;
  severity: "error" | "warning";
  code: string;                                   // stable id, e.g. "unknown-function" (marker identity)
  startLineNumber: number; startColumn: number;   // 1-based (Monaco convention)
  endLineNumber: number;   endColumn: number;
  quickFix?: { title: string; newText: string };  // replacement over the diagnostic's own range
};

export type DiagnosticsResult = { sourceQuery: string; diagnostics: EditorDiagnostic[] };

export function offsetToPosition(text: string, index: number): { lineNumber: number; column: number }
// Locators expose how many valid occurrences exist, so the caller can apply the ambiguity policy:
type LocatedToken = { start: number; end: number; validOccurrenceCount: number };
export function locateFunctionToken(query: string, token: string): LocatedToken | undefined
export function locateVariableToken(query: string, token: string): LocatedToken | undefined
export function computeEditorDiagnostics(query: string, errorMessage: string): DiagnosticsResult
// Pure mapping used by the code-action provider (unit-tested without Monaco):
export function codeActionEditsForMarkers(
  diagnostics: EditorDiagnostic[],
  markers: { code: string; startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }[]
): { title: string; code: string; newText: string; range: Range }[]
```
- `computeEditorDiagnostics` returns the **source query alongside** the diagnostics so the
  editor can guard against stale application (see "stale guard" below):
  - **syntax** → reuse `parseSyntaxError`; one diagnostic, range clamped/validated (see §3).
  - **`Unknown function 'X'`** → `locateFunctionToken` (matches `X` immediately before `(`,
    supports dotted names); `hint` = `suggestForError(...)`; `quickFix` = replace with the
    suggested name when there is one. `code: "unknown-function"`.
  - **`'X' not defined`** → `locateVariableToken` (a `\bX\b` **not** preceded by `.` or `:`,
    so property keys / labels are skipped); same hint + quickFix. `code: "undefined-variable"`.
  - non-locatable / whole-query error → `diagnostics: []` (no marker).
- Token locators mask comments/strings with **same-length spaces** (offsets preserved) via
  a shared `maskCommentsAndStrings(query)` extracted from `lib/cypherSuggestions.ts`.
  **Ambiguity policy:** if the token can't be located → no diagnostic (toast only); if it
  occurs in **exactly one** valid (non-property/label) position → marker **+ quickFix**; if
  it occurs in **multiple** valid positions → emit the marker on the first occurrence but
  **omit the quickFix** (never auto-replace when we can't be sure which one is the offender).

### Diagnostics context (replaces the single `syntaxError`)
- `app/components/provider.ts`: replace `SyntaxErrorContext` with `DiagnosticsContext`
  carrying `DiagnosticsResult | null` + setter. (The separate `UserFriendlyMessage.syntaxError`
  used for the highlighted *toast* description stays — that's a different concern.)

### `app/providers.tsx`
- In the query-failure `catch`, `setDiagnostics(computeEditorDiagnostics(newQuery.text, errorMessage))`.
  Clear on a new run and on graph switch (mirrors today's `setSyntaxError(null)`).

### `app/components/CypherEditor.tsx`
- Replace the decoration effect with a **markers** effect that applies to **both** editor
  models (main + dialog), not just the active one, so toggling maximize can't surface a
  stale model. Each marker carries `source: "cypher-diagnostics"` and a `code`. Clear by
  calling `setModelMarkers(model, "cypher-diagnostics", [])` on **every** model on
  cleanup / empty / query change.
- **Stale guard:** before applying, only set markers whose `sourceQuery === model.getValue()`
  (the diagnostics may have been computed for a query the user has since edited).
- Keep a `diagnosticsRef` (current `EditorDiagnostic[]`) for the code-action provider.

### Code actions (quick fixes) — register **once per `CypherEditor`**, dispose on unmount
- One `monaco.languages.registerCodeActionProvider(LANGUAGE_NAME, provider)` registered a
  single time for the `CypherEditor` lifecycle (NOT per `EditorComponent` — there are two,
  which would duplicate). Guard with a ref; dispose on unmount.
- `provideCodeActions(model, range, context)` must **not** filter `context.markers` by
  `owner` (Monaco's `IMarkerData` has no `owner`). Instead match on our marker `code`
  (set as marker `code`/`source`) — or call
  `monaco.editor.getModelMarkers({ owner: "cypher-diagnostics", resource: model.uri })` —
  then delegate to the pure `codeActionEditsForMarkers(diagnosticsRef.current, markers)` to
  build the `WorkspaceEdit`s. Don't match by `message` (it changes when hints are appended).

---

## 3. Token location & range rules (precise)

All locators first compute `masked = maskCommentsAndStrings(query)` — every char inside a
`//`/`/* */` comment or a quoted string is replaced by a space **of the same length**, so
offsets stay valid and we never mark inside a string/comment.

`locateFunctionToken(query, token)` — a function call: match the token **immediately
followed by `(`** (allowing whitespace), supporting dotted/namespaced names by escaping
the token: `new RegExp(\`${escapeRegExp(token)}\\s*\\(\`)`. This avoids marking a variable
or alias that merely shares the name. Backtick-quoted names are out of scope (no marker).

`locateVariableToken(query, token)` — a variable reference: match `\b${escapeRegExp(token)}\b`
that is **not** immediately preceded by `.` or `:` (so `n.name`'s property and `:Label`'s
label are skipped). If the only occurrences are property/label-qualified → no marker.

Both return the matched location plus `validOccurrenceCount` so the caller applies the
**ambiguity policy** (count `1` ⇒ range usable for a quick fix; `>1` ⇒ first occurrence,
marker-only); if none qualifies → `undefined` ⇒ no diagnostic (toast only).

`offsetToPosition(text, index)`: `lineNumber = (count of "\n" before index) + 1`;
`column = index − lastNewlineIndexBefore` (1-based).

**Syntax-error range rules** (server columns can point at whitespace, punctuation, EOF, or
a line end):
- clamp `line`/`column` into the model's bounds;
- prefer the word at the column; if there's no word char there, underline a **single
  character** (or the nearest punctuation), never a zero-width range;
- the editor applies `model.validateRange(...)` before `setModelMarkers` as a final guard.
- Unit tests cover EOF, trailing whitespace, punctuation, multi-line, and column-at-line-end.

---

## 4. UX

```
MATCH (person) RETURN prsn                   RETURN lenght("hi")
                      ~~~~ (red squiggle)            ~~~~~~ (red squiggle)
  hover: 'prsn' not defined.                  hover: Unknown function 'lenght'.
         💡 Did you mean person?                     💡 Did you mean length()?
  💡 Quick Fix ▸ Replace with `person`         💡 Quick Fix ▸ Replace with `length`
```
(The `WITH … AS` / direction / `toInteger` fixes are **stretch**, not v1 — see §1/§5.)
Whole-query errors (timeout, OOM, …) show only the existing toast — no editor marker.

> Marker hovers are **plain text** (Monaco marker `message`, not a `MarkdownString`), so the
> hover is `` `${message}\n\n💡 ${hint}` `` — newlines and the 💡 emoji are fine, but no
> markdown links/formatting. (Richer markdown would need a separate hover provider — extra
> scope, deferred.)

---

## 5. Phasing (ship incrementally)

1. **Phase 1 — markers foundation.** Introduce `EditorDiagnostic` + `DiagnosticsContext`;
   migrate syntax errors from decoration → `setModelMarkers` (applied/cleared on **both**
   models; stale guard). Behavior parity, IDE-grade squiggle. (Self-contained.)
2. **Phase 2 — token-local semantic markers.** `Unknown function` / `not defined` markers
   with plain-text hover = message + Idea #1 suggestion.
3. **Phase 3 — quick fixes (replace-with-suggestion only).** Code-action provider
   registered once; pure `codeActionEditsForMarkers` mapping; the only fix is "Replace
   `<typo>` with `<suggestion>`".
4. **Phase 4 — stretch.** (a) Cypher-aware quick fixes (add `AS`, direction, `toInteger`)
   *only* with a conservative locator; (b) proactive as-you-type schema lint (warning
   markers for unknown labels/properties from `app/api/graph/model.ts`).

---

## 6. Testing — 100% coverage of the new logic + real-DB smoke tests

- **Unit (100% on `lib/cypherDiagnostics.ts`)**, gated like Idea #1 via
  `--test-coverage-include`:
  - `offsetToPosition` (first/last line, multi-line, line-end);
  - `locateFunctionToken` (dotted name; not matching a same-named variable; inside
    string/comment → none) and `locateVariableToken` (skips `n.name` property and
    `:Label`; first occurrence; none → undefined);
  - syntax range rules (column at whitespace / punctuation / EOF / line-end → clamped,
    never zero-width);
  - `computeEditorDiagnostics` (syntax / unknown-function / undefined-variable → ranges +
    hint + quickFix; whole-query error → `[]`; `sourceQuery` echoed back);
  - **`codeActionEditsForMarkers`** (the pure marker→edit mapping): matches by `code`,
    no duplicate actions, ignores markers whose range no longer matches a diagnostic,
    produces the correct replacement `range` + `newText`.
- **Smoke vs real FalkorDB** (extend the Idea #1 smoke): run `RETURN lenght(1)` /
  `MATCH (person) RETURN prsn`, feed the real error + query into
  `computeEditorDiagnostics`, assert the range covers the token and the quickFix `newText`
  equals the suggested name. Same `FALKORDB_SMOKE` gating + CI job.
- **Component behavior** (not pure): the marker lifecycle is the bug-prone part, so cover
  it with a focused test/asserted-path — apply on run, **clear on edit**, **clear on both
  models when toggling maximize**, and the **stale guard** (diagnostics for an old query
  are not applied to an edited model).
- **E2E (Playwright)**: one minimal assertion that a bad query renders a marker
  (`.squiggly-error` decoration in the DOM). Keep it as smoke only — Monaco DOM classes are
  theme/virtualization-dependent; rely on unit/smoke for correctness depth.

---

## 7. Docs (browser) + PR

- **README**: add an "Errors in the editor" note (squiggles + hover + quick fixes) and any
  new test commands.
- **PR**: **new PR recommended** (Idea #2 is a substantial, self-contained editor feature;
  keep it off the already-large #1861). Title e.g.
  `feat: inline editor diagnostics and quick fixes for Cypher errors`. Branch after #1861
  merges (it depends on Idea #1's suggestion helpers). Draft description covers the
  markers model, the token-location approach, phasing, and the test/coverage/smoke story.

---

## 8. Risks & mitigations
- **Two editors (maximize dialog) → stale markers.** Apply **and clear** markers on **both**
  editor models on every change (and on cleanup), so toggling maximize never surfaces a
  stale model. Clear the owner's markers on unmount/HMR.
- **Async stale diagnostics.** A query can fail *after* the user has edited the editor.
  Diagnostics carry their `sourceQuery`; the editor applies markers only when
  `sourceQuery === model.getValue()`. Also clear on edit.
- **Code-action marker matching.** `IMarkerData` has no `owner`; match by our marker
  `code`/`source` (or `getModelMarkers({ owner, resource })`), never by `message`.
- **Provider duplication.** Register the code-action provider exactly once per
  `CypherEditor` (guard ref), dispose on unmount — not per `EditorComponent` (there are two).
- **Ambiguous/odd tokens.** Type-specific locators (function `token(`; variable not after
  `.`/`:`); backticked names unsupported (no marker). Per the ambiguity policy: not
  locatable → no marker; exactly one valid occurrence → marker + quickFix; multiple →
  marker on the first occurrence, **no** quickFix.
- **Unsafe quick fixes.** v1 ships only the single-range replace-with-suggestion fix; the
  ambiguous ones (AS/direction/toInteger) are deferred until a conservative locator exists.
- **E2E flakiness for markers.** Keep marker E2E minimal; depth lives in unit/smoke.

---

## 9. Step-by-step task list
1. Extract `maskCommentsAndStrings` in `lib/cypherSuggestions.ts` (shared, keep 100%
   coverage); add `lib/cypherDiagnostics.ts` (`offsetToPosition`, `locateFunctionToken`,
   `locateVariableToken`, `computeEditorDiagnostics`, `codeActionEditsForMarkers`) +
   100% unit tests; extend the coverage gate to include it.
2. `EditorDiagnostic`/`DiagnosticsResult` types + `DiagnosticsContext` (replace
   `SyntaxErrorContext`); `providers.tsx` computes/sets/clears diagnostics.
3. `CypherEditor.tsx`: decoration → `setModelMarkers` on **both** models, with stale guard
   and clear-on-edit; `diagnosticsRef`. (Phase 1 + 2)
4. Register the `CodeActionProvider` **once** (guard ref, dispose on unmount); wire it to
   `codeActionEditsForMarkers`; replace-with-suggestion fix only. (Phase 3)
5. Smoke test + minimal marker e2e; README; (Phase 4 stretch separately).
6. Validate: `next build`, `npm run test:coverage` (100%), smoke vs live FalkorDB,
   targeted e2e. New PR + description; monitor/resolve AI review.

## 10. Open decisions for you
1. **New PR (recommended) vs extend #1861?**
2. **Quick fixes in v1 (Phase 3) or defer?** (They're the most compelling part but add scope.)
3. **Proactive label/property lint (Phase 4) now or later?**
4. **Keep the inline character highlight alongside markers, or markers only?**
