import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getSessionFromRequest(request) { return globalThis.__connectionDeleteRouteTest.getSession(request); } export async function removeSessionConnection(id, connectionId) { return globalThis.__connectionDeleteRouteTest.remove(id, connectionId); }";

type TestSession = { user?: { id?: string } } | null;

declare global {
    var __connectionDeleteRouteTest: {
        getSession: (request: Request) => Promise<TestSession>;
        remove: (id: string, connectionId: string) => Promise<boolean>;
    };
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") return { url: authModule, shortCircuit: true };
            if (specifier === "@/app/api/utils") return nextResolve(new URL("../../utils.ts", import.meta.url).href, context);
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

const { DELETE } = await import("./route.ts");
after(() => { Reflect.deleteProperty(globalThis, "__connectionDeleteRouteTest"); });

function installTestSession(session: TestSession = null) {
    const calls: Array<[string, string]> = [];
    globalThis.__connectionDeleteRouteTest = {
        getSession: async () => session,
        remove: async (id, connectionId) => {
            calls.push([id, connectionId]);
            return true;
        },
    };
    return calls;
}

function remove(connectionId: string, origin?: string) {
    return DELETE(new Request("http://localhost/api/connections/connection", {
        method: "DELETE",
        headers: {
            "sec-fetch-site": "same-origin",
            ...(origin === undefined ? {} : { origin }),
        },
    }), { params: Promise.resolve({ connectionId }) });
}

test("DELETE rejects untrusted origins before authentication or storage access", async () => {
    let authenticationCalls = 0;
    const calls = installTestSession();
    globalThis.__connectionDeleteRouteTest.getSession = async () => {
        authenticationCalls++;
        return null;
    };
    const response = await remove("connection-1", "not an origin");
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Untrusted request origin" });
    assert.equal(authenticationCalls, 0);
    assert.deepEqual(calls, []);
});

test("DELETE returns 401 without deleting when the session is missing", async () => {
    const calls = installTestSession();
    const response = await remove("connection-1");
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Not authenticated" });
    assert.deepEqual(calls, []);
});

test("DELETE requires a connection ID after authentication", async () => {
    const calls = installTestSession({ user: { id: "test-user" } });
    const response = await remove("");
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Connection ID is required" });
    assert.deepEqual(calls, []);
});

test("DELETE returns 404 when the connection does not belong to the session", async () => {
    const calls = installTestSession({ user: { id: "test-user" } });
    globalThis.__connectionDeleteRouteTest.remove = async (id, connectionId) => {
        calls.push([id, connectionId]);
        return false;
    };
    const response = await remove("unknown-connection");
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: "Connection not found" });
    assert.deepEqual(calls, [["test-user", "unknown-connection"]]);
});

test("DELETE reports successful removal and CORS response headers", async () => {
    const calls = installTestSession({ user: { id: "test-user" } });
    const response = await remove("connection-1");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "Connection removed" });
    assert.deepEqual(calls, [["test-user", "connection-1"]]);
    assert.equal(response.headers.get("vary"), "Origin");
    assert.equal(response.headers.get("access-control-allow-methods"), "GET, POST, PUT, DELETE, PATCH, OPTIONS");
});

test("DELETE returns a generic server error when removal fails unexpectedly", async (t) => {
    t.mock.method(console, "error", () => {});
    installTestSession({ user: { id: "test-user" } });
    globalThis.__connectionDeleteRouteTest.remove = async () => {
        throw new Error("private storage detail");
    };
    const response = await remove("connection-1");
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
});
