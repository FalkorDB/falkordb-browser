import test from "node:test";
import assert from "node:assert/strict";
import { commitCanvasSession, ownsCanvasSession } from "./canvasSession.ts";
import { register3DCheck, writeCanvasData } from "./graph3DResources.ts";
import { getConnectionEpoch, setActiveConnectionIdGlobal } from "./active-connection.ts";

test("only the committed session and data may supply a canvas snapshot", () => {
    const canvas = {};
    const session = { graph: {}, data: {}, tabId: "a", epoch: 0 };
    assert.equal(ownsCanvasSession(canvas, session), false);
    commitCanvasSession(canvas, session);
    assert.equal(ownsCanvasSession(canvas, session), true);
    for (const pending of [
        { ...session, tabId: "b" },
        { ...session, graph: {} },
        { ...session, data: {} },
        { ...session, epoch: 1 },
        { ...session, restore: {} },
    ]) {
        assert.equal(ownsCanvasSession(canvas, pending), false);
    }
    assert.equal(ownsCanvasSession({}, session), false);
});

test("a pending restore retains its data until the renderer commits it", async () => {
    const canvas = { setGraphData() {} };
    const previous = { graph: {}, data: {}, tabId: "previous", epoch: 0 };
    const restore = {};
    const pending = { graph: {}, data: {}, tabId: "pending", epoch: 0, restore };
    commitCanvasSession(canvas, previous);
    const ready = Promise.withResolvers<boolean>();
    register3DCheck(canvas, () => ready.promise);
    let active = true;
    const write = writeCanvasData(canvas, { nodes: [], links: [] }, () => {
        commitCanvasSession(canvas, pending);
    }, () => active);
    assert.equal(ownsCanvasSession(canvas, pending), false);
    active = false;
    ready.resolve(true);
    assert.equal(await write, false);
    assert.equal(ownsCanvasSession(canvas, pending), false);
    assert.equal(ownsCanvasSession(canvas, previous), true);
    commitCanvasSession(canvas, pending);
    assert.equal(ownsCanvasSession(canvas, pending), true);
    assert.equal(ownsCanvasSession(canvas, { ...pending, restore: undefined }), true);
});

test("a safe-renderer wait cannot commit after a connection switch starts", async () => {
    setActiveConnectionIdGlobal("canvas-session-a");
    const epoch = getConnectionEpoch();
    const canvas = { setGraphData() {} };
    const ready = Promise.withResolvers<boolean>();
    register3DCheck(canvas, () => ready.promise);
    let written = false;
    const pending = writeCanvasData(canvas, { nodes: [], links: [] }, () => {
        written = true;
    }, () => getConnectionEpoch() === epoch);
    setActiveConnectionIdGlobal("canvas-session-b");
    ready.resolve(true);
    assert.equal(await pending, false);
    assert.equal(written, false);
    setActiveConnectionIdGlobal(null);
});
