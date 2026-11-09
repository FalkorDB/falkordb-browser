import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isTutorialDemoGraphName,
  protectTutorialGraphRead,
  getTutorialDemoReclaimableNames,
  completeTutorialDemoGraphSetup,
  isTutorialDemoOwnershipExpired,
  TUTORIAL_DEMO_OWNER_TTL_MS,
  parseTutorialDemoOwnership,
  pickTutorialDemoGraphNames,
  runTutorialDemoLoadOnce,
  queueTutorialDemoRecovery,
  waitForTutorialDemoLoad,
  tutorialDemoOwnershipKey,
} from "./tutorialDemoGraphs.ts";

const USER_GRAPHS = ["social-demo", "social-demo-test", "tutorial-social", "tutorial-social-demo", "my-graph"];

describe("tutorial demo graph names (#2202)", () => {
  it("uses non-creating queries for tutorial reads but permits explicit setup", () => {
    const url = "/api/graph/tutorial-social-demo-owned?query=RETURN%201";
    assert.equal(new URL(protectTutorialGraphRead(url), "http://localhost").searchParams.get("readOnly"), "true");
    assert.equal(protectTutorialGraphRead(url, true), url);
    assert.equal(protectTutorialGraphRead("/api/graph/social-demo?query=RETURN%201"), "/api/graph/social-demo?query=RETURN%201");
    assert.equal(new URL(protectTutorialGraphRead(`${url}&readOnly=false`), "http://localhost").searchParams.get("readOnly"), "true");
    for (const suffix of ["/count", "/count/nodes", "/count/edges"]) {
      assert.equal(protectTutorialGraphRead(`/api/graph/tutorial-social-demo-owned${suffix}`), `/api/graph/tutorial-social-demo-owned${suffix}?readOnly=true`);
    }
  });
  it("never picks a user's fixed social-demo graph names", () => {
    let n = 0;
    const [demo, test] = pickTutorialDemoGraphNames(() => `s${n += 1}`, () => false);
    assert.deepEqual([demo, test], ["tutorial-social-demo-s1", "tutorial-social-test-s1"]);
    for (const name of USER_GRAPHS) {
      assert.notEqual(demo, name);
      assert.notEqual(test, name);
    }
  });

  it("retries with a new suffix while either name is already taken", () => {
    const taken = new Set(["tutorial-social-demo-a", "tutorial-social-test-b"]);
    const suffixes = ["a", "b", "c"];
    const names = pickTutorialDemoGraphNames(() => suffixes.shift()!, name => taken.has(name));
    assert.deepEqual(names, ["tutorial-social-demo-c", "tutorial-social-test-c"]);
  });

  it("only treats generated tutorial names as tutorial-owned", () => {
    assert.equal(isTutorialDemoGraphName("tutorial-social-demo-0f6025a6-685a"), true);
    assert.equal(isTutorialDemoGraphName("tutorial-social-test-abc"), true);
    for (const name of [...USER_GRAPHS, "tutorial-social-demo-", "tutorial-social-demo-a b", "tutorial-social-demo-a/b", 42, null]) {
      assert.equal(isTutorialDemoGraphName(name), false, String(name));
    }
  });

  it("fails explicitly instead of looping forever when every candidate is taken", () => {
    let attempts = 0;
    assert.throws(() => pickTutorialDemoGraphNames(() => `s${attempts += 1}`, () => true), /50 attempts/);
    assert.equal(attempts, 50);
  });

  it("shares an in-flight load for the same owner across navigation", async () => {
    const loads = new Map<string, Promise<string>>();
    let finish!: (value: string) => void;
    const delayed = new Promise<string>(resolve => { finish = resolve; });
    let calls = 0;
    const loadKey = "scope-1:owner-1";
    const first = runTutorialDemoLoadOnce(loads, loadKey, async () => {
      calls += 1;
      return delayed;
    });
    const second = runTutorialDemoLoadOnce(loads, loadKey, async () => {
      calls += 1;
      return "duplicate";
    });

    assert.equal(first, second);
    finish("loaded");
    assert.equal(await first, "loaded");
    await Promise.resolve();
    assert.equal(calls, 1);
    assert.equal(loads.size, 0);
  });

  it("isolates recovery scopes and releases failed work for retry", async () => {
    const loads = new Map<string, Promise<string>>();
    const first = runTutorialDemoLoadOnce(loads, "connection-a", async () => "a");
    const second = runTutorialDemoLoadOnce(loads, "connection-b", async () => "b");
    assert.notEqual(first, second);
    assert.deepEqual(await Promise.all([first, second]), ["a", "b"]);
    await assert.rejects(runTutorialDemoLoadOnce(loads, "connection-a", async () => {
      throw new Error("probe failed");
    }), /probe failed/);
    assert.equal(loads.size, 0);
    assert.equal(await runTutorialDemoLoadOnce(loads, "connection-a", async () => "retried"), "retried");
  });

  it("serializes fresh recovery activations instead of reusing an old sweep", async () => {
    const recoveries = new Map<string, Promise<void>>();
    let finish!: () => void;
    const delayed = new Promise<void>(resolve => { finish = resolve; });
    const scanned: string[] = [];
    const records = ["old-owner"];
    const first = queueTutorialDemoRecovery(recoveries, "a", async () => {
      scanned.push(...records);
      await delayed;
      throw new Error("old activation failed");
    });
    await Promise.resolve();
    records.push("owner-added-while-away");
    const second = queueTutorialDemoRecovery(recoveries, "a", async () => { scanned.push(...records); });
    assert.notEqual(first, second);
    await queueTutorialDemoRecovery(recoveries, "b", async () => { scanned.push("b"); });
    assert.deepEqual(scanned, ["old-owner", "b"]);
    const failed = assert.rejects(first, /old activation failed/);
    finish();
    await failed;
    await second;
    assert.deepEqual(scanned, ["old-owner", "b", "old-owner", "owner-added-while-away"]);
    assert.equal(recoveries.size, 0);
  });

  it("bounds replay waits without releasing a pending creation or losing its late result", async () => {
    const loads = new Map<string, Promise<string>>();
    let finish!: (value: string) => void;
    const delayed = new Promise<string>(resolve => { finish = resolve; });
    const pending = runTutorialDemoLoadOnce(loads, "a", () => delayed);
    await assert.rejects(waitForTutorialDemoLoad(pending, 5), /still pending/);
    await assert.rejects(waitForTutorialDemoLoad(pending, 5), /still pending/);
    assert.equal(loads.get("a"), pending);
    finish("late creation tracked");
    assert.equal(await waitForTutorialDemoLoad(pending, 1000), "late creation tracked");
    assert.equal(loads.size, 0);
  });
});

