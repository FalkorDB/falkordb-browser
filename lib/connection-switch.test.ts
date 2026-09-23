import test from "node:test";
import assert from "node:assert/strict";

import switchSessionConnection, { ConnectionSwitchRejectedError } from "./connection-switch.ts";

test("resolves when the session adopts the requested connection", async () => {
    let received: unknown;
    await switchSessionConnection(async (data) => {
        received = data;
        return { activeConnectionId: "b" };
    }, "b");

    assert.deepEqual(received, { activeConnectionId: "b" });
});

test("rejects when the session still names the previous connection", async () => {
    // The JWT callback declines a switch it cannot resolve, leaving the session
    // — and the host/port/username the storage prefix is built from — on the
    // old connection. Publishing that as success is what crosses the two.
    await assert.rejects(
        () => switchSessionConnection(async () => ({ activeConnectionId: "a" }), "b"),
        (error: unknown) => {
            assert.ok(error instanceof ConnectionSwitchRejectedError);
            assert.match((error as Error).message, /still on a/);
            return true;
        }
    );
});

test("rejects when the session names no connection at all", async () => {
    await assert.rejects(
        () => switchSessionConnection(async () => null, "b"),
        ConnectionSwitchRejectedError
    );
});

test("propagates a failed update untouched", async () => {
    const boom = new Error("network down");
    await assert.rejects(
        () => switchSessionConnection(async () => { throw boom; }, "b"),
        (error: unknown) => error === boom
    );
});
