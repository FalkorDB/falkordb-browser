import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";

type RouteTestState = {
    getClient(request: Request): Promise<unknown>;
};

declare global {
    var __infoRouteTest: RouteTestState | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__infoRouteTest.getClient(request); }";
const utilsUrl = new URL("../utils.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "@/app/api/utils") {
                return nextResolve(utilsUrl, context);
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
    delete globalThis.__infoRouteTest;
    hooks.deregister();
});

function harness(options: {
    authResponse?: NextResponse;
    sessionError?: Error;
    infoError?: Error;
    infoResult?: string;
} = {}) {
    const sections: string[] = [];
    globalThis.__infoRouteTest = {
        async getClient() {
            if (options.sessionError) throw options.sessionError;
            if (options.authResponse) return options.authResponse;
            return {
                client: {
                    connection: Promise.resolve({
                        async info(section: string) {
                            sections.push(section);
                            if (options.infoError) throw options.infoError;
                            return options.infoResult ?? "server information";
                        },
                    }),
                },
            };
        },
    };
    return sections;
}

function request(url = "https://example.test/api/info"): NextRequest {
    return new NextRequest(url);
}

test("GET forwards the requested info section and returns its result", async () => {
    const sections = harness({ infoResult: "memory usage" });

    const response = await GET(request("https://example.test/api/info?section=memory"));

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { result: "memory usage" });
    assert.deepEqual(sections, ["memory"]);
});

test("GET requests the default section when no section is supplied", async () => {
    const sections = harness();

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { result: "server information" });
    assert.deepEqual(sections, [""]);
});

test("GET passes authentication responses through without querying info", async () => {
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const sections = harness({ authResponse: denied });

    assert.strictEqual(await GET(request()), denied);
    assert.deepEqual(sections, []);
});

test("GET reports database and session errors", async (t) => {
    t.mock.method(console, "error", () => {});

    harness({ infoError: new Error("info unavailable") });
    const databaseResponse = await GET(request());
    assert.equal(databaseResponse.status, 400);
    assert.deepEqual(await databaseResponse.json(), { message: "info unavailable" });

    harness({ sessionError: new Error("session unavailable") });
    const sessionResponse = await GET(request());
    assert.equal(sessionResponse.status, 500);
    assert.deepEqual(await sessionResponse.json(), { message: "Internal server error" });
});
