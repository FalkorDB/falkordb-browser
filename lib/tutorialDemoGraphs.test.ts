import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isTutorialDemoGraphName,
  parseTutorialDemoOwnership,
  pickTutorialDemoGraphNames,
  tutorialDemoOwnershipKey,
} from "./tutorialDemoGraphs.ts";

const USER_GRAPHS = ["social-demo", "social-demo-test", "tutorial-social", "tutorial-social-demo", "my-graph"];

describe("tutorial demo graph names (#2202)", () => {
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
});

describe("tutorial demo graph ownership (#2202)", () => {
  const scope = "localhost:6379:default:";
  const ownerId = "owner-1";
  const stored = (value: unknown) => JSON.stringify(value);

  it("reads back recorded tutorial graphs, de-duplicated", () => {
    const names = ["tutorial-social-demo-x", "tutorial-social-test-x", "tutorial-social-demo-x"];
    assert.deepEqual(
      parseTutorialDemoOwnership(stored({ scope, ownerId, names }), scope, ownerId),
      { scope, ownerId, names: ["tutorial-social-demo-x", "tutorial-social-test-x"] },
    );
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
});
