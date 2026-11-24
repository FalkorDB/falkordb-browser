import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest } from "next/server.js";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const storageModule = "data:text/javascript,export function getCsvStorageProvider() { return globalThis.__cleanupRouteStorage; }";

declare global {
    var __cleanupRouteStorage: { cleanupExpired: (cutoff: number) => Promise<number> } | undefined;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/lib/csv-storage") return { url: storageModule, shortCircuit: true };
            if (specifier === "@/app/lib/csv-temp-config") return nextResolve(new URL("../../../lib/csv-temp-config.ts", import.meta.url).href, context);
            if (specifier === "@/lib/graphUpload") return nextResolve(new URL("../../../../lib/graphUpload.ts", import.meta.url).href, context);
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

const { GET, POST } = await import("./route.ts");
const request = (method: string, headers: Record<string, string> = {}) =>
    new NextRequest("http://localhost/api/csv-temp/cleanup", { method, headers });
after(() => { delete globalThis.__cleanupRouteStorage; });

test("cleanup fails closed when no secret is configured", async (t) => {
    t.mock.property(process, "env", { NODE_ENV: "test" });
    globalThis.__cleanupRouteStorage = { cleanupExpired: async () => assert.fail("must not access storage") };
    const response = await GET(request("GET"));
    assert.equal(response.status, 503);
    assert.match((await response.json()).message, /Cleanup is not configured/);
});

test("cleanup rejects invalid credentials without touching storage", async (t) => {
    t.mock.property(process, "env", { NODE_ENV: "test", CSV_TEMP_CLEANUP_SECRET: "test-cleanup-secret" });
    globalThis.__cleanupRouteStorage = { cleanupExpired: async () => assert.fail("must not access storage") };
    const response = await POST(request("POST", { "x-csv-cleanup-secret": "wrong" }));
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Unauthorized" });
});

test("GET cron and POST cleanup pass the configured expiry cutoff to storage", async (t) => {
    t.mock.property(process, "env", {
        NODE_ENV: "test", CSV_TEMP_CLEANUP_SECRET: "test-cleanup-secret", CRON_SECRET: "test-cron-secret", CSV_TEMP_TTL_SECONDS: "60",
    });
    t.mock.method(Date, "now", () => 1_000_000);
    const cutoffs: number[] = [];
    globalThis.__cleanupRouteStorage = {
        cleanupExpired: async (cutoff) => { cutoffs.push(cutoff); return 3; },
    };
    for (const [operation, input] of [
        [GET, request("GET", { authorization: "Bearer test-cron-secret" })],
        [POST, request("POST", { "x-csv-cleanup-secret": "test-cleanup-secret" })],
    ] as const) {
        const response = await operation(input);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { deleted: 3, ttlSeconds: 60 });
        assert.equal(response.headers.get("vary"), "Origin");
    }
    assert.deepEqual(cutoffs, [940_000, 940_000]);
});

test("cleanup reports storage failures without exposing internal details", async (t) => {
    t.mock.property(process, "env", { NODE_ENV: "test", CSV_TEMP_CLEANUP_SECRET: "test-cleanup-secret" });
    const log = t.mock.method(console, "error", () => {});
    globalThis.__cleanupRouteStorage = { cleanupExpired: async () => { throw new Error("private storage details"); } };
    const response = await POST(request("POST", { "x-csv-cleanup-secret": "test-cleanup-secret" }));
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Cleanup failed" });
    assert.equal(log.mock.callCount(), 1);
});
