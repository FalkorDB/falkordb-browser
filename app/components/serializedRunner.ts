// Pure, dependency-injected helpers for serializing + validating the
// connection-switch session mutation. Extracted from providers.tsx so they can be
// unit-tested under node:test (route/.tsx files can't resolve @/ aliases and pull
// in React). See idea-7-serialize-connection-switch-plan.md §3a.

/** Resolves after `ms` milliseconds. */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Serializes calls to `fn` so overlapping invocations run strictly in submission
 * order — the next call never starts until the previous one settles. The
 * predecessor's outcome is swallowed for *sequencing* only; each caller still
 * receives its own call's real result/rejection.
 */
export function createSerializedRunner<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  let tail: Promise<unknown> = Promise.resolve();
  return (...args: A): Promise<R> => {
    const run = tail.catch(() => undefined).then(() => fn(...args));
    // Advance the chain tail without letting a rejection break ordering.
    tail = run.catch(() => undefined);
    return run;
  };
}

export interface WaitOptions {
  intervalMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

/**
 * Polls `predicate` until it returns true or `timeoutMs` elapses. Returns whether
 * the predicate became true within the timeout. `now`/`sleep` are injectable so
 * tests don't rely on real timers.
 */
export async function waitUntil(
  predicate: () => boolean,
  timeoutMs: number,
  opts: WaitOptions = {},
): Promise<boolean> {
  const intervalMs = opts.intervalMs ?? 50;
  const now = opts.now ?? (() => Date.now());
  const sleep = opts.sleep ?? delay;
  const start = now();
  while (!predicate()) {
    if (now() - start >= timeoutMs) return false;
    await sleep(intervalMs);
  }
  return true;
}

export interface CommitResult {
  activeConnectionId?: string | null;
}

export interface CommitDeps {
  /** Performs the session mutation (next-auth `useSession().update`). */
  update: (data: { activeConnectionId?: string | null }) => Promise<unknown>;
  /** Current next-auth session status (`"loading" | "authenticated" | ...`). */
  getStatus: () => string;
  /** Called with the target once a commit is validated as successful. */
  onCommitted?: (targetId: string | null) => void;
}

export interface CommitOptions {
  maxAttempts?: number;
  readyTimeoutMs?: number;
  backoffMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

/**
 * Commits `targetId` to the session, defeating next-auth's quirks: `update()`
 * no-ops (returns undefined) while the provider is loading and turns transport
 * errors into `null` rather than rejecting. So we (a) wait until the provider is
 * authenticated, (b) accept the commit only when the returned session actually
 * reflects `targetId`, (c) retry a bounded number of times, and (d) throw on
 * exhaustion so callers' rollback runs. We deliberately do NOT time-box the
 * `update()` await: a non-aborting timeout could let a stale response land after a
 * newer commit — the very race this closes.
 */
export async function commitWithValidation(
  targetId: string | null,
  deps: CommitDeps,
  opts: CommitOptions = {},
): Promise<CommitResult> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const readyTimeoutMs = opts.readyTimeoutMs ?? 3000;
  const backoffMs = opts.backoffMs ?? 150;
  const sleep = opts.sleep ?? delay;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const ready = await waitUntil(() => deps.getStatus() === "authenticated", readyTimeoutMs, {
      now: opts.now,
      sleep,
    });
    if (ready) {
      const result = (await deps.update({ activeConnectionId: targetId })) as
        | CommitResult
        | null
        | undefined;
      if (result && result.activeConnectionId === targetId) {
        deps.onCommitted?.(targetId);
        return result;
      }
    }
    await sleep(backoffMs);
  }
  throw new Error(`Failed to commit active connection ${targetId ?? "null"} to session`);
}
