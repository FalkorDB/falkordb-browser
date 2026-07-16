# Implementation Plan — Idea #7: converge overlapping connection switches (minimal, single-tab)

Goal: when a user triggers overlapping connection switches (A→B→C) **in one tab**, the persisted JWT
cookie, the React UI state, the module-global id, and the switch gate must all converge on the
**last successfully-committed** connection — and a failed or superseded switch must never leave those
out of sync or leave the gate stuck.

Closes the **🔴 Critical** CodeRabbit thread on PR #1951
(`app/components/ConnectionManager.tsx#L51-69` + `app/providers.tsx#L1615-1620`):

> **The ticket still does not serialize the session mutation.** An older `updateSession` can complete
> after the latest switch and overwrite the JWT/session before failing `isLatestSwitch`. Resetting all
> pending slots then reopens graph operations while that older session mutation remains in flight.
> Serialize session updates or enforce latest-wins server-side.

**Behaviour bug fix, not breaking.** Follow-up to the ownership-token work merged in #1951.

> **Scope decision (agreed with @barakb): minimal, single-tab.** Two rubber-duck rounds proved the
> naïve "just serialize `updateSession`" fix insufficient and shrank the real severity (§1–§2). This
> plan fixes the realistic single-tab case with bounded risk; cross-tab / focus-refetch coordination
> and server-authoritative last-wins are explicitly **out of scope** and documented in §4/§7.

---

## 0. Background — verified facts (merged code + next-auth internals)

`app/providers.tsx`
- `updateSession = useSession().update` (`:161`), exposed on `ConnectionContext` (`:696`), mirrored to
  `updateSessionRef` (`:166-167`). A render-synchronous `statusRef` already exists (`:681-682`).
- Switch gate: `pendingSwitchesRef` **counter** (`:345`), `beginConnectionSwitch()` (`:362`, bumps
  counter + `switchTicketRef` + `bumpContextGen`), `endConnectionSwitch()` (`:369`, decrements),
  `isLatestSwitch(ticket)` (`:375`).
- Graph ops are gated: `fetchCount` (`:722`) and `runQuery` (`:852`) early-return while
  `pendingSwitchesRef.current > 0`.
- The reset effect (`:1617-1655`) **zeroes the whole gate** — `pendingSwitchesRef.current = 0`
  (`:1632`) — and bumps `contextGen`, resets graph state, on a real React `activeConnectionId` change.
- The module-global id is re-synced to React state **after every render** by a dependency-free effect
  (`:1083`): `useEffect(() => { setActiveConnectionIdGlobal(activeConnectionId); })`.
- Auto-select on load uses **localStorage `lastActiveConnectionId`** then `conns[0]` (`:1202-1209`) —
  **not** the JWT.
- Internal establishment/migration writes call `updateSessionRef.current(...)` directly (`:1216`,
  `:1253`).

`app/components/ConnectionManager.tsx` — three switch sites (`handleSelect` `:52`, `confirmRemove`
`:115`, `handleAddConnection` `:170`): `beginConnectionSwitch()` → `setActiveConnectionIdGlobal(id)` →
`localStorage.setItem` → `await updateSession({activeConnectionId:id})` → `isLatestSwitch` guard →
`setActiveConnectionId(id)`, with a rollback `catch`. Selecting the active id is a no-op (`:37-38`).

`app/api/auth/[...nextauth]/options.ts`
- `getClient()` resolves the connection **primarily from `X-Connection-Id`** (`:1098`), falling back to
  the JWT `session.activeConnectionId` only when the header is absent (`:1112-1113`); role/host/port
  come from `fetchTokenById(connId)` (`:1289-1300`).
- JWT `trigger === "update"` (`:892-913`) sets `token.activeConnectionId` **before** the Token DB
  lookup; `session` callback (`:923-927`) returns `activeConnectionId` + `user.{role,host,port,tls}`.

next-auth (`node_modules`, verified)
- `react.js:337` — `update()` returns `undefined` immediately **while `loading`** (no HTTP write).
- `client.js:38-40` — transport errors become **`null`, not a rejection**; `update()` resolves `null`.
- `update()` returns the session body (incl. `activeConnectionId`) on success and broadcasts a
  cross-tab event (`react.js:344-350`).
- Ordinary session GETs (focus / cross-tab, `react.js:243-320`) **also re-set the JWT cookie**
  (`@auth/core/lib/actions/session.js:44-49`) and do **not** set `loading` — unserialized writers.

---

## 1. Corrected severity (verified)

