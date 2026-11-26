import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

type AuthenticatedUser = {
    role: string;
    username?: string;
    host?: string;
    port?: string | number;
};

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
    is_active: boolean;
};

type RouteTestState = {
    getClient(): Promise<unknown>;
    fetchTokenById(tokenId: string): Promise<TokenRecord | null>;
    revokeToken(tokenId: string, username: string): Promise<boolean>;
};

type RouteTestOptions = {
    user?: AuthenticatedUser;
    authResponse?: NextResponse;
    sessionError?: Error;
    token?: TokenRecord | null;
    storageError?: Error;
    revokeResult?: boolean;
};

declare global {
    var __tokenIdRouteTest: RouteTestState | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient() { return globalThis.__tokenIdRouteTest.getClient(); }";
const storageModule = "data:text/javascript,export default { getStorage() { const state = globalThis.__tokenIdRouteTest; return { fetchTokenById: (id) => state.fetchTokenById(id), revokeToken: (id, username) => state.revokeToken(id, username) }; } };";
const utilsUrl = new URL("../../../utils.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/lib/token-storage/StorageFactory") {
                return { url: storageModule, shortCircuit: true };
            }
            if (specifier === "../../[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "../../../utils") {
                return nextResolve(utilsUrl, context);
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

const { GET, DELETE } = await import("./route.ts");

after(() => {
    delete globalThis.__tokenIdRouteTest;
    hooks.deregister();
});

function tokenRecord(overrides: Partial<TokenRecord> = {}): TokenRecord {
    return {
        token_hash: "token-hash",
        token_id: "token-123",
        user_id: "user-1",
        username: "alice",
        name: "automation",
        role: "Member",
        host: "db.example",
        port: 6380,
        created_at: 1_700_000_000,
        expires_at: -1,
        last_used: 0,
        is_active: true,
        ...overrides,
    };
}

function harness(options: RouteTestOptions = {}) {
    const fetchedIds: string[] = [];
    const revoked: Array<{ tokenId: string; username: string }> = [];
    globalThis.__tokenIdRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                user: options.user ?? {
                    role: "Member",
                    username: "alice",
                    host: "DB.EXAMPLE",
                    port: "6380",
                },
            };
        },
        async fetchTokenById(tokenId) {
            fetchedIds.push(tokenId);
            if (options.storageError) throw options.storageError;
            return options.token === undefined ? tokenRecord() : options.token;
        },
        async revokeToken(tokenId, username) {
            revoked.push({ tokenId, username });
            if (options.storageError) throw options.storageError;
            return options.revokeResult ?? true;
        },
    };
    return { fetchedIds, revoked };
}

function request(): NextRequest {
    return new NextRequest("https://example.test/api/auth/tokens/token-123");
}

function context(tokenId = "token-123") {
    return { params: Promise.resolve({ tokenId }) };
}

test("GET returns token details to its owner on the same endpoint", async () => {
    const state = harness();

    const response = await GET(request(), context());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        token: {
            token_hash: "token-hash",
            token_id: "token-123",
            user_id: "user-1",
            username: "alice",
            name: "automation",
            role: "Member",
            host: "db.example",
            port: 6380,
            created_at: "2023-11-14T22:13:20.000Z",
            expires_at: null,
            last_used: null,
            is_active: true,
        },
    });
    assert.deepEqual(state.fetchedIds, ["token-123"]);
});

test("GET normalizes empty hosts to localhost when checking ownership", async () => {
    harness({
        user: { role: "Member", username: "alice", host: "", port: 6380 },
        token: tokenRecord({ host: "" }),
    });

    const response = await GET(request(), context());

    assert.equal(response.status, 200);
});

test("GET allows an administrator for the same endpoint", async () => {
    harness({
        user: { role: "Admin", username: "operator", host: "db.example", port: 6380 },
    });

    const response = await GET(request(), context());

    assert.equal(response.status, 200);
});

test("GET serializes finite expiry and last-used timestamps", async () => {
    harness({
        token: tokenRecord({ expires_at: 1_700_000_600, last_used: 1_700_000_300 }),
    });

    const response = await GET(request(), context());

    assert.deepEqual(await response.json(), {
        token: {
            token_hash: "token-hash",
            token_id: "token-123",
            user_id: "user-1",
            username: "alice",
            name: "automation",
            role: "Member",
            host: "db.example",
            port: 6380,
            created_at: "2023-11-14T22:13:20.000Z",
            expires_at: "2023-11-14T22:23:20.000Z",
            last_used: "2023-11-14T22:18:20.000Z",
            is_active: true,
        },
    });
});

