import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const routeUrl = new URL("./route.ts", import.meta.url).href;
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/utils") return nextResolve(new URL("../../utils.ts", import.meta.url).href, context);
            if (specifier === "@/lib/preconfiguredConnection") return nextResolve(new URL("../../../../lib/preconfiguredConnection.ts", import.meta.url).href, context);
            if (specifier === "next/server") return nextResolve("next/server.js", context);
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
const request = (origin?: string) => new Request("http://localhost/api/connections/preconfigured", {
    headers: origin ? { origin } : undefined,
});

test("reports no configured connection with no-store headers", async (t) => {
    t.mock.property(process, "env", { NODE_ENV: "test" });
    const response = await GET(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { configured: false, autoConnect: false });
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("vary"), "Origin");
});

test("prefills a manual connection without exposing credentials or certificates", async (t) => {
    t.mock.property(process, "env", {
        NODE_ENV: "test",
        FALKORDB_HOST: "database.example",
        FALKORDB_PORT: "6380",
        FALKORDB_USERNAME: "operator",
        FALKORDB_PASSWORD: "test-password",
        FALKORDB_CA: "test-certificate",
        FALKORDB_TLS: "true",
        FALKORDB_AUTO_CONNECT: "false",
    });
    const response = await GET(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        configured: true, autoConnect: false, host: "database.example", port: 6380, username: "operator", tls: true,
    });
    assert.equal(response.headers.get("cache-control"), "no-store");
});

test("hides connection details on auto-connect and warns without logging the password", async (t) => {
    t.mock.property(process, "env", {
        NODE_ENV: "test",
        FALKORDB_HOST: "database.example", FALKORDB_USERNAME: "operator", FALKORDB_PASSWORD: "test-password",
    });
    const warnings: string[] = [];
    t.mock.method(console, "warn", (message: string) => { warnings.push(message); });
    const response = await GET(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { configured: true, autoConnect: true });
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /auto.connect/i);
    assert.doesNotMatch(warnings[0], /test-password/);
});

test("rejects malformed configuration without exposing the invalid value", async (t) => {
    t.mock.property(process, "env", { NODE_ENV: "test", FALKORDB_HOST: "database.example", FALKORDB_PORT: "invalid-port" });
    t.mock.method(console, "error", () => {});
    const response = await GET(request());
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
        message: "The preconfigured connection environment is invalid. Check the server logs.",
    });
    assert.equal(response.headers.get("cache-control"), "no-store");
});

test("rejects an untrusted request origin", async () => {
    const response = await GET(request("not an origin"));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Untrusted request origin" });
});
