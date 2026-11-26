import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

type RouteTestState = {
    calls: Array<{ method: string; request: Request }>;
    handle(method: string, request: Request): Promise<Response>;
};

declare global {
    var __nextAuthRouteTest: RouteTestState | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export const handlers = { GET: (request) => globalThis.__nextAuthRouteTest.handle('GET', request), POST: (request) => globalThis.__nextAuthRouteTest.handle('POST', request) };";
const utilsUrl = new URL("../../utils.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/auth") return { url: authModule, shortCircuit: true };
            if (specifier === "../../utils") return nextResolve(utilsUrl, context);
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

globalThis.__nextAuthRouteTest = {
    calls: [],
    async handle(method, request) {
        this.calls.push({ method, request });
        return NextResponse.json({ delegatedTo: method });
    },
};

const { GET, POST } = await import("./route.ts");

after(() => {
    delete globalThis.__nextAuthRouteTest;
    hooks.deregister();
});

function request(method: string, headers: HeadersInit = {}): NextRequest {
    return new NextRequest("https://example.test/api/auth/callback", { method, headers });
}

function routeState(): RouteTestState {
    const state = globalThis.__nextAuthRouteTest;
    assert.ok(state);
    state.calls.length = 0;
    return state;
}

test("GET delegates safe requests to the Auth.js GET handler", async () => {
    const state = routeState();
    const incoming = request("GET");

    const response = await GET(incoming);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { delegatedTo: "GET" });
    assert.equal(state.calls.length, 1);
    assert.equal(state.calls[0].method, "GET");
    assert.strictEqual(state.calls[0].request, incoming);
});

test("POST rejects an invalid origin without invoking Auth.js", async () => {
    const state = routeState();

    const response = await POST(request("POST", { origin: "not-an-origin" }));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Untrusted request origin" });
    assert.equal(state.calls.length, 0);
});

test("POST delegates bearer-authenticated requests to the Auth.js POST handler", async () => {
    const state = routeState();
    const incoming = request("POST", { authorization: "Bearer test-only" });

    const response = await POST(incoming);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { delegatedTo: "POST" });
    assert.equal(state.calls.length, 1);
    assert.equal(state.calls[0].method, "POST");
    assert.strictEqual(state.calls[0].request, incoming);
});