test("GET returns not found for an unknown token", async () => {
    const state = harness({ token: null });

    const response = await GET(request(), context("missing"));

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: "Token not found" });
    assert.deepEqual(state.fetchedIds, ["missing"]);
});

test("GET denies users who do not own a token on their endpoint", async () => {
    harness({
        user: { role: "Member", username: "alice", host: "other.example", port: 6380 },
    });

    const response = await GET(request(), context());

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
        message: "Forbidden: You can only view tokens for your connection",
    });
});

test("GET denies the token owner when the port differs", async () => {
    harness({
        user: { role: "Member", username: "alice", host: "db.example", port: 6381 },
    });

    const response = await GET(request(), context());

    assert.equal(response.status, 403);
});

test("GET denies an administrator on a different endpoint", async () => {
    harness({
        user: { role: "Admin", username: "operator", host: "other.example", port: 6380 },
    });

    const response = await GET(request(), context());

    assert.equal(response.status, 403);
});

test("GET passes authentication responses through", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const state = harness({ authResponse: denied });

    assert.strictEqual(await GET(request(), context()), denied);
    assert.deepEqual(state.fetchedIds, []);
});

test("GET reports storage and session failures", async (t) => {
    t.mock.method(console, "error", () => {});

    harness({ storageError: new Error("storage unavailable") });
    const storageResponse = await GET(request(), context());
    assert.equal(storageResponse.status, 500);
    assert.deepEqual(await storageResponse.json(), { message: "Internal server error" });

    harness({ sessionError: new Error("session unavailable") });
    const sessionResponse = await GET(request(), context());
    assert.equal(sessionResponse.status, 500);
    assert.deepEqual(await sessionResponse.json(), { message: "Internal server error" });
});

test("DELETE reports an already revoked token before checking ownership", async () => {
    const state = harness({
        token: tokenRecord({ is_active: false }),
        user: { role: "Member", username: "other", host: "other.example", port: 1 },
    });

    const response = await DELETE(request(), context());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Token is already revoked" });
    assert.deepEqual(state.revoked, []);
});

test("DELETE passes authentication responses through", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const state = harness({ authResponse: denied });

    assert.strictEqual(await DELETE(request(), context()), denied);
    assert.deepEqual(state.fetchedIds, []);
});

test("DELETE returns not found for an unknown token", async () => {
    const state = harness({ token: null });

    const response = await DELETE(request(), context("missing"));

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: "Token not found" });
    assert.deepEqual(state.revoked, []);
});

test("DELETE denies revocation by a different user and endpoint", async () => {
    const state = harness({
        user: { role: "Member", username: "other", host: "other.example", port: 6380 },
    });

    const response = await DELETE(request(), context());

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
        message: "Forbidden: You can only revoke tokens for your connection",
    });
    assert.deepEqual(state.revoked, []);
});

test("DELETE denies an owner using a different port", async () => {
    const state = harness({
        user: { role: "Member", username: "alice", host: "db.example", port: 6381 },
    });

    const response = await DELETE(request(), context());

    assert.equal(response.status, 403);
    assert.deepEqual(state.revoked, []);
});

test("DELETE revokes an owned token and returns its identifier", async () => {
    const state = harness();

    const response = await DELETE(request(), context());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        message: "Token revoked successfully",
        tokenId: "token-123",
    });
    assert.deepEqual(state.revoked, [{ tokenId: "token-123", username: "alice" }]);
});

test("DELETE lets administrators revoke tokens for their endpoint", async () => {
    const state = harness({
        user: { role: "Admin", username: "", host: "db.example", port: 6380 },
    });

    const response = await DELETE(request(), context());

    assert.equal(response.status, 200);
    assert.deepEqual(state.revoked, [{ tokenId: "token-123", username: "default" }]);
});

test("DELETE reports unsuccessful and failed storage operations", async (t) => {
    t.mock.method(console, "error", () => {});

    harness({ revokeResult: false });
    const failedResponse = await DELETE(request(), context());
    assert.equal(failedResponse.status, 500);
    assert.deepEqual(await failedResponse.json(), { message: "Failed to revoke token" });

    harness({ storageError: new Error("storage unavailable") });
    const errorResponse = await DELETE(request(), context());
    assert.equal(errorResponse.status, 500);
    assert.deepEqual(await errorResponse.json(), { message: "Internal server error" });
});
