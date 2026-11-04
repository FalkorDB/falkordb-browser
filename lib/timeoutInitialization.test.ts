import test from "node:test";
import assert from "node:assert/strict";
import { isTimeoutInitializationReady, timeoutInitializationKey } from "./timeoutInitialization.ts";

const session = {
    expires: "2026-11-04T15:00:00.000Z",
    user: { id: "session-a", host: "localhost", port: 6379, username: "default" },
};

test("timeout readiness is scoped to the current authenticated session and prefix", () => {
    const currentKey = timeoutInitializationKey("authenticated", true, session, "connection-a");
    const renewedSessionKey = timeoutInitializationKey(
        "authenticated",
        true,
        { ...session, user: { ...session.user, id: "session-b" } },
        "connection-a",
    );
    const switchedPrefixKey = timeoutInitializationKey("authenticated", true, session, "connection-b");

    assert.ok(currentKey);
    assert.equal(isTimeoutInitializationReady(currentKey, currentKey), true);
    assert.equal(isTimeoutInitializationReady(renewedSessionKey, currentKey), false);
    assert.equal(isTimeoutInitializationReady(switchedPrefixKey, currentKey), false);
    assert.equal(isTimeoutInitializationReady(null, currentKey), false);
    assert.equal(timeoutInitializationKey(
        "authenticated", true, { ...session, expires: "2026-11-05T15:00:00.000Z" }, "connection-a",
    ), currentKey);
});

test("timeout readiness stays closed until an authenticated prefix is initialized", () => {
    assert.equal(timeoutInitializationKey("loading", false, session, null), null);
    assert.equal(timeoutInitializationKey("unauthenticated", false, session, null), null);
    assert.equal(timeoutInitializationKey("authenticated", false, session, "connection-a"), null);
});

test("session refresh preserves readiness but connection mismatch closes it", () => {
    const key = timeoutInitializationKey("authenticated", true, session, "connection-a", "connection-a");
    assert.equal(timeoutInitializationKey("loading", true, session, "connection-a", "connection-a"), key);
    assert.equal(timeoutInitializationKey("loading", true, null, "connection-a", "connection-a"), null);
    assert.equal(timeoutInitializationKey("unauthenticated", true, session, "connection-a", "connection-a"), null);
    assert.equal(timeoutInitializationKey("authenticated", true, session, "connection-a", "connection-b"), null);
    assert.equal(timeoutInitializationKey("authenticated", true, session, "connection-b", "connection-b") === key, false);
    assert.equal(timeoutInitializationKey("authenticated", true, session, "connection-a", null), key);
});
