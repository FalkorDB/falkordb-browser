import test, { after } from "node:test";
import assert from "node:assert/strict";
import nodeFs, { readFileSync, promises as fs } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { NextRequest, NextResponse } from "next/server.js";
import { getUploadFilePath, getUploadsDirectory, MAX_FILE_SIZE } from "./file-validation.ts";

const routeUrl = new URL("./route.ts", import.meta.url).href;
const rootUrl = new URL("../../../", import.meta.url);
const sessionModule = "data:text/javascript,export async function getClient(request) { return globalThis.__uploadTestSession(request); }";

declare global {
    var __uploadTestSession: ((request: NextRequest) => Promise<unknown>) | undefined;
}

globalThis.__uploadTestSession = async (request) => {
    if (request.headers.get("x-test-denied") === "yes") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return { user: { id: "upload-route-test", role: request.headers.get("x-test-role") ?? "Read-Write" } };
};

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (context.parentURL === routeUrl) {
            if (specifier === "../auth/[...nextauth]/options") return { url: sessionModule, shortCircuit: true };
            if (specifier === "next/server") return nextResolve("next/server.js", context);
            if (specifier === "../utils" || specifier === "./file-validation") return nextResolve(`${specifier}.ts`, context);
            if (specifier.startsWith("@/")) return nextResolve(new URL(`${specifier.slice(2)}.ts`, rootUrl).href, context);
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
const userId = "upload-route-test";
const uploadDir = getUploadsDirectory(userId);

after(async () => {
    await fs.rm(uploadDir, { recursive: true, force: true });
    delete globalThis.__uploadTestSession;
});

function requestWithFile(filename: string, type: string, content: string, field = "file") {
    const form = new FormData();
    form.append(field, new File([content], filename, { type }));
    return new NextRequest("http://localhost/api/upload", { method: "POST", body: form });
}

test("valid Cypher upload is written under the authenticated user's directory", async () => {
    const response = await POST(requestWithFile("input.cypher", "text/plain", "CREATE (:Person);"));
    assert.equal(response.status, 200);
    const body = await response.json() as { id: string; path: string; status: number };
    assert.match(body.id, /^[0-9a-f-]+\.cypher$/);
    assert.equal(body.path, `/api/upload/${body.id}`);
    assert.equal(body.status, 200);
    const stored = getUploadFilePath(body.id, userId);
    assert.ok(stored);
    assert.equal(await fs.readFile(stored, "utf8"), "CREATE (:Person);");
});

test("read-only and unauthenticated requests are rejected before storing files", async () => {
    const readOnly = requestWithFile("input.cypher", "text/plain", "RETURN 1");
    readOnly.headers.set("x-test-role", "Read-Only");
    const denied = await POST(readOnly);
    assert.equal(denied.status, 403);
    assert.match((await denied.json()).error, /permission/i);
    const unauthorized = requestWithFile("input.cypher", "text/plain", "RETURN 1");
    unauthorized.headers.set("x-test-denied", "yes");
    assert.equal((await POST(unauthorized)).status, 401);
});

test("invalid types, malformed multipart and missing file fields return client errors", async () => {
    const cases = [
        [requestWithFile("input.json", "application/json", "{}"), "Invalid file type."],
        [requestWithFile("input.cypher", "application/json", "RETURN 1"), "Invalid file type."],
        [requestWithFile("input.cypher", "text/plain", "RETURN 1", "attachment"), "No file uploaded."],
        [new NextRequest("http://localhost/api/upload", { method: "POST" }), "Request body is missing."],
        [new NextRequest("http://localhost/api/upload", { method: "POST", body: "not multipart" }), "Expected multipart/form-data with a boundary."],
    ] as const;
    for (const [request, expected] of cases) {
        const response = await POST(request);
        assert.equal(response.status, 400);
        assert.equal((await response.json()).error, expected);
    }
});

test("oversized files are rejected instead of storing a truncated upload", async () => {
    await fs.mkdir(uploadDir, { recursive: true });
    const before = new Set(await fs.readdir(uploadDir));
    const form = new FormData();
    form.append("file", new File(["a".repeat(MAX_FILE_SIZE + 1)], "large.cypher", { type: "text/plain" }));
    const response = await POST(new NextRequest("http://localhost/api/upload", { method: "POST", body: form }));
    assert.equal(response.status, 413);
    assert.equal((await response.json()).error, "File is too large.");
    assert.deepEqual(new Set(await fs.readdir(uploadDir)), before);
});

test("an oversized stream is rejected and removed after writing has started", { timeout: 15_000 }, async (t) => {
    await fs.mkdir(uploadDir, { recursive: true });
    const before = new Set(await fs.readdir(uploadDir));
    let release!: () => void;
    let rejectOpen!: (error: Error) => void;
    const opened = new Promise<void>((resolve, reject) => { release = resolve; rejectOpen = reject; });
    const createWriteStream = nodeFs.createWriteStream.bind(nodeFs);
    t.mock.method(nodeFs, "createWriteStream", (...args: Parameters<typeof nodeFs.createWriteStream>) => {
        const stream = createWriteStream(...args);
        stream.once("open", release);
        stream.once("error", rejectOpen);
        return stream;
    });

    const form = new FormData();
    form.append("file", new File(["a".repeat(MAX_FILE_SIZE + 1)], "large.cypher", { type: "text/plain" }));
    const multipart = new Request("http://localhost", { method: "POST", body: form });
    const bytes = new Uint8Array(await multipart.arrayBuffer());
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(bytes.subarray(0, 1024));
            opened.then(() => {
                controller.enqueue(bytes.subarray(1024));
                controller.close();
            }, (error) => controller.error(error));
        },
    });
    const request = new NextRequest("http://localhost/api/upload", {
        method: "POST",
        headers: { "content-type": multipart.headers.get("content-type")! },
        body,
        duplex: "half",
    });
    const response = await POST(request);
    assert.equal(response.status, 413);
    assert.equal((await response.json()).error, "File is too large.");
    assert.deepEqual(new Set(await fs.readdir(uploadDir)), before);
});

