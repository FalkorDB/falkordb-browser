import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server.js";

type TokenRecord = {
    token_hash: string;
    token_id: string;
    user_id: string;
    username: string;
    name: string;
    role: string;
    host: string;
    port: number;
    created_at: number;
    expires_at: number;
    last_used: number;
};

type TokenQuery = {
    isAdmin: boolean;
    username: string;
    host: string;
    port: number;
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
    getClient(): Promise<unknown>;
    getStorage(): { fetchTokens(query: TokenQuery): Promise<TokenRecord[]> };
    getAuthSecret(): string | undefined;
    generateTimeUUID(): string;
    storeEncryptedCredential(credential: StoredCredential): Promise<void>;
};

type RouteTestOptions = {
    user?: {
        id: string;
        role: string;
        username?: string;
        host?: string;
        port?: number;
        tls?: boolean;
        ca?: string;
        password?: string;
    };
    authResponse?: NextResponse;
    sessionError?: Error;
    storageError?: Error;
    tokens?: TokenRecord[];
    secret?: string;
    secretError?: Error;
    storeError?: Error;
};

declare global {
    var __tokenRouteTest: RouteTestState | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient() { return globalThis.__tokenRouteTest.getClient(); } export function generateTimeUUID() { return 'token-id-fixed'; } export const PAT_BINDING_VERSION = 2;";
const tokenUtilsModule = "data:text/javascript,export function getAuthSecret() { return globalThis.__tokenRouteTest.getAuthSecret(); } export async function storeEncryptedCredential(credential) { return globalThis.__tokenRouteTest.storeEncryptedCredential(credential); }";
const storageModule = "data:text/javascript,export default { getStorage() { return globalThis.__tokenRouteTest.getStorage(); } };";
const utilsUrl = new URL("../../utils.ts", import.meta.url).href;
const validateBodyUrl = new URL("../../validate-body.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "../[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "../tokenUtils") {
                return { url: tokenUtilsModule, shortCircuit: true };
            }
            if (specifier === "@/lib/token-storage/StorageFactory") {
                return { url: storageModule, shortCircuit: true };
            }
            if (specifier === "../../utils") {
                return nextResolve(utilsUrl, context);
            }
            if (specifier === "../../validate-body") {
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

const { GET, POST } = await import("./route.ts");

after(() => {
    delete globalThis.__tokenRouteTest;
    hooks.deregister();
});

function harness(options: RouteTestOptions = {}) {
    const fetchQueries: TokenQuery[] = [];
    const storedCredentials: StoredCredential[] = [];
    let getClientCalls = 0;
    globalThis.__tokenRouteTest = {
        async getClient() {
            getClientCalls += 1;
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                user: options.user ?? {
                    id: "user-1",
                    role: "Admin",
                    username: "alice",
                    host: "db.example",
                    port: 6380,
                    password: "connection-secret",
                },
            };
        },
        getStorage() {
            return {
                async fetchTokens(query) {
                    fetchQueries.push(query);
                    if (options.storageError) throw options.storageError;
                    return options.tokens ?? [];
                },
            };
        },
        getAuthSecret() {
            if (options.secretError) throw options.secretError;
            return options.secret;
        },
        generateTimeUUID() {
            return "token-id-fixed";
        },
        async storeEncryptedCredential(credential) {
            storedCredentials.push(credential);
            if (options.storeError) throw options.storeError;
        },
    };
    return {
        fetchQueries,
        storedCredentials,
        getClientCalls: () => getClientCalls,
    };
}

function getRequest(): Request {
    return new Request("https://example.test/api/auth/tokens");
}

function postRequest(body: string): NextRequest {
    return new NextRequest("https://example.test/api/auth/tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
    });
}

function tokenRecord(overrides: Partial<TokenRecord> = {}): TokenRecord {
    return {
        token_hash: "hash",
        token_id: "token-1",
        user_id: "user-1",
        username: "alice",
        name: "automation",
        role: "Admin",
        host: "db.example",
        port: 6380,
        created_at: 1_700_000_000,
        expires_at: -1,
        last_used: 0,
        ...overrides,
    };
}

test("GET returns ISO token timestamps and applies the administrator filter", async () => {
    const state = harness({
        tokens: [tokenRecord({ last_used: 1_700_000_300 })],
    });

    const response = await GET(getRequest());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        tokens: [{
            token_hash: "hash",
            token_id: "token-1",
            user_id: "user-1",
            username: "alice",
            name: "automation",
            role: "Admin",
            host: "db.example",
            port: 6380,
            created_at: "2023-11-14T22:13:20.000Z",
            expires_at: null,
            last_used: "2023-11-14T22:18:20.000Z",
        }],
        count: 1,
        role: "Admin",
    });
    assert.deepEqual(state.fetchQueries, [{
        isAdmin: true,
        username: "alice",
        host: "db.example",
        port: 6380,
    }]);
});

test("GET applies member defaults and serializes finite expiry timestamps", async () => {
    const state = harness({
        user: { id: "user-2", role: "Member" },
        tokens: [tokenRecord({ expires_at: 1_700_000_600, last_used: -1 })],
    });

    const response = await GET(getRequest());

    assert.equal(response.status, 200);
    assert.deepEqual(state.fetchQueries, [{
        isAdmin: false,
        username: "default",
        host: "localhost",
        port: 6379,
    }]);
    assert.deepEqual(await response.json(), {
        tokens: [{
            token_hash: "hash",
            token_id: "token-1",
            user_id: "user-1",
            username: "alice",
            name: "automation",
            role: "Admin",
            host: "db.example",
            port: 6380,
            created_at: "2023-11-14T22:13:20.000Z",
            expires_at: "2023-11-14T22:23:20.000Z",
            last_used: null,
        }],
        count: 1,
        role: "Member",
    });
});

