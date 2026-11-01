# Implementation Plan — Idea #6: stop stale graph results from applying after a connection / graph / query change

Goal: never let connection‑A (or graph‑A, or an older query's) results be **applied** to the UI, and
never let a superseded operation **auto‑create a ghost graph** on the wrong connection. Today only
`fetchCount` is safe; `runQuery`, `fetchInfo`, `handleFetchOptions`, the `selectGraph` dropdown
refresh, and the `GraphInfo` count fallback are not.

Closes the CodeRabbit thread on `app/providers.tsx:767` (PR #1934). **Behaviour bug fix, not
breaking.**

> Revised twice after rubber‑duck reviews. §10 traces every finding to the section that fixes it so a
> reviewer can confirm coverage.

---

## 0. Background — primitives that already exist

`lib/utils.ts`
- `_activeConnectionId` — injected as `X-Connection-Id` by `securedFetch`, `uploadFileWithProgress`,
  `getSSEGraphResult`, `getMetaStats`, `getMemoryUsage`. A request **snapshots** it **synchronously
  when called** (`:273`, `:700`) — a single in‑flight request is *not* re‑routed. The bug is that a
  multi‑step op reads the *current* global again for each **follow‑up** and applies without re‑check.
- `_connectionEpoch` — bumped by `setActiveConnectionIdGlobal(id)` only when the id changes (A→B→A
  detected). Read via `getConnectionEpoch()`.

`providers.tsx`
- Syncs the global every render (`~966`). On a real switch, a **reset effect** (`~1483`) clears graph
  state and re‑fetches the list — but does **not** abort in‑flight ops, so a late op re‑applies.
- `fetchCount` (`~667`) is the correct template: capture `{connectionId, epoch}`, early‑return if
  superseded, pin the request, wrap `toast`/`setIndicator` in guards, re‑check epoch **and**
  `activeGraphNameRef` before writing.

---

## 1. Why one epoch (or one generation) is not enough

Stale applies happen at four independent granularities — they must be tracked **separately**, or a
guard for one wrongly discards a still‑valid other:

1. **Connection** switch A→B (bumps epoch).
2. **Graph** switch A→B on the *same* connection (epoch unchanged; selection stays enabled during a
   query — `selectGraph.tsx:209‑232`).
3. **Newer query** on the same graph (two queries resolve out of order).
4. **Newer list refresh** vs an older one (and a query must **not** invalidate a valid list refresh —
   they are unrelated).

Plus a **transition window**: `ConnectionManager.handleSelect` (`ConnectionManager.tsx:37‑45`) sets
the **global** id (bumps epoch) *before* `await updateSession`, and sets **React**
`activeConnectionId` (which triggers the reset) *after*. The same happens on **add** (`~124‑128`) and
**remove‑active** (`~84‑89`). An op started in that window captures B's epoch while the UI still names
A's graph → can query/auto‑create A's graph on B and survive the reset.

---

## 2. Mechanism — four ownership tokens + connection pin + a switch gate

All refs live in `providers.tsx`. **Capture at op start, re‑check before every write.**

| Ref | Bumped synchronously when… | Owns (guards) |
| --- | --- | --- |
| `contextGenRef` | connection switch **begins** (`beginConnectionSwitch`), reset effect runs, or the **active graph name changes** (via one `commitGraphName`) | every graph/panel/list apply — the "what the UI represents" guard |
| `querySeqRef` | each `runQuery` starts | the graph/panel apply **and** the count write for that query |
| `optionsSeqRef` | each list refresh starts (`handleFetchOptions`) | `setGraphNames` / `setGraphName` auto‑select |
| `loadingOwnerRef` | claimed by a query at start | who may clear `isQueryLoading` |

**Apply rule for a query:** apply only if `contextGenRef.current === ctx` **and**
`querySeqRef.current === seq` (both captured at start). **Apply rule for a list refresh:** apply only
if `contextGenRef.current === ctx` **and** `optionsSeqRef.current === oseq`. A query bumps only
`querySeq` (not `optionsSeq`), so it never discards a valid list refresh, and vice‑versa.

**Connection pin (routing):** still capture `connectionId` at start and pass it to **every** request
so calls hit the right backend before React settles; keep `epoch`‑based `guarded*` toast/indicator
wrappers, but the wrappers additionally check the **op's token** (`contextGen`+`querySeq`) so
same‑connection supersession also silences stale toasts.

**Switch gate (ticket‑based):** `beginConnectionSwitch(targetId): SwitchTicket | null` — **no‑op
returning `null` if `targetId === activeConnectionId`**; else create `{ id: ++switchTicketSeq, target }`,
store it as the latest in `switchingRef.current`, bump `contextGen`, and return it. Graph ops
(`runQuery`, dropdown refresh) **reject whenever `switchingRef.current !== null`** — the block
condition is simply "a switch ticket exists", **not** a global‑vs‑React id comparison (unreliable
because the render‑sync at `~966` can transiently restore the old global during `await updateSession`).
ConnectionManager owns the lifecycle:
- Mutate `setActiveConnectionIdGlobal` / React `setActiveConnectionId` / `localStorage` **only after a
  successful `updateSession`**, so a rejected switch leaves ids consistent.
- On success, `completeConnectionSwitch(ticket)`; the reset effect (driven by the React id change)
  clears `switchingRef` **iff it still holds this ticket** (latest‑wins for concurrent switches; a
  superseded older completion is ignored).
- On reject, `cancelConnectionSwitch(ticket)` clears it iff current and restores prior ids.
  **Remove‑active** is special: the old connection is already deleted, so on failure fall back to
  another remaining connection instead of restoring the deleted one.
Expose `beginConnectionSwitch` / `completeConnectionSwitch` / `cancelConnectionSwitch` via
`ConnectionContext`. **`bumpContextGen` also releases the spinner** (`loadingOwnerRef.current = null;
setIsQueryLoading(false)`), so a switch/graph‑change can't strand it; a new `runQuery` re‑claims.

---

## 3. Per‑function changes

### 3a. Central graph‑name commit — `commitGraphName(name)` (new)
Graph name is set at several sites that currently bypass `handleSetGraphName`:
`providers.tsx:1407`, `:1417`, `:1498` (reset), plus the new auto‑select. Route **all** through:
```ts
const commitGraphName = useCallback((name: string) => {
  if (name === activeGraphNameRef.current) return; // no change → no bump
  activeGraphNameRef.current = name;               // authoritative NOW (the ref otherwise only refreshes at render, ~633)
  bumpContextGen();                                // also releases spinner ownership (§2)
  setGraphName(name);
}, [/* stable setters/refs */]);
```
`handleSetGraphName` delegates to it, and **`runQuery` defaults `n` to `activeGraphNameRef.current`**
(not its stale render closure) so a same‑tick commit is seen. This makes graph‑change bumps
synchronous and single‑sourced.

### 3b. ConnectionManager — ticket lifecycle at all 3 switch sites
`handleSelect`, add‑auto‑switch (`~124‑128`), and remove‑active‑switch (`~84‑89`) call
`beginConnectionSwitch(target)` **first**; if it returns `null` (already active) they proceed
unchanged. Reorder each to: `await updateSession(...)` → **on success** set global/React/localStorage
ids + `completeConnectionSwitch(ticket)`; **on reject** `cancelConnectionSwitch(ticket)`
(remove‑active recovers to another remaining connection). The reset effect clears `switchingRef` only
if it still holds the completing ticket, so a superseded older switch can't reopen graph ops for the
wrong target.

### 3c. `fetchInfo(type, name, pin?)` (`~720`) — sole caller is `runQuery` (verified: only `:813`)
Accept the caller's pin; guard with the op token, not epoch‑only:
```ts
const cid = pin?.connectionId !== undefined ? pin.connectionId : getActiveConnectionIdGlobal();
const isCurrent = pin?.isCurrent ?? (() => getConnectionEpoch() === startEpoch);
const gToast = ((...a) => { if (isCurrent()) toast(...a); }) as typeof toast;
const gInd   = (i) => { if (isCurrent()) setIndicator(i); };
```
- property‑key branch: `getSSEGraphResult(url, gToast, gInd, { connectionId: cid })`; `if (!isCurrent()) return [];` after it.
- generic branch: `securedFetch(url, { method:"GET" }, gToast, gInd, cid)`; discard **after `await result.text()`** and after parse.
- `!== undefined` for the pin so an explicit `null` is honoured.

### 3d. `fetchMetaStats(name, options?)` (`~769`) — forward pin + guarded callbacks
`getMetaStats` already takes `{ signal, connectionId }`. Widen the wrapper to accept
`{ connectionId, isCurrent }` and build `gToast/gInd` from `isCurrent` before delegating.

### 3e. `fetchCount` (`~667`) — add an ownership predicate for the count write
`fetchCount` already pins connection/epoch, but two same‑graph queries share graph name **and** epoch,
so its count write can be overwritten out of order. Add optional `options.isCurrent?: () => boolean`;
when present, require `isCurrent()` (in addition to the existing graph/epoch checks) before
`setNodesCount/setEdgesCount`. Standalone/periodic callers omit it (unchanged).

### 3f. `runQuery` (`~777`) — capture all tokens, pin all requests, guard every apply site
1. **Reject** up front if a switch is in progress (§2 gate).
2. **Capture:** `const ctx = contextGenRef.current; const seq = bumpQuerySeq(); const cid = getActiveConnectionIdGlobal(); const epoch = getConnectionEpoch();` and
   `const isCurrent = () => contextGenRef.current === ctx && querySeqRef.current === seq;`
   Claim the spinner: `loadingOwnerRef.current = seq;`
3. **Pin** every request to `cid` and pass `isCurrent`:
   - SSE query: `getSSEGraphResult(url, gToast, gInd, { query: q, connectionId: cid })`.
   - `fetchMetaStats(n, { connectionId: cid, isCurrent })`.
   - `fetchInfo("(property key)", n, { connectionId: cid, isCurrent })`.
   - `getMemoryUsage(n, gToast, gInd, cid)`.
   - `/explain`: `securedFetch(url, { method:"GET" }, gToast, gInd, cid)`.
   - `Graph.create(...)` — pass `cid` so the `GraphInfo` count fallback is pinned (see §4).
   - `fetchCount(n, { connectionId: cid, epoch, isCurrent })`.
4. **Discard checks:** `if (!isCurrent()) return;` immediately after `Promise.all([...])`, after
   `/explain`, and again right **before** `setGraph(g)` (guards the whole success block:
   `setGraph`, `setGraphInfo`, `setData`, `fetchCount`, `setCurrentTab`, `setConnectionItem`, history
   writes, `setViewport`, `setGraphData`, `setSearch`, `setScrollPosition`, `handleCooldown`).
5. **Catch (`884‑901`):** wrap the whole body in `if (isCurrent()) { … }` — a superseded failure must
   not write diagnostics/`lastFailure`/history.
6. **`finally` (`903‑904`):** `if (isCurrent()) setUrlQueryText(newQuery.text);` and clear loading
   **only if this run owns it**: `if (loadingOwnerRef.current === seq) { loadingOwnerRef.current = null; setIsQueryLoading(false); }`.

### 3g. `fetchOptions` (`lib/utils.ts:1145`) — return data, stop mutating, add a pin
It currently calls **both** `setOptions` and `setSelectedValue` (single‑graph auto‑select). Refactor
to pure‑ish return so callers guard both:
```ts
export async function fetchOptions(toast, setIndicator, indicator, connectionId?: string | null):
  Promise<{ opts: string[]; autoSelect: string | null } | null> { … securedFetch(`/api/graph`, …, connectionId) …
  return { opts, autoSelect: opts.length === 1 ? formatName(opts[0]) : null }; }
```

### 3h. `handleFetchOptions(opts?)` (`~1370`) — non‑destructive refresh, guarded list + auto‑select
Do **not** blank the list on an ordinary refresh (that reintroduces the empty‑selector bug PR #1934
fixed in `selectGraph`). Only the **connection‑reset** path clears it; drive the spinner off a local
`loading` flag instead of `setGraphNames(undefined)`. The list is **connection‑scoped** (guard by
connection epoch + `optionsSeq`); the auto‑select is **graph‑scoped** (also guard by `contextGen`):
```ts
const ctx = contextGenRef.current; const oseq = bumpOptionsSeq();
const cid = getActiveConnectionIdGlobal(); const epoch = getConnectionEpoch();
if (opts?.clear) setGraphNames(undefined);            // only the reset effect passes { clear: true }
const res = await fetchOptions(gToast, gInd, indicator, cid);
if (getConnectionEpoch() === epoch && optionsSeqRef.current === oseq) {
  if (res) setGraphNames(res.opts);                   // on network error keep the last good list
  setGraphNamesLoaded(true);
  if (res?.autoSelect && contextGenRef.current === ctx) commitGraphName(res.autoSelect);
}
```
Expose `handleFetchOptions` on `GraphContext` (move its declaration above the context memo). The reset
effect calls `handleFetchOptions({ clear: true })`.

### 3i. `selectGraph.tsx` dropdown refresh (`:75‑77`, `:196‑203`) — the 2nd `fetchOptions` caller
Replace the direct `fetchOptions` call with the provider's guarded `handleFetchOptions` (now on
`GraphContext`), so all graph‑list fetching flows through one guarded path. (This also removes the
duplicate offline/auto‑select logic.)

---

## 4. Pin the `GraphInfo` count fallback (rubber‑duck #6 — TOCTOU)
`Graph.create` **yields** while building elements and then calls the unpinned fallback:
`providers.tsx:839` → `model.ts:825/855` (`createLabel`/`createRelationship`) → `model.ts:187/215` →
`model.ts:172` `getMetaStatsCount` → `getMetaStats(graphName, toast, setIndicator)` (no connection).
Because `Graph.create` uses the **supplied** `GraphInfo` instance unchanged (`model.ts:470‑476`),
passing `cid` only to `Graph.create` is insufficient — the pin must live **on the `GraphInfo`
instance** that `runQuery` builds at `providers.tsx:818`:
- `GraphInfo.create(propertyKeys, labels, rels, memory, toast, setIndicator, cid, isCurrent)` stores
  `connectionId` (+ a guarded toast/indicator) on the instance.
- `getMetaStatsCount` → `getMetaStats(graphName, gToast, gInd, undefined, { connectionId: this.connectionId })`.
- Preserve the pin through `GraphInfo.clone()` and `GraphInfo.empty()` so it is never lost.
`runQuery` thus builds `graphI` already pinned; `Graph.create(n, result, …, graphI)` needs no new arg.
Done **now** — the pre‑`Graph.create` guard alone can't close the mid‑creation window.

---

## 5. Testing

Provider callbacks aren't unit‑tested directly (repo convention: pure logic is extracted + e2e).

### 5a. Unit (`node:test`)
- `securedFetch` and new `fetchOptions` forward an explicit `connectionId` (string **and** `null`) and
  fall back to the global on `undefined`.
- If token helpers are extracted to a pure module: monotonic bump + supersede semantics, incl.
  independence of `querySeq` vs `optionsSeq`.

### 5b. E2E — deterministic races (`e2e/tests/connectionSwitchRace.spec.ts`, `@admin`, 2 connections)
Each asserts **(i)** no ghost graph on B via a **fresh `/api/graph` list request** (not the cached
selector) and **(ii)** the panel/graph reflect the current selection:
1. **Connection switch mid‑query** — delay A's SSE response (route the URL; it contains a literal
   `?query=`, use a **URL predicate**, not `%3Fquery=`), switch to B before it resolves.
