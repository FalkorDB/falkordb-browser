import test from "node:test";
import assert from "node:assert/strict";

process.env.CSV_TEMP_SIGNING_SECRET = "unit-test-signing-secret";

const {
    generateCsvKey,
    isValidCsvKey,
    normalizeCsvKey,
    isValidOwner,
    hashOwner,
    signCsvCapability,
    verifyCsvCapability,
} = await import("./csv-key.ts");

test("generateCsvKey produces a valid UUID v4 key", () => {
    assert.ok(isValidCsvKey(generateCsvKey()));
});

test("isValidCsvKey accepts uuid v4 (any case/space) and rejects others", () => {
    assert.ok(isValidCsvKey("11111111-1111-4111-8111-111111111111"));
    assert.ok(isValidCsvKey("  11111111-1111-4111-8111-111111111111  "));
    assert.ok(isValidCsvKey("11111111-1111-4111-8111-111111111111".toUpperCase()));
    assert.ok(!isValidCsvKey("not-a-uuid"));
    assert.ok(!isValidCsvKey("../../etc/passwd"));
    assert.ok(!isValidCsvKey("11111111-1111-3111-8111-111111111111"));
    assert.ok(!isValidCsvKey(42 as unknown as string));
});

test("normalizeCsvKey lowercases and throws on invalid", () => {
    assert.equal(
        normalizeCsvKey("ABCDEF01-1111-4111-8111-111111111111"),
        "abcdef01-1111-4111-8111-111111111111"
    );
    assert.throws(() => normalizeCsvKey("evil/../path"), /Invalid CSV key/);
    assert.throws(() => normalizeCsvKey(""), /Invalid CSV key/);
});

test("hashOwner is deterministic, 32-hex, and hides the raw id", () => {
    const a = hashOwner("user-123");
    assert.equal(a, hashOwner("user-123"));
    assert.notEqual(a, hashOwner("user-456"));
    assert.ok(isValidOwner(a));
    assert.ok(/^[0-9a-f]{32}$/.test(a));
    assert.ok(!a.includes("user-123"));
    assert.throws(() => hashOwner(""), /user id is required/);
});

test("isValidOwner only accepts 32-hex strings", () => {
    assert.ok(isValidOwner("0".repeat(32)));
    assert.ok(!isValidOwner("0".repeat(31)));
    assert.ok(!isValidOwner("g".repeat(32)));
    assert.ok(!isValidOwner(undefined as unknown as string));
});

test("signCsvCapability / verifyCsvCapability round-trips for the right (owner,key)", () => {
    const owner = hashOwner("user-123");
    const key = "11111111-1111-4111-8111-111111111111";
    const { token } = signCsvCapability(owner, key, 60_000);
    assert.ok(verifyCsvCapability(owner, key, token));
});

test("verifyCsvCapability rejects a different owner/key, expiry, tamper, or secret", () => {
    const owner = hashOwner("user-123");
    const other = hashOwner("user-456");
    const key = "11111111-1111-4111-8111-111111111111";
    const key2 = "22222222-2222-4222-8222-222222222222";
    const { token } = signCsvCapability(owner, key, 60_000);
    assert.ok(!verifyCsvCapability(other, key, token));
    assert.ok(!verifyCsvCapability(owner, key2, token));

    const expired = signCsvCapability(owner, key, -1_000).token;
    assert.ok(!verifyCsvCapability(owner, key, expired));

    const [exp, sig] = token.split(".");
    assert.ok(!verifyCsvCapability(owner, key, `${exp}.${"0".repeat(sig.length)}`));
    assert.ok(!verifyCsvCapability(owner, key, "garbage"));
    assert.ok(!verifyCsvCapability(owner, key, ""));
    assert.ok(!verifyCsvCapability(owner, key, undefined as unknown as string));

    const original = process.env.CSV_TEMP_SIGNING_SECRET;
    process.env.CSV_TEMP_SIGNING_SECRET = "different-secret";
    try {
        assert.ok(!verifyCsvCapability(owner, key, token));
    } finally {
        process.env.CSV_TEMP_SIGNING_SECRET = original;
    }
});
