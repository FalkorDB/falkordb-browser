import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const utilsUrl = new URL("../../../utils.ts", import.meta.url).href;
const readOnlyUrl = new URL("../../../../../lib/falkordb-cypher/readOnly.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__graphProfileRouteTest.getClient(request); }";
const runQueryModule = "data:text/javascript,export async function runQuery() { throw new Error('Unexpected runQuery call'); }";

type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __graphProfileRouteTest: RouteTestState | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "@/lib/falkordb-cypher/readOnly") {
                return { url: readOnlyUrl, shortCircuit: true };
            }
            if (specifier.endsWith("/utils")) {
                return { url: utilsUrl, shortCircuit: true };
            }
            if (specifier === "next/server") return nextResolve("next/server.js", context);
        }
        if (context.parentURL === utilsUrl && specifier === "./run-query.ts") {
            return { url: runQueryModule, shortCircuit: true };
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
    delete globalThis.__graphProfileRouteTest;
});

function harness(options: {
    role?: string;
    sessionError?: Error;
    profileError?: Error;
} = {}) {
    const selectedGraphIds: string[] = [];
    const profileQueries: string[] = [];
    globalThis.__graphProfileRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            return {
                user: { role: options.role ?? "Admin" },
                client: {
                    selectGraph(graphId: string) {
                        selectedGraphIds.push(graphId);
                        return {
                            async profile(query: string) {
                                profileQueries.push(query);
                                if (options.profileError) throw options.profileError;
                                return { steps: ["NodeByLabelScan", "Results"] };
                            },
                        };
                    },
                },
            };
        },
    };
    return { selectedGraphIds, profileQueries };
}

function request(query: string, search = "", contentType = "application/json"): NextRequest {
    return new NextRequest(`http://localhost/api/graph/graph-one/profile${search}`, {
        method: "POST",
        headers: { "content-type": contentType },
        body: JSON.stringify({ query }),
    });
}

function rawRequest(body: string, contentType = "application/json"): NextRequest {
    return new NextRequest("http://localhost/api/graph/graph-one/profile", {
        method: "POST",
        headers: { "content-type": contentType },
        body,
    });
}

const routeParams = { params: Promise.resolve({ graph: "graph-one" }) };

test("read-only users cannot profile queries", async () => {
    const state = harness({ role: "Read-Only" });

    const response = await POST(request("MATCH (n) RETURN n"), routeParams);

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
        message: "Profiling executes queries and is not available in read-only mode.",
    });
    assert.deepEqual(state.selectedGraphIds, []);
});

test("explicit read-only requests cannot profile queries", async () => {
    const state = harness();

    const response = await POST(request("MATCH (n) RETURN n", "?readOnly=true"), routeParams);

    assert.equal(response.status, 403);
    assert.deepEqual(state.selectedGraphIds, []);
});

test("non-JSON profile requests are rejected", async () => {
    const state = harness();

    const response = await POST(request("MATCH (n) RETURN n", "", "text/plain"), routeParams);

    assert.equal(response.status, 415);
    assert.deepEqual(await response.json(), { message: "Content-Type must be application/json" });
    assert.deepEqual(state.selectedGraphIds, []);
});

test("malformed JSON profile requests are rejected", async () => {
    const state = harness();

    const response = await POST(rawRequest("{"), routeParams);

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Invalid JSON" });
    assert.deepEqual(state.selectedGraphIds, []);
});

test("profile requests without a query are rejected", async () => {
    const state = harness();

    const response = await POST(request(""), routeParams);

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Missing parameter query" });
    assert.deepEqual(state.selectedGraphIds, []);
});

test("write queries are rejected before selecting a graph", async () => {
    const state = harness();

    const response = await POST(request("CREATE (:Node)"), routeParams);

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
        message: "Profile only supports valid read-only Cypher queries; update clauses and CALL procedures are not profiled.",
    });
    assert.deepEqual(state.selectedGraphIds, []);
});

test("procedure calls are rejected before selecting a graph", async () => {
    const state = harness();

    const response = await POST(request("CALL db.labels()"), routeParams);

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
        message: "Profile only supports valid read-only Cypher queries; update clauses and CALL procedures are not profiled.",
    });
    assert.deepEqual(state.selectedGraphIds, []);
});

test("valid read-only queries return profile steps for the selected graph", async () => {
    const state = harness();

    const response = await POST(request("MATCH (n) RETURN n"), routeParams);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        result: ["NodeByLabelScan", "Results"],
    });
    assert.deepEqual(state.selectedGraphIds, ["graph-one"]);
    assert.deepEqual(state.profileQueries, ["MATCH (n) RETURN n"]);
});

test("profile query failures are returned as bad requests", async (t) => {
    const log = t.mock.method(console, "error", () => {});
    const state = harness({ profileError: new Error("profile failed") });

    const response = await POST(request("MATCH (n) RETURN n"), routeParams);

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "profile failed" });
    assert.deepEqual(state.profileQueries, ["MATCH (n) RETURN n"]);
    assert.equal(log.mock.callCount(), 1);
});

test("authentication responses pass through without selecting a graph", async () => {
    const authResponse = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    globalThis.__graphProfileRouteTest = {
        async getClient() {
            return authResponse;
        },
    };

    const response = await POST(request("MATCH (n) RETURN n"), routeParams);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Unauthorized" });
});

test("session failures return a server error", async () => {
    harness({ sessionError: new Error("session unavailable") });

    const response = await POST(request("MATCH (n) RETURN n"), routeParams);

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
});