2. **Graph switch mid‑query (same connection)** — delay a query on graph A, select graph B.
3. **Two out‑of‑order queries on the same graph** — the newer result wins; the older is dropped.
4. **Options‑refresh / query overlap** — a delayed list/auto‑select from A must not select on B, and a
   query must not blank the list.
5. **Stale failure** — delay‑then‑fail A's query, switch, assert no diagnostics/history/URL from A.
6. **Spinner release** — after a supersede‑without‑new‑run (e.g. graph cleared), `isQueryLoading` is
   released (no stuck spinner).
Use `urlPath()` for navigation asserts (repo e2e memory). Each new test must **fail on pre‑fix
`staging`** and pass after.

### 5c. Gate
`npm test`, `npm run lint`, `npm run test:coverage`, `npx tsc --noEmit`, full Playwright — the exact
commands CI runs — all green.

---

## 6. Docs + PR
Title: `fix(providers): guard graph ops by connection + generation to stop stale applies`. Body links
the thread (`providers.tsx:767`), the §1 races, and per‑function before/after. Comment each guard
pointing at `fetchCount`. No README change.

---

## 7. Risks & mitigations
| Risk | Mitigation |
| --- | --- |
| Over‑eager discard drops valid results. | Four **separate** tokens (§2); a query never invalidates a list refresh and vice‑versa; capture‑once per op. E2e "no switch → applies" path. |
| Stuck spinner. | `loadingOwnerRef`: claim on start, clear only by owner in `finally`, and explicitly release on context invalidation; **guard the other clear site `page.tsx:347`** by ownership. E2e #6. |
| `GraphInfo` fallback TOCTOU. | §4 threads `connectionId` into `GraphInfo`/`getMetaStatsCount` — done now. |
| Transition window / add / remove switches. | §2 `beginConnectionSwitch` at all 3 sites, synchronous, with failure cleanup + latest‑switch ownership. |
| Same‑connection graph/concurrent races. | `contextGen` (graph) + `querySeq` (newer query) + `isCurrent` in `fetchCount`/`fetchInfo`/`fetchMetaStats`. |
| Auto‑select / 2nd caller leaks. | §3g returns data; §3h guards both; §3i centralizes `selectGraph`. |
| Signature ripples. | New params optional; both `fetchOptions` callers updated here; `tsc`+lint verify. |
| Hard to prove. | The 6 deterministic Playwright races (§5b) are the acceptance criterion. |

