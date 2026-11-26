import assert from "node:assert/strict";
import test, { after, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest } from "next/server.js";

type CsvCapabilitiesFixture = {
    session: { user?: { id?: string } } | null;
    sessionCalls: number;
};

declare global {
    var __csvCapabilitiesRouteFixture: CsvCapabilitiesFixture | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getSessionFromRequest() { const fixture = globalThis.__csvCapabilitiesRouteFixture; fixture.sessionCalls += 1; return fixture.session; }";
const utilsUrl = new URL("../../utils.ts", import.meta.url).href;
const capabilitiesUrl = new URL("../../../lib/csv-load-capabilities.ts", import.meta.url).href;
const graphUploadUrl = new URL("../../../../lib/graphUpload.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "../../auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "../../utils") {
                return nextResolve(utilsUrl, context);
            }
            if (specifier === "@/app/lib/csv-load-capabilities") {
                return nextResolve(capabilitiesUrl, context);
            }
            if (specifier === "@/lib/graphUpload") {
                return nextResolve(graphUploadUrl, context);
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
    delete globalThis.__csvCapabilitiesRouteFixture;
    hooks.deregister();
});

const baseEnvironment: NodeJS.ProcessEnv = {
    NODE_ENV: "test",
    AUTH_URL: "https://app.example",
    ALLOWED_ORIGINS: "https://browser.example",
    CSV_STORAGE: "local",
    CSV_LOCAL_LOAD_URI_MODE: "http",
    CSV_SERVE_BASE_URL: "http://files.example",
};

function configure(
    t: TestContext,
    env: Partial<NodeJS.ProcessEnv> = {},
    session: CsvCapabilitiesFixture["session"] = { user: { id: "user-1" } },
): CsvCapabilitiesFixture {
    t.mock.property(process, "env", { ...baseEnvironment, ...env });
    const fixture: CsvCapabilitiesFixture = { session, sessionCalls: 0 };
    globalThis.__csvCapabilitiesRouteFixture = fixture;
    return fixture;
}

function request(origin = "https://browser.example"): NextRequest {
    return new NextRequest("https://app.example/api/csv-temp/capabilities", {
        headers: { host: "app.example", origin },
    });
}

test("GET reports trusted session capabilities without requiring a database connection", async (t) => {
    const fixture = configure(t);

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://browser.example");
    assert.deepEqual(await response.json(), {
        uploadEnabled: false,
        fileUriSupported: true,
    });
    assert.equal(fixture.sessionCalls, 1);
});

test("GET denies untrusted origins before reading the session", async (t) => {
    const fixture = configure(t);

    const response = await GET(request("https://attacker.example"));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Untrusted request origin" });
    assert.equal(fixture.sessionCalls, 0);
});

test("GET requires an authenticated user", async (t) => {
    const fixture = configure(t, {}, null);

    const response = await GET(request());

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: "Not authenticated" });
    assert.equal(fixture.sessionCalls, 1);
});

test("GET reports cloud uploads as usable while honoring the file URI setting", async (t) => {
    const fixture = configure(t, {
        CSV_STORAGE: "s3",
        S3_BUCKET: "test-bucket",
        LOAD_CSV_FILE_URI: "false",
    });

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        uploadEnabled: true,
        fileUriSupported: false,
    });
    assert.equal(fixture.sessionCalls, 1);
});

test("GET disables local uploads when they would produce an unreadable HTTP URL", async (t) => {
    const fixture = configure(t, {
        CSV_LOCAL_LOAD_URI_MODE: "http",
        CSV_SERVE_BASE_URL: "http://files.example",
        LOAD_CSV_FILE_URI: "false",
    });

    const response = await GET(request());

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        uploadEnabled: false,
        fileUriSupported: false,
    });
    assert.equal(fixture.sessionCalls, 1);
});
