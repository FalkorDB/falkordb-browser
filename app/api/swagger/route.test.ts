import assert from "node:assert/strict";
import test, { after } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextResponse } from "next/server.js";
import swaggerSpec from "./swagger-spec.ts";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const swaggerSpecUrl = new URL("./swagger-spec.ts", import.meta.url).href;
const utilsUrl = new URL("../utils.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "./swagger-spec") return nextResolve(swaggerSpecUrl, context);
            if (specifier === "../utils") return nextResolve(utilsUrl, context);
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

after(() => hooks.deregister());

test("GET serves the OpenAPI specification with no-cache headers", async () => {
    const response = await GET(new Request("https://example.test/api/swagger"));

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body, swaggerSpec);
    assert.equal(body.openapi, swaggerSpec.openapi);
    assert.equal(body.info.title, swaggerSpec.info.title);
    assert.equal(response.headers.get("Cache-Control"), "no-cache, no-store, must-revalidate");
    assert.equal(response.headers.get("Pragma"), "no-cache");
    assert.equal(response.headers.get("Expires"), "0");
});
