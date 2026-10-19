import test from "node:test";
import assert from "node:assert/strict";
import { NoConnectionCache, readServerState } from "./serverState.ts";

test("readServerState is stateful unless SERVER_STATE says stateless", () => {
    assert.equal(readServerState({}), "stateful");
    assert.equal(readServerState({ SERVER_STATE: "" }), "stateful");
    assert.equal(readServerState({ SERVER_STATE: "stateful" }), "stateful");
    assert.equal(readServerState({ SERVER_STATE: "full" }), "stateful");
    assert.equal(readServerState({ SERVER_STATE: "stateless" }), "stateless");
    assert.equal(readServerState({ SERVER_STATE: " Stateless " }), "stateless");
});

test("NoConnectionCache never returns what was set", () => {
    const cache = new NoConnectionCache<object>();
    const value = {};
    assert.equal(cache.set("a", value), cache);
    assert.equal(cache.get("a"), undefined);
    assert.equal(cache.delete("a"), false);
});
