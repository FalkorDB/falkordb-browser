import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__encryptTestSession(request); } export function generateConsistentUserId(username,host,port) { return JSON.stringify([username,host,port]); }";

declare global {
    var __encryptTestSession: ((request: NextRequest) => Promise<unknown>) | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "../auth/[...nextauth]/options") return { url: authModule, shortCircuit: true };
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier === "../utils" || specifier === "../auth/encryption") return nextResolve(`${specifier}.ts`, context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (url === routeUrl) {
            const source = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
                fileName: fileURLToPath(url),
                compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, inlineSourceMap: true, inlineSources: true },
            }).outputText;
            return { format: "module", source, shortCircuit: true };
        }
        return nextLoad(url, context);
    },
});

const { POST } = await import("./route.ts");
const previousKey = process.env.ENCRYPTION_KEY;
before(() => { process.env.ENCRYPTION_KEY = "a".repeat(64); });
after(() => {
    if (previousKey === undefined) delete process.env.ENCRYPTION_KEY;
    else process.env.ENCRYPTION_KEY = previousKey;
    delete globalThis.__encryptTestSession;
});

function session(username: string, host = "localhost", port = 6379) {
    globalThis.__encryptTestSession = async () => ({ user: { username, host, port } });
}

function send(body: string) {
    return POST(new NextRequest("http://localhost/api/encrypt", { method: "POST", body }));
}

test("owner-bound ciphertext round trips for one connection and rejects another", async () => {
    session("alice");
    const encrypted = await send(JSON.stringify({ value: "test-value", action: "encrypt" }));
    assert.equal(encrypted.status, 200);
    const { value } = await encrypted.json() as { value: string };
    assert.notEqual(value, "test-value");
    const sameOwner = await send(JSON.stringify({ value, action: "decrypt" }));
    assert.equal(sameOwner.status, 200);
    assert.deepEqual(await sameOwner.json(), { value: "test-value" });
    session("bob");
    const otherOwner = await send(JSON.stringify({ value, action: "decrypt" }));
    assert.equal(otherOwner.status, 403);
    assert.deepEqual(await otherOwner.json(), { error: "Value does not belong to this connection" });
});

test("rejects malformed or invalid requests and handles empty values", async () => {
    session("alice");
    for (const [body, message] of [
        ["{", "Invalid JSON in request body"],
        ["null", "Request body must be a JSON object"],
        ['{"action":"encrypt"}', "Missing or invalid 'value'"],
        ['{"value":"data","action":"other"}', "Action must be 'encrypt' or 'decrypt'"],
    ] as const) {
        const response = await send(body);
        assert.equal(response.status, 400);
        assert.equal((await response.json()).error, message);
    }
    for (const action of ["encrypt", "decrypt"]) {
        const response = await send(JSON.stringify({ value: "", action }));
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { value: "" });
    }
});

test("rejects legacy ciphertext and reports missing encryption configuration", async () => {
    session("alice");
    const legacy = await send(JSON.stringify({ value: "old:cipher:text", action: "decrypt" }));
    assert.equal(legacy.status, 400);
    assert.match((await legacy.json()).error, /predates owner binding/);
    delete process.env.ENCRYPTION_KEY;
    try {
        const response = await send(JSON.stringify({ value: "v2:aa:bb:cc", action: "decrypt" }));
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { error: "Server configuration error" });
    } finally {
        process.env.ENCRYPTION_KEY = "a".repeat(64);
    }
});

test("passes through authentication failures and rejects missing connection identity", async () => {
    globalThis.__encryptTestSession = async () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    assert.equal((await send("{}")).status, 401);
    globalThis.__encryptTestSession = async () => ({ user: { username: "alice" } });
    const response = await send("{}");
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "Connection identity unavailable, please retry" });
});

test("reports unexpected session errors", async (t) => {
    t.mock.method(console, "error", () => {});
    globalThis.__encryptTestSession = async () => { throw new Error("session failure"); };
    const response = await send("{}");
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: "Internal server error" });
});