describe("tutorial demo graph ownership (#2202)", () => {
  const scope = "localhost:6379:default:";
  const ownerId = "owner-1";
  const stored = (value: unknown) => JSON.stringify(value);

  it("reads back recorded tutorial graphs, de-duplicated", () => {
    const names = ["tutorial-social-demo-x", "tutorial-social-test-x", "tutorial-social-demo-x"];
    assert.deepEqual(
      parseTutorialDemoOwnership(stored({ scope, ownerId, names }), scope, ownerId),
      {
        scope,
        ownerId,
        names: ["tutorial-social-demo-x", "tutorial-social-test-x"],
        pendingNames: ["tutorial-social-demo-x", "tutorial-social-test-x"],
      },
    );
  });

  it("only reclaims names whose setup was confirmed complete", () => {
    const names = ["tutorial-social-demo-x", "tutorial-social-test-x"];
    const legacy = parseTutorialDemoOwnership(stored({ scope, ownerId, names }), scope, ownerId);
    assert.deepEqual(getTutorialDemoReclaimableNames(legacy), []);

    const partiallyCreated = parseTutorialDemoOwnership(
      stored({ scope, ownerId, names, pendingNames: ["tutorial-social-test-x"] }),
      scope,
      ownerId,
    );
    assert.deepEqual(getTutorialDemoReclaimableNames(partiallyCreated), ["tutorial-social-demo-x"]);
    assert.throws(() => parseTutorialDemoOwnership(
      stored({ scope, ownerId, names, pendingNames: ["tutorial-social-demo-other"] }),
      scope,
      ownerId,
    ));
    for (const pendingNames of [null, "unknown", [42]]) {
      assert.throws(() => parseTutorialDemoOwnership(stored({ scope, ownerId, names, pendingNames }), scope, ownerId));
    }
  });

  it("records confirmed completion in the original scope without renewing its lease", () => {
    const names = ["tutorial-social-demo-x", "tutorial-social-test-x"];
    const ownership = completeTutorialDemoGraphSetup(
      stored({ scope, ownerId, names, pendingNames: names, lastActiveAt: 123 }),
      scope, ownerId, [names[0]],
    );
    assert.deepEqual(ownership.pendingNames, [names[1]]);
    assert.equal(ownership.lastActiveAt, 123);
    assert.deepEqual(getTutorialDemoReclaimableNames(ownership), [names[0]]);
  });

  it("never applies completion to a different owner, scope, or unrecorded graph", () => {
    const names = ["tutorial-social-demo-x"];
    const record = stored({ scope, ownerId, names, pendingNames: names });
    assert.throws(() => completeTutorialDemoGraphSetup(record, "other:", ownerId, names));
    assert.throws(() => completeTutorialDemoGraphSetup(record, scope, "other-owner", names));
    assert.throws(() => completeTutorialDemoGraphSetup(record, scope, ownerId, ["tutorial-social-demo-unowned"]));
  });

  it("refuses a record that would delete a user's graph", () => {
    for (const userGraph of USER_GRAPHS) {
      assert.throws(
        () => parseTutorialDemoOwnership(stored({ scope, ownerId, names: [userGraph] }), scope, ownerId),
        /refusing to delete/,
        userGraph,
      );
    }
  });

  it("refuses a record from another connection scope or owner", () => {
    const names = ["tutorial-social-demo-x"];
    assert.throws(() => parseTutorialDemoOwnership(stored({ scope: "other:", ownerId, names }), scope, ownerId));
    assert.throws(() => parseTutorialDemoOwnership(stored({ scope, ownerId: "owner-2", names }), scope, ownerId));
    assert.throws(() => parseTutorialDemoOwnership(stored({ scope, ownerId }), scope, ownerId));
    assert.throws(() => parseTutorialDemoOwnership(stored(null), scope, ownerId));
  });

  it("rejects owner IDs that could escape the storage key", () => {
    assert.equal(tutorialDemoOwnershipKey("owner-1"), "tutorialDemoGraphOwnership:owner-1");
    assert.throws(() => tutorialDemoOwnershipKey("owner:1"));
    assert.throws(() => tutorialDemoOwnershipKey(""));
  });

  it("preserves validated heartbeat timestamps and rejects malformed timestamps", () => {
    const record = { scope, ownerId, names: ["tutorial-social-demo-x"], lastActiveAt: 123 };
    assert.deepEqual(parseTutorialDemoOwnership(stored(record), scope, ownerId), {
      ...record,
      pendingNames: record.names,
    });
    for (const lastActiveAt of [-1, "123", null]) {
      assert.throws(() => parseTutorialDemoOwnership(stored({ ...record, lastActiveAt }), scope, ownerId));
    }
  });

  it("expires only recorded owners with a full day without a heartbeat", () => {
    const record = { scope, ownerId, names: ["tutorial-social-demo-x"], lastActiveAt: 100 };
    assert.equal(isTutorialDemoOwnershipExpired(record, 100 + TUTORIAL_DEMO_OWNER_TTL_MS - 1), false);
    assert.equal(isTutorialDemoOwnershipExpired(record, 100 + TUTORIAL_DEMO_OWNER_TTL_MS), true);
    assert.equal(isTutorialDemoOwnershipExpired({ scope, ownerId, names: [] }, 10 * TUTORIAL_DEMO_OWNER_TTL_MS), false);
    assert.equal(isTutorialDemoOwnershipExpired(record, 0), false);
  });
});