---

## 8. Step‑by‑step task list
1. `lib/utils.ts`: `fetchOptions` returns `{opts, autoSelect}` + optional `connectionId`; unit‑test connection forwarding.
2. `app/api/graph/model.ts`: thread `connectionId` through `GraphInfo.create`/`getMetaStatsCount`/`Graph.create` (§4).
3. `providers.tsx`: add `contextGenRef`/`querySeqRef`/`optionsSeqRef`/`loadingOwnerRef` + bump helpers; `commitGraphName`; expose `beginConnectionSwitch` + `handleFetchOptions` on context.
4. `ConnectionManager.tsx`: call `beginConnectionSwitch` first at select/add/remove‑active, with failure cleanup.
5. `providers.tsx`: `fetchInfo` pin + token guards (post‑`text()` check, `!== undefined`).
6. `providers.tsx`: `fetchMetaStats` forward pin + guarded callbacks.
7. `providers.tsx`: `fetchCount` optional `isCurrent` before count writes.
8. `providers.tsx`: `runQuery` capture tokens; pin all; guard after `Promise.all`, after `/explain`, before `Graph.create`, before success apply, in catch, in `finally` (owner‑based loading release).
9. `providers.tsx`: `handleFetchOptions` guard list + auto‑select via `optionsSeq`+`contextGen`; route auto‑select through `commitGraphName`.
10. `selectGraph.tsx`: use guarded `handleFetchOptions` for the dropdown refresh.
11. `e2e/tests/connectionSwitchRace.spec.ts`: the 6 races (must fail pre‑fix).
12. Full CI command set; iterate to green.