test("a file exactly at the size limit is stored in full", async () => {
    const content = "a".repeat(MAX_FILE_SIZE);
    const response = await POST(requestWithFile("maximum.cypher", "text/plain", content));
    assert.equal(response.status, 200);
    const { id } = await response.json() as { id: string };
    const stored = getUploadFilePath(id, userId);
    assert.ok(stored);
    assert.equal(await fs.readFile(stored, "utf8"), content);
});

test("a truncated multipart body returns a parsing error", async (t) => {
    t.mock.method(console, "error", () => {});
    const request = new NextRequest("http://localhost/api/upload", {
        method: "POST",
        headers: { "content-type": "multipart/form-data; boundary=example" },
        body: "--example\r\nContent-Disposition: form-data; name=\"file\"; filename=\"input.cypher\"\r\nContent-Type: text/plain\r\n\r\nRETURN 1",
    });
    const response = await POST(request);
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /Malformed multipart body/);
});

test("a directory creation failure returns a storage error", async (t) => {
    t.mock.method(console, "error", () => {});
    t.mock.method(fs, "mkdir", async () => { throw new Error("mkdir failed"); });
    const response = await POST(requestWithFile("input.cypher", "text/plain", "RETURN 1"));
    assert.equal(response.status, 500);
    assert.equal((await response.json()).error, "Failed to prepare upload directory.");
});

test("a write failure returns a storage error and reports a cleanup failure", async (t) => {
    const errors: unknown[][] = [];
    t.mock.method(console, "error", (...args: unknown[]) => { errors.push(args); });
    const createWriteStream = nodeFs.createWriteStream.bind(nodeFs);
    t.mock.method(nodeFs, "createWriteStream", () => createWriteStream(`${uploadDir}/missing/file.tmp`));
    const cleanupError = Object.assign(new Error("cleanup failed"), { code: "EACCES" });
    t.mock.method(fs, "unlink", async () => { throw cleanupError; });
    const response = await POST(requestWithFile("input.cypher", "text/plain", "RETURN 1"));
    assert.equal(response.status, 500);
    assert.equal((await response.json()).error, "Failed to store uploaded file.");
    assert.ok(errors.some(([message, error]) => message === "Upload cleanup error:" && error === cleanupError));
});

test("invalid file contents are rejected and the staged file is removed", async () => {
    await fs.mkdir(uploadDir, { recursive: true });
    const before = new Set(await fs.readdir(uploadDir));
    const response = await POST(requestWithFile("input.cypher", "text/plain", "RETURN \u0000"));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, "Invalid file contents.");
    assert.deepEqual(new Set(await fs.readdir(uploadDir)), before);
});

test("multipart uploads reject additional files and text fields", async () => {
    const forms = [new FormData(), new FormData()];
    forms[0].append("file", new File(["RETURN 1"], "first.cypher", { type: "text/plain" }));
    forms[0].append("file", new File(["RETURN 2"], "second.cypher", { type: "text/plain" }));
    forms[1].append("file", new File(["RETURN 1"], "first.cypher", { type: "text/plain" }));
    forms[1].append("extra", "value");
    for (const [form, error] of [[forms[0], "Only a single file may be uploaded."], [forms[1], "Unexpected form fields."]] as const) {
        const response = await POST(new NextRequest("http://localhost/api/upload", { method: "POST", body: form }));
        assert.equal(response.status, 400);
        assert.equal((await response.json()).error, error);
    }
});
