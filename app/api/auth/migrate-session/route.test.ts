import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";

type ConnectionRecord = {
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
    encrypted_password: string;
    kind: "session" | "pat";
    tls?: boolean;
    ca?: string;
    cert?: string;
    encrypted_key?: string;
};

type Session = {
    activeConnectionId?: string;
    user: { id: string };
};

type RouteTestState = {
    getSessionFromRequest(request: Request): Promise<Session | null>;
    fetchTokenById(tokenId: string): Promise<ConnectionRecord | null>;
};

type RouteTestOptions = {
    session?: Session | null;
    sessionError?: Error;
    record?: ConnectionRecord | null;
    storageError?: Error;
};

declare global {
    var __migrateSessionRouteTest: RouteTestState | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getSessionFromRequest(request) { return globalThis.__migrateSessionRouteTest.getSessionFromRequest(request); }";
const storageModule = "data:text/javascript,export default { getStorage() { return { fetchTokenById: (id) => globalThis.__migrateSessionRouteTest.fetchTokenById(id) }; } };";
const utilsUrl = new URL("../../utils.ts", import.meta.url).href;
const connectionBindingUrl = new URL("../../../../lib/connectionBinding.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "@/app/api/utils") {
                return nextResolve(utilsUrl, context);
            }
            if (specifier === "@/lib/connectionBinding") {
                return nextResolve(connectionBindingUrl, context);
            }
            if (specifier === "@/lib/token-storage/StorageFactory") {
                return { url: storageModule, shortCircuit: true };
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
    delete globalThis.__migrateSessionRouteTest;
    hooks.deregister();
});

function connectionRecord(overrides: Partial<ConnectionRecord> = {}): ConnectionRecord {
    return {
        token_id: "connection-1",
        user_id: "session-1",
        username: "alice",
        name: "connection:connection-1",
        role: "Admin",
        host: "db.example",
        port: 6380,
        created_at: 1_700_000_000,
        expires_at: -1,
        last_used: -1,
        is_active: true,
        encrypted_password: "not-returned",
        kind: "session",
        tls: true,
        ca: "ca-certificate",
        cert: "client-certificate",
        encrypted_key: "not-returned",
        ...overrides,
    };
}

function harness(options: RouteTestOptions = {}) {
    let sessionCalls = 0;
    const fetchedIds: string[] = [];
    globalThis.__migrateSessionRouteTest = {
        async getSessionFromRequest() {
            sessionCalls += 1;
            if (options.sessionError) throw options.sessionError;
            return options.session === undefined
                ? { activeConnectionId: "connection-1", user: { id: "session-1" } }
                : options.session;
        },
        async fetchTokenById(tokenId) {
            fetchedIds.push(tokenId);
            if (options.storageError) throw options.storageError;
            return options.record === undefined ? connectionRecord() : options.record;
        },
    };
    return { fetchedIds, sessionCalls: () => sessionCalls };
}

function request(headers: HeadersInit = { authorization: "Bearer test-only" }): Request {
    return new Request("https://example.test/api/auth/migrate-session", {
        method: "POST",
        headers,
    });
}

test("POST returns only the active connection details from a usable record", async () => {
    const state = harness();

    const response = await POST(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        connection: {
            id: "connection-1",
            username: "alice",
            role: "Admin",
            host: "db.example",
            port: 6380,
            tls: true,
            ca: "ca-certificate",
            cert: "client-certificate",
        },
    });
    assert.deepEqual(state.fetchedIds, ["connection-1"]);
    assert.equal(state.sessionCalls(), 1);
});

test("POST defaults unset TLS details and omits empty certificates", async () => {
    harness({
        record: connectionRecord({ tls: undefined, ca: "", cert: "" }),
    });

    const response = await POST(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        connection: {
            id: "connection-1",
            username: "alice",
            role: "Admin",
            host: "db.example",
            port: 6380,
            tls: false,
        },
    });
});

test("POST rejects an invalid origin before reading the session", async () => {
    const state = harness();

    const response = await POST(request({ origin: "not a valid origin" }));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Untrusted request origin" });
    assert.equal(state.sessionCalls(), 0);
});

test("POST rejects sessions without an active connection", async () => {
    const state = harness({ session: { user: { id: "session-1" } } });

    const response = await POST(request());

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
        message: "No active connection. Please sign in again.",
        code: "SESSION_INVALID",
    });
    assert.deepEqual(state.fetchedIds, []);
});

test("POST rejects missing or unusable connection records", async () => {
    harness({ record: null });
    const missingResponse = await POST(request());
    assert.equal(missingResponse.status, 401);
    assert.deepEqual(await missingResponse.json(), {
        message: "No active connection. Please sign in again.",
        code: "SESSION_INVALID",
    });

    harness({ record: connectionRecord({ user_id: "different-session" }) });
    const wrongOwnerResponse = await POST(request());
    assert.equal(wrongOwnerResponse.status, 401);
    assert.deepEqual(await wrongOwnerResponse.json(), {
        message: "No active connection. Please sign in again.",
        code: "SESSION_INVALID",
    });

    harness({ record: connectionRecord({ kind: "pat" }) });
    const patResponse = await POST(request());
    assert.equal(patResponse.status, 401);
});

test("POST reports session and storage lookup failures", async (t) => {
    t.mock.method(console, "error", () => {});

    harness({ sessionError: new Error("session unavailable") });
    const sessionResponse = await POST(request());
    assert.equal(sessionResponse.status, 500);
    assert.deepEqual(await sessionResponse.json(), { message: "Internal server error" });

    harness({ storageError: new Error("storage unavailable") });
    const storageResponse = await POST(request());
    assert.equal(storageResponse.status, 500);
    assert.deepEqual(await storageResponse.json(), { message: "Internal server error" });
});
