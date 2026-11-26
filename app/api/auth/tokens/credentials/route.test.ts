import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server.js";

type ConnectionOptions = {
    host: string;
    port: string;
    username: string;
    password?: string;
    tls: string;
    ca: string;
};

type StoredCredential = {
    tokenHash: string;
    tokenId: string;
    userId: string;
    username: string;
    name: string;
    role: string;
    host: string;
    port: number;
    password: string;
    expiresAtUnix: number;
};

type RouteTestState = {
    getAuthSecret(): string | undefined;
    newClient(options: ConnectionOptions, userId: string): Promise<{ role: string }>;
    closeCachedConnection(userId: string): Promise<void>;
    generateTimeUUID(): string;
    storeEncryptedCredential(credential: StoredCredential): Promise<void>;
};

type RouteTestOptions = {
    secret?: string;
    secretError?: Error;
    connectError?: Error;
    closeError?: Error;
    storeError?: Error;
    role?: string;
};

declare global {
    var __credentialRouteTest: RouteTestState | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function newClient(options, userId) { return globalThis.__credentialRouteTest.newClient(options, userId); } export async function closeCachedConnection(userId) { return globalThis.__credentialRouteTest.closeCachedConnection(userId); } export function generateTimeUUID() { return 'pat-id-fixed'; } export const PAT_BINDING_VERSION = 1;";
const tokenUtilsModule = "data:text/javascript,export function getAuthSecret() { return globalThis.__credentialRouteTest.getAuthSecret(); } export async function storeEncryptedCredential(credential) { return globalThis.__credentialRouteTest.storeEncryptedCredential(credential); }";
const validateBodyUrl = new URL("../../../validate-body.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "../../[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "../../tokenUtils") {
                return { url: tokenUtilsModule, shortCircuit: true };
            }
            if (specifier === "../../../validate-body") {
                return nextResolve(validateBodyUrl, context);
            }
            if (specifier === "next/server") return nextResolve("next/server.js", context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (url === routeUrl) {
            const source = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
                fileName: fileURLToPath(url),
                compilerOptions: {
                    module: ts.ModuleKind.ESNext,
                    target: ts.ScriptTarget.ES2022,
                    inlineSourceMap: true,
                    inlineSources: true,
                },
            }).outputText;
            return { format: "module", source, shortCircuit: true };
        }
        return nextLoad(url, context);
    },
});

const { POST } = await import("./route.ts");

after(() => {
    delete globalThis.__credentialRouteTest;
    hooks.deregister();
});

function harness(options: RouteTestOptions = {}) {
    const connectionAttempts: Array<{ options: ConnectionOptions; userId: string }> = [];
    const closedIds: string[] = [];
    const storedCredentials: StoredCredential[] = [];
    globalThis.__credentialRouteTest = {
        getAuthSecret() {
            if (options.secretError) throw options.secretError;
            return options.secret;
        },
        async newClient(connectionOptions, userId) {
            connectionAttempts.push({ options: connectionOptions, userId });
            if (options.connectError) throw options.connectError;
            return { role: options.role ?? "Admin" };
        },
        async closeCachedConnection(userId) {
            closedIds.push(userId);
            if (options.closeError) throw options.closeError;
        },
        generateTimeUUID() {
            return "pat-id-fixed";
        },
        async storeEncryptedCredential(credential) {
            storedCredentials.push(credential);
            if (options.storeError) throw options.storeError;
        },
    };
    return { connectionAttempts, closedIds, storedCredentials };
}

function postRequest(body: string): NextRequest {
    return new NextRequest("https://example.test/api/auth/tokens/credentials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
    });
}

test("POST requires a signing secret before parsing or connecting", async () => {
    const state = harness();

    const response = await POST(postRequest("{"));

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
        message: "Server configuration error: AUTH_SECRET or NEXTAUTH_SECRET not set",
    });
    assert.deepEqual(state.connectionAttempts, []);
});

test("POST rejects malformed JSON and invalid credentials input", async () => {
    const state = harness({ secret: "unit-test-secret" });

    const malformedResponse = await POST(postRequest("{"));
    assert.equal(malformedResponse.status, 400);
    assert.deepEqual(await malformedResponse.json(), { message: "Invalid JSON in request body" });

    const invalidResponse = await POST(postRequest(JSON.stringify({ username: "" })));
    assert.equal(invalidResponse.status, 400);
    assert.deepEqual(await invalidResponse.json(), { message: "username: Username cannot be empty" });
    assert.deepEqual(state.connectionAttempts, []);
});

test("POST rejects client certificates because credentials tokens cannot persist them", async () => {
    const state = harness({ secret: "unit-test-secret" });

    const response = await POST(postRequest(JSON.stringify({
        cert: "Y2VydGlmaWNhdGU=",
        key: "a2V5",
        tls: "true",
    })));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
        message: "Client certificate authentication is not supported for API tokens; use a password-based token.",
    });
    assert.deepEqual(state.connectionAttempts, []);
});

test("POST maps connection failures to unauthorized and closes the attempted connection", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({ secret: "unit-test-secret", connectError: new Error("connection refused") });

    const response = await POST(postRequest(JSON.stringify({
        username: "alice",
        password: "db-password",
        host: "db.example",
        port: "6380",
    })));

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Invalid credentials or connection failed" });
    assert.equal(state.connectionAttempts.length, 1);
    assert.deepEqual(state.closedIds, [state.connectionAttempts[0].userId]);
});

