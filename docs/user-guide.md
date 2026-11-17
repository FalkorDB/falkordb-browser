# User guide

Behavior details for everyday work in FalkorDB Browser. For a tour of every page and panel, see the [feature overview](../readme-browser.md).

## Automatic query limiting

When the result limit in Settings is above 0, the browser adds `LIMIT <n>` to a query
whose final `RETURN` has none. A limit of 0 (shown as ∞) adds no `LIMIT`; trailing semicolons are still removed.

- Trailing semicolons are removed before the limit is added.
- A non-`UNION` query whose final `RETURN` already has a `LIMIT` keeps it.
- `UNION` queries are wrapped as `CALL { … } RETURN * LIMIT <n>`, even when a branch has its
  own `LIMIT`, so the limit applies to the combined result. A leading `CYPHER` parameter
  header stays outside the wrapper.
- Known limitation: `UNION` queries that contain a `CALL` clause, or start with `EXPLAIN` or
  `PROFILE`, are not wrapped; the limit is added to the last branch only.
- Known limitation: a final `RETURN` that reads a property named `limit` (e.g.
  `RETURN n.limit`) is mistaken for an existing `LIMIT`, so no limit is added.

## Error help

When a Cypher query fails, the browser shows the database's message together with an
actionable **💡 hint**. For a mistyped function or variable it offers a
**"Did you mean…?"** suggestion (e.g. `Unknown function 'lenght'` → *Did you mean
`length()`?*), computed from the built-in/UDF function list and the variables in your
query. The error is also surfaced **inline in the editor** as a red squiggle on the
offending token, with the hint on hover and a one-click **quick fix** to apply the
suggestion. As you type, unknown node labels that look like a typo of a known label are
flagged with a warning and a quick fix. When the static help isn't enough, a **"Fix with
AI"** button (shown only when a supported OpenAI-compatible model — OpenAI/Groq/xAI/Ollama/
LM Studio — is configured) sends the **query and its error** to your configured provider on an
explicit click and returns an explanation + a corrected query you can insert into the editor.
The full server message is always shown — recognized errors display it directly, and when the
toast shows a friendlier summary instead, you can expand **"See more"** to read the raw text and
use **"Copy"** for one-click copy into a bug report. Where helpful, a hint includes a
**"Learn more →"** link to the matching FalkorDB docs page, and the query-timeout hint deep-links
straight to the **timeout field in Settings**. Hints are currently English-only; localization is a
deliberate follow-up (it pairs with introducing stable structured error codes).
The logic lives in `lib/cypherSuggestions.ts`, `lib/cypherDiagnostics.ts`, and `lib/aiFix.ts`,
with the static hint catalog (and its optional docs/deep-links) in `lib/cypherErrors.ts` and the
clipboard helper in `lib/clipboard.ts`.

A few queries parse perfectly but are still certain to be rejected, so there is nothing to learn
from sending them. `lib/queryPreflight.ts` catches those at submit time — today, a `LOAD CSV`
source FalkorDB cannot fetch (it only accepts `https://` and `file://`). Run stays **enabled**,
because the query is not malformed; instead the request is stopped with an explanation and, when
uploading the file is what would fix it, an **"Upload CSV"** button that opens the Load CSV tab
with the storage and URI handled for you. Whether `file://` can resolve depends on the
deployment and nothing the browser can see settles it, so it is assumed to work unless you
set `LOAD_CSV_FILE_URI=false`.

## AI query optimization and drafts

