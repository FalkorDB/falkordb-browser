import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";

type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __ldapRouteTest: RouteTestState | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__ldapRouteTest.getClient(request); }";
const utilsUrl = new URL("../utils.ts", import.meta.url).href;
const enterpriseUrl = new URL("../../../lib/enterprise.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "@/app/api/utils") {
                return nextResolve(utilsUrl, context);
            }
            if (specifier === "@/lib/enterprise") {
                return nextResolve(enterpriseUrl, context);
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
    delete globalThis.__ldapRouteTest;
    hooks.deregister();
});

function harness(options: {
    authResponse?: NextResponse;
    sessionError?: Error;
    config?: Record<string, unknown> | null;
    configError?: Error;
} = {}) {
    const configKeys: string[] = [];
    globalThis.__ldapRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                client: {
                    connection: Promise.resolve({
                        async configGet(key: string) {
                            configKeys.push(key);
                            if (options.configError) throw options.configError;
                            return options.config ?? {};
                        },
                    }),
                },
            };
        },
    };
    return configKeys;
}

function request(): Request {
    return new Request("https://example.test/api/ldap");
}

test("GET reads LDAP configuration and returns only whether it is configured", async () => {
    const configKeys = harness({
        config: { "falkordbe.ldap_servers": "ldap://private-host:389" },
    });

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { usesLdap: true });
    assert.deepEqual(configKeys, ["falkordbe.ldap_servers"]);
});

test("GET reports LDAP as unconfigured when the parameter is empty", async () => {
    harness({ config: { "falkordbe.ldap_servers": "" } });

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { usesLdap: false });
});

test("GET passes authentication responses through without reading configuration", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const configKeys = harness({ authResponse: denied });

    assert.strictEqual(await GET(request()), denied);
    assert.deepEqual(configKeys, []);
});

test("GET hides LDAP configuration read errors", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ configError: new Error("private LDAP details") });

    const response = await GET(request());

    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { message: "Failed to read LDAP configuration" });
});

test("GET reports unexpected session errors", async (t) => {
    t.mock.method(console, "error", () => {});
    harness({ sessionError: new Error("session unavailable") });

    const response = await GET(request());

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
});