test("POST validates past expiration dates after closing the authenticated connection", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 1_700_000_123_999 });
    const state = harness({ secret: "unit-test-secret" });

    const response = await POST(postRequest(JSON.stringify({
        username: "alice",
        password: "db-password",
        expiresAt: "2020-01-01T00:00:00.000Z",
    })));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Expiration date must be in the future" });
    assert.equal(state.connectionAttempts.length, 1);
    assert.deepEqual(state.closedIds, [state.connectionAttempts[0].userId]);
});

for (const ttlSeconds of [0, 31_622_401]) {
    test(`POST rejects out-of-range TTL ${ttlSeconds} after closing the authenticated connection`, async () => {
        const state = harness({ secret: "unit-test-secret" });

        const response = await POST(postRequest(JSON.stringify({
            username: "alice",
            password: "db-password",
            ttlSeconds,
        })));

        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), {
            message: "Invalid TTL value (must be between 1 and 31622400 seconds)",
        });
        assert.equal(state.storedCredentials.length, 0);
        assert.deepEqual(state.closedIds, [state.connectionAttempts[0].userId]);
    });
}

test("POST accepts a future absolute expiry", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 1_700_000_123_999 });
    t.mock.method(console, "log", () => {});
    const state = harness({ secret: "unit-test-secret" });

    const response = await POST(postRequest(JSON.stringify({
        username: "alice",
        password: "db-password",
        expiresAt: "2023-11-14T22:30:00.000Z",
    })));

    assert.equal(response.status, 200);
    assert.equal(state.storedCredentials[0].expiresAtUnix, 1_700_001_000);
});

test("POST authenticates credentials, signs a password-free PAT, and stores the credential", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 1_700_000_123_999 });
    t.mock.method(console, "log", () => {});
    const state = harness({ secret: "unit-test-secret", role: "Member" });

    const response = await POST(postRequest(JSON.stringify({
        username: "alice",
        password: "db-password",
        host: "db.example",
        port: "6380",
        tls: "true",
        ca: "ca-certificate",
        name: "cli token",
        ttlSeconds: 60,
    })));

    assert.equal(response.status, 200);
    const body = await response.json() as { message: string; token: string };
    assert.equal(body.message, "Token created successfully");
    const { payload } = await jwtVerify(body.token, new TextEncoder().encode("unit-test-secret"));
    assert.equal(payload.jti, "pat-id-fixed");
    assert.equal(payload.username, "alice");
    assert.equal(payload.role, "Member");
    assert.equal(payload.host, "db.example");
    assert.equal(payload.port, 6380);
    assert.equal(payload.tls, true);
    assert.equal(payload.pbv, 1);
    assert.equal(payload.exp, 1_700_000_183);
    assert.equal("password" in payload, false);

    assert.deepEqual(state.connectionAttempts[0].options, {
        host: "db.example",
        port: "6380",
        username: "alice",
        password: "db-password",
        tls: "true",
        ca: "ca-certificate",
    });
    assert.deepEqual(state.closedIds, [state.connectionAttempts[0].userId]);
    assert.equal(state.storedCredentials.length, 1);
    assert.match(state.storedCredentials[0].tokenHash, /^[a-f0-9]{64}$/);
    assert.deepEqual(state.storedCredentials[0], {
        tokenHash: state.storedCredentials[0].tokenHash,
        tokenId: "pat-id-fixed",
        userId: payload.sub,
        username: "alice",
        name: "cli token",
        role: "Member",
        host: "db.example",
        port: 6380,
        password: "db-password",
        expiresAtUnix: 1_700_000_183,
    });
});

test("POST applies login defaults and stores a non-expiring token", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 1_700_000_123_999 });
    t.mock.method(console, "log", () => {});
    const state = harness({ secret: "unit-test-secret" });

    const response = await POST(postRequest("{}"));

    assert.equal(response.status, 200);
    const body = await response.json() as { token: string };
    const { payload } = await jwtVerify(body.token, new TextEncoder().encode("unit-test-secret"));
    assert.equal(payload.username, "default");
    assert.equal(payload.host, "localhost");
    assert.equal(payload.port, 6379);
    assert.equal(payload.tls, false);
    assert.equal(payload.exp, undefined);
    assert.deepEqual(state.connectionAttempts[0].options, {
        host: "localhost",
        port: "6379",
        username: "default",
        password: undefined,
        tls: "false",
        ca: "undefined",
    });
    assert.deepEqual(state.storedCredentials[0], {
        tokenHash: state.storedCredentials[0].tokenHash,
        tokenId: "pat-id-fixed",
        userId: payload.sub,
        username: "default",
        name: "API Token",
        role: "Admin",
        host: "localhost",
        port: 6379,
        password: "",
        expiresAtUnix: -1,
    });
});

test("POST reports credential storage and cleanup failures", async (t) => {
    t.mock.method(console, "error", () => {});
    t.mock.method(console, "log", () => {});

    harness({ secret: "unit-test-secret", storeError: new Error("storage unavailable") });
    const storeResponse = await POST(postRequest("{}"));
    assert.equal(storeResponse.status, 500);
    assert.deepEqual(await storeResponse.json(), { message: "Failed to store token" });

    harness({ secret: "unit-test-secret", closeError: new Error("cleanup failed") });
    const cleanupResponse = await POST(postRequest("{}"));
    assert.equal(cleanupResponse.status, 500);
    assert.deepEqual(await cleanupResponse.json(), { message: "Internal server error" });
});