The editor's **Optimize** action uses the model and provider configuration selected
in Settings, with an API key only for hosted providers.
Before each analysis, optionally describe what to optimize, such as reducing scans
or improving a specific join. This guidance is included only in that request's
prompt and is not saved or reused. Leave it blank for a general review.
Each analysis requires clicking **Analyze**; there is no remembered-consent checkbox.
Optimize and Fix with AI use the Responses API for hosted OpenAI models, including
GPT-5, the o-series and newer reasoning models, without unsupported temperature
settings. Older OpenAI families (GPT-3.5, GPT-4/GPT-4o/GPT-4.1, `chatgpt-*`,
`gpt-audio*` and their fine-tunes) and the other supported providers keep Chat
Completions with `temperature: 0` and the 30-second timeout. Responses requests allow
up to four minutes to finish. Reverse proxies, Kubernetes ingress controllers (often
60 seconds by default, e.g. `nginx.ingress.kubernetes.io/proxy-read-timeout` set via the
Helm chart's `ingress.annotations`) and serverless platforms must allow that long;
otherwise a slow reply surfaces as a generic Fix/Optimize error. Closing Optimize
cancels the request.
Fix with AI also offers **Cancel** while loading. Cancelling, changing the query,
tab, graph, connection, or page discards the old request; late replies cannot
replace a newer result.
It analyzes the query, available indexes, and `GRAPH.EXPLAIN` output without executing
the query. Expand **EXPLAIN execution plan** to inspect the plan used in the analysis.
If index metadata is unavailable, analysis continues with an explicit warning.

Fix with AI and Optimize share a suggested-query card with **Copy** and
**Insert into editor** actions. Chat offers the same actions with compact, fully
wrapped queries in a keyboard-scrollable, height-limited area, plus a
**Collapse query**/**Expand query** toggle for queries taller than a few lines.
Both presentations adapt to mobile screens. Neither action runs the query.

Missing AI configuration and provider errors offer **Go to Settings**. Returning
to the graph preserves the editor query and unsent Chat input. Debounced URL
updates wait for route transitions, so a draft update cannot cancel navigation
to Settings. Chat drafts are scoped to the connection, tab, and graph, and survive
closing and reopening Chat.
The transition guard covers mounted programmatic push/replace/refresh calls.
History back/forward and toast callbacks retained after unmount use Next's native
navigation without acquiring a transition token. Deferred URL updates are
discarded when the destination's path, search, or hash differs from their source.
Submitted Chat input remains saved until the request succeeds; newer edits or an
intentional clear take precedence over restoring a failed submission.
Optimize failures close the dialog and show only a toast with the Settings action.

## Graph operation ownership

Expansion, collapse and mutation repaints are tied to the graph, query result,
tab and connection that started them. A completed server mutation still updates
its owning graph model when that view is no longer active; only its canvas
repaint and active-view controls are skipped. Returning to a saved tab reconciles
its stored positions with the updated model.

Rendering large results in 3D is covered in [Large graphs in 3D](large-graphs-3d.md).

## Restoring graph tabs

Graph editing waits for saved tabs and the query timeout to initialize for the
current connection, while information panels and Chat remain accessible.
During initial connection discovery, restoration uses the signed session's
connection ID until the active connection is loaded. A connection switch never
restores tabs from a different connection's storage prefix.
If timeout configuration does not respond within five seconds, restoration uses
the 60-second fallback.

## Tutorial samples

- Each tutorial uses unique graph names and records ownership per connection.
  Cleanup deletes only samples whose creation was confirmed, never user graphs
  based on their names (including `social-demo`).
- Completed abandoned samples are reclaimed on app visits and tutorial start/close.
  Web Locks protect active tabs; without them, other tabs' records must be inactive
  for 24 hours. Failed cleanup retains ownership for retry without extending that
  inactivity window. Clearing browser storage removes ownership evidence.
- Unconfirmed creations are retained for manual verification, with a notice at
  most once per connection per browser session. They are never automatically
  deleted, even after a timeout or reload.
- Graph selection and saved-tab loads wait for recovery. Setup and Replay waits
  are bounded; a late creation remains tracked. Switching connections or closing
  on mobile cannot publish an old tutorial into a newer one; switching while the
  tutorial is open restarts it with samples on the new connection, leaving the
  old connection's samples recorded for its own cleanup. Background sample
  reads cannot recreate deleted graphs; explicit editor writes retain their
  normal permissions. Closing restores only user graphs verified to still exist.

## Database configuration

Successful database configuration edits offer **Undo**, which restores the immediately
preceding value, including zero. Load-time configuration values remain read-only.

## Personal access tokens

Custom expiration dates use the selected local calendar day, ending at
23:59:59.999 in the browser's timezone, including daylight-saving transitions.
