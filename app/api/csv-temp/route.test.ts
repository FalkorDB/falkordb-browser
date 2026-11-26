import assert from "node:assert/strict";
import test, { after, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";
import { hashOwner, isValidCsvKey } from "../../lib/csv-key.ts";

type Session = NextResponse | { user: { id: string; role: string } };
type CsvUploadFixture = {
    session: Session;
    mode: string;
    sessionCalls: number;
    storeCalls: Array<{ owner: string; key: string; csv: string }>;
    deleteCalls: Array<{ owner: string; key: string }>;
    deleteError?: Error;
    provider: {
        store(owner: string, key: string, body: NodeJS.ReadableStream): Promise<void>;
        delete(owner: string, key: string): Promise<void>;
    };
};

declare global {
    var __csvTempUploadRouteFixture: CsvUploadFixture | undefined;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient() { const fixture = globalThis.__csvTempUploadRouteFixture; fixture.sessionCalls += 1; return fixture.session; }";
const storageModule = "data:text/javascript,export function getCsvStorageProvider() { return globalThis.__csvTempUploadRouteFixture.provider; } export function getResolvedCsvStorageMode() { return globalThis.__csvTempUploadRouteFixture.mode; }";
const graphUploadModule = "data:text/javascript,export let CSV_UPLOAD_ENABLED = true; export function setCsvUploadEnabled(enabled) { CSV_UPLOAD_ENABLED = enabled; }";
const utilsUrl = new URL("../utils.ts", import.meta.url).href;
const csvKeyUrl = new URL("../../lib/csv-key.ts", import.meta.url).href;

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "../auth/[...nextauth]/options") {
                return { url: authModule, shortCircuit: true };
            }
            if (specifier === "../utils") {
                return nextResolve(utilsUrl, context);
            }
            if (specifier === "@/app/lib/csv-storage") {
                return { url: storageModule, shortCircuit: true };
            }
            if (specifier === "@/app/lib/csv-key") {
                return nextResolve(csvKeyUrl, context);
            }
            if (specifier === "@/lib/graphUpload") {
                return { url: graphUploadModule, shortCircuit: true };
            }
            if (specifier === "./stream-csv") {
                return nextResolve(new URL("./stream-csv.ts", import.meta.url).href, context);
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

const { POST } = await import("./route.ts");
const { setCsvUploadEnabled } = await import(graphUploadModule);

after(() => {
    delete globalThis.__csvTempUploadRouteFixture;
    setCsvUploadEnabled(true);
    hooks.deregister();
});

function configure(t: TestContext): CsvUploadFixture {
    t.mock.property(process, "env", {
        ...process.env,
        CSV_TEMP_SIGNING_SECRET: "csv-temp-upload-route-test-secret",
    });
    const fixture: CsvUploadFixture = {
        session: { user: { id: "user-456", role: "Admin" } },
        mode: "local",
        sessionCalls: 0,
        storeCalls: [],
        deleteCalls: [],
        provider: {
            async store(owner, key, body) {
                const chunks: Buffer[] = [];
                for await (const chunk of body as AsyncIterable<Buffer | string>) {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                }
                fixture.storeCalls.push({
                    owner,
                    key,
                    csv: Buffer.concat(chunks).toString("utf8"),
                });
            },
            async delete(owner, key) {
                fixture.deleteCalls.push({ owner, key });
                if (fixture.deleteError) throw fixture.deleteError;
            },
        },
    };
    globalThis.__csvTempUploadRouteFixture = fixture;
    setCsvUploadEnabled(true);
    return fixture;
}

function multipartRequest(parts: Array<{ name: string; value: string | File; filename?: string }> = []): NextRequest {
    const form = new FormData();
    for (const part of parts) {
        if (part.value instanceof File) {
            form.append(part.name, part.value, part.filename ?? part.value.name);
        } else {
            form.append(part.name, part.value);
        }
    }
    return new NextRequest("http://example.test/api/csv-temp", {
        method: "POST",
        body: form,
    });
}

test("POST streams a BOM-prefixed CSV into owner-scoped storage and returns its key", async (t) => {
    const fixture = configure(t);
    const file = new File(["\uFEFFname\nAda\n"], "people.csv", { type: "text/csv" });

    const response = await POST(multipartRequest([{ name: "file", value: file }]));

    assert.equal(response.status, 201, JSON.stringify(await response.clone().json()));
    const result = await response.json() as { key: string };
    assert.equal(isValidCsvKey(result.key), true);
    assert.deepEqual(fixture.storeCalls, [{
        owner: hashOwner("user-456"),
        key: result.key,
        csv: "name\nAda\n",
    }]);
    assert.deepEqual(fixture.deleteCalls, []);
});

test("POST passes authentication failures through unchanged", async (t) => {
    const fixture = configure(t);
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    fixture.session = denied;

    const response = await POST(multipartRequest());

    assert.strictEqual(response, denied);
    assert.equal(fixture.sessionCalls, 1);
    assert.deepEqual(fixture.storeCalls, []);
});

test("POST rejects read-only uploads before storage access", async (t) => {
    const fixture = configure(t);
    fixture.session = { user: { id: "user-456", role: "Read-Only" } };

    const response = await POST(multipartRequest());

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { message: "You do not have permission to upload files." });
    assert.deepEqual(fixture.storeCalls, []);
    assert.deepEqual(fixture.deleteCalls, []);
});

test("POST requires direct upload for cloud storage modes", async (t) => {
    const fixture = configure(t);
    fixture.mode = "s3";

    const response = await POST(multipartRequest());

    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), {
        message: "Direct upload required: use /api/csv-temp/direct for cloud CSV storage.",
    });
    assert.deepEqual(fixture.storeCalls, []);
    assert.deepEqual(fixture.deleteCalls, []);
});

test("POST cleans up the generated key when the multipart body has no file", async (t) => {
    const fixture = configure(t);
    fixture.deleteError = new Error("storage cleanup failed");

    const response = await POST(multipartRequest());

    assert.equal(response.status, 400);
    const result = await response.json() as { message: string };
    assert.deepEqual(result, { message: "No file provided." });
    assert.equal(fixture.deleteCalls.length, 1);
    assert.equal(fixture.deleteCalls[0].owner, hashOwner("user-456"));
    assert.equal(isValidCsvKey(fixture.deleteCalls[0].key), true);
    assert.deepEqual(fixture.storeCalls, []);
});

test("POST denies uploads when the CSV feature is disabled", async (t) => {
    const fixture = configure(t);
    setCsvUploadEnabled(false);

    const response = await POST(multipartRequest());

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { message: "CSV upload is temporarily disabled." });
    assert.equal(fixture.sessionCalls, 0);
    assert.deepEqual(fixture.storeCalls, []);
});
