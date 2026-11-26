import test, { after, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";
import type { CsvDirectUploadRequest, CsvDirectUploadTarget, CsvStorageMode } from "../../../lib/csv-storage.ts";
import { hashOwner, isValidCsvKey } from "../../../lib/csv-key.ts";

type Fixture = {
    session: NextResponse | { user: { id: string; role: string } };
    mode: CsvStorageMode;
    provider: { createDirectUploadTarget?: (owner: string, key: string, input: CsvDirectUploadRequest) => Promise<CsvDirectUploadTarget | null> };
};

declare global {
    var __directCsvFixture: Fixture;
}

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient() { return globalThis.__directCsvFixture.session; }";
const storageModule = "data:text/javascript,export function getResolvedCsvStorageMode() { return globalThis.__directCsvFixture.mode; } export function getCsvStorageProvider() { return globalThis.__directCsvFixture.provider; }";

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier.includes("auth/[...nextauth]/options")) return { url: authModule, shortCircuit: true };
            if (specifier === "@/app/lib/csv-storage") return { url: storageModule, shortCircuit: true };
            if (specifier === "@/app/lib/csv-key") return nextResolve(new URL("../../../lib/csv-key.ts", import.meta.url).href, context);
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

const { POST } = await import("./route.ts");
const request = (body: string, query = "") => new NextRequest(`http://localhost/api/csv-temp/direct${query}`, {
    method: "POST", body, headers: { origin: "http://localhost", "content-type": "application/json" },
});
const json = (body: unknown) => JSON.stringify(body);

function configure(t: TestContext): Fixture {
    t.mock.property(process, "env", { NODE_ENV: "test", CSV_TEMP_SIGNING_SECRET: "test-signing-secret", CSV_MAX_FILE_SIZE_MB: "1" });
    const fixture: Fixture = { session: { user: { id: "owner-1", role: "Admin" } }, mode: "s3", provider: {} };
    globalThis.__directCsvFixture = fixture;
    return fixture;
}

after(() => { Reflect.deleteProperty(globalThis, "__directCsvFixture"); });

test("passes through authentication failures and rejects read-only uploads", async (t) => {
    const fixture = configure(t);
    const denied = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    fixture.session = denied;
    assert.strictEqual(await POST(request("{}")), denied);

    fixture.session = { user: { id: "owner-1", role: "Read-Only" } };
    let response = await POST(request("{}"));
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { message: "You do not have permission to upload files." });
    fixture.session = { user: { id: "owner-1", role: "Admin" } };
    response = await POST(request("{}", "?readOnly=true"));
    assert.equal(response.status, 403);
});

test("validates the JSON body and required upload metadata", async (t) => {
    configure(t);
    const malformed = await POST(request("{"));
    assert.equal(malformed.status, 400);
    assert.deepEqual(await malformed.json(), { message: "Invalid request body." });
    for (const body of [null, [], {}, { filename: " " }, { filename: "file.csv", sizeBytes: 0 },
        { filename: "file.csv", sizeBytes: -1 }, { filename: "file.csv", sizeBytes: "1" },
        { filename: "file.csv", sizeBytes: 1, contentType: null }]) {
        const response = await POST(request(json(body)));
        assert.equal(response.status, 400);
        assert.deepEqual(await response.json(), { message: "filename and sizeBytes are required." });
    }
});

test("enforces the configured size limit before checking storage mode", async (t) => {
    const fixture = configure(t);
    fixture.mode = "local";
    const tooLarge = await POST(request(json({ filename: "file.csv", sizeBytes: 1024 * 1024 + 1 })));
    assert.equal(tooLarge.status, 413);
    assert.deepEqual(await tooLarge.json(), { message: "File exceeds the 1 MB limit." });
    const atLimit = await POST(request(json({ filename: "file.csv", sizeBytes: 1024 * 1024 })));
    assert.equal(atLimit.status, 409);
    assert.deepEqual(await atLimit.json(), { message: "Direct upload is not enabled for local CSV storage." });
});

test("creates owner-scoped direct upload targets with normalized metadata", async (t) => {
    const fixture = configure(t);
    const calls: Array<{ owner: string; key: string; input: CsvDirectUploadRequest }> = [];
    const target: CsvDirectUploadTarget = { type: "s3-presigned-put", method: "PUT", url: "https://storage.example/file", headers: { "content-type": "text/csv" } };
    fixture.provider.createDirectUploadTarget = async (owner, key, input) => {
        calls.push({ owner, key, input });
        return target;
    };
    for (const [body, input] of [
        [{ filename: " file.csv ", sizeBytes: 2.8, contentType: " text/plain " }, { filename: "file.csv", sizeBytes: 2, contentType: "text/plain" }],
        [{ filename: "other.csv", sizeBytes: 1, contentType: " " }, { filename: "other.csv", sizeBytes: 1, contentType: "text/csv" }],
        [{ filename: "third.csv", sizeBytes: 1 }, { filename: "third.csv", sizeBytes: 1, contentType: "text/csv" }],
    ] as const) {
        const response = await POST(request(json(body)));
        assert.equal(response.status, 201);
        assert.equal(response.headers.get("vary"), "Origin");
        const result = await response.json();
        assert.equal(result.mode, "s3");
        assert.deepEqual(result.upload, target);
        assert.equal(isValidCsvKey(result.key), true);
        assert.deepEqual(calls.at(-1), { owner: hashOwner("owner-1"), key: result.key, input });
    }
    assert.equal(new Set(calls.map(({ key }) => key)).size, 3);
});

test("reports unsupported providers and storage errors without leaking details", async (t) => {
    const fixture = configure(t);
    let response = await POST(request(json({ filename: "file.csv", sizeBytes: 1 })));
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { message: "Direct upload is not available for the configured CSV storage." });
    fixture.provider.createDirectUploadTarget = async () => null;
    response = await POST(request(json({ filename: "file.csv", sizeBytes: 1 })));
    assert.equal(response.status, 409);

    const log = t.mock.method(console, "error", () => {});
    fixture.provider.createDirectUploadTarget = async () => { throw new Error("private storage details"); };
    response = await POST(request(json({ filename: "file.csv", sizeBytes: 1 })));
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Failed to prepare direct upload." });
    assert.equal(log.mock.callCount(), 1);
});
