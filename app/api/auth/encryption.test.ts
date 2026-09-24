import test from "node:test";
import assert from "node:assert/strict";
import { encrypt, decrypt, encryptForOwner, decryptForOwner, UnboundCiphertextError } from "./encryption.ts";

process.env.ENCRYPTION_KEY =
  "a3f5d8c2b7e4f1a0c9d6e8b2f5a7c3d1e9f2a4b8c6d3e7f1a5b9c2d8e4f0a6b3";

const ALICE = "alice@localhost:6379";
const BOB = "bob@localhost:6379";

test("owner-bound ciphertext", async (t) => {
  await t.test("round-trips for the owner it was written for", () => {
    const ciphertext = encryptForOwner("sk-secret", ALICE);
    assert.equal(decryptForOwner(ciphertext, ALICE), "sk-secret");
  });

  await t.test("is marked so the client can tell the format apart", () => {
    assert.match(
      encryptForOwner("sk-secret", ALICE),
      /^v2:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/
    );
  });

  await t.test("does not repeat itself for the same input", () => {
    assert.notEqual(
      encryptForOwner("sk-secret", ALICE),
      encryptForOwner("sk-secret", ALICE)
    );
  });

  await t.test("refuses to open for a different owner", () => {
    const ciphertext = encryptForOwner("sk-secret", ALICE);
    assert.throws(() => decryptForOwner(ciphertext, BOB));
  });

  await t.test("refuses tampered ciphertext", () => {
    const ciphertext = encryptForOwner("sk-secret", ALICE);
    const flipped = `${ciphertext.slice(0, -1)}${ciphertext.endsWith("0") ? "1" : "0"}`;
    assert.throws(() => decryptForOwner(flipped, ALICE));
  });

  await t.test("rejects unbound ciphertext distinguishably", () => {
    assert.throws(
      () => decryptForOwner(encrypt("sk-secret"), ALICE),
      UnboundCiphertextError
    );
  });

  await t.test("rejects plain text distinguishably", () => {
    assert.throws(() => decryptForOwner("not-ciphertext", ALICE), UnboundCiphertextError);
  });

  await t.test("requires an owner", () => {
    assert.throws(() => encryptForOwner("sk-secret", ""));
    assert.throws(() => decryptForOwner(encryptForOwner("sk-secret", ALICE), ""));
  });
});

test("unbound ciphertext stays readable for server-internal use", () => {
  assert.equal(decrypt(encrypt("db-password")), "db-password");
});
