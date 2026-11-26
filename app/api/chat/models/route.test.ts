import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const routeUrl = import.meta.resolve("./route.ts");
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__modelRouteSession(request); }";
const catalogModule = "data:text/javascript,export class TextToCypher { async listModels() { return ['all-model']; } async listModelsByProvider(provider) { return [provider + '-model']; } }";

declare global {
    var __modelRouteSession: ((request: Request) => Promise<unknown>) | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "../../auth/[...nextauth]/options") return { url: authModule, shortCircuit: true };
            if (specifier === "@falkordb/text-to-cypher") return { url: catalogModule, shortCircuit: true };
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier === "../../utils") return nextResolve(new URL("../../utils.ts", import.meta.url).href, context);
            if (specifier === "@/lib/ai-provider-utils") return nextResolve(new URL("../../../../lib/ai-provider-utils.ts", import.meta.url).href, context);
            if (specifier === "@/lib/local-llm-utils") return nextResolve(new URL("../../../../lib/local-llm-utils.ts", import.meta.url).href, context);
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
const session = () => { globalThis.__modelRouteSession = async () => ({ user: { host: "localhost", port: 6379 } }); };
const post = (body: object, signal?: AbortSignal) => new NextRequest("http://localhost/api/chat/models", {
    method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" }, signal,
});
after(() => { delete globalThis.__modelRouteSession; });

test("lists the catalog, optionally filtered by provider", async () => {
    session();
    assert.deepEqual(await (await GET(new NextRequest("http://localhost/api/chat/models"))).json(), { models: ["all-model"] });
    assert.deepEqual(await (await GET(new NextRequest("http://localhost/api/chat/models?provider=groq"))).json(), { models: ["groq-model"] });
});

test("rejects unauthenticated catalog and live model requests", async () => {
    globalThis.__modelRouteSession = async () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    for (const response of [await GET(new NextRequest("http://localhost/api/chat/models")), await POST(post({ key: "sk-test" }))]) {
        assert.equal(response.status, 401);
        assert.deepEqual(await response.json(), { error: "Unauthorized" });
    }
});

test("fetches, filters, sorts and prefixes live provider models", async (t) => {
    session();
    const cases = [
        { key: "sk-test", url: "https://api.openai.com/v1/models", headers: { authorization: "Bearer sk-test" }, payload: { data: [{ id: "z" }, {}, { id: "a" }] }, expected: ["openai::a", "openai::z"] },
        { key: "gsk_test", url: "https://api.groq.com/openai/v1/models", headers: { authorization: "Bearer gsk_test" }, payload: { data: [{ id: "z" }, { id: "a" }] }, expected: ["groq::a", "groq::z"] },
        { key: "xai-test", url: "https://api.x.ai/v1/models", headers: { authorization: "Bearer xai-test" }, payload: { data: [{ id: "z" }, { id: "a" }] }, expected: ["xai::a", "xai::z"] },
        { key: "sk-ant-test", url: "https://api.anthropic.com/v1/models", headers: { "x-api-key": "sk-ant-test", "anthropic-version": "2023-06-01" }, payload: { data: [{ id: "z" }, {}, { id: "a" }] }, expected: ["anthropic::a", "anthropic::z"] },
        { key: "AIza-test", url: "https://generativelanguage.googleapis.com/v1beta/models", headers: { "x-goog-api-key": "AIza-test" }, payload: { models: [{ name: "models/z", supportedGenerationMethods: ["generateContent"] }, { name: "models/ignored", supportedGenerationMethods: ["embedContent"] }, { name: "models/a", supportedGenerationMethods: ["generateContent"] }] }, expected: ["gemini::a", "gemini::z"] },
    ];
    let responsePayload: object = {};
    let requestedUrl = "";
    let requestInit: RequestInit | undefined;
    t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
        requestedUrl = String(input);
        requestInit = init;
        return Response.json(responsePayload);
    });
    for (const item of cases) {
        responsePayload = item.payload;
        const response = await POST(post({ key: ` ${item.key} ` }));
        assert.equal(response.status, 200);
        assert.equal(requestedUrl, item.url);
        assert.equal(requestInit?.method, "GET");
        assert.equal(requestInit?.cache, "no-store");
        for (const [name, value] of Object.entries(item.headers)) {
            assert.equal(new Headers(requestInit?.headers).get(name), value);
        }
        assert.deepEqual(await response.json(), { models: item.expected });
    }
});

