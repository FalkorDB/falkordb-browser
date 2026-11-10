# Clearer Cypher Errors — Ideas Backlog

A prioritized list of ideas to keep improving how FalkorDB Browser explains query
errors. Ideas are ordered **top (highest value, do first) → bottom**, so the team
can plan and implement them in sequence. Each idea is written to be clear even if
you've never touched this code before.

Every idea below follows the same template:

- **Problem today** — what a user experiences now.
- **The idea** — the change, in plain language.
- **Example** — a concrete *before → after* so the value is obvious.
- **Why it's valuable** — the payoff.
- **How it would work** — grounded notes pointing at real files.
- **Impact / Effort / Depends on / Risks.**

---

## Where we are today (the baseline)

When you run a Cypher query that fails, FalkorDB Browser already:

1. Shows the database's error message instead of a cryptic blob.
2. For **recognized** errors, adds a short **💡 hint** that tells you how to fix it.
3. Shows that message + hint in three places: the **error toast**, the
   **query‑history tooltip**, and the **editor hover** (for syntax errors).
4. Offers a **"See more"** toggle to reveal the exact raw database error.

The hint logic lives in `lib/cypherErrors.ts` (a small catalog of ~16 known errors
mapped to fixed, static tips: `getCypherErrorHint(raw)` returns `{ id, hint }` or
`undefined`). It's wired into the UI through `lib/utils.ts`,
`components/ui/toaster.tsx`, `app/components/PaginationList.tsx`, and
`app/components/CypherEditor.tsx`.

**Example of today's behavior**

```
You run:   MATCH (n) WITH n.name RETURN n.name

Toast:
  Error
  WITH clause projections must be aliased
  💡 Every expression in a WITH clause must be aliased with AS,
     e.g. WITH count(n) AS total.
  See more ▸
```

That's good. The ideas below make it *great*.

### Ratings legend
- **Impact** — how much it helps users (Low / Medium / High).
- **Effort** — rough build cost (S = hours, M = a day or two, L = multi‑day).
- **Depends on** — anything that should ideally come first.

---

## 1. "Did you mean…?" suggestions — fix the exact typo

**Impact: High · Effort: S–M · Depends on: nothing · Risk: low**

### Problem today
When you misspell a **function name** or **variable**, we explain the *category* of
mistake but not the *specific* fix. You still have to spot the typo yourself.

### The idea
The browser knows the valid function names and the variables you defined in your
query. When the database reports an unknown function or undefined variable, compare
the bad name against those lists (using an edit‑distance "closest match"
algorithm) and suggest the real one. Only suggest when the match is close, so we
never guess wildly.

This idea covers the two cases that **actually produce a database error**:

| You typed | We compare against | Suggestion |
|-----------|--------------------|------------|
| `RETURN lenght("hi")` → *Unknown function 'lenght'* | function candidates | "Did you mean `length()`?" |
| `MATCH (person) RETURN prsn` → *'prsn' not defined* | variables bound in the query | "Did you mean `person`?" |

> Note: misspelling a **label** like `MATCH (:Persn)` does **not** cause an error —
> it simply matches nothing. So label/property suggestions are a *proactive editor
> warning*, not an error hint; they belong with idea **#2** (editor linting), not
> here.

### Example (before → after)

```
You run:   RETURN lenght("hello")

Before:
  Error
  Unknown function 'lenght'
  💡 Check the function name for typos. See the FalkorDB function reference…

After:
  Error
  Unknown function 'lenght'
  💡 Did you mean length()?
```

### Why it's valuable
This is the single biggest jump from "the computer says I'm wrong" to "the computer
hands me the fix." Typos are the most common mistake, and the suggestion is often
the exact text the user needs to paste back in — zero thinking required.

### How it would work (grounded)
- **Function candidates:** the editor already has a static `FUNCTIONS` array in
  `app/components/CypherEditor.tsx`, and also pulls remote graph functions + UDFs
  for autocomplete. Use those candidate sources (the static list alone may be
  incomplete).
- **Variables:** `CypherEditor.tsx` already extracts the variables bound in the
  query (it does this to color them). Reuse that set.
- Add a small `closestMatch(name, candidates)` helper (Levenshtein distance, with a
  max‑distance threshold so weak matches are dropped).
- Compute the suggestion where the error is shown — it can stay *out* of the pure
  `lib/cypherErrors.ts` catalog (which intentionally has no app dependencies) and
  layer on top of the catalog `id`.
- **Plumbing to be aware of:** the toast/history layer currently receives only the
  raw error/status/hint, not the failed query text or the candidate lists. Variable
  suggestions in particular need the query in scope, so this requires passing the
  failed query + candidates into the error‑presentation layer (or computing the
  enriched suggestion *before* calling `toast()`).