test("GET passes authentication responses through", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const state = harness({ authResponse: denied });

    assert.strictEqual(await GET(getRequest()), denied);
    assert.deepEqual(state.fetchQueries, []);
});

test("GET maps token storage failures to a safe error response", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ storageError: new Error("storage path unavailable") });

    const response = await GET(getRequest());

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Failed to fetch tokens" });
});

test("GET reports unexpected session errors", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ sessionError: new Error("session unavailable") });

    const response = await GET(getRequest());

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
});

test("POST reports a configuration error before authenticating when no secret exists", async () => {
    const state = harness();

    const response = await POST(postRequest(JSON.stringify({ name: "automation" })));

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Server configuration error" });
    assert.equal(state.getClientCalls(), 0);
});

test("POST passes authentication responses through", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const state = harness({ secret: "unit-test-secret", authResponse: denied });

    assert.strictEqual(await POST(postRequest(JSON.stringify({ name: "automation" }))), denied);
    assert.equal(state.storedCredentials.length, 0);
});

test("POST rejects malformed JSON and invalid token data", async () => {
    harness({ secret: "unit-test-secret" });

    const malformedResponse = await POST(postRequest("{"));
    assert.equal(malformedResponse.status, 400);
    assert.deepEqual(await malformedResponse.json(), { message: "Invalid JSON in request body" });

    const invalidResponse = await POST(postRequest(JSON.stringify({ name: "", ttlSeconds: 0 })));
    assert.equal(invalidResponse.status, 400);
});

test("POST rejects expiration dates that are not in the future", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 1_700_000_123_999 });
    harness({ secret: "unit-test-secret" });

    const response = await POST(postRequest(JSON.stringify({
        name: "automation",
        expiresAt: "2020-01-01T00:00:00.000Z",
    })));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Expiration date must be in the future" });
});

test("POST signs token claims and stores the credential with a TTL", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 1_700_000_123_999 });
    const state = harness({ secret: "unit-test-secret" });

    const response = await POST(postRequest(JSON.stringify({
        name: "automation",
        ttlSeconds: 60,
    })));

    assert.equal(response.status, 200);
    const body = await response.json() as { message: string; token: string };
    assert.equal(body.message, "Token created successfully");
    const { payload } = await jwtVerify(body.token, new TextEncoder().encode("unit-test-secret"));
    assert.equal(payload.sub, "user-1");
    assert.equal(payload.jti, "token-id-fixed");
    assert.equal(payload.username, "alice");
    assert.equal(payload.role, "Admin");
    assert.equal(payload.host, "db.example");
    assert.equal(payload.port, 6380);
    assert.equal(payload.pbv, 2);
    assert.equal(payload.exp, 1_700_000_183);
    assert.equal("password" in payload, false);
    assert.equal(state.storedCredentials.length, 1);
    assert.match(state.storedCredentials[0].tokenHash, /^[a-f0-9]{64}$/);
    assert.deepEqual(state.storedCredentials[0], {
        tokenHash: state.storedCredentials[0].tokenHash,
        tokenId: "token-id-fixed",
        userId: "user-1",
        username: "alice",
        name: "automation",
        role: "Admin",
        host: "db.example",
        port: 6380,
        password: "connection-secret",
        expiresAtUnix: 1_700_000_183,
    });
});

test("POST accepts a future absolute expiry and stores its timestamp", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 1_700_000_123_999 });
    const state = harness({ secret: "unit-test-secret" });

    const response = await POST(postRequest(JSON.stringify({
        name: "automation",
        expiresAt: "2023-11-14T22:30:00.000Z",
    })));

    assert.equal(response.status, 200);
    assert.equal(state.storedCredentials[0].expiresAtUnix, 1_700_001_000);
});

test("POST defaults optional user fields and creates a non-expiring token", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 1_700_000_123_999 });
    const state = harness({
        secret: "unit-test-secret",
        user: { id: "user-2", role: "", username: "", host: "", port: 0, ca: "" },
    });

    const response = await POST(postRequest(JSON.stringify({ name: "unlimited" })));

    assert.equal(response.status, 200);
    const body = await response.json() as { token: string };
    const { payload } = await jwtVerify(body.token, new TextEncoder().encode("unit-test-secret"));
    assert.equal(payload.username, "default");
    assert.equal(payload.role, "");
    assert.equal(payload.host, "localhost");
    assert.equal(payload.port, 0);
    assert.equal("exp" in payload, false);
    assert.equal("ca" in payload, false);
    assert.deepEqual(state.storedCredentials[0], {
        tokenHash: state.storedCredentials[0].tokenHash,
        tokenId: "token-id-fixed",
        userId: "user-2",
        username: "default",
        name: "unlimited",
        role: "Unknown",
        host: "localhost",
        port: 6379,
        password: "",
        expiresAtUnix: -1,
    });
    assert.match(state.storedCredentials[0].tokenHash, /^[a-f0-9]{64}$/);
});

test("POST reports credential storage failures", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ secret: "unit-test-secret", storeError: new Error("storage unavailable") });

    const response = await POST(postRequest(JSON.stringify({ name: "automation" })));

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Failed to store token" });
});

test("POST reports unexpected token generation errors", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ secretError: new Error("secret lookup failed") });

    const response = await POST(postRequest(JSON.stringify({ name: "automation" })));

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
});
