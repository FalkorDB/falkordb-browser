import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getSessionFromRequest(request) { return globalThis.__connectionsRouteTest.getSession(request); } export async function listSessionConnections(id) { return globalThis.__connectionsRouteTest.list(id); } export async function addSessionConnection(id, connection) { return globalThis.__connectionsRouteTest.add(id, connection); }";

type TestSession = {
    user?: {
        id?: string;
        host?: string;
        port?: number;
        tls?: boolean;
    };
};

type ConnectionInput = {
    host: string;
    port: string;
    username: string;
    password: string;
    tls: string;
    ca?: string;
    cert?: string;
    key?: string;
};

declare global {
    var __connectionsRouteTest: {
        getSession: (request: Request) => Promise<TestSession | null>;
        list: (id: string) => Promise<unknown[]>;
        add: (id: string, connection: ConnectionInput) => Promise<unknown>;
    };
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") return { url: authModule, shortCircuit: true };
            if (specifier === "@/app/api/utils") return nextResolve(new URL("../utils.ts", import.meta.url).href, context);
            if (specifier === "@/app/api/validate-body") return nextResolve(new URL("../validate-body.ts", import.meta.url).href, context);
            if (specifier === "@/lib/login-errors") return nextResolve(new URL("../../../lib/login-errors.ts", import.meta.url).href, context);
            if (specifier === "next/server") return nextResolve("next/server.js", context);
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

const { GET, POST } = await import("./route.ts");
after(() => { Reflect.deleteProperty(globalThis, "__connectionsRouteTest"); });

function installTestSession(session: TestSession | null = null) {
    const calls: { list: string[]; add: Array<[string, ConnectionInput]> } = { list: [], add: [] };
    globalThis.__connectionsRouteTest = {
        getSession: async () => session,
        list: async (id) => {
            calls.list.push(id);
            return [{ id: "connection-1" }];
        },
        add: async (id, connection) => {
            calls.add.push([id, connection]);
            return { id: "connection-2" };
        },
    };
    return calls;
}

function send(method: "GET" | "POST", body?: string, headers?: Record<string, string>) {
    return new Request("http://localhost/api/connections", {
        method,
        headers: method === "POST" ? { "sec-fetch-site": "same-origin", ...headers } : headers,
        ...(body === undefined ? {} : { body }),
    });
}

test("GET rejects malformed origins before authentication or storage access", async () => {
    let authenticationCalls = 0;
    globalThis.__connectionsRouteTest = {
        getSession: async () => { authenticationCalls++; return null; },
        list: async () => { throw new Error("storage should not be called"); },
        add: async () => { throw new Error("storage should not be called"); },
    };
    const response = await GET(send("GET", undefined, { origin: "not an origin" }));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Untrusted request origin" });
    assert.equal(authenticationCalls, 0);
});

test("GET returns 401 for a missing session without listing connections", async () => {
    const calls = installTestSession();
    const response = await GET(send("GET"));
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Not authenticated" });
    assert.deepEqual(calls.list, []);
});

test("GET returns the current user's connections and CORS response headers", async () => {
    const calls = installTestSession({ user: { id: "test-user" } });
    const response = await GET(send("GET"));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { connections: [{ id: "connection-1" }] });
    assert.deepEqual(calls.list, ["test-user"]);
    assert.equal(response.headers.get("vary"), "Origin");
    assert.equal(response.headers.get("access-control-allow-methods"), "GET, POST, PUT, DELETE, PATCH, OPTIONS");
});

test("GET reports storage failures without exposing the cause", async (t) => {
    t.mock.method(console, "error", () => {});
    globalThis.__connectionsRouteTest = {
        getSession: async () => ({ user: { id: "test-user" } }),
        list: async () => { throw new Error("private storage detail"); },
        add: async () => { throw new Error("storage should not be called"); },
    };
    const response = await GET(send("GET"));
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
});

test("POST rejects a missing session before parsing or storing the request body", async () => {
    const calls = installTestSession();
    const response = await POST(send("POST", "{"));
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Not authenticated" });
    assert.deepEqual(calls.add, []);
});

