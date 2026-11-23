import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const rootRoute = new URL("./route.ts", import.meta.url).href;
const userRoute = import.meta.resolve("./[user]/route.ts");
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__userRouteTestSession(request); }";

declare global {
    var __userRouteTestSession: ((request: Request) => Promise<unknown>) | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL?.includes("/app/api/user/")) {
            if (specifier.includes("auth/[...nextauth]/options")) return { url: authModule, shortCircuit: true };
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) return nextResolve(`${specifier}.ts`, context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if ([rootRoute, userRoute].includes(url)) {
            const source = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
                fileName: fileURLToPath(url),
                compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, inlineSourceMap: true, inlineSources: true },
            }).outputText;
            return { format: "module", source, shortCircuit: true };
        }
        return nextLoad(url, context);
    },
});

const root = await import("./route.ts");
const single = await import("./[user]/route.ts");
const params = { params: Promise.resolve({ user: "alice" }) };
const request = (method: string, body?: string) => new NextRequest("http://localhost/api/user", {
    method,
    body,
    headers: { origin: "http://localhost" },
});
const json = (body: unknown) => JSON.stringify(body);

after(() => { delete globalThis.__userRouteTestSession; });

function session(overrides: object = {}, role = "Admin") {
    const calls: unknown[][] = [];
    globalThis.__userRouteTestSession = async () => ({
        user: { role },
        client: { connection: Promise.resolve({
            configGet: async (key: string) => { calls.push(["configGet", key]); return {}; },
            aclList: async () => [],
            aclGetUser: async (name: string) => { calls.push(["aclGetUser", name]); return null; },
            aclSetUser: async (name: string, rules: string[]) => { calls.push(["aclSetUser", name, rules]); },
            aclDelUser: async (name: string) => { calls.push(["aclDelUser", name]); },
            ...overrides,
        }) },
    });
    return calls;
}

const mutations = [
    () => root.POST(request("POST", json({ username: "alice", password: "pass", role: "Admin" }))),
    () => root.DELETE(request("DELETE", json({ users: [{ username: "alice" }] }))),
    () => single.PATCH(request("PATCH", json({ role: "Admin" })), params),
];

test("lists users, recognized roles, key patterns and unknown roles", async () => {
    session({ aclList: async () => [
        "user alice on ~app:* ~logs:* &* +@all",
        "user bob on -@all",
        "malformed",
        "other ignored on",
    ] });
    const response = await root.GET(request("GET"));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("vary"), "Origin");
    assert.deepEqual(await response.json(), { result: [
        { username: "alice", role: "Admin", keys: ["app:*", "logs:*"], selected: false },
        { username: "bob", role: "Unknown", keys: ["*"], selected: false },
    ] });
});

test("authentication responses pass through unchanged on all handlers", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    globalThis.__userRouteTestSession = async () => denied;
    for (const operation of [() => root.GET(request("GET")), ...mutations]) {
        assert.strictEqual(await operation(), denied);
    }
});

test("non-admin roles are rejected before probing LDAP or changing users", async () => {
    for (const role of ["Read-Only", "Read-Write"]) {
        const calls = session({}, role);
        for (const operation of mutations) {
            const response = await operation();
            assert.equal(response.status, 403);
            assert.deepEqual(await response.json(), { message: "Forbidden: only Admin users can manage users" });
        }
        assert.deepEqual(calls, []);
    }
});

test("LDAP management and failed LDAP probes block every mutation", async (t) => {
    t.mock.method(console, "error", () => {});
    for (const [configGet, status, message] of [
        [async () => ({ "falkordbe.ldap_servers": "ldap://example.test" }), 403, "Users and roles are managed by LDAP on this connection"],
        [async () => { throw new Error("CONFIG failed"); }, 502, "Failed to read LDAP configuration"],
    ] as const) {
        const calls = session({ configGet });
        for (const operation of mutations) {
            const response = await operation();
            assert.equal(response.status, status);
            assert.deepEqual(await response.json(), { message });
        }
        assert.deepEqual(calls, []);
    }
});

