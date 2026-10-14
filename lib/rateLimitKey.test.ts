import test from "node:test";
import assert from "node:assert/strict";
import { clientAddressFromForwardedFor, readNonNegativeInt } from "./rateLimitKey.ts";

// ---------------------------------------------------------------------------
// readNonNegativeInt
// ---------------------------------------------------------------------------

test("a whole non-negative number is read as is", () => {
    assert.equal(readNonNegativeInt("0", 200), 0);
    assert.equal(readNonNegativeInt("15", 200), 15);
    assert.equal(readNonNegativeInt(" 15 ", 200), 15);
});

test("anything else falls back rather than switching the limit off", () => {
    for (const raw of [undefined, "", "  ", "0abc", "10abc", "-1", "-0", "1.5", "1e3", "abc", "99999999999999999999"]) {
        assert.equal(readNonNegativeInt(raw, 200), 200, String(raw));
    }
});

// ---------------------------------------------------------------------------
// clientAddressFromForwardedFor
// ---------------------------------------------------------------------------

test("behind one proxy the right-most entry is the client", () => {
    assert.equal(clientAddressFromForwardedFor("203.0.113.7", 1), "203.0.113.7");
    // A client-supplied left-most entry is ignored, so rotating it buys nothing.
    assert.equal(clientAddressFromForwardedFor("1.1.1.1, 203.0.113.7", 1), "203.0.113.7");
    assert.equal(clientAddressFromForwardedFor("2.2.2.2, 203.0.113.7", 1), "203.0.113.7");
});

test("each further trusted proxy moves the client one entry left", () => {
    assert.equal(clientAddressFromForwardedFor("spoof, 203.0.113.7, 10.0.0.2", 2), "203.0.113.7");
});

test("zero hops is read as one: the right-most entry is still the best there is", () => {
    assert.equal(clientAddressFromForwardedFor("spoof, 203.0.113.7", 0), "203.0.113.7");
});

test("fewer entries than hops falls back to the left-most", () => {
    assert.equal(clientAddressFromForwardedFor("203.0.113.7", 3), "203.0.113.7");
});

test("blank entries are skipped and a missing header yields nothing", () => {
    assert.equal(clientAddressFromForwardedFor("203.0.113.7, , ", 1), "203.0.113.7");
    assert.equal(clientAddressFromForwardedFor("", 1), undefined);
    assert.equal(clientAddressFromForwardedFor(null, 1), undefined);
});
