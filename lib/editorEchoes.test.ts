import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MAX_PENDING_ECHOES, reconcileEcho, recordEcho } from "./editorEchoes.ts";

describe("reconcileEcho", () => {
  it("keeps a stale echo of our own earlier keystroke", () => {
    const pending = ["asfasd", "asfasdf"];
    assert.equal(reconcileEcho(pending, "asfasdf", "asfasd"), "keep");
  });

  it("applies a value the editor never emitted (history navigation)", () => {
    const pending: string[] = [];
    assert.equal(reconcileEcho(pending, "RETURN 111", "RETURN 222"), "apply");
  });

  it("applies a history value again after visiting it before (A -> B -> A -> B)", () => {
    const pending: string[] = [];
    assert.equal(reconcileEcho(pending, "A", "B"), "apply");
    assert.equal(reconcileEcho(pending, "B", "A"), "apply");
    assert.equal(reconcileEcho(pending, "A", "B"), "apply");
  });

  it("does not restore text the user deleted when an older echo matches the editor", () => {
    // user types c then Backspace: editor emitted ab, abc, ab and is now at "ab"
    const pending = ["ab", "abc", "ab"];
    assert.equal(reconcileEcho(pending, "ab", "ab"), "keep"); // first echo acknowledged
    assert.equal(reconcileEcho(pending, "ab", "abc"), "keep"); // stale abc still recognised
    assert.equal(reconcileEcho(pending, "ab", "ab"), "keep"); // last echo
    assert.deepEqual(pending, []);
  });

  it("acknowledging a later echo also drops the ones React skipped", () => {
    const pending = ["a", "ab", "abc"];
    assert.equal(reconcileEcho(pending, "abc", "ab"), "keep");
    assert.deepEqual(pending, ["abc"]);
  });

  it("an external value supersedes anything still pending", () => {
    const pending = ["x", "xy"];
    assert.equal(reconcileEcho(pending, "xy", "RETURN 1"), "apply");
    assert.deepEqual(pending, []);
  });
});

describe("reconcileEcho with an external change", () => {
  it("applies a history value even when it matches a pending echo", () => {
    // typed "RETURN 1", kept typing to "RETURN 12", then picked the history entry "RETURN 1"
    const pending = ["RETURN 1", "RETURN 12"];
    assert.equal(reconcileEcho(pending, "RETURN 12", "RETURN 1", true), "apply");
    assert.deepEqual(pending, []);
  });

  it("does not reset the editor when the external value is already on screen", () => {
    const pending = ["A"];
    assert.equal(reconcileEcho(pending, "A", "A", true), "keep");
    assert.deepEqual(pending, []);
  });
});

describe("recordEcho", () => {
  it("drops the oldest emissions once the queue is full", () => {
    const pending: string[] = [];
    for (let i = 0; i < MAX_PENDING_ECHOES + 5; i += 1) recordEcho(pending, `q${i}`);
    assert.equal(pending.length, MAX_PENDING_ECHOES);
    assert.equal(pending[0], "q5");
    assert.equal(pending.at(-1), `q${MAX_PENDING_ECHOES + 4}`);
  });
});
