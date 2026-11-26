import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { promises as fs, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";
import { getUploadsDirectory, MAX_FILE_SIZE } from "../file-validation.ts";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const authModule = "data:text/javascript,export async function getClient(request) { return globalThis.__downloadTestSession(request); }";

declare global {
    var __downloadTestSession: ((request: NextRequest) => Promise<unknown>) | undefined;
}

globalThis.__downloadTestSession = async (request) => {
    if (request.headers.get("x-denied")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return { user: { id: request.headers.get("x-user") ?? "download-test-owner" } };
};

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "@/app/api/auth/[...nextauth]/options") return { url: authModule, shortCircuit: true };
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier === "../../utils" || specifier === "../file-validation") return nextResolve(`${specifier}.ts`, context);
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
const filename = "a3bb189e-8bf9-4c8b-8b4c-3c2f5c5d5e5f.cypher";
const directory = getUploadsDirectory("download-test-owner");
const filepath = `${directory}/${filename}`;

before(async () => {
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(filepath, "CREATE (:Person);");
});

after(async () => {
    await fs.rm(directory, { recursive: true, force: true });
    delete globalThis.__downloadTestSession;
});

function download(name: string, headers?: Record<string, string>) {
    return GET(new NextRequest("http://localhost/api/upload/file", { headers }), {
        params: Promise.resolve({ filename: name }),
    });
}

test("downloads the owner's uploaded file with safe response headers", async () => {
    const response = await download(filename);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "CREATE (:Person);");
    assert.equal(response.headers.get("content-type"), "text/plain");
    assert.equal(response.headers.get("content-disposition"), `attachment; filename="${filename}"`);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("cache-control"), "private, no-store");
});

test("does not disclose files to unauthenticated or different users", async () => {
    assert.equal((await download(filename, { "x-denied": "yes" })).status, 401);
    const response = await download(filename, { "x-user": "another-user" });
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: "File not found." });
});

test("rejects malformed, unsupported and missing filenames", async () => {
    for (const name of ["../secret", "not-a-uuid.csv", "a3bb189e-8bf9-4c8b-8b4c-3c2f5c5d5e5f.exe", "b3bb189e-8bf9-4c8b-8b4c-3c2f5c5d5e5f.csv"]) {
        const response = await download(name);
        assert.equal(response.status, 404);
        assert.deepEqual(await response.json(), { message: "File not found." });
    }
});

test("rejects directories and files exceeding the download size limit", async () => {
    await fs.mkdir(directory, { recursive: true });
    const directoryName = "c3bb189e-8bf9-4c8b-8b4c-3c2f5c5d5e5f.csv";
    await fs.mkdir(`${directory}/${directoryName}`, { recursive: true });
    assert.equal((await download(directoryName)).status, 404);
    const largeName = "d3bb189e-8bf9-4c8b-8b4c-3c2f5c5d5e5f.csv";
    const handle = await fs.open(`${directory}/${largeName}`, "w");
    try {
        await handle.truncate(MAX_FILE_SIZE + 1);
    } finally {
        await handle.close();
    }
    const response = await download(largeName);
    assert.equal(response.status, 413);
    assert.deepEqual(await response.json(), { message: "File is too large." });
});

test("unexpected filesystem failures return a server error", async (t) => {
    t.mock.method(console, "error", () => {});
    t.mock.method(fs, "open", async () => { throw new Error("storage unavailable"); });
    const response = await download(filename);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Failed to download uploaded file." });
});