---

## 2. Show errors *in the editor*, where you're typing

**Impact: High · Effort: L · Depends on: shared token‑extraction (pairs with #1) · Risk: medium**

### Problem today
Only **syntax** errors get highlighted in the editor (via Monaco *decorations*).
For everything else the error appears only in a toast, away from the code — so you
must mentally map the message back to a spot in your query.

### The idea
Split editor feedback into two honest tiers, because not every error has a precise
location:

1. **Token‑local squiggles** — for errors we *can* pin to a token (unknown
   function, undefined variable, a locatable missing `AS`): underline that exact
   token and put the hint in its hover.
2. **Whole‑query diagnostics** — for errors with no single location (timeout,
   out‑of‑memory, write‑queue‑full, constraint violation, a type mismatch we can't
   localize): keep showing these as the toast / history hint / a small banner above
   the editor — **not** a fake token marker.

Use Monaco **markers** (`setModelMarkers`) for the squiggles + hover. A VS Code‑style
"Problems panel" is **not** built into standalone Monaco, so treat that (and
keyboard navigation between errors) as an optional extra we'd build ourselves.

### Example (before → after)

```
You run:   MATCH (n) WITH n.name RETURN n.name

Before: error only in a toast; the editor shows nothing.

After (token‑local squiggle in the editor):
  MATCH (n) WITH n.name RETURN n.name
                 ~~~~~~
                 └─ hover: "WITH projections must be aliased.
                            💡 Add AS, e.g. WITH n.name AS name"
```

### Why it's valuable
People read errors fastest when the error sits *on the line that caused it*. This
removes the "ok, but where?" step and makes the editor feel like a real IDE — while
being honest that some errors are query‑wide.

### How it would work (grounded)
- Today `CypherEditor.tsx` uses Monaco *decorations* for syntax errors only. Add
  `setModelMarkers` for proper squiggles + marker hovers.
- For token‑local non‑syntax errors there's no position from the server, so locate
  the offending token in the query text (e.g., find `lenght`, or the undefined
  variable name) and place the marker there. This token‑finding helper is the same
  one idea #1 needs — build it once, share it.
- **Bonus (proactive lint):** since we have the graph schema (`Labels`,
  `PropertyKeys` in `app/api/graph/model.ts`), we can *warn* about unknown labels /
  properties even though they don't error — e.g., a faint underline on `:Persn`
  with "No label `:Persn` exists. Did you mean `:Person`?"
- **Stretch — Quick Fixes:** Monaco's `registerCodeActionProvider` can offer
  one‑click fixes: add `AS name` to an unaliased `WITH`; add direction `->` to an
  undirected `CREATE`; wrap a value with `toInteger(...)`.

### Risks
- Token‑finding can mis‑locate when the same name appears twice; prefer the first
  occurrence and fall back to a whole‑query diagnostic if unsure.

---

## 3. "Explain / Fix with AI" button — handle the long tail

**Impact: High · Effort: M–L · Depends on: explicit‑send UX + a dedicated AI prompt mode · Risk: medium (privacy)**

### Problem today
Our catalog recognizes ~16 common errors. The other ~100+ possible database errors
(and messy multi‑clause queries) fall back to the raw message with no tailored
guidance.

### The idea
Add a **user‑initiated** "Explain with AI" / "Fix with AI" action on the error toast
and history item. On click, it sends your query + the exact error to an AI flow and
returns a plain‑English explanation and/or a corrected query.

### Example (before → after)

```
You run (an error our catalog does NOT recognize):
  MATCH (p:Person) WHERE avg(p.age) > 30 RETURN p

Before:
  Error
  An unexpected error occurred. Please try again.
  See more ▸  Invalid use of aggregating function 'avg'   ← raw only; no tailored help

After (click ✨ Explain with AI):
  "Aggregations like avg() can't be used inside a WHERE clause. Here's one
   way to fix it — compute the average first, then compare:
     MATCH (p:Person)
     WITH avg(p.age) AS avgAge
     MATCH (p:Person) WHERE p.age > avgAge
     RETURN p"
```

### Why it's valuable
No static catalog can cover every error or every weird query. The AI fills the gap
for the rare/complex cases — and because we feed it the *real* error, the answer is
specific to *your* query, not generic docs.

### How it would work (grounded)
- The app already has an AI chat (`app/graph/Chat.tsx`) and chat API
  (`app/api/chat/route.tsx`) built on `@falkordb/text-to-cypher`. **However**, that
  flow is oriented toward "turn a question into Cypher" and validates graph
  state — so this likely needs a **distinct prompt mode / endpoint** for "explain or
  fix this failed query," not just passing extra fields through the existing flow.
- When we *do* have a catalog hint, include it in the AI prompt so the AI's answer
  stays grounded and consistent with our other messaging.

### Privacy guardrail (must‑have)
- **Only** send on an explicit user click — never auto‑send a failed query.
- Respect the app's configured AI/provider settings (the query + error may go to an
  external model). Gate the button's visibility on those settings.

