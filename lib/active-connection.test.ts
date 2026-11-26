import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyConnectionPin } from "./active-connection.ts";

describe("connection discovery pinning", () => {
  for (const [current, session, target, expected] of [
    ["a", "a", "a", "already-pinned"],
    ["a", "b", "a", "already-pinned"],
    [null, "a", "a", "same-session-bootstrap"],
    [null, "a", "b", "changed"],
    [null, null, "a", "changed"],
    [null, undefined, "a", "changed"],
    ["a", "a", "b", "changed"],
  ] as const) {
    it(`classifies ${String(current)} / ${String(session)} -> ${target} as ${expected}`, () => {
      assert.equal(classifyConnectionPin(current, session, target), expected);
    });
  }
});
