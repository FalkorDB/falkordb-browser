import test from "node:test";
import assert from "node:assert/strict";
import type { TokenData } from "./token-storage/ITokenStorage";
import {
    BINDING_VERSION,
    PAT_BINDING_VERSION,
    isEndpointBound,
    isUsableConnectionRecord,
    parseConnectionUrl,
    patPayloadStatus,
} from "./connectionBinding.ts";

// ---------------------------------------------------------------------------
// parseConnectionUrl
// ---------------------------------------------------------------------------

test("a connection url yields its endpoint, credentials and scheme", () => {
    assert.deepEqual(parseConnectionUrl("falkors://alice:s3cr3t@db.internal:6380"), {
        host: "db.internal",
        port: "6380",
        username: "alice",
        password: "s3cr3t",
        tls: true,
    });
});

test("tls follows the scheme", () => {
    assert.equal(parseConnectionUrl("falkor://db").tls, false);
    assert.equal(parseConnectionUrl("redis://db").tls, false);
    assert.equal(parseConnectionUrl("falkors://db").tls, true);
    assert.equal(parseConnectionUrl("rediss://db").tls, true);
});

test("a url without port or credentials leaves them undefined", () => {
    assert.deepEqual(parseConnectionUrl("falkor://db.internal"), {
        host: "db.internal",
        port: undefined,
        username: undefined,
        password: undefined,
        tls: false,
    });
});

test("an IPv6 literal loses its brackets", () => {
    assert.equal(parseConnectionUrl("falkor://[::1]:6379").host, "::1");
    assert.equal(parseConnectionUrl("falkor://[::1]:6379").port, "6379");
    assert.equal(parseConnectionUrl("falkor://u:p@[2001:db8::1]").host, "2001:db8::1");
    // `URL` canonicalises the address, so two spellings share one identity.
    assert.equal(parseConnectionUrl("falkor://[2001:DB8:0::1]").host, "2001:db8::1");
});

test("percent-escaped credentials are decoded, including a literal %", () => {
    const parsed = parseConnectionUrl("falkor://al%40ice:100%25%2Fsure@db:6379");
    assert.equal(parsed.username, "al@ice");
    assert.equal(parsed.password, "100%/sure");
});

test("an unescaped @ in the password is kept", () => {
    assert.equal(parseConnectionUrl("falkor://alice:p@ss@db:6379").password, "p@ss");
    assert.equal(parseConnectionUrl("falkor://alice:p@ss@db:6379").host, "db");
});

test("a bare % that starts no escape is refused, as node-redis would refuse it", () => {
    assert.deepEqual(parseConnectionUrl("falkor://alice:100%@db:6379"), {});
    assert.deepEqual(parseConnectionUrl("falkor://al%zzice:pw@db:6379"), {});
});

test("a url naming no host yields nothing to record", () => {
    assert.deepEqual(parseConnectionUrl("unix:///run/redis.sock"), {});
    assert.deepEqual(parseConnectionUrl("unix://alice:pw@/run/redis.sock"), {});
    assert.deepEqual(parseConnectionUrl("redis://"), {});
});

test("a string that is not a url yields nothing", () => {
    assert.deepEqual(parseConnectionUrl("db.internal:6379"), {});
    assert.deepEqual(parseConnectionUrl(""), {});
});

// ---------------------------------------------------------------------------
// isEndpointBound
// ---------------------------------------------------------------------------

test("only a session token with the current binding is endpoint-bound", () => {
    assert.equal(isEndpointBound({ sub: "s", bv: BINDING_VERSION }), true);
    assert.equal(isEndpointBound({ sub: "s", bv: BINDING_VERSION - 1 }), false);
    assert.equal(isEndpointBound({ sub: "s", bv: String(BINDING_VERSION) }), false);
    assert.equal(isEndpointBound({ sub: "s" }), false);
    assert.equal(isEndpointBound(null), false);
    assert.equal(isEndpointBound(undefined), false);
});

test("a PAT marker never passes for a session binding", () => {
    // Keeping the claims apart is what stops a revoked PAT, read back through
    // `getToken`, from being admitted as a session.
    assert.equal(isEndpointBound({ sub: "s", pbv: PAT_BINDING_VERSION }), false);
});

// ---------------------------------------------------------------------------
// patPayloadStatus
// ---------------------------------------------------------------------------

const PAT = { sub: "u", jti: "t", host: "db", port: 6379, role: "Admin", tls: false };

test("a PAT with the current marker is valid", () => {
    assert.equal(patPayloadStatus({ ...PAT, pbv: PAT_BINDING_VERSION }), "valid");
});

test("a PAT minted before the marker existed predates the binding", () => {
    assert.equal(patPayloadStatus(PAT), "predates-binding");
});

test("an unknown marker, or a malformed payload, is plainly invalid", () => {
    assert.equal(patPayloadStatus({ ...PAT, pbv: PAT_BINDING_VERSION + 1 }), "invalid");
    assert.equal(patPayloadStatus({ ...PAT, pbv: String(PAT_BINDING_VERSION) }), "invalid");
    assert.equal(patPayloadStatus({ ...PAT, host: "", pbv: PAT_BINDING_VERSION }), "invalid");
    assert.equal(patPayloadStatus({ ...PAT, port: undefined }), "invalid");
    assert.equal(patPayloadStatus({ ...PAT, jti: undefined }), "invalid");
    assert.equal(patPayloadStatus(null), "invalid");
    assert.equal(patPayloadStatus("token"), "invalid");
});

// ---------------------------------------------------------------------------
// isUsableConnectionRecord
// ---------------------------------------------------------------------------

const NOW = 1_700_000_000;

function record(overrides: Partial<TokenData> = {}): TokenData {
    return {
        token_hash: "h",
        token_id: "c1",
        user_id: "session-1",
        username: "default",
        name: "connection:c1",
        role: "Admin",
        host: "db",
        port: 6379,
        created_at: NOW - 60,
        expires_at: NOW + 60,
        last_used: -1,
        is_active: true,
        encrypted_password: "",
        ...overrides,
    };
}

test("an active, unexpired connection record of this session is usable", () => {
    assert.equal(isUsableConnectionRecord(record(), "session-1", NOW), true);
    assert.equal(isUsableConnectionRecord(record({ expires_at: -1 }), "session-1", NOW), true);
});

test("a missing, revoked or expired record is not usable", () => {
    assert.equal(isUsableConnectionRecord(null, "session-1", NOW), false);
    assert.equal(isUsableConnectionRecord(undefined, "session-1", NOW), false);
    assert.equal(isUsableConnectionRecord(record({ is_active: false }), "session-1", NOW), false);
    assert.equal(isUsableConnectionRecord(record({ expires_at: NOW }), "session-1", NOW), false);
    assert.equal(isUsableConnectionRecord(record({ expires_at: NOW - 1 }), "session-1", NOW), false);
});

test("another session's record, or a PAT row, is not usable", () => {
    assert.equal(isUsableConnectionRecord(record(), "session-2", NOW), false);
    assert.equal(isUsableConnectionRecord(record({ name: "my token" }), "session-1", NOW), false);
});

test("expiry defaults to the current time", () => {
    const now = Math.floor(Date.now() / 1000);
    assert.equal(isUsableConnectionRecord(record({ expires_at: now + 3600 }), "session-1"), true);
    assert.equal(isUsableConnectionRecord(record({ expires_at: now - 3600 }), "session-1"), false);
});