---

## 4. Learn which errors users actually hit (telemetry)

**Impact: Medium (compounding) · Effort: S–M · Depends on: nothing · Risk: low (with redaction)**

### Problem today
We're guessing which errors are most common, and we don't know which ones fall
through to the generic message in the wild.

### The idea
Count how often each recognized error fires, and — crucially — capture a
**privacy‑safe fingerprint** of the *unrecognized* ones so we know what to add next.

The trick that makes this safe **and** useful: before recording an unrecognized
error, **redact only the user‑controlled parts** (quoted identifiers, numbers,
string literals) while **keeping the public, non‑sensitive keywords** (function
names, the error‑template words). We learn the *shape* of the error — including
which function/feature it's about — without storing anyone's data.

### Example (before → after)

```
Raw unrecognized error (contains user data — never stored as‑is):
  Invalid input for function 'date': '2026-13-40'

Stored fingerprint (only the user literal is redacted — 'date' is a public
keyword, so we keep it):
  Invalid input for function 'date': '<value>'   ×137 this week

Action it drives:
  UNRECOGNIZED = 12% of all errors; 60% of those normalize to the
  datetime template above → the next catalog entry to add is datetime parsing.
```

### Why it's valuable
Turns the roadmap from opinion into data. Every later improvement (more hints,
better suggestions) gets pointed exactly where users are actually getting stuck —
without collecting raw queries or personal data.

### How it would work (grounded)
- `getCypherErrorHint()` already returns a stable `id`. Emit a count for that `id`;
  for `undefined`, emit the redacted fingerprint instead.
- Redaction is a small client‑side function: replace quoted tokens / numbers with
  placeholders, but keep a short allow‑list of public keywords (function names,
  error‑template words) so the fingerprint stays actionable. Record only counts +
  fingerprints, never the raw query.
- Optional: a "Was this hint helpful? 👍 👎" control to measure hint quality.

---

## 5. Cover more errors and stay in sync with the database

**Impact: Medium · Effort: M · Depends on: #4 to prioritize; coordinate with #6 · Risk: low**

### Problem today
The database defines ~120 error templates (`EMSG_*` in its `error_msgs.h`); we have
hints for ~16. New database versions can also reword a message and silently break
our text matching.

### The idea
Two parts, deliberately staged to avoid wasted work:
1. **Now:** add a *few* high‑frequency entries (driven by idea #4's data) — cheap,
   high‑value.
2. **Before investing in 100+ mappings:** coordinate idea #6 (structured codes
   upstream). If stable codes are coming, we don't want to hand‑write and maintain a
   hundred fragile regexes.

Plus a **drift guard:** an automated test that runs known‑bad queries against a real
FalkorDB and asserts each is still recognized — so a future reword fails CI, not the
user.

### Example (before → after)

```
Before (a real but unhandled error — falls through to the generic message,
with the raw text tucked behind "See more"):
  Error
  An unexpected error occurred. Please try again.
  See more ▸  Type mismatch: list expected to have a single element, but had 3

After (new catalog entry — the real message is shown, plus a hint):
  Error
  Type mismatch: list expected to have a single element, but had 3
  💡 This spot expects a single value but got a list. Use a function like
     head(list) or an index list[0], or aggregate it first.
```

### Why it's valuable
More coverage = more users get a helpful hint. The drift guard means the feature
keeps working as FalkorDB evolves instead of quietly rotting.

### How it would work (grounded)
- Add entries to `lib/cypherErrors.ts` in the same anchored‑pattern style, each
  citing its `EMSG_*` source.
- The drift guard mirrors the manual check done during development: spin up a
  FalkorDB container, fire the bad queries, assert `getCypherErrorHint()` matches.
  Gate it as an opt‑in CI job (like the existing Playwright e2e).

---

## 6. One source of truth: structured error codes

**Impact: Medium–High · Effort: L · Depends on: upstream coordination · Risk: medium (cross‑repo)**

### Problem today
We recognize errors by matching English text (e.g., the words "not defined"). This
is fragile (a reworded message breaks it) and English‑only (blocks translation).

