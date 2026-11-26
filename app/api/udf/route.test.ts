import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";

const rootRoute = new URL("./route.ts", import.meta.url).href;
const libraryRoute = import.meta.resolve("./[lib]/route.ts");
const compatibility = new URL("./compatibility.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__udfTestSession(request); }";

declare global {
    var __udfTestSession: ((request: Request) => Promise<unknown>) | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL && [rootRoute, libraryRoute, compatibility].includes(context.parentURL)) {
            if (specifier.includes("auth/[...nextauth]/options")) return { url: authModule, shortCircuit: true };
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier === "@/app/utils") return nextResolve(new URL("../../utils.ts", import.meta.url).href, context);
            if (["./compatibility", "../compatibility", "../utils", "../../utils", "../../validate-body"].includes(specifier)) {
                return nextResolve(`${specifier}.ts`, context);
            }
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if ([rootRoute, libraryRoute, compatibility].includes(url)) {
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
const library = await import("./[lib]/route.ts");
const params = { params: Promise.resolve({ lib: "test-library" }) };
const request = (method: string, body?: string) => new Request("http://localhost/api/udf", { method, body });
after(() => { delete globalThis.__udfTestSession; });

function clientWith(overrides: object = {}, version = 41600) {
    return {
        connection: Promise.resolve({ moduleList: async () => [{ name: "graph", ver: version }] }),
        udfList: async (..._args: unknown[]) => ["library"],
        udfFlush: async () => "OK",
        udfLoad: async (..._args: unknown[]) => "OK",
        udfDelete: async (..._args: unknown[]) => "OK",
        ...overrides,
    };
}

test("lists all libraries and a named library using the database API", async () => {
    const calls: unknown[][] = [];
    globalThis.__udfTestSession = async () => ({
        client: clientWith({ udfList: async (...args: unknown[]) => { calls.push(args); return ["library"]; } }),
    });
    const all = await root.GET(request("GET"));
    const named = await library.GET(request("GET"), params);
    assert.equal(all.status, 200);
    assert.equal(named.status, 200);
    assert.deepEqual(await all.json(), { result: ["library"] });
    assert.deepEqual(await named.json(), { result: ["library"] });
    assert.deepEqual(calls, [[], ["test-library", true]]);
});

test("loads, deletes and flushes UDFs with the requested arguments", async () => {
    const calls: unknown[][] = [];
    globalThis.__udfTestSession = async () => ({
        client: clientWith({
            udfLoad: async (...args: unknown[]) => { calls.push(["load", ...args]); return "OK"; },
            udfDelete: async (...args: unknown[]) => { calls.push(["delete", ...args]); return "OK"; },
            udfFlush: async () => { calls.push(["flush"]); return "OK"; },
        }),
    });
    const loaded = await library.POST(request("POST", JSON.stringify({ code: "return 1", replace: true })), params);
    const deleted = await library.DELETE(request("DELETE"), params);
    const flushed = await root.DELETE(request("DELETE"));
    assert.deepEqual(await loaded.json(), { message: "UDF created successfully" });
    assert.deepEqual(await deleted.json(), { message: "UDF deleted successfully" });
    assert.deepEqual(await flushed.json(), { result: "UDFs flushed successfully" });
    assert.equal(loaded.status, 200);
    assert.equal(deleted.status, 200);
    assert.equal(flushed.status, 200);
    assert.deepEqual(calls, [["load", "test-library", "return 1", true], ["delete", "test-library"], ["flush"]]);
});

test("rejects malformed or invalid UDF requests without executing database mutations", async () => {
    let loads = 0;
    globalThis.__udfTestSession = async () => ({
        client: clientWith({ udfLoad: async () => { loads += 1; return "OK"; } }),
    });
    const malformed = await library.POST(request("POST", "{"), params);
    const invalid = await library.POST(request("POST", JSON.stringify({ code: "" })), params);
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).message, "Invalid JSON in request body");
    assert.equal(invalid.status, 400);
    assert.match((await invalid.json()).message, /Code cannot be empty/);
    assert.equal(loads, 0);
});

test("all UDF routes reject unsupported database versions and pass through authentication errors", async () => {
    let mutations = 0;
    const operations = [
        () => root.GET(request("GET")),
        () => root.DELETE(request("DELETE")),
        () => library.GET(request("GET"), params),
        () => library.POST(request("POST", "{}"), params),
        () => library.DELETE(request("DELETE"), params),
    ];
    globalThis.__udfTestSession = async () => ({
        client: clientWith({
            udfLoad: async () => { mutations += 1; return "OK"; },
            udfDelete: async () => { mutations += 1; return "OK"; },
            udfFlush: async () => { mutations += 1; return "OK"; },
        }, 41599),
    });
    for (const operation of operations) {
        const response = await operation();
        assert.equal(response.status, 400);
        assert.match((await response.json()).message, /requires graph module version/);
    }
    assert.equal(mutations, 0);
    globalThis.__udfTestSession = async () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    for (const operation of operations) {
        const response = await operation();
        assert.equal(response.status, 401);
        assert.deepEqual(await response.json(), { message: "Unauthorized" });
    }
});

test("reports missing graph module and module-list failures", async (t) => {
    t.mock.method(console, "error", () => {});
    globalThis.__udfTestSession = async () => ({
        client: clientWith({ connection: Promise.resolve({ moduleList: async () => [] }) }),
    });
    const missing = await root.GET(request("GET"));
    assert.equal(missing.status, 503);
    assert.match((await missing.json()).message, /Graph module not found/);
    globalThis.__udfTestSession = async () => ({
        client: clientWith({ connection: Promise.resolve({ moduleList: async () => { throw new Error("module lookup failed"); } }) }),
    });
    const failed = await library.GET(request("GET"), params);
    assert.equal(failed.status, 400);
    assert.match((await failed.json()).message, /module lookup failed/);
});

test("unexpected session errors produce server errors for each UDF route", async (t) => {
    t.mock.method(console, "error", () => {});
    globalThis.__udfTestSession = async () => { throw new Error("session failed"); };
    for (const operation of [
        () => root.GET(request("GET")),
        () => root.DELETE(request("DELETE")),
        () => library.GET(request("GET"), params),
        () => library.POST(request("POST", "{}"), params),
        () => library.DELETE(request("DELETE"), params),
    ]) {
        const response = await operation();
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { message: "Internal server error" });
    }
});

test("database operation failures are reported without a success response", async (t) => {
    t.mock.method(console, "error", () => {});
    globalThis.__udfTestSession = async () => ({
        client: clientWith({
            udfList: async () => { throw new Error("list failed"); },
            udfLoad: async () => null,
            udfDelete: async () => null,
            udfFlush: async () => "NOT_OK",
        }),
    });
    for (const [operation, message] of [
        [() => root.GET(request("GET")), "list failed"],
        [() => library.GET(request("GET"), params), "list failed"],
        [() => library.POST(request("POST", JSON.stringify({ code: "return 1" })), params), "Failed to create UDF"],
        [() => library.DELETE(request("DELETE"), params), "Failed to delete UDF"],
        [() => root.DELETE(request("DELETE")), "Failed to flush UDFs: NOT_OK"],
    ] as const) {
        const response = await operation();
        assert.equal(response.status, 400);
        assert.equal((await response.json()).message, message);
    }
});
