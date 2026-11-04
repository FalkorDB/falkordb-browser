import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import type { Graph } from "falkordb";
import { runQuery } from "./run-query.ts";
import { isRequestOriginTrusted } from "./utils.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type MockResult = { data: string };
const OK: MockResult = { data: "ok" };

function makeGraph({
    queryResult = OK,
    roQueryResult = OK,
    queryError,
}: {
    queryResult?: MockResult;
    roQueryResult?: MockResult;
    queryError?: Error;
} = {}): { graph: Graph; querySpy: ReturnType<typeof mock.fn>; roQuerySpy: ReturnType<typeof mock.fn> } {
    const querySpy = mock.fn(async () => {
        if (queryError) throw queryError;
        return queryResult;
    });
    const roQuerySpy = mock.fn(async () => roQueryResult);

    const graph = { query: querySpy, roQuery: roQuerySpy } as unknown as Graph;
    return { graph, querySpy, roQuerySpy };
}

// ---------------------------------------------------------------------------
// runQuery
// ---------------------------------------------------------------------------

describe("runQuery", () => {
    // ------------------------------------------------------------------
    // isReadOnly = true  →  always use roQuery (replica or Read-Only user)
    // ------------------------------------------------------------------
    it("uses roQuery when isReadOnly is true", async () => {
        const { graph, querySpy, roQuerySpy } = makeGraph();
        await runQuery(graph, "MATCH (n) RETURN n", true);
        assert.equal(roQuerySpy.mock.callCount(), 1);
        assert.equal(querySpy.mock.callCount(), 0);
    });

    describe("isRequestOriginTrusted", () => {
        const envKeys = ["ALLOWED_ORIGINS", "AUTH_URL", "NEXTAUTH_URL", "TRUST_PROXY_HEADERS"] as const;

        it("honors explicit origin restrictions even when Host equals Origin in auto mode", (t) => {
            const previous = { ...process.env };
            t.after(() => { process.env = previous; });
            process.env.AUTH_URL = "auto";
            process.env.ALLOWED_ORIGINS = "https://allowed.example";
            for (const origin of ["https://unlisted.example", "https://allowed.example"]) {
                const request = new Request(`${origin}/api/graph`, {
                    method: "POST", headers: { host: new URL(origin).host, origin },
                });
                assert.equal(isRequestOriginTrusted(request), origin === "https://allowed.example");
            }
        });

        it("does not override an untrusted or malformed Origin with Fetch Metadata", (t) => {
            const previous = { ...process.env };
            t.after(() => { process.env = previous; });
            process.env.ALLOWED_ORIGINS = "";
            process.env.AUTH_URL = "https://app.example";
            for (const origin of ["https://attacker.example", "null", "malformed"]) {
                assert.equal(isRequestOriginTrusted(new Request("https://app.example/api/graph", {
                    method: "POST",
                    headers: { host: "app.example", origin, "sec-fetch-site": "same-origin" },
                })), false);
            }
        });

        it("requires a trusted origin for cookie-authenticated mutations", () => {
            const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
            try {
                process.env.AUTH_URL = "https://app.example";
                delete process.env.ALLOWED_ORIGINS;
                delete process.env.NEXTAUTH_URL;
                delete process.env.TRUST_PROXY_HEADERS;

                assert.equal(
                    isRequestOriginTrusted(new Request("https://app.example/api/graph", {
                        method: "POST",
                        headers: { host: "app.example", origin: "https://app.example" },
                    })),
                    true,
                );
                assert.equal(
                    isRequestOriginTrusted(new Request("https://app.example/api/graph", {
                        method: "POST",
                        headers: { host: "app.example", origin: "https://attacker.example" },
                    })),
                    false,
                );
                assert.equal(
                    isRequestOriginTrusted(new Request("https://app.example/api/graph", {
                        method: "POST",
                        headers: { host: "app.example" },
                    })),
                    false,
                );
                assert.equal(
                    isRequestOriginTrusted(new Request("https://app.example/api/graph", {
                        method: "POST",
                        headers: { host: "app.example", authorization: "Bearer token" },
                    })),
                    true,
                );
                assert.equal(
                    isRequestOriginTrusted(new Request("https://app.example/api/graph", {
                        method: "GET",
                        headers: { host: "app.example" },
                    })),
                    true,
                );
            } finally {
                for (const key of envKeys) {
                    const value = originalEnv[key];
                    if (value === undefined) delete process.env[key];
                    else process.env[key] = value;
                }
            }
        });
    });

    it("forwards options to roQuery when isReadOnly is true", async () => {
        const { graph, roQuerySpy } = makeGraph();
        const opts = { TIMEOUT: 3000 };
        await runQuery(graph, "MATCH (n) RETURN n", true, opts);
        assert.deepEqual(roQuerySpy.mock.calls[0].arguments[1], opts);
    });

    // ------------------------------------------------------------------
    // isReadOnly = false  →  use graph.query (write-capable instance)
    // ------------------------------------------------------------------
    it("uses graph.query when isReadOnly is false", async () => {
        const { graph, querySpy, roQuerySpy } = makeGraph();
        await runQuery(graph, "CREATE (n)", false);
        assert.equal(querySpy.mock.callCount(), 1);
        assert.equal(roQuerySpy.mock.callCount(), 0);
    });

    it("forwards options to graph.query when isReadOnly is false", async () => {
        const { graph, querySpy } = makeGraph();
        const opts = { TIMEOUT: 1500 };
        await runQuery(graph, "MATCH (n) RETURN n", false, opts);
        assert.deepEqual(querySpy.mock.calls[0].arguments[1], opts);
    });

    it("propagates errors from graph.query without swallowing them", async () => {
        const permErr = new Error("NOPERM this user has no permissions");
        const { graph } = makeGraph({ queryError: permErr });
        await assert.rejects(() => runQuery(graph, "CREATE (n)", false), /NOPERM/);
    });
});