test("creates a user with requested ACL key patterns and password", async () => {
    const calls = session();
    const response = await root.POST(request("POST", json({
        username: "alice", password: "pass", role: "Admin", keys: ["app:*", "logs:*"],
    })));
    assert.equal(response.status, 201);
    assert.equal(response.headers.get("location"), "/api/db/user/alice");
    assert.deepEqual(await response.json(), { message: "Success" });
    assert.deepEqual(calls, [
        ["configGet", "falkordbe.ldap_servers"],
        ["aclGetUser", "alice"],
        ["aclSetUser", "alice", ["on", "resetkeys", "~app:*", "~logs:*", "clearselectors", "&*", "+@all", ">pass"]],
    ]);
});

test("refuses existing users without writing ACLs", async () => {
    const calls = session({ aclGetUser: async () => ({ flags: ["on"] }) });
    const response = await root.POST(request("POST", json({ username: "alice", password: "pass", role: "Admin" })));
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { message: "User alice already exists" });
    assert.deepEqual(calls, [["configGet", "falkordbe.ldap_servers"]]);
});

test("updates a user with and without a replacement password", async () => {
    const calls = session();
    for (const body of [{ role: "Admin", keys: ["tenant:*"], password: "new-pass" }, { role: "Admin" }]) {
        const response = await single.PATCH(request("PATCH", json(body)), params);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { message: "User role updated" });
    }
    assert.deepEqual(calls, [
        ["configGet", "falkordbe.ldap_servers"],
        ["aclSetUser", "alice", ["on", "resetkeys", "~tenant:*", "clearselectors", "&*", "+@all", "resetpass", ">new-pass"]],
        ["configGet", "falkordbe.ldap_servers"],
        ["aclSetUser", "alice", ["on", "resetkeys", "~*", "clearselectors", "&*", "+@all"]],
    ]);
});

test("deletes all requested users", async () => {
    const calls = session();
    const response = await root.DELETE(request("DELETE", json({ users: [{ username: "alice" }, { username: "bob" }] })));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "Users deleted" });
    assert.deepEqual(calls, [
        ["configGet", "falkordbe.ldap_servers"], ["aclDelUser", "alice"], ["aclDelUser", "bob"],
    ]);
});

test("rejects invalid bodies and unknown roles without ACL mutations", async (t) => {
    t.mock.method(console, "error", () => {});
    const cases = [
        [() => root.POST(request("POST", json({ username: "", password: "pass", role: "Admin" }))), /Username cannot be empty/],
        [() => root.POST(request("POST", json({ username: "alice", password: "pass", role: "wrong" }))), /Invalid role/],
        [() => root.DELETE(request("DELETE", json({ users: [] }))), /At least one user is required/],
        [() => single.PATCH(request("PATCH", json({ role: "Admin", keys: [""] })), params), /Key cannot be empty/],
        [() => single.PATCH(request("PATCH", json({ role: "wrong" })), params), /Invalid role/],
        [() => root.POST(request("POST", "{")), /JSON/],
        [() => root.DELETE(request("DELETE", "{")), /JSON/],
        [() => single.PATCH(request("PATCH", "{"), params), /JSON/],
    ] as const;
    for (const [operation, message] of cases) {
        const calls = session();
        const response = await operation();
        assert.equal(response.status, 400);
        assert.match((await response.json()).message, message);
        assert.deepEqual(calls, [["configGet", "falkordbe.ldap_servers"]]);
    }
});

test("reports database failures from listing, writing and deleting", async (t) => {
    t.mock.method(console, "error", () => {});
    const fail = async () => { throw new Error("database failure"); };
    const cases = [
        [{ aclList: fail }, () => root.GET(request("GET"))],
        [{ aclSetUser: fail }, mutations[0]],
        [{ aclDelUser: fail }, mutations[1]],
        [{ aclSetUser: fail }, mutations[2]],
    ] as const;
    for (const [overrides, operation] of cases) {
        session(overrides);
        const response = await operation();
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { message: "database failure" });
    }
});

test("unexpected authentication failures return generic server errors", async (t) => {
    t.mock.method(console, "error", () => {});
    globalThis.__userRouteTestSession = async () => { throw new Error("private session error"); };
    for (const operation of [() => root.GET(request("GET")), ...mutations]) {
        const response = await operation();
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { message: "Internal server error" });
    }
});
