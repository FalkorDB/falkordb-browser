import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const fixUrl = import.meta.resolve("./fix/route.ts");
const optimizeUrl = import.meta.resolve("./optimize/route.ts");
const routeUrls = [fixUrl, optimizeUrl];
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__aiRouteSession(request); }";

declare global {
    var __aiRouteSession: ((request: Request) => Promise<unknown>) | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL && routeUrls.includes(context.parentURL)) {
            if (specifier === "../../auth/[...nextauth]/options") return { url: authModule, shortCircuit: true };
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier === "@/lib/aiFix") return nextResolve(new URL("../../../lib/aiFix.ts", import.meta.url).href, context);
            if (specifier === "@/lib/aiOptimize") return nextResolve(new URL("../../../lib/aiOptimize.ts", import.meta.url).href, context);
            if (["../../validate-body", "../../utils", "../requestBody", "../completion", "./context"].includes(specifier)) return nextResolve(`${specifier}.ts`, context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (routeUrls.includes(url)) {
            const source = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
                fileName: fileURLToPath(url),
                compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, inlineSourceMap: true, inlineSources: true },
            }).outputText;
            return { format: "module", source, shortCircuit: true };
        }
        return nextLoad(url, context);
    },
});

const fix = await import("./fix/route.ts");
const optimize = await import("./optimize/route.ts");
const fixBody = { query: "RETRUN 1", errorMessage: "Syntax error", model: "openai::gpt-4o", key: "sk-test" };
const optimizeBody = { query: "MATCH (n) RETURN n", graphName: "example", model: "openai::gpt-4o", key: "sk-test" };
const request = (body: string, headers: HeadersInit = {}) => new NextRequest("http://localhost/api/chat/ai", { method: "POST", body, headers });
const post = (body: object) => request(JSON.stringify(body));
after(() => { delete globalThis.__aiRouteSession; });

function session(options: { explainError?: Error; indexError?: Error } = {}) {
    const calls: string[] = [];
    globalThis.__aiRouteSession = async () => ({
        client: { selectGraph: (name: string) => {
            assert.equal(name, "example");
            return {
                explain: async (query: string) => {
                    calls.push(`explain:${query}`);
                    if (options.explainError) throw options.explainError;
                    return { steps: ["Results", "Node By Label Scan"] };
                },
                roQuery: async (query: string) => {
                    calls.push(query);
                    if (options.indexError) throw options.indexError;
                    return { data: [{ label: "Person", types: ["name"], entitytype: "NODE" }] };
                },
            };
        } },
    });
    return calls;
}

test("fix endpoint sends the actual error and returns the corrected query", async (t) => {
    session();
    t.mock.method(globalThis, "fetch", async (url: string | URL | Request, init?: RequestInit) => {
        assert.equal(String(url), "https://api.openai.com/v1/chat/completions");
        const body = JSON.parse(String(init?.body));
        assert.equal(body.model, "gpt-4o");
        assert.match(body.messages[1].content, /RETRUN 1/);
        assert.match(body.messages[1].content, /Syntax error/);
        return Response.json({ choices: [{ message: { content: JSON.stringify({ explanation: "Fix typo", correctedQuery: "RETURN 1" }) } }] });
    });
    const response = await fix.POST(post(fixBody));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { explanation: "Fix typo", correctedQuery: "RETURN 1" });
});

test("optimizer supplies real plan and index context and returns its analysis", async (t) => {
    const calls = session();
    t.mock.method(globalThis, "fetch", async (_url: string | URL | Request, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body));
        assert.match(body.messages[1].content, /Node By Label Scan/);
        assert.match(body.messages[1].content, /Person/);
        assert.match(body.messages[1].content, /reduce scans/);
        return Response.json({ choices: [{ message: { content: JSON.stringify({
            explanation: "Use an index", suggestions: ["Add an index"], optimizedQuery: "MATCH (n:Person) RETURN n",
        }) } }] });
    });
    const response = await optimize.POST(post({ ...optimizeBody, guidance: "reduce scans" }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        explanation: "Use an index", suggestions: ["Add an index"], optimizedQuery: "MATCH (n:Person) RETURN n",
        executionPlan: ["Results", "Node By Label Scan"],
    });
    assert.equal(calls[0], "explain:MATCH (n) RETURN n");
    assert.match(calls[1], /^CALL db\.indexes\(\)/);
});

