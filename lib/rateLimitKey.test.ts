import test from "node:test";
import assert from "node:assert/strict";
import { clientAddressFromForwardedFor, isPreconfiguredSignIn, readNonNegativeInt } from "./rateLimitKey.ts";

test("preconfigured sign-in classification cannot be bypassed with duplicate flags", async () => {
    for (const body of ["preconfigured=false&preconfigured=true", "preconfigured=true&preconfigured=false"]) {
        const request = new Request("https://app.example/api/auth/callback/credentials", {
            method: "POST", body,
            headers: { "content-type": "application/x-www-form-urlencoded", "content-length": String(body.length) },
        });
        assert.equal(await isPreconfiguredSignIn(request), true);
        assert.equal(await request.text(), body);
    }
    const body = "preconfigured=false";
    assert.equal(await isPreconfiguredSignIn(new Request("https://app.example/api/auth/callback/credentials", {
        method: "POST", body, headers: { "content-length": String(body.length) },
    })), false);
});

test("preconfigured sign-in decoding agrees with Request for a UTF-8 BOM", async () => {
    for (const [type, text] of [
        ["application/json", '{"preconfigured":"true"}'],
        ["application/x-www-form-urlencoded", "preconfigured=true"],
    ]) {
        const body = Buffer.from(`\uFEFF${text}`);
        const request = new Request("https://app.example/api/auth/callback/credentials", {
            method: "POST", body,
            headers: { "content-type": type, "content-length": String(body.byteLength) },
        });
        assert.equal(await isPreconfiguredSignIn(request), true);
        assert.equal(await request.text(), text);
    }
});

const SIGN_IN_URL = "https://app.example/api/auth/callback/credentials";

test("only POSTs to the credentials callback are inspected", async () => {
    const headers = { "content-length": "18" };
    const body = "preconfigured=true";
    assert.equal(await isPreconfiguredSignIn(new Request(SIGN_IN_URL, { headers })), false);
    assert.equal(await isPreconfiguredSignIn(new Request("https://app.example/api/auth/callback/other", {
        method: "POST", body, headers,
    })), false);
    assert.equal(await isPreconfiguredSignIn(new Request(SIGN_IN_URL, { method: "POST", body, headers })), true);
    // A byte body sets no Content-Type, so it is read as a form.
    assert.equal(await isPreconfiguredSignIn(new Request(SIGN_IN_URL, {
        method: "POST", body: new TextEncoder().encode(body), headers,
    })), true);
});

test("an unsized or oversized sign-in counts as preconfigured without being read", async () => {
    for (const headers of [{}, { "content-length": "invalid" }, { "content-length": String(16 * 1024 + 1) }] as Record<string, string>[]) {
        const request = new Request(SIGN_IN_URL, { method: "POST", body: "preconfigured=false", headers });
        assert.equal(await isPreconfiguredSignIn(request), true);
        assert.equal(request.bodyUsed, false);
    }
});

test("a sign-in streaming past its declared size counts as preconfigured", async () => {
    const request = new Request(SIGN_IN_URL, {
        method: "POST", body: "x".repeat(16 * 1024 + 1), headers: { "content-length": "10" },
    });
    assert.equal(await isPreconfiguredSignIn(request), true);
});

test("a failed cancellation of an oversized sign-in body is only logged", async (t) => {
    const warn = t.mock.method(console, "warn", () => {});
    const reader = {
        read: async () => ({ done: false, value: new Uint8Array(16 * 1024 + 1) }),
        cancel: () => Promise.reject(new Error("cancel failed")),
        releaseLock: () => {},
    };
    const request = {
        method: "POST",
        url: SIGN_IN_URL,
        headers: new Headers({ "content-length": "1" }),
        clone: () => ({ body: { getReader: () => reader } }),
    } as unknown as Request;
    assert.equal(await isPreconfiguredSignIn(request), true);
    await new Promise(resolve => { setImmediate(resolve); });
    assert.equal(warn.mock.callCount(), 1);
    assert.equal(warn.mock.calls[0].arguments[0], "Failed to cancel sign-in inspection:");
});

test("a sign-in without a body or with an unreadable JSON body is not preconfigured", async (t) => {
    const warn = t.mock.method(console, "warn", () => {});
    assert.equal(await isPreconfiguredSignIn(new Request(SIGN_IN_URL, {
        method: "POST", headers: { "content-length": "0" },
    })), false);
    for (const [body, warnings] of [["null", 0], ['{"preconfigured":true}', 0], ["{bad", 1]] as const) {
        assert.equal(await isPreconfiguredSignIn(new Request(SIGN_IN_URL, {
            method: "POST", body,
            headers: { "content-type": "application/json", "content-length": String(body.length) },
        })), false);
        assert.equal(warn.mock.callCount(), warnings);
    }
});

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
