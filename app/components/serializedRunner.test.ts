import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createSerializedRunner,
  waitUntil,
  commitWithValidation,
  delay,
  type CommitDeps,
} from "./serializedRunner.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Flush pending microtasks + one macrotask so chained .then callbacks run.
const tick = () => new Promise((resolve) => { setTimeout(resolve, 0); });

const noopSleep = async () => {};

// ---------------------------------------------------------------------------
// createSerializedRunner
// ---------------------------------------------------------------------------

describe("createSerializedRunner", () => {
  it("runs calls in submission order, never overlapping, even when they complete out of order", async () => {
    const started: string[] = [];
    let inFlight = 0;
    let maxInFlight = 0;
    const gates: Record<string, ReturnType<typeof deferred<string>>> = {};

    const run = createSerializedRunner((id: string) => {
      started.push(id);
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      const g = deferred<string>();
      gates[id] = g;
      return g.promise.finally(() => { inFlight -= 1; });
    });

    const pA = run("A");
    const pB = run("B");
    const pC = run("C");
    await tick();
    assert.deepEqual(started, ["A"], "only the first call starts");

    gates.A.resolve("ra");
    assert.equal(await pA, "ra");
    await tick();
    assert.deepEqual(started, ["A", "B"]);

    gates.B.resolve("rb");
    assert.equal(await pB, "rb");
    await tick();
    assert.deepEqual(started, ["A", "B", "C"]);

    gates.C.resolve("rc");
    assert.equal(await pC, "rc");
    assert.equal(maxInFlight, 1, "at most one call in flight at a time");
  });

  it("surfaces each caller's own rejection and does not break the chain", async () => {
    const run = createSerializedRunner((id: string) =>
      id === "B" ? Promise.reject(new Error("boom")) : Promise.resolve(id));

    const pA = run("A");
    const pB = run("B");
    const pC = run("C");

    assert.equal(await pA, "A");
    await assert.rejects(() => pB, /boom/);
    assert.equal(await pC, "C", "a rejected call does not stall later calls");
  });
});

// ---------------------------------------------------------------------------
// waitUntil
// ---------------------------------------------------------------------------

describe("waitUntil", () => {
  it("returns true immediately when the predicate already holds", async () => {
    const ok = await waitUntil(() => true, 1000, { sleep: noopSleep, now: () => 0 });
    assert.equal(ok, true);
  });

  it("returns true once the predicate becomes true", async () => {
    let calls = 0;
    const ok = await waitUntil(() => { calls += 1; return calls >= 3; }, 1000, {
      sleep: noopSleep,
      now: () => 0,
    });
    assert.equal(ok, true);
    assert.equal(calls, 3);
  });

  it("returns false when the timeout elapses first", async () => {
    let t = 0;
    const ok = await waitUntil(() => false, 100, {
      sleep: noopSleep,
      now: () => { const v = t; t += 1000; return v; },
    });
    assert.equal(ok, false);
  });

  it("works with the real default timer path", async () => {
    let ready = false;
    setTimeout(() => { ready = true; }, 5);
    const ok = await waitUntil(() => ready, 1000, { intervalMs: 1 });
    assert.equal(ok, true);
  });
});

describe("delay", () => {
  it("resolves after the given time", async () => {
    const start = Date.now();
    await delay(5);
    assert.ok(Date.now() - start >= 4);
  });
});

// ---------------------------------------------------------------------------
// commitWithValidation
// ---------------------------------------------------------------------------

function makeDeps(overrides: Partial<CommitDeps> & { committed?: string[] } = {}): CommitDeps {
  const committed = overrides.committed ?? [];
  return {
    update: overrides.update ?? (async () => ({ activeConnectionId: null })),
    getStatus: overrides.getStatus ?? (() => "authenticated"),
    onCommitted: overrides.onCommitted ?? ((id) => { committed.push(id ?? "null"); }),
    isCancelled: overrides.isCancelled,
  };
}

const fastOpts = { sleep: noopSleep, now: () => 0, readyTimeoutMs: 100, backoffMs: 0 };

