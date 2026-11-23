import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__monitorTestSession(request); }";

declare global {
    var __monitorTestSession: ((request: Request) => Promise<unknown>) | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") return { url: authModule, shortCircuit: true };
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier === "@/app/api/utils") return nextResolve(new URL("../utils.ts", import.meta.url).href, context);
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

const { GET } = await import("./route.ts");
const request = () => new Request("http://localhost/api/monitor");
after(() => { delete globalThis.__monitorTestSession; });

test("monitor returns memory fields and graph series from database information", async () => {
    globalThis.__monitorTestSession = async () => ({
        client: {
            connection: Promise.resolve({
                info: async (section: string) => {
                    assert.equal(section, "memory");
                    return "# Memory\r\nused_memory:123\r\nignored:99\r\nused_memory_rss:456\r\n";
                },
            }),
            info: async () => ["g:people", ["one", "two"], "g:empty", []],
        },
    });
    const response = await GET(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        memory: [{ name: "used_memory", series: "123" }, { name: "used_memory_rss", series: "456" }],
        graph: [{ name: "people", series: 2 }, { name: "empty", series: 0 }],
    });
});

test("monitor passes through authentication failures", async () => {
    globalThis.__monitorTestSession = async () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const response = await GET(request());
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Unauthorized" });
});

test("monitor reports database failures", async (t) => {
    t.mock.method(console, "error", () => {});
    globalThis.__monitorTestSession = async () => ({
        client: { connection: Promise.resolve({ info: async () => { throw new Error("database unavailable"); } }) },
    });
    const response = await GET(request());
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "database unavailable" });
});

test("monitor reports unexpected session errors", async (t) => {
    t.mock.method(console, "error", () => {});
    globalThis.__monitorTestSession = async () => { throw new Error("session failure"); };
    const response = await GET(request());
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal server error" });
});