### The idea
Match on a **stable error code** instead of words — the way Postgres uses SQLSTATE
codes. Two possible routes:
- Port the hint catalog **upstream into the `falkordb` JavaScript client**
  (mirroring what falkordb‑rs already did with `mitigation_hint()` in PR #248), so
  the mapping lives in one place and every JS app benefits; or
- Have the **database return a structured error code** alongside the message.

The browser then keeps only its unique, context‑aware layer (the "Did you mean?"
suggestions from idea #1).

### Example (before → after)

```
Before (brittle, English‑only):
  if (message.includes("not defined")) { /* show hint */ }

After (stable, translatable):
  if (error.code === "VAR_NOT_DEFINED") { /* show localized hint */ }
```

### Why it's valuable
Robustness and reuse: messages can change wording without breaking us, the logic
isn't duplicated across projects, and translation becomes possible. This is the
"do it properly" foundation that ideas #5 and #7 lean on.

---

## 7. Translations and accessibility

**Impact: Medium · Effort: S–M · Depends on: #6 makes i18n much cleaner · Risk: low**

### Problem today
Hints are English‑only static strings, and a screen‑reader user may hear only
"Error" without the helpful detail.

### The idea
- **i18n:** move hint text into a translatable message catalog so non‑English users
  get hints in their language (stable error codes from #6 make this clean).
- **Accessibility:** announce the hint and wire up the "See more" toggle properly —
  add `aria-controls` linking the toggle to the raw‑error region, and an `aria-live`
  region so the hint is read aloud when the toast appears. (We already added
  `aria-expanded`; this finishes the job.)

### Example (before → after)

```
i18n:
  Before (always English):  💡 Check the function name for typos.
  After (Spanish locale):   💡 Comprueba si el nombre de la función es correcto.

Accessibility (what a screen reader announces):
  Before:  "Error."
  After:   "Error. Unknown function 'lenght'. Hint: did you mean length?"
```

### Why it's valuable
Reaches more users (non‑English speakers, screen‑reader users), so the error help
works for *everyone*, not just some.

### How it would work (grounded)
- Replace literal hint strings with keys resolved through an i18n layer; the
  `getCypherErrorHint` `id` is a natural translation key.
- In `components/ui/toaster.tsx`, give the raw‑error block an `id`, point the toggle
  at it via `aria-controls`, and wrap the description in an `aria-live="assertive"`
  region.

---

## 8. Low‑hanging fruit (small, do anytime)

**Impact: Low–Medium · Effort: S each · Depends on: nothing**

Small, self‑contained polish items that can slot in between larger efforts. Each has
a quick before → after so the payoff is clear:

- **Syntax hint in the toast too** — today the generic syntax hint shows only on
  editor hover.
  `Before:` syntax toast has no 💡. · `After:` `💡 Check for typos, missing commas,
  or unbalanced brackets/quotes near the highlighted spot.`
- **Merge the one‑off mapping** — fold the existing special‑case for "exactly one
  relationship type" into the standard catalog so every error flows through one
  path. `Before:` two code paths. · `After:` one catalog entry (easier to test).
- **"Retry" button for *truly* transient errors only** — limit to **write‑queue‑full
  / network blips** (with backoff). `Before:` user re‑types and re‑runs. · `After:`
  one‑click Retry. *(Note: do NOT offer Retry for timeout/out‑of‑memory — those are
  usually deterministic and retrying just repeats an expensive query; prefer
  "simplify / add LIMIT / raise timeout".)*
- **Deep‑link the fix** — the query‑timeout hint links to the timeout field in
  Settings. `Before:` "raise the timeout in settings." · `After:` "Raise it in
  Settings →" (a real link).
- **"Learn more →" links** — each hint optionally links to the matching FalkorDB docs
  page. `Before:` hint only. · `After:` hint + "Learn more →".
- **Copy raw error** — a copy button next to "See more" for easy bug reports.
  `Before:` select‑and‑copy by hand. · `After:` one‑click copy.

---

## Summary table (plan order)

| # | Idea | Impact | Effort | Why this order |
|---|------|--------|--------|----------------|
| 1 | "Did you mean?" suggestions | High | S–M | Biggest UX win; data already in‑app |
| 2 | Errors in the editor (markers + quick fixes) | High | L | IDE‑grade; shares token‑finding with #1 |
| 3 | Explain / Fix with AI | High | M–L | Covers the long tail; needs privacy + prompt mode |
| 4 | Telemetry on error ids + fingerprints | Medium | S–M | Makes all later work data‑driven |
| 5 | More coverage + drift guard | Medium | M | More hits; stage with #6 to avoid rework |
| 6 | Structured error codes | Med–High | L | Robust, reusable, enables i18n |
| 7 | i18n & accessibility | Medium | S–M | Reach everyone; cleaner after #6 |
| 8 | Low‑hanging fruit | Low–Med | S | Quick polish, anytime |

**Recommended first step:** Idea #1 (function‑name "Did you mean?"), because the
function candidates are already in the editor and the payoff is immediate and
obvious. It also builds the shared token‑finding helper that idea #2 reuses.
