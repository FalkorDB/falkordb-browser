import test from "node:test";
import assert from "node:assert/strict";
import { looksServerEncrypted, ServerDecryptError } from "./server-encryption.ts";

// A 12-byte IV and a 16-byte GCM tag, as the server has always emitted them.
const IV = "0123456789abcdef01234567";
const TAG = "0123456789abcdef0123456789abcdef";

test("looksServerEncrypted recognises an owner-bound v2 blob", () => {
    assert.equal(looksServerEncrypted(`v2:${IV}:${TAG}:deadbeef`), true);
});

test("looksServerEncrypted still recognises a pre-binding 3-part blob", () => {
    // Values written before owner binding must still be classified as
    // ciphertext so the app asks the server about them instead of treating
    // them as plaintext.
    assert.equal(looksServerEncrypted(`${IV}:${TAG}:deadbeef`), true);
});

test("looksServerEncrypted rejects plaintext and malformed shapes", () => {
    assert.equal(looksServerEncrypted("sk-a-plain-api-key"), false);
    assert.equal(looksServerEncrypted("enc:legacy-base64=="), false);
    assert.equal(looksServerEncrypted(`v2:${IV}:deadbeef`), false);
    assert.equal(looksServerEncrypted(`v2:${IV}::deadbeef`), false);
    assert.equal(looksServerEncrypted(`v2:zzzz:${TAG}:deadbeef`), false);
    assert.equal(looksServerEncrypted(""), false);
});

test("looksServerEncrypted does not claim hex-looking plaintext", () => {
    // Three hex runs of the wrong length are a credential the user typed, not
    // a GCM blob. Claiming them posts them to the decrypt API, which refuses
    // them as legacy ciphertext — and the caller then clears them.
    assert.equal(looksServerEncrypted("dead:beef:cafe"), false);
    assert.equal(looksServerEncrypted(`${IV}0:${TAG}:deadbeef`), false);
    assert.equal(looksServerEncrypted(`${IV}:${TAG}0:deadbeef`), false);
});

test("ServerDecryptError carries the status that tells the two refusals apart", () => {
    const predatesBinding = new ServerDecryptError(400);
    const notOurs = new ServerDecryptError(403);

    assert.equal(predatesBinding.status, 400);
    assert.equal(notOurs.status, 403);
    assert.equal(notOurs.name, "ServerDecryptError");
    assert.ok(notOurs instanceof Error);
});