---

## 9. Effort / sequencing note
This is genuinely a **large, multi‑file concurrency change** (providers.tsx, lib/utils.ts,
model.ts/GraphInfo, ConnectionManager.tsx, selectGraph.tsx, new e2e). Suggested landing order behind
the tokens: (a) `commitGraphName` + tokens + `runQuery` guards, (b) `fetchInfo`/`fetchMetaStats`/
`fetchCount` pins, (c) `handleFetchOptions` + `selectGraph` + `fetchOptions`, (d) `GraphInfo` pin, (e)
switch gate, (f) e2e — each step green before the next.

---

## 10. Rubber‑duck findings addressed (traceability)
**Round 1** — auto‑select unguarded → §3g/§3h; 2nd `fetchOptions` caller → §3i; `runQuery`
catch/`finally` → §3f.5–6; guarded callbacks not threaded → §3c/§3d + guarded direct info toast;
epoch insufficient → §2 tokens; unpinned `GraphInfo` fallback → §4; transition window → §2 gate;
`??` vs `!== undefined` → §3c; post‑`text()` discard → §3c; `fetchInfo` sole caller is `runQuery` → §3c.
**Round 2** — pre‑create guard TOCTOU → §4 (pin now, not defer); single `opGen` couples ops → §2 four
separate tokens; `fetchCount` count write not generation‑guarded → §3e; graph‑name bumping not
centralized → §3a `commitGraphName` (covers `:915/:1407/:1417/:1498` + auto‑select); loading ownership →
`loadingOwnerRef` + `page.tsx:347` guard (§3f.6/§7); switch‑gate lifecycle (no‑op active, updateSession
reject, add/remove sites, latest ownership) → §3b; new tests (out‑of‑order, overlap, fallback, spinner)
→ §5b #3/#4/#6.
**Round 3** — switch gate must block on "ticket exists" (not global≠React, unreliable via `~966`
render‑sync) + mutate ids only after a successful `updateSession` + ticket `complete`/`cancel` API +
remove‑active recovery → §2/§3b; `handleFetchOptions` must **not** destructively blank the list (keep
last good list on refresh/error; only reset clears) → §3h; `GraphInfo` pin must bind onto the supplied
instance and survive `clone()`/`empty()` (passing `cid` to `Graph.create` alone is insufficient —
`model.ts:470‑476`) → §4; `commitGraphName` must set `activeGraphNameRef.current` synchronously and
`runQuery` read from it → §3a. Confirmed sound by the reviewer: `querySeq`/`optionsSeq` independence,
`isCurrent` in `fetchCount`, all `setGraphName` sites covered, single external loading clear, no
self‑invalidation in the normal flow, and the begin/reset double‑bump being harmless (equality tokens).

---

## 11. Open decisions for you
1. **Target branch** — `staging` (normal promotion) or `main` directly? Plan assumes **`staging`**.
2. **Abort on switch** — out of scope (the token guard already prevents stale *applies*), or also add
   `AbortController` to stop wasted work now? Plan assumes **out of scope** (follow‑up).
3. **Token extraction** — inline refs in `providers.tsx`, or a small pure `lib/opGuards.ts` for unit
   tests + reuse? Plan assumes **inline first**, extract only if it eases testing.
