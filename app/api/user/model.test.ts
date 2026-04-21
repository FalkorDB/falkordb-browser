import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getRoleWithKeys, extractKeysFromACL, ROLE } from "./model";

// ---------------------------------------------------------------------------
// getRoleWithKeys
// ---------------------------------------------------------------------------
describe("getRoleWithKeys", () => {
  it("inserts resetkeys and ~* when no keys are provided", () => {
    const role = ROLE.get("Read-Write")!;
    const result = getRoleWithKeys(role);
    assert.equal(result[0], "on");
    assert.equal(result[1], "resetkeys");
    assert.equal(result[2], "~*");
  });

  it("inserts resetkeys and the supplied key pattern", () => {
    const role = ROLE.get("Read-Write")!;
    const result = getRoleWithKeys(role, ["myprefix:*"]);
    assert.equal(result[1], "resetkeys");
    assert.equal(result[2], "~myprefix:*");
  });

  it("inserts resetkeys and key pattern for Read-Only role", () => {
    const role = ROLE.get("Read-Only")!;
    const result = getRoleWithKeys(role, ["test:*"]);
    assert.equal(result[1], "resetkeys");
    assert.equal(result[2], "~test:*");
  });

  it("inserts resetkeys for Admin role", () => {
    const role = ROLE.get("Admin")!;
    const result = getRoleWithKeys(role);
    assert.equal(result[1], "resetkeys");
    assert.equal(result[2], "~*");
  });

  it("preserves all remaining role entries after the key pattern", () => {
    const role = ROLE.get("Read-Only")!;
    const result = getRoleWithKeys(role, ["ns:*"]);
    // role[0] = "on", then "resetkeys", then "~ns:*", then role.slice(1)
    const expected = ["on", "resetkeys", "~ns:*", ...role.slice(1)];
    assert.deepEqual(result, expected);
  });

  // Regression: without resetkeys, a previously-set ~* would survive an
  // update to a narrower pattern because aclSetUser merges key patterns.
  it("includes resetkeys so stale wildcard ~* cannot shadow a narrower update", () => {
    const role = ROLE.get("Read-Write")!;
    const result = getRoleWithKeys(role, ["app:*"]);
    // resetkeys must appear before the new ~pattern so Redis/FalkorDB clears
    // existing key patterns first.
    const resetkeysIdx = result.indexOf("resetkeys");
    const keyPatternIdx = result.findIndex((v) => v.startsWith("~"));
    assert.ok(resetkeysIdx !== -1, "resetkeys must be present");
    assert.ok(resetkeysIdx < keyPatternIdx, "resetkeys must precede the key pattern");
  });
});

// ---------------------------------------------------------------------------
// extractKeysFromACL
// ---------------------------------------------------------------------------
describe("extractKeysFromACL", () => {
  it("returns the key pattern from a typical ACL line", () => {
    const parts = ["user", "alice", "on", "~myprefix:*", "resetchannels", "-@all"];
    assert.deepEqual(extractKeysFromACL(parts), ["myprefix:*"]);
  });

  it("returns [*] when no ~ pattern is present", () => {
    const parts = ["user", "alice", "on", "resetchannels", "-@all"];
    assert.deepEqual(extractKeysFromACL(parts), ["*"]);
  });

  it("returns [*] when the only pattern is ~*", () => {
    const parts = ["user", "alice", "on", "~*", "resetchannels", "-@all"];
    assert.deepEqual(extractKeysFromACL(parts), ["*"]);
  });

  it("returns multiple key patterns as an array", () => {
    const parts = ["user", "alice", "on", "~ns1:*", "~ns2:*", "-@all"];
    assert.deepEqual(extractKeysFromACL(parts), ["ns1:*", "ns2:*"]);
  });

  it("strips the ~ prefix correctly", () => {
    const parts = ["user", "bob", "on", "~test:*", "-@all"];
    const result = extractKeysFromACL(parts);
    assert.ok(!result[0].startsWith("~"), "result must not start with ~");
    assert.deepEqual(result, ["test:*"]);
  });
});
