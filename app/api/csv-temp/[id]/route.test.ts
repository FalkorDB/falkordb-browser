import assert from "node:assert/strict";
import test, { after, type TestContext } from "node:test";
import { Readable } from "node:stream";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";
import { hashOwner, signCsvCapability } from "../../../lib/csv-key.ts";

type Session = NextResponse | { user: { id: string; role: string } };
type CsvTempFixture = {
    mode: string;
    session: Session;
    stream: Readable | null;
    openCalls: Array<{ owner: string; key: string }>;
    deleteCalls: Array<{ owner: string; key: string }>;
    provider: {
        delete(owner: string, key: string): Promise<void>;
    };
};

declare global {
    var __csvTempIdRouteFixture: CsvTempFixture | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient() { return globalThis.__csvTempIdRouteFixture.session; }";
const storageModule = "data:text/javascript,export function getCsvStorageProvider() { return globalThis.__csvTempIdRouteFixture.provider; } export function getResolvedCsvStorageMode() { return globalThis.__csvTempIdRouteFixture.mode; }";
const localStorageModule = "data:text/javascript,export function openLocalCsvReadStream(owner, key) { const fixture = globalThis.__csvTempIdRouteFixture; fixture.openCalls.push({ owner, key }); return fixture.stream; }";
const graphUploadModule = "data:text/javascript,export let CSV_UPLOAD_ENABLED = true; export function setCsvUploadEnabled(enabled) { CSV_UPLOAD_ENABLED = enabled; }";
const utilsUrl = new URL("../../utils.ts", import.meta.url).href;
const csvKeyUrl = new URL("../../../lib/csv-key.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/lib/csv-storage") {
                return { url: storageModule, shortCircuit: true };
            }
            if (specifier === "@/app/lib/csv-storage-local") {
                return { url: localStorageModule, shortCircuit: true };
            }
            if (specifier === "@/app/api/auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "@/app/api/utils") {
                return nextResolve(utilsUrl, context);
            }
            if (specifier === "@/app/lib/csv-key") {
                return nextResolve(csvKeyUrl, context);
            }
            if (specifier === "@/lib/graphUpload") {
                return { url: graphUploadModule, shortCircuit: true };
            }
            if (specifier === "next/server") return nextResolve("next/server.js", context);
        }
        if (context.parentURL === utilsUrl && specifier === "./run-query.ts") {
            return nextResolve(new URL("../../run-query.ts", import.meta.url).href, context);
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

const { GET, DELETE } = await import("./route.ts");
const { setCsvUploadEnabled } = await import(graphUploadModule);

after(() => {
    delete globalThis.__csvTempIdRouteFixture;
    setCsvUploadEnabled(true);
    hooks.deregister();
});

function configure(t: TestContext): CsvTempFixture {
    t.mock.property(process, "env", {
        ...process.env,
        CSV_TEMP_SIGNING_SECRET: "csv-temp-route-test-secret",
    });
    const fixture: CsvTempFixture = {
        mode: "local",
        session: { user: { id: "user-123", role: "Admin" } },
        stream: null,
        openCalls: [],
        deleteCalls: [],
        provider: {
            async delete(owner, key) {
                fixture.deleteCalls.push({ owner, key });
            },
        },
    };
    globalThis.__csvTempIdRouteFixture = fixture;
    setCsvUploadEnabled(true);
    return fixture;
}

function params(id = "11111111-1111-4111-8111-111111111111") {
    return { params: Promise.resolve({ id }) };
}

function request(path: string, method: "GET" | "DELETE" = "GET"): NextRequest {
    return new NextRequest(`http://example.test/api/csv-temp/${path}`, { method });
}

function signedRequest(owner: string, key: string): NextRequest {
    const { token } = signCsvCapability(owner, key, 60_000);
    const url = new URL(`http://example.test/api/csv-temp/${key}`);
    url.searchParams.set("o", owner);
    url.searchParams.set("t", token);
    return new NextRequest(url);
}

test("GET streams a signed local CSV capability with cache-safe download headers", async (t) => {
    const fixture = configure(t);
    const key = "11111111-1111-4111-8111-111111111111";
    const owner = hashOwner("user-123");
    fixture.stream = Readable.from([Buffer.from("name\nAda\n")]);

    const response = await GET(signedRequest(owner, key), params(key));

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "text/csv; charset=utf-8");
    assert.equal(response.headers.get("content-disposition"), `inline; filename="${key}.csv"`);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(await response.text(), "name\nAda\n");
    assert.deepEqual(fixture.openCalls, [{ owner, key }]);
});

