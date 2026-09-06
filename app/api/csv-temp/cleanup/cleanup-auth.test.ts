import { test } from "node:test";
import assert from "node:assert/strict";
import { authorizeCleanup } from "./cleanup-auth.ts";

test("authorizeCleanup fails closed (503) when no secret is configured", () => {
    const result = authorizeCleanup([], "Bearer anything", "anything");
    assert.equal(result.ok, false);
    if (!result.ok) {
        assert.equal(result.status, 503);
        assert.match(result.message, /not configured/i);
    }
});

test("authorizeCleanup accepts a matching Bearer token", () => {
    const result = authorizeCleanup(["s3cr3t"], "Bearer s3cr3t", null);
    assert.deepEqual(result, { ok: true });
});

test("authorizeCleanup accepts a matching x-csv-cleanup-secret header", () => {
    const result = authorizeCleanup(["s3cr3t"], null, "s3cr3t");
    assert.deepEqual(result, { ok: true });
});

test("authorizeCleanup trims the header secret before comparing", () => {
    const result = authorizeCleanup(["s3cr3t"], null, "  s3cr3t  ");
    assert.deepEqual(result, { ok: true });
});

test("authorizeCleanup accepts a secret configured via any source (e.g. CRON_SECRET)", () => {
    const result = authorizeCleanup(["primary", "cron"], "Bearer cron", null);
    assert.deepEqual(result, { ok: true });
});

test("authorizeCleanup rejects a wrong credential with 401", () => {
    const result = authorizeCleanup(["s3cr3t"], "Bearer nope", "also-nope");
    assert.equal(result.ok, false);
    if (!result.ok) {
        assert.equal(result.status, 401);
        assert.equal(result.message, "Unauthorized");
    }
});

test("authorizeCleanup rejects when no credential is presented (401)", () => {
    const result = authorizeCleanup(["s3cr3t"], null, null);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 401);
});

test("authorizeCleanup does not treat an empty presented secret as a match", () => {
    // An empty configured secret shouldn't be produced by getCsvTempCleanupSecrets,
    // but guard anyway: empty bearer/header must never authorize.
    const result = authorizeCleanup([""], "Bearer ", "   ");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 401);
});

test("authorizeCleanup ignores a non-Bearer Authorization scheme", () => {
    const result = authorizeCleanup(["s3cr3t"], "Basic s3cr3t", null);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 401);
});
