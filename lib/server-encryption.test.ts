import test from "node:test";
import assert from "node:assert/strict";
import { looksServerEncrypted, ServerDecryptError } from "./server-encryption.ts";

test("looksServerEncrypted recognises an owner-bound v2 blob", () => {
    assert.equal(looksServerEncrypted("v2:0123456789ab:0123456789abcdef:deadbeef"), true);
});

test("looksServerEncrypted still recognises a pre-binding 3-part blob", () => {
    // Values written before owner binding must still be classified as
    // ciphertext so the app asks the server about them instead of treating
    // them as plaintext.
    assert.equal(looksServerEncrypted("0123456789ab:0123456789abcdef:deadbeef"), true);
});

test("looksServerEncrypted rejects plaintext and malformed shapes", () => {
    assert.equal(looksServerEncrypted("sk-a-plain-api-key"), false);
    assert.equal(looksServerEncrypted("enc:legacy-base64=="), false);
    assert.equal(looksServerEncrypted("v2:0123456789ab:deadbeef"), false);
    assert.equal(looksServerEncrypted("v2:0123456789ab::deadbeef"), false);
    assert.equal(looksServerEncrypted("v2:zzzz:0123456789abcdef:deadbeef"), false);
    assert.equal(looksServerEncrypted(""), false);
});

test("ServerDecryptError carries the status that tells the two refusals apart", () => {
    const predatesBinding = new ServerDecryptError(400);
    const notOurs = new ServerDecryptError(403);

    assert.equal(predatesBinding.status, 400);
    assert.equal(notOurs.status, 403);
    assert.equal(notOurs.name, "ServerDecryptError");
    assert.ok(notOurs instanceof Error);
});
