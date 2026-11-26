import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const utilsUrl = new URL("../../../utils.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__graphExportRouteTest.getClient(request); }";

type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __graphExportRouteTest: RouteTestState | undefined;
}

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "../../../utils") {
                return { url: utilsUrl, shortCircuit: true };
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

const { GET } = await import("./route.ts");

after(() => {
    delete globalThis.__graphExportRouteTest;
    hooks.deregister();
});

function harness(options: {
    authResponse?: NextResponse;
    sessionError?: Error;
    connectionError?: Error;
    dumpResult?: Buffer | null;
    dumpError?: Error;
} = {}) {
    const dumpedGraphs: string[] = [];
    globalThis.__graphExportRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            const connection = options.connectionError
                ? Promise.reject(options.connectionError)
                : Promise.resolve({
                    async dump(graphName: string) {
                        dumpedGraphs.push(graphName);
                        if (options.dumpError) throw options.dumpError;
                        return options.dumpResult === undefined
                            ? Buffer.from([0, 127, 128, 255])
                            : options.dumpResult;
                    },
                });
            return { client: { connection } };
        },
    };
    return { dumpedGraphs };
}

function request(): NextRequest {
    return new NextRequest("http://example.test/api/graph/graph-one/export");
}

function routeParams() {
    return { params: Promise.resolve({ graph: "graph-one" }) };
}

test("GET exports the requested graph as an unchanged binary download", async () => {
    const state = harness();

    const response = await GET(request(), routeParams());

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/octet-stream");
    assert.equal(response.headers.get("content-disposition"), 'attachment; filename="graph-one.dump"');
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), new Uint8Array([0, 127, 128, 255]));
    assert.deepEqual(state.dumpedGraphs, ["graph-one"]);
});

test("GET returns a client error when the graph dump is missing", async () => {
    const state = harness({ dumpResult: null });

    const response = await GET(request(), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Failed to retrieve graph data for ID: graph-one" });
    assert.deepEqual(state.dumpedGraphs, ["graph-one"]);
});

test("GET reports dump failures as client errors", async () => {
    const state = harness({ dumpError: new Error("dump failed") });

    const response = await GET(request(), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "dump failed" });
    assert.deepEqual(state.dumpedGraphs, ["graph-one"]);
});

test("GET reports connection failures as client errors", async () => {
    const state = harness({ connectionError: new Error("connection failed") });

    const response = await GET(request(), routeParams());

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "connection failed" });
    assert.deepEqual(state.dumpedGraphs, []);
});

test("GET passes authentication responses through unchanged", async () => {
    const authResponse = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const state = harness({ authResponse });

    const response = await GET(request(), routeParams());

    assert.strictEqual(response, authResponse);
    assert.deepEqual(state.dumpedGraphs, []);
});

test("GET returns a server error when session resolution fails", async (t) => {
    t.mock.method(console, "error", () => {});
    const state = harness({ sessionError: new Error("session unavailable") });

    const response = await GET(request(), routeParams());

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
    assert.deepEqual(state.dumpedGraphs, []);
});