The stale JWT does **not** misroute normal graph queries: header-routed ops (`securedFetch`/SSE inject
`X-Connection-Id` from the global) hit the newest connection + its Token DB role, and reload
auto-select uses localStorage (= newest), which **repairs** the JWT. The real residual impact is:
1. **Session/UI metadata divergence** — `session.user.{role,host,port,username}` (JWT-sourced) can show
   the superseded connection until the next successful update/refresh; any header-less code path that
   trusts `session.user.role` is then wrong.
2. **Header-less / fallback requests** resolve the connection from the stale JWT (`:1112-1113`).
3. **Transient mid-switch window** where the global reverts to the *old* id via the `:1083` effect —
   mitigated because the gate blocks graph ops during a switch.

So the finding is real (persisted session + UI diverge from the user's last choice) but it is a
**metadata/fallback** bug, not general live-query misrouting.

---

## 2. Why the naïve serializer is insufficient (both rubber-duck rounds)

1. **`update()` no-ops while loading** → a microtask-chained call reads the still-`loading` closure,
   gets `undefined` back **without writing the cookie**, yet resolves and passes `isLatestSwitch` →
   UI C, cookie B.
2. **Errors → `null`**, so the ConnectionManager `catch` rollbacks never fire on transport failure.
3. **Failure rollback is independently broken** — it rolls back only the global (not React), and
   `confirmRemove` would roll back to a **deleted** connection.
4. **Zeroing the gate** (`:1632`) reopens graph ops while a **newer** switch D (begun after C's
   `setActiveConnectionId` but before the reset effect) is still pending.

The minimal fix must therefore **validate** the commit, converge **all** states on failure, and make
the gate **ticket-owned**.

---

## 3. Minimal design

### 3a. Serialized + validated `commitActiveConnection` — `providers.tsx` (keeps the object signature)

Swap the *implementation* behind the existing context `updateSession({ activeConnectionId })` — **no
caller/type change** (avoids the signature-mismatch trap; `provider.ts:238` stays):

```ts
const sessionChainRef = useRef<Promise<unknown>>(Promise.resolve());

// Serialize + validate JWT writes. update() no-ops while loading and turns
// transport errors into null, so we (a) wait until the provider is authenticated
// (reuse the existing statusRef :681), (b) validate the returned session actually
// reflects the target, (c) retry a bounded number of times. We do NOT time-box the
// update() await: a non-aborting timeout would let a late response overwrite a newer
// commit's cookie — the exact race we're closing. The chain (and the ticket) stay
// pending until the real request settles; a hung provider blocking later switches is
// an accepted residual (no worse than today's single await, §6). Throw on exhaustion
// so callers' catch/rollback runs.
const commitActiveConnection = useCallback((data: { activeConnectionId?: string | null }) => {
  const targetId = data.activeConnectionId ?? null;
  const run = sessionChainRef.current.catch(() => undefined).then(async () => {
    for (let attempt = 0; attempt < MAX_COMMIT_ATTEMPTS; attempt += 1) {
      // Bounded wait for a non-loading provider; a timeout here just fails this
      // attempt (backoff + retry) — it never abandons an in-flight update().
      const ready = await waitUntil(() => statusRef.current === "authenticated", READY_TIMEOUT_MS);
      if (ready) {
        const result = await updateSessionRef.current({ activeConnectionId: targetId }) as
          { activeConnectionId?: string | null } | null | undefined;
        if (result && result.activeConnectionId === targetId) {
          lastCommittedConnIdRef.current = targetId;    // §3c
          return result;
        }
      }
      await delay(COMMIT_BACKOFF_MS);
    }
    throw new Error(`Failed to commit active connection to session`);
  });
  sessionChainRef.current = run.catch(() => undefined);   // a failure never breaks the chain
  return run;
}, []);
```

Expose `commitActiveConnection` as the context `updateSession` (`:696`; swap memo dep `:700`). Stable
identity (empty deps; reads refs at call time). The three switch sites are unchanged in signature and
now get ordering + a real throw on failure.

> Extract the pure pieces — `createSerializedRunner`, and a `commitWithValidation(update, statusGetter,
> target, opts)` core — into `app/components/serializedRunner.ts` so they are unit-testable under
> `node:test` (route/`.tsx` files aren't; `providers.tsx` wires the refs to them).

### 3b. Ticket-owned gate (fixes issue 4) — `providers.tsx`

Replace the counter with a **set of live tickets**, released **per-ticket by the caller**, never
globally zeroed:

```ts
const pendingSwitchTicketsRef = useRef<Set<number>>(new Set());
// Target-keyed handoff: the reset effect releases this ticket only when React
// state actually reaches `targetId`, so a batched-away intermediate state can't
// release the wrong ticket.
const committedSwitchRef = useRef<{ ticket: number; targetId: string | null } | null>(null);
const beginConnectionSwitch = () => { const t = (switchTicketRef.current += 1);
  pendingSwitchTicketsRef.current.add(t); bumpContextGen(); return t; };
const endConnectionSwitch = (ticket: number) => { pendingSwitchTicketsRef.current.delete(ticket); };
const isConnectionSwitchInProgress = () => pendingSwitchTicketsRef.current.size > 0;
// Called by the winning switch (or a state-changing rollback) just before it
// publishes React state. Retire any prior handed-off ticket first (its own newer
// live ticket keeps the gate closed), so the ref can't leak a superseded handoff.
const handoffConnectionSwitch = (ticket: number, targetId: string | null) => {
  const prev = committedSwitchRef.current;
  if (prev && prev.ticket !== ticket) endConnectionSwitch(prev.ticket);
  committedSwitchRef.current = { ticket, targetId };
};
```

- Gate predicate at `:722` and `:852` becomes `isConnectionSwitchInProgress()`.
- **Remove** `pendingSwitchesRef.current = 0` from the reset effect (`:1632`). Instead, at the **end**
  of the reset effect (after graph state + `bumpContextGen` are done), release the handed-off ticket
  **only when it matches the connection React actually reached**:
  `const h = committedSwitchRef.current; if (h && h.targetId === activeConnectionId) { endConnectionSwitch(h.ticket); committedSwitchRef.current = null; }`.
  A newer D keeps its own ticket, so it can't be clobbered. The reset effect's early-return branches
  (`:1623-1625`, `prev === null`/unchanged) must **not** skip this release when a matching handoff is
  pending — a rollback to the same id, or a first-establishment id, still needs its ticket released.
- Change the `ConnectionContext.endConnectionSwitch` type (`provider.ts:244`) to `(ticket: number)`;
  expose `handoffConnectionSwitch(ticket, targetId)` and `isConnectionSwitchInProgress()` on the
  context (ConnectionManager can't read the provider ref directly).
- **Ticket lifecycle (no leak, no early release):** the switch site wraps its body in `try/finally`
  with a `handedOff` flag. **Any path that changes React state** — the winning publish **and** a
  state-changing rollback — calls `handoffConnectionSwitch(ticket, target)` **then**
  `setActiveConnectionId(target)` and sets `handedOff = true`; the reset effect releases that ticket
  after graph state is reset. Only when React **already equals** the target (no state change, so no
  reset effect will fire) does `finally { if (!handedOff) endConnectionSwitch(ticket); }` release
  directly. Releasing only via the reset effect on a state change is required — `contextGen` discards a
  stale result *apply* but does **not** undo a server-side effect (`runQuery` `:847-864` can mutate the
  DB, `fetchCount` `:719-722` can auto-create a graph, `DeleteGraph`/`CreateGraph` mutate before their
  epoch check), so the gate must stay closed until the reset effect re-pins graph state. A superseded
  switch never publishes (fails `isLatestSwitch`), and `handoffConnectionSwitch` retires any prior
  handed-off ticket, so the ref can't leak a superseded ticket. On sign-out/auth reset,
  `pendingSwitchTicketsRef.current.clear()` **and** `committedSwitchRef.current = null`.

### 3c. Converge all states on failure/supersession (fixes issue 3) — `ConnectionManager.tsx` + `providers.tsx`

- `lastCommittedConnIdRef` (providers) is **seeded** from the authenticated session
  (`sessionData.activeConnectionId`) as soon as `status === "authenticated"`, and thereafter set only
  on a **validated** commit success (§3a). Seeding guarantees rollback converges even if the first
  establishment write and the first user switch both fail (round-2 clarification: an unseeded `null`
  ref couldn't converge with the existing JWT). Expose a getter (or a small
  `rollbackActiveConnection()` helper) on the context so the switch sites can read the last-good id;
  if it is still `null`, fall back to `sessionData.activeConnectionId`.
- `handleSelect` / `handleAddConnection` — on a thrown commit failure, if `isLatestSwitch(ticket)`,
  roll back **both** React **and** global + localStorage to the last-good id. Since this rollback
  **changes React state**, it must go through the same handoff (`handoffConnectionSwitch(ticket,
  rollbackId)` → `setActiveConnectionId(rollbackId)` → `handedOff = true`) so the ticket is released by
  that rollback's reset effect — releasing it directly in `finally` would reopen the gate before the
  reset re-pins graph state (the round-3 unsafe window, which also applies to rollback). Only when
  React already equals `rollbackId` (no state change) does `finally` release directly.
- `confirmRemove` — **commit the replacement before deleting** the old connection, and hand the ticket
  to the reset effect (do **not** hold it across the DELETE — a hung DELETE would otherwise stick the
  gate). Order: `beginConnectionSwitch` → `commitActiveConnection(newActive)` (validated) →
  `handoffConnectionSwitch(ticket)` + publish React/global/localStorage → **then** DELETE the old row →
  update `additionalConnections` **only after DELETE succeeds**. If the commit fails first, nothing was
  deleted and we roll back to the last-good id (`finally` releases the ticket). If the DELETE fails
  after a successful commit, the session already sits consistently on the valid replacement; on an
  **ambiguous** DELETE network failure, **refetch** the connection list rather than assuming the row
  survived. Because a `Set<number>` can't identify the in-flight switch *target*, **block all removals
  while a switch is in progress** via the `isConnectionSwitchInProgress()` context predicate (§3b) —
  simplest and safe. The `isLast` sign-out path is unchanged (it returns before any switch).

### 3d. Route internal writes through the serialized commit — `providers.tsx`

Point the establishment (`:1216`) and migrate-session (`:1253`) writes at `commitActiveConnection` so
they are ordered against user switches. (Full generation-tagging of their React/global mutations is
**out of scope** — see §4.)

---

## 4. Explicitly out of scope (documented limitations)

- **Cross-tab / focus-refetch cookie reordering.** Unserialized session GETs (`@auth/core
  session.js:44-49`, focus/broadcast) can still re-set a stale cookie; each tab has its own serializer.
  No auto-reconciliation (it can oscillate between tabs). The single-tab guarantee is explicit.
- **Server-side JWT row validation.** The server sets `token.activeConnectionId` before the Token DB
  lookup (`:894-911`), so committing to a just-deleted target reports success with stale role. §3c's
  commit-before-delete avoids the common path; hardening the callback is deferred (Approach B).
- **Full generation-tagging of internal establishment/migration mutations** (their React/global writes,
  not just the queued session write) — deferred.
- **True global (cross-tab) last-wins** — needs server-authoritative active connection with a
  globally-comparable sequence (Approach B/C from the scoping discussion); not pursued now.

---

## 5. Testing

### 5a. Unit (`node:test`, explicit `.ts` imports) — `app/components/serializedRunner.test.ts`
- `createSerializedRunner`: order preserved under reversed completion; each caller gets its own
  result/rejection; a rejection doesn't break the chain; ≤1 call in flight.
- `commitWithValidation` core (inject `update` + `statusGetter`): `undefined` (no-op) then success →
  retries and commits + records last-good; `null` (transport) → throws after `MAX_COMMIT_ATTEMPTS`;
  wrong `activeConnectionId` → retries; waits (bounded) while status ≠ `authenticated`, and a
  not-ready timeout fails the attempt (retry) without abandoning an in-flight `update`.
- **Serialization under slow completion:** a slow `update(B)` delays `update(C)`; assert C only starts
  after B settles and the final committed value is C (this is why the non-aborting timeout was removed
  — a timed-out B could otherwise land after C).
- Ticket-set gate helper: releasing C's ticket while D is live keeps `size > 0` (issue-4 regression).

### 5b. E2E — `@admin`, **≥3 connections** (extend `e2e/tests/connectionManager.spec.ts`)
- 3 connections are required to produce A→B→C (selecting the active one is a no-op `:37-38`; the spec
  only guarantees one today `:22-25`).
- `page.route` holds the first `/api/auth/session` update in flight, start the second, release the
  first; assert convergence by reading **`/api/auth/session` directly** (its `activeConnectionId`) —
  not a graph op (routes by header, would falsely pass) — and assert the second update POST isn't
  observed until the first is released.
- Add regressions: B succeeds → C fails (converge on B); active-connection removal with commit failure
  (never points at the deleted row); gate stays closed while a newer switch is pending.

### 5c. Gate — same commands CI runs (`.github/workflows/nextjs.yml`)
`npm test` · `npm run test:coverage` (100% on its allowlist; add `serializedRunner.ts`) ·
`npm run lint` · `npx tsc --noEmit` · full Playwright in CI.

---

## 6. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Serialization + ready-wait + retry adds latency to rapid successive switches. | Bounded (`READY_TIMEOUT_MS`, `MAX_COMMIT_ATTEMPTS`, `COMMIT_BACKOFF_MS`); single switch pays ~0 (chain starts resolved, provider authenticated). |
| A hung `update()` blocks later switches (chain stays pending). | Accepted residual — **no worse than today's single `await`**, and rare. We deliberately do **not** time-box the `update` await: a non-aborting timeout could let a stale response land after a newer commit (the very race we close). A watchdog may log a stall, but the chain/ticket stay pending until the real request settles. A true abortable fetch is out of scope. |
| Commit-before-delete changes `confirmRemove` ordering. | Small, contained reorder; `additionalConnections` updated only after DELETE succeeds; ambiguous DELETE failure refetches the list; covered by a new e2e regression; strictly safer (never points at a deleted connection). |
| Ticket leak / stuck gate. | Winning ticket handed to the reset effect (released after graph reset); all other paths release via `finally`; sign-out/auth reset `clear()`s the set. |

---

## 7. Findings addressed (traceability)

| Source | Concern | This plan |
| --- | --- | --- |
| CodeRabbit 🔴 (`ConnectionManager#L51-69`) | superseded `updateSession` commits an older connection | §3a serialized+validated commit |
| CodeRabbit 🔴 (`providers.tsx#L1615-1620`) | gate cleared while a mutation is in flight | §3b ticket-owned gate; remove `:1632` zero |
| Round-1/2 #1 | `update()` no-ops while loading; errors→null | §3a ready-wait + validation + throw |
| Round-1/2 #2 (rollback) | failure leaves cookie/UI/React inconsistent | §3c converge React+global to last-good; commit-before-delete |
| Round-2 (gate release timing) | releasing before reset effect / newer D | §3b winning ticket handed to the reset effect; released only after graph reset |
| Round-2 (severity) | overstated impact | §1 corrected + verified |
| Round-2 (E2E) | 2 conns can't A→B→C; graph-op assert bypasses JWT | §5b ≥3 conns, assert `/api/auth/session` |
| Round-2 (context API) | `commitActiveConnection(id)` vs object callers | §3a keeps the object signature |
| Round-3 (non-aborting timeout) | a timed-out `update` can land late and re-set the cookie | §3a timeout removed; chain/ticket stay pending until the real settle |
| Round-3 (server-side effects) | `contextGen` doesn't undo a server mutation started before the reset | §3b gate stays closed until the reset effect (ticket handoff) |
| Round-3 (`lastCommittedConnIdRef` init) | unseeded ref can't converge | §3c seed from `sessionData.activeConnectionId`; fallback on rollback |
| Round-2/3 (cross-tab / server validation / generation) | not solvable single-tab | §4 documented out of scope |

---

## 8. Step-by-step task list

1. `app/components/serializedRunner.ts` (`createSerializedRunner` + `commitWithValidation`) + tests.
2. `providers.tsx`: `commitActiveConnection` (serialize + ready-wait + validate + retry, **no**
   non-aborting timeout) + `lastCommittedConnIdRef` (seeded from the session); expose as context
   `updateSession` (`:696`/`:700`).
3. `providers.tsx`: ticket-**set** gate + target-keyed `committedSwitchRef` + `handoffConnectionSwitch`
   + `isConnectionSwitchInProgress`; predicate at `:722`/`:852`; replace the `:1632` zero with a
   reset-effect release of the matching handed-off ticket (don't skip it in the early-return branches);
   update `provider.ts:244` type + expose `handoffConnectionSwitch`/`isConnectionSwitchInProgress`.
4. `ConnectionManager.tsx`: `try/finally` ticket lifecycle (handoff on win, `finally` release
   otherwise); converge React+global on failure; commit-before-delete in `confirmRemove` (update list
   only after DELETE; refetch on ambiguous failure); block removals while any switch ticket is live.
5. `providers.tsx`: route internal writes (`:1216`/`:1253`) through `commitActiveConnection`.
6. Extend `connectionManager.spec.ts` (≥3 connections; §5b) + unit tests.
7. Run the §5c gate; open PR to `staging`; drive Copilot + CodeRabbit threads to resolved. **No merge
   without @barakb's approval.**

---

## 9. Open decisions for you

1. **`confirmRemove` commit-before-delete** (§3c): include (recommended — it's the minimal way to make
   the removal path converge) or keep DELETE-first with best-effort convergence?
2. **Coverage allowlist:** add `serializedRunner.ts` at 100% (recommended)?
3. **Tuning constants** (`MAX_COMMIT_ATTEMPTS`, `READY_TIMEOUT_MS`, `COMMIT_BACKOFF_MS`) — proposed
   defaults 3 / 3000ms / 150ms; adjust?
