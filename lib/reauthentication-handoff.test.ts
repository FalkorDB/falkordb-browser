import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  consumeReauthenticationHandoff,
  createReauthenticationHandoffId,
  isUsableReauthenticationHandoff,
  matchesReauthenticationEndpoint,
  readReauthenticationHandoffId,
} from "./reauthentication-handoff.ts";

const handoff = {
  token_id: "reauth:opaque",
  name: "reauth:opaque",
  kind: "session" as const,
  is_active: true,
  expires_at: 600,
  host: "db.example.test",
  port: 6380,
  username: "alice",
  tls: true,
};

describe("createReauthenticationHandoffId", () => {
  it("creates distinct opaque UUID references", () => {
    const first = createReauthenticationHandoffId();
    const second = createReauthenticationHandoffId();

    assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    assert.notEqual(first, second);
  });
});

describe("readReauthenticationHandoffId", () => {
  it("reads only the named handoff cookie", () => {
    assert.equal(
      readReauthenticationHandoffId("session=abc; falkordb-reauth-handoff=opaque-id; other=def"),
      "opaque-id",
    );
    assert.equal(readReauthenticationHandoffId("not-falkordb-reauth-handoff=wrong"), undefined);
    assert.equal(readReauthenticationHandoffId("falkordb-reauth-handoff="), undefined);
    assert.equal(readReauthenticationHandoffId(undefined), undefined);
  });
});

describe("matchesReauthenticationEndpoint", () => {
  it("matches the same host, port, username, and TLS mode", () => {
    assert.equal(matchesReauthenticationEndpoint(handoff, {
      host: "db.example.test",
      port: "6380",
      username: "alice",
      tls: "true",
    }), true);
  });

  it("rejects a host mismatch", () => {
    assert.equal(matchesReauthenticationEndpoint(handoff, { host: "other.example.test", port: "6380", username: "alice", tls: "true" }), false);
  });

  it("rejects a port mismatch, non-numeric port, and out-of-range port", () => {
    assert.equal(matchesReauthenticationEndpoint(handoff, { host: "db.example.test", port: "6379", username: "alice", tls: "true" }), false);
    assert.equal(matchesReauthenticationEndpoint(handoff, { host: "db.example.test", port: "not-a-port", username: "alice", tls: "true" }), false);
    assert.equal(matchesReauthenticationEndpoint(handoff, { host: "db.example.test", port: "0", username: "alice", tls: "true" }), false);
  });

  it("rejects a username mismatch", () => {
    assert.equal(matchesReauthenticationEndpoint(handoff, { host: "db.example.test", port: "6380", username: "bob", tls: "true" }), false);
  });

  it("rejects a TLS-mode mismatch", () => {
    assert.equal(matchesReauthenticationEndpoint(handoff, { host: "db.example.test", port: "6380", username: "alice", tls: "false" }), false);
  });

  it("uses the standard endpoint defaults when fields are omitted", () => {
    const defaultConnection = { ...handoff, host: "localhost", port: 6379, username: "default", tls: undefined };
    assert.equal(matchesReauthenticationEndpoint(defaultConnection, {}), true);
  });
});

describe("isUsableReauthenticationHandoff", () => {
  it("accepts an active session handoff before its expiry", () => {
    assert.equal(isUsableReauthenticationHandoff(handoff, 599), true);
  });

  it("rejects expired, inactive, non-session, and non-handoff records", () => {
    assert.equal(isUsableReauthenticationHandoff({ ...handoff, expires_at: 600 }, 600), false);
    assert.equal(isUsableReauthenticationHandoff({ ...handoff, expires_at: Number.POSITIVE_INFINITY }, 599), false);
    assert.equal(isUsableReauthenticationHandoff(handoff, Number.POSITIVE_INFINITY), false);
    assert.equal(isUsableReauthenticationHandoff({ ...handoff, is_active: false }, 599), false);
    assert.equal(isUsableReauthenticationHandoff({ ...handoff, kind: "pat" }, 599), false);
    assert.equal(isUsableReauthenticationHandoff({ ...handoff, name: "connection:opaque" }, 599), false);
  });
});

describe("consumeReauthenticationHandoff", () => {
  it("deletes the prefixed handoff and does not clean up a successful login", async () => {
    const deletedIds: string[] = [];
    let cleanupCalls = 0;

    const consumed = await consumeReauthenticationHandoff(
      "opaque",
      async tokenId => {
        deletedIds.push(tokenId);
        return true;
      },
      async () => { cleanupCalls += 1; },
    );

    assert.equal(consumed, true);
    assert.deepEqual(deletedIds, ["reauth:opaque"]);
    assert.equal(cleanupCalls, 0);
  });

  it("cleans up the rejected login when the handoff is already missing", async () => {
    let cleanupCalls = 0;

    const consumed = await consumeReauthenticationHandoff(
      "opaque",
      async () => false,
      async () => { cleanupCalls += 1; },
    );

    assert.equal(consumed, false);
    assert.equal(cleanupCalls, 1);
  });

  it("cleans up and propagates storage errors", async () => {
    const storageError = new Error("storage unavailable");
    let cleanupCalls = 0;

    await assert.rejects(
      consumeReauthenticationHandoff(
        "opaque",
        async () => { throw storageError; },
        async () => { cleanupCalls += 1; },
      ),
      error => error === storageError,
    );
    assert.equal(cleanupCalls, 1);
  });

  it("allows only one concurrent callback to consume the same handoff", async () => {
    let available = true;
    let cleanupCalls = 0;
    const deleteToken = async (tokenId: string) => {
      assert.equal(tokenId, "reauth:opaque");
      if (!available) return false;
      available = false;
      return true;
    };
    const onFailure = async () => { cleanupCalls += 1; };

    const results = await Promise.all([
      consumeReauthenticationHandoff("opaque", deleteToken, onFailure),
      consumeReauthenticationHandoff("opaque", deleteToken, onFailure),
    ]);

    assert.deepEqual(results.sort(), [false, true]);
    assert.equal(cleanupCalls, 1);
  });
});
