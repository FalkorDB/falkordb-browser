import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { reconcileEcho } from "./editorEchoes.ts";

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