test("GET rejects invalid keys, owners, and signatures without opening local files", async (t) => {
    const fixture = configure(t);
    const key = "11111111-1111-4111-8111-111111111111";
    const owner = hashOwner("user-123");

    const invalidKey = await GET(
        signedRequest(owner, key),
        params("../../etc/passwd"),
    );
    const missingCapability = await GET(request(key), params(key));
    const invalidOwner = new URL(signedRequest(owner, key).url);
    invalidOwner.searchParams.set("o", "../user");
    const ownerResponse = await GET(new NextRequest(invalidOwner), params(key));
    const invalidToken = new URL(signedRequest(owner, key).url);
    invalidToken.searchParams.set("t", "1.invalid");
    const tokenResponse = await GET(new NextRequest(invalidToken), params(key));

    assert.equal(invalidKey.status, 404);
    assert.equal(missingCapability.status, 404);
    assert.equal(ownerResponse.status, 404);
    assert.equal(tokenResponse.status, 404);
    assert.deepEqual(fixture.openCalls, []);
});

test("GET hides local files when storage is cloud-backed or the file is absent", async (t) => {
    const fixture = configure(t);
    const key = "11111111-1111-4111-8111-111111111111";
    const owner = hashOwner("user-123");
    const signed = signedRequest(owner, key);

    fixture.mode = "s3";
    const cloudResponse = await GET(signed, params(key));
    fixture.mode = "local";
    const missingResponse = await GET(signed, params(key));

    assert.equal(cloudResponse.status, 404);
    assert.equal(missingResponse.status, 404);
    assert.deepEqual(fixture.openCalls, [{ owner, key }]);
});

test("GET and DELETE respect the CSV upload feature gate", async (t) => {
    const fixture = configure(t);
    setCsvUploadEnabled(false);

    const getResponse = await GET(request("11111111-1111-4111-8111-111111111111"), params());
    const deleteResponse = await DELETE(
        request("11111111-1111-4111-8111-111111111111", "DELETE"),
        params(),
    );

    assert.equal(getResponse.status, 404);
    assert.equal(await getResponse.text(), "Not found.");
    assert.equal(deleteResponse.status, 403);
    assert.deepEqual(await deleteResponse.json(), { message: "CSV upload is temporarily disabled." });
    assert.deepEqual(fixture.deleteCalls, []);
});

test("DELETE passes authentication failures through unchanged", async (t) => {
    const fixture = configure(t);
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    fixture.session = denied;

    const response = await DELETE(
        request("11111111-1111-4111-8111-111111111111", "DELETE"),
        params(),
    );

    assert.strictEqual(response, denied);
    assert.deepEqual(fixture.deleteCalls, []);
});

test("DELETE blocks read-only sessions and rejects invalid keys without deleting", async (t) => {
    const fixture = configure(t);
    fixture.session = { user: { id: "user-123", role: "Read-Only" } };
    const readOnlyResponse = await DELETE(
        request("11111111-1111-4111-8111-111111111111", "DELETE"),
        params(),
    );
    fixture.session = { user: { id: "user-123", role: "Admin" } };
    const invalidKeyResponse = await DELETE(
        request("invalid", "DELETE"),
        params("invalid"),
    );

    assert.equal(readOnlyResponse.status, 403);
    assert.deepEqual(await readOnlyResponse.json(), { message: "You do not have permission to delete files." });
    assert.equal(invalidKeyResponse.status, 400);
    assert.deepEqual(await invalidKeyResponse.json(), { message: "Invalid key." });
    assert.deepEqual(fixture.deleteCalls, []);
});

test("DELETE removes only the authenticated owner's normalized CSV key", async (t) => {
    const fixture = configure(t);
    const normalizedKey = "11111111-1111-4111-8111-111111111111";
    const mixedCaseKey = `  ${normalizedKey.toUpperCase()}  `;

    const response = await DELETE(
        request(mixedCaseKey, "DELETE"),
        params(mixedCaseKey),
    );

    assert.equal(response.status, 204);
    assert.equal(await response.text(), "");
    assert.deepEqual(fixture.deleteCalls, [{
        owner: hashOwner("user-123"),
        key: normalizedKey,
    }]);
});