test("optimizer reports unavailable index metadata instead of assuming no indexes", async (t) => {
    session({ indexError: new Error("metadata unavailable") });
    t.mock.method(console, "warn", () => {});
    t.mock.method(globalThis, "fetch", async (_url: string | URL | Request, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body));
        assert.match(body.messages[1].content, /Index metadata is unavailable/);
        return Response.json({ choices: [{ message: { content: '{"explanation":"Check indexes","suggestions":[]}' } }] });
    });
    const response = await optimize.POST(post(optimizeBody));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        explanation: "Check indexes", suggestions: [], executionPlan: ["Results", "Node By Label Scan"],
        indexWarning: "Index metadata was unavailable; recommendations may be incomplete.",
    });
});

test("both endpoints reject unauthorized, oversized, malformed and invalid requests", async (t) => {
    t.mock.method(console, "error", () => {});
    const endpoints = [fix.POST, optimize.POST];
    globalThis.__aiRouteSession = async () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    for (const endpoint of endpoints) assert.equal((await endpoint(post({}))).status, 401);
    globalThis.__aiRouteSession = async () => { throw new Error("auth failure"); };
    for (const endpoint of endpoints) {
        const response = await endpoint(post({}));
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { error: "Internal server error" });
    }
    session();
    for (const endpoint of endpoints) {
        const largeHeader = await endpoint(request("{}", { "content-length": "99999999" }));
        const largeStream = await endpoint(request("x".repeat(1024 * 1024)));
        const malformed = await endpoint(request("{"));
        const invalid = await endpoint(post({}));
        const missingKey = await endpoint(post(endpoint === fix.POST ? { ...fixBody, key: "" } : { ...optimizeBody, key: "" }));
        assert.equal(largeHeader.status, 413);
        assert.equal(largeStream.status, 413);
        assert.equal(malformed.status, 400);
        assert.equal(invalid.status, 400);
        assert.equal(missingKey.status, 400);
        assert.match((await missingKey.json()).error, /API key is required/);
    }
});

test("optimizer returns plan lookup errors and rejects invalid model responses", async (t) => {
    t.mock.method(console, "error", () => {});
    session({ explainError: new Error("invalid query plan") });
    const planError = await optimize.POST(post(optimizeBody));
    assert.equal(planError.status, 400);
    assert.deepEqual(await planError.json(), { error: "invalid query plan" });
    session();
    t.mock.method(globalThis, "fetch", async () => Response.json({ choices: [{ message: { content: "not JSON" } }] }));
    const invalid = await optimize.POST(post(optimizeBody));
    assert.equal(invalid.status, 422);
    assert.match((await invalid.json()).error, /invalid optimization response/);
});

test("both endpoints map provider errors, timeouts and cancellations", async (t) => {
    session();
    t.mock.method(console, "error", () => {});
    t.mock.method(console, "warn", () => {});
    let mode = "status";
    t.mock.method(globalThis, "fetch", async () => {
        if (mode === "status") return Response.json({ error: { message: "private details" } }, { status: 401 });
        if (mode === "timeout") throw new DOMException("timeout", "TimeoutError");
        if (mode === "abort") throw new DOMException("canceled", "AbortError");
        throw new Error("network failure");
    });
    for (const [endpoint, body] of [[fix.POST, fixBody], [optimize.POST, optimizeBody]] as const) {
        mode = "status";
        const unauthorized = await endpoint(post(body));
        assert.equal(unauthorized.status, 401);
        assert.match((await unauthorized.json()).error, /rejected your API key/);
        for (const [nextMode, expected] of [["timeout", /timed out/], ["abort", /canceled/], ["network", /Unable to reach/]] as const) {
            mode = nextMode;
            const response = await endpoint(post(body));
            assert.equal(response.status, 422);
            assert.match((await response.json()).error, expected);
        }
    }
});