describe("commitWithValidation", () => {
  it("commits when the returned session reflects the target and records it", async () => {
    const committed: string[] = [];
    const result = await commitWithValidation(
      "conn-C",
      makeDeps({ update: async () => ({ activeConnectionId: "conn-C" }), committed,
        onCommitted: (id) => { committed.push(id ?? "null"); }, isCancelled: () => false }),
      fastOpts,
    );
    assert.deepEqual(result, { activeConnectionId: "conn-C" });
    assert.deepEqual(committed, ["conn-C"]);
  });

  it("aborts a cancelled commit without calling update", async () => {
    let updateCalls = 0;
    await assert.rejects(
      () => commitWithValidation(
        "conn-C",
        makeDeps({ isCancelled: () => true, update: async () => { updateCalls += 1; return { activeConnectionId: "conn-C" }; } }),
        fastOpts,
      ),
      /Commit for conn-C cancelled \(auth changed\)/,
    );
    assert.equal(updateCalls, 0, "a cancelled commit never performs a write");
  });

  it("retries past a no-op (undefined) result then commits", async () => {
    let attempts = 0;
    const result = await commitWithValidation(
      "conn-C",
      makeDeps({
        update: async () => {
          attempts += 1;
          return attempts === 1 ? undefined : { activeConnectionId: "conn-C" };
        },
      }),
      fastOpts,
    );
    assert.deepEqual(result, { activeConnectionId: "conn-C" });
    assert.equal(attempts, 2);
  });

  it("throws after maxAttempts when update keeps returning null (transport error)", async () => {
    let attempts = 0;
    await assert.rejects(
      () => commitWithValidation(
        "conn-C",
        makeDeps({ update: async () => { attempts += 1; return null; } }),
        { ...fastOpts, maxAttempts: 3 },
      ),
      /Failed to commit active connection conn-C/,
    );
    assert.equal(attempts, 3);
  });

  it("retries when the returned activeConnectionId does not match the target", async () => {
    let attempts = 0;
    await assert.rejects(
      () => commitWithValidation(
        "conn-C",
        makeDeps({ update: async () => { attempts += 1; return { activeConnectionId: "conn-B" }; } }),
        { ...fastOpts, maxAttempts: 2 },
      ),
      /Failed to commit/,
    );
    assert.equal(attempts, 2);
  });

  it("waits until the provider is authenticated before committing", async () => {
    let statusCalls = 0;
    let updateCalls = 0;
    const result = await commitWithValidation(
      "conn-C",
      makeDeps({
        getStatus: () => { statusCalls += 1; return statusCalls >= 3 ? "authenticated" : "loading"; },
        update: async () => { updateCalls += 1; return { activeConnectionId: "conn-C" }; },
      }),
      fastOpts,
    );
    assert.deepEqual(result, { activeConnectionId: "conn-C" });
    assert.equal(updateCalls, 1, "update only fires once the provider is ready");
  });

  it("fails the attempt (no update) when the ready-wait times out", async () => {
    let updateCalls = 0;
    let t = 0;
    await assert.rejects(
      () => commitWithValidation(
        "conn-C",
        makeDeps({
          getStatus: () => "loading",
          update: async () => { updateCalls += 1; return { activeConnectionId: "conn-C" }; },
        }),
        { sleep: noopSleep, now: () => { const v = t; t += 1000; return v; }, readyTimeoutMs: 100, backoffMs: 0, maxAttempts: 2 },
      ),
      /Failed to commit/,
    );
    assert.equal(updateCalls, 0, "update never fires while unauthenticated");
  });

  it("supports a null target and works without an onCommitted callback", async () => {
    const result = await commitWithValidation(
      null,
      { update: async () => ({ activeConnectionId: null }), getStatus: () => "authenticated" },
      fastOpts,
    );
    assert.deepEqual(result, { activeConnectionId: null });
  });

  it("labels the error 'null' when a null-target commit exhausts its retries", async () => {
    await assert.rejects(
      () => commitWithValidation(
        null,
        makeDeps({ update: async () => ({ activeConnectionId: "conn-x" }) }),
        { ...fastOpts, maxAttempts: 2 },
      ),
      /Failed to commit active connection null to session/,
    );
  });

  it("uses default options when none are provided", async () => {
    const result = await commitWithValidation(
      "conn-A",
      makeDeps({ update: async () => ({ activeConnectionId: "conn-A" }) }),
    );
    assert.deepEqual(result, { activeConnectionId: "conn-A" });
  });
});
