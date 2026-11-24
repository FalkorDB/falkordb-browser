import test, { after, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";
import { hashOwner } from "../../../../lib/csv-key.ts";

type Fixture = {
    session: NextResponse | {
        user: { id: string; role: string };
        client: { selectGraph: (name: string) => { query: (query: string, options: { params: { csvUrl: string } }) => Promise<unknown> } };
    };
    provider: {
        resolveReadUrl: (owner: string, key: string) => Promise<string>;
        delete: (owner: string, key: string) => Promise<void>;
    };
};

declare global {
    var __loadCsvFixture: Fixture;
}

const routeUrl = import.meta.resolve("./route.ts");
const authModule = "data:text/javascript,export async function getClient() { return globalThis.__loadCsvFixture.session; }";
const storageModule = "data:text/javascript,export function getCsvStorageProvider() { return globalThis.__loadCsvFixture.provider; }";

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier.includes("auth/[...nextauth]/options")) return { url: authModule, shortCircuit: true };
            if (specifier === "@/app/lib/csv-storage") return { url: storageModule, shortCircuit: true };
            if (specifier === "@/app/lib/csv-key") return nextResolve(new URL("../../../../lib/csv-key.ts", import.meta.url).href, context);
            if (specifier === "@/app/lib/csv-load-url") return nextResolve(new URL("../../../../lib/csv-load-url.ts", import.meta.url).href, context);
            if (specifier === "@/app/api/csv-temp/csv-url-head") return nextResolve(new URL("../../../csv-temp/csv-url-head.ts", import.meta.url).href, context);
            if (specifier === "@/lib/graphUpload") return nextResolve(new URL("../../../../../lib/graphUpload.ts", import.meta.url).href, context);
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier.startsWith(".") && !specifier.endsWith(".ts")) return nextResolve(`${specifier}.ts`, context);
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
const key = "123e4567-e89b-42d3-a456-426614174000";
const params = { params: Promise.resolve({ graph: "example" }) };
const request = (body: string, query = "") => new NextRequest(`http://localhost/api/graph/example/load-csv${query}`, {
    method: "POST", body, headers: { origin: "http://localhost", "content-type": "application/json" },
});
const json = (body: unknown) => JSON.stringify(body);

function configure(t: TestContext) {
    t.mock.property(process, "env", { NODE_ENV: "test", CSV_TEMP_SIGNING_SECRET: "test-signing-secret" });
    const calls: unknown[][] = [];
    const fixture: Fixture = {
        session: {
            user: { id: "owner-1", role: "Admin" },
            client: { selectGraph: (name) => {
                calls.push(["selectGraph", name]);
                return { query: async (query, options) => { calls.push(["query", query, options]); return { rows: 2 }; } };
            } },
        },
        provider: {
            resolveReadUrl: async (owner, csvKey) => { calls.push(["resolveReadUrl", owner, csvKey]); return "file:///imports/test.csv"; },
            delete: async (owner, csvKey) => { calls.push(["delete", owner, csvKey]); },
        },
    };
    globalThis.__loadCsvFixture = fixture;
    return { fixture, calls };
}

after(() => { Reflect.deleteProperty(globalThis, "__loadCsvFixture"); });

test("passes through authentication failures and validates request bodies", async (t) => {
    const { fixture, calls } = configure(t);
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const session = fixture.session;
    fixture.session = denied;
    assert.strictEqual(await POST(request("{}"), params), denied);
    fixture.session = session;
    const invalidJson = await POST(request("{"), params);
    assert.equal(invalidJson.status, 400);
    assert.deepEqual(await invalidJson.json(), { message: "Invalid request body." });
    for (const [body, message] of [
        [{}, "key and a query body are required."],
        [{ key, body: " " }, "key and a query body are required."],
        [{ key, body: "RETURN row", withHeaders: "true" }, "withHeaders must be a boolean."],
        [{ key: "invalid", body: "RETURN row" }, "Invalid key."],
        [{ key, body: "LOAD CSV FROM 'file:///other' AS row RETURN row" }, "The query must not contain its own LOAD CSV clause."],
    ] as const) {
        const response = await POST(request(json(body)), params);
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { message });
    }
    assert.deepEqual(calls, []);
});

test("rejects read-only requests before resolving storage", async (t) => {
    const { fixture, calls } = configure(t);
    assert.ok(!(fixture.session instanceof NextResponse));
    fixture.session.user.role = "Read-Only";
    const body = json({ key, body: "RETURN row" });
    let response = await POST(request(body), params);
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { message: "You do not have permission to modify this graph." });
    fixture.session.user.role = "Admin";
    response = await POST(request(body, "?readOnly=true"), params);
    assert.equal(response.status, 403);
    assert.deepEqual(calls, []);
});

test("validates the storage URL and CSV header without running or deleting", async (t) => {
    const { fixture, calls } = configure(t);
    fixture.provider.resolveReadUrl = async () => { throw new Error("not found"); };
    let response = await POST(request(json({ key, body: "RETURN row" })), params);
    assert.equal(response.status, 404);
    assert.match((await response.json()).message, /Uploaded CSV not found/);

    t.mock.method(console, "error", () => {});
    fixture.provider.resolveReadUrl = async () => "http://storage.example/file.csv";
    response = await POST(request(json({ key, body: "RETURN row" })), params);
    assert.equal(response.status, 422);
    assert.match((await response.json()).message, /only fetch CSV files over https/);

    fixture.provider.resolveReadUrl = async () => "https://storage.example/file.csv";
    t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 416, headers: { "content-range": "bytes */0" } }));
    response = await POST(request(json({ key, body: "RETURN row" })), params);
    assert.equal(response.status, 422);
    assert.deepEqual(await response.json(), { message: "The uploaded CSV is empty." });
    assert.deepEqual(calls, []);
});

test("executes a parameterized import and deletes the owner-scoped file after success", async (t) => {
    const { calls } = configure(t);
    const response = await POST(request(json({ key: key.toUpperCase(), withHeaders: true, body: " RETURN row " })), params);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("vary"), "Origin");
    assert.deepEqual(await response.json(), { message: "LOAD CSV completed successfully.", result: { rows: 2 } });
    assert.deepEqual(calls, [
        ["resolveReadUrl", hashOwner("owner-1"), key],
        ["selectGraph", "example"],
        ["query", "LOAD CSV WITH HEADERS FROM $csvUrl AS row\nRETURN row", { params: { csvUrl: "file:///imports/test.csv" } }],
        ["delete", hashOwner("owner-1"), key],
    ]);
});

test("reports query errors in the stream and retains the file for retry", async (t) => {
    const { fixture, calls } = configure(t);
    assert.ok(!(fixture.session instanceof NextResponse));
    fixture.session.client.selectGraph = () => ({ query: async () => { throw new Error("Failed reading CSV header row"); } });
    t.mock.method(console, "error", () => {});
    const response = await POST(request(json({ key, withHeaders: false, body: "RETURN row" })), params);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { error: {
        message: "Failed reading CSV header row. Verify the file has a valid header row, or turn off 'Use CSV headers' and access columns as row[0], row[1], ... (resolved storage host: ).",
        status: 422,
    } });
    assert.deepEqual(calls, [["resolveReadUrl", hashOwner("owner-1"), key]]);
});