test("POST rejects malformed JSON", async () => {
    const calls = installTestSession({ user: { id: "test-user", host: "session.example", port: 6379 } });
    const response = await POST(send("POST", "{"));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Invalid JSON payload" });
    assert.deepEqual(calls.add, []);
});

test("POST applies the real connection schema before storing", async () => {
    const calls = installTestSession({ user: { id: "test-user", host: "session.example", port: 6379 } });
    const response = await POST(send("POST", JSON.stringify({ host: 42 })));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).message, "host: Invalid Host");
    assert.deepEqual(calls.add, []);
});

test("POST rejects invalid client certificate encoding using the real schema", async () => {
    const calls = installTestSession({ user: { id: "test-user", host: "session.example", port: 6379 } });
    const response = await POST(send("POST", JSON.stringify({ cert: "not-base64", key: "Y2VydA==", tls: true })));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).message, "cert: Client certificate must be base64-encoded");
    assert.deepEqual(calls.add, []);
});

test("POST uses validated input and session defaults in the created connection", async () => {
    const calls = installTestSession({ user: { id: "test-user", host: "session.example", port: 6379, tls: true } });
    const response = await POST(send("POST", JSON.stringify({
        host: "custom.example",
        port: 6380,
        username: "test-user",
        password: "test-password",
        tls: false,
    })));
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { connection: { id: "connection-2" } });
    assert.deepEqual(calls.add, [["test-user", {
        host: "custom.example",
        port: "6380",
        username: "test-user",
        password: "test-password",
        tls: "false",
        ca: undefined,
        cert: undefined,
        key: undefined,
    }]]);
});

test("POST falls back to the session connection settings when optional fields are omitted", async () => {
    const calls = installTestSession({ user: { id: "test-user", host: "session.example", port: 6379, tls: false } });
    const response = await POST(send("POST", JSON.stringify({ username: "test-user", password: "test-password" })));
    assert.equal(response.status, 201);
    assert.deepEqual(calls.add, [["test-user", {
        host: "session.example",
        port: "6379",
        username: "test-user",
        password: "test-password",
        tls: "false",
        ca: undefined,
        cert: undefined,
        key: undefined,
    }]]);
});

test("POST classifies connection errors and keeps internal failures generic", async (t) => {
    t.mock.method(console, "error", () => {});
    const scenarios = [
        { error: new Error("NOAUTH Authentication required"), status: 400, code: "credentials_required" },
        { error: new Error("WRONGPASS invalid password"), status: 400, code: "invalid_credentials" },
        { error: new Error("connect ECONNREFUSED 127.0.0.1:6379"), status: 503, code: "connection_failed" },
        { error: new Error("database detail"), status: 400, code: "connection_failed" },
        { error: new Error(""), status: 500, code: "connection_failed" },
    ] as const;
    for (const scenario of scenarios) {
        globalThis.__connectionsRouteTest = {
            getSession: async () => ({ user: { id: "test-user", host: "session.example", port: 6379 } }),
            list: async () => [],
            add: async () => { throw scenario.error; },
        };
        const response = await POST(send("POST", JSON.stringify({ username: "test-user", password: "test-password" })));
        assert.equal(response.status, scenario.status);
        assert.deepEqual(await response.json(), {
            message: scenario.code === "credentials_required"
                ? "This database requires credentials. Please enter your username and password."
                : scenario.code === "invalid_credentials"
                    ? "Invalid credentials. Please check your username and password."
                    : "Could not connect to the database. Please check your connection settings and server logs.",
            code: scenario.code,
        });
    }
});

test("POST rejects untrusted origins before authentication", async () => {
    let authenticationCalls = 0;
    globalThis.__connectionsRouteTest = {
        getSession: async () => { authenticationCalls++; return null; },
        list: async () => [],
        add: async () => ({}),
    };
    const response = await POST(send("POST", "{}", { origin: "not an origin" }));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Untrusted request origin" });
    assert.equal(authenticationCalls, 0);
});
