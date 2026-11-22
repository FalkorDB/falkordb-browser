import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
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
