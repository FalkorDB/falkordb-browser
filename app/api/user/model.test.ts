import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ErrorReply } from "@redis/client";
import {
  getRoleWithKeys,
  extractKeysFromACL,
  requiresPasswordReauthentication,
  persistAclAfterPasswordChange,
  removePreviousPasswordConnectionCredential,
  ROLE,
} from "./model.ts";

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
    const expected = ["on", "resetkeys", "~ns:*", "clearselectors", ...role.slice(1)];
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

  it("clears independent ACL selectors when replacing any role", () => {
    for (const role of ROLE.values()) {
      const result = getRoleWithKeys(role, ["allowed:*"]);
      assert.equal(result.filter(rule => rule === "clearselectors").length, 1);
      assert.deepEqual(result, ["on", "resetkeys", "~allowed:*", "clearselectors", ...role.slice(1)]);
    }
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

describe("requiresPasswordReauthentication", () => {
  it("requires reauthentication only when the authenticated user changes their own password", () => {
    assert.equal(requiresPasswordReauthentication("alice", "alice", "NewPassword1!"), true);
    assert.equal(requiresPasswordReauthentication("alice", "bob", "NewPassword1!"), false);
    assert.equal(requiresPasswordReauthentication("alice", "alice"), false);
    assert.equal(requiresPasswordReauthentication(undefined, "alice", "NewPassword1!"), false);
  });
});

describe("persistAclAfterPasswordChange", () => {
  it("does not save ACL when reauthentication is not required", async () => {
    let saves = 0;
    const status = await persistAclAfterPasswordChange(false, async () => { saves += 1; }, () => assert.fail("unexpected error"));
    assert.equal(status, undefined);
    assert.equal(saves, 0);
  });

  it("reports a successful ACL save", async () => {
    let saves = 0;
    const status = await persistAclAfterPasswordChange(true, async () => { saves += 1; }, () => assert.fail("unexpected error"));
    assert.equal(status, "saved");
    assert.equal(saves, 1);
  });

  it("reports a Redis ACL SAVE error as an unknown outcome", async () => {
    const error = new ErrorReply("ERR ACL file is unavailable");
    let reported: unknown;
    const status = await persistAclAfterPasswordChange(true, async () => { throw error; }, cause => { reported = cause; });
    assert.equal(status, "unknown");
    assert.equal(reported, error);
  });

  it("reports a transport error as an unknown ACL SAVE outcome", async () => {
    const error = new Error("Connection closed");
    let reported: unknown;
    const status = await persistAclAfterPasswordChange(true, async () => { throw error; }, cause => { reported = cause; });
    assert.equal(status, "unknown");
    assert.equal(reported, error);
  });
});

describe("removePreviousPasswordConnectionCredential", () => {
  it("deletes the previous connection record when an id is available", async () => {
    const deletedIds: string[] = [];

    await removePreviousPasswordConnectionCredential(
      "connection-id",
      async id => {
        deletedIds.push(id);
        return true;
      },
      () => assert.fail("unexpected cleanup error"),
    );

    assert.deepEqual(deletedIds, ["connection-id"]);
  });

  it("does nothing when there is no previous connection id", async () => {
    let deleteCalls = 0;

    await removePreviousPasswordConnectionCredential(
      undefined,
      async () => { deleteCalls += 1; return true; },
      () => assert.fail("unexpected cleanup error"),
    );

    assert.equal(deleteCalls, 0);
  });

  it("logs cleanup errors without failing the password-change operation", async () => {
    const storageError = new Error("storage unavailable");
    let reported: unknown;

    await removePreviousPasswordConnectionCredential(
      "connection-id",
      async () => { throw storageError; },
      error => { reported = error; },
    );

    assert.equal(reported, storageError);
  });
});