test("fetches local models from normalized loopback endpoints", async (t) => {
    session();
    let requestedUrl = "";
    let payload: object = {};
    t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
        requestedUrl = String(input);
        return Response.json(payload);
    });
    payload = { models: [{ name: "z" }, {}, { name: "a" }] };
    const ollama = await POST(post({ source: "local", endpoint: "http://127.0.0.1:11434/" }));
    assert.equal(requestedUrl, "http://127.0.0.1:11434/api/tags");
    assert.deepEqual(await ollama.json(), { models: ["ollama::a", "ollama::z"], providerName: "Ollama" });
    payload = { data: [{ id: "z" }, { id: "a" }] };
    const lmstudio = await POST(post({ source: "local", localProvider: "lmstudio", endpoint: "http://localhost:1234" }));
    assert.equal(requestedUrl, "http://localhost:1234/v1/models");
    assert.deepEqual(await lmstudio.json(), { models: ["openai::a", "openai::z"], providerName: "LM Studio" });
});

test("validates keys and rejects non-loopback local endpoints", async (t) => {
    session();
    t.mock.method(console, "error", () => {});
    const missing = await POST(post({ key: " " }));
    assert.equal(missing.status, 400);
    assert.deepEqual(await missing.json(), { error: "API key is required to load live models" });
    const unknown = await POST(post({ key: "unsupported" }));
    assert.equal(unknown.status, 500);
    assert.match((await unknown.json()).error, /Could not detect the provider/);
    const invalid = await POST(post({ source: "local", endpoint: "http://example.com" }));
    assert.equal(invalid.status, 500);
    assert.match((await invalid.json()).error, /localhost or 127\.0\.0\.1/);
});

test("reports session failures for catalog and live requests", async (t) => {
    t.mock.method(console, "error", () => {});
    globalThis.__modelRouteSession = async () => { throw new Error("session unavailable"); };
    const catalog = await GET(new NextRequest("http://localhost/api/chat/models"));
    assert.equal(catalog.status, 500);
    assert.deepEqual(await catalog.json(), { error: "Internal server error" });
    const live = await POST(post({ key: "sk-test" }));
    assert.equal(live.status, 500);
    assert.deepEqual(await live.json(), { error: "session unavailable" });
});

test("maps upstream failures without exposing provider response bodies", async (t) => {
    session();
    t.mock.method(console, "error", () => {});
    let upstreamStatus = 401;
    t.mock.method(globalThis, "fetch", async () => new Response("private upstream body", { status: upstreamStatus }));
    for (const [status, expected, message] of [[401, 400, /rejected this API key/], [403, 400, /rejected this API key/], [429, 429, /Could not load live/], [503, 502, /Could not load live/]] as const) {
        upstreamStatus = status;
        const response = await POST(post({ key: "sk-test" }));
        assert.equal(response.status, expected);
        const body = await response.json();
        assert.match(body.error, message);
        assert.doesNotMatch(body.error, /private upstream body/);
    }
    upstreamStatus = 502;
    const local = await POST(post({ source: "local" }));
    assert.equal(local.status, 500);
    assert.match((await local.json()).error, /Could not load local Ollama models \(502\)/);
});

test("reports local connection failures and cancelled requests", async (t) => {
    session();
    const controller = new AbortController();
    t.mock.method(globalThis, "fetch", async (_input: string | URL | Request, init?: RequestInit) => {
        if (init?.signal) {
            return await new Promise<Response>((_resolve, reject) => {
                init.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
                controller.abort();
            });
        }
        throw new Error("unreachable");
    });
    const cancelled = await POST(post({ key: "sk-test" }, controller.signal));
    assert.equal(cancelled.status, 499);
    assert.deepEqual(await cancelled.json(), { error: "Model request was cancelled." });
    t.mock.method(globalThis, "fetch", async () => { throw new Error("connection refused"); });
    const unavailable = await POST(post({ source: "local" }));
    assert.equal(unavailable.status, 503);
    assert.match((await unavailable.json()).error, /Could not connect to Ollama at http:\/\/localhost:11434/);
});
