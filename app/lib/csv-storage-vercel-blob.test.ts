import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { registerHooks } from "node:module";
import { Readable } from "node:stream";

process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_teststore_testsecret";
process.env.BLOB_KEY_PREFIX = "/coverage/csv/";
delete process.env.BLOB_ACCESS;

const moduleUrl = new URL("./csv-storage-vercel-blob.ts", import.meta.url).href;
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === "./csv-key" && context.parentURL === moduleUrl) {
            return nextResolve("./csv-key.ts", context);
        }
        return nextResolve(specifier, context);
    },
});

const { VercelBlobCsvStorage } = await import("./csv-storage-vercel-blob.ts");
const OWNER = "a".repeat(32);
const KEY = "11111111-1111-4111-8111-111111111111";
const PATHNAME = `coverage/csv/${OWNER}-${KEY}.csv`;

test("store, public read, and delete use the exact owner-scoped blob", async (t) => {
    const calls: { method: string | undefined; url: string; body: string; headers: Record<string, string | string[] | undefined> }[] = [];
    const blobUrl = "https://teststore.public.blob.vercel-storage.com/coverage/csv/file.csv";
    const blob = {
        pathname: PATHNAME,
        url: blobUrl,
        downloadUrl: blobUrl,
        uploadedAt: "2026-01-01T00:00:00.000Z",
        size: 12,
        etag: "etag",
    };
    const server = createServer(async (req, res) => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        calls.push({
            method: req.method,
            url: req.url ?? "",
            body: Buffer.concat(chunks).toString("utf8"),
            headers: req.headers,
        });
        res.setHeader("content-type", "application/json");
        if (req.method === "PUT") res.end(JSON.stringify(blob));
        else if (req.method === "GET") res.end(JSON.stringify({ blobs: [blob], hasMore: false }));
        else res.end(JSON.stringify({}));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const previousUrl = process.env.VERCEL_BLOB_API_URL;
    process.env.VERCEL_BLOB_API_URL = `http://127.0.0.1:${address.port}`;
    process.env.BLOB_ACCESS = "public";
    t.after(async () => {
        if (previousUrl === undefined) delete process.env.VERCEL_BLOB_API_URL;
        else process.env.VERCEL_BLOB_API_URL = previousUrl;
        delete process.env.BLOB_ACCESS;
        await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    });

    const storage = new VercelBlobCsvStorage();
    await storage.store(OWNER, KEY, Readable.from(["name\nAlice\n"]));
    assert.equal(await storage.resolveReadUrl(OWNER, KEY), blobUrl);
    await storage.delete(OWNER, KEY);

    assert.equal(calls.length, 4);
    assert.equal(calls[0].method, "PUT");
    assert.equal(new URL(calls[0].url, "http://localhost").searchParams.get("pathname"), PATHNAME);
    assert.equal(calls[0].body, "name\nAlice\n");
    assert.equal(calls[0].headers["x-content-type"], "text/csv; charset=utf-8");
    assert.equal(calls[0].headers["x-add-random-suffix"], "0");
    for (const call of calls.slice(1, 3)) {
        assert.equal(call.method, "GET");
        const params = new URL(call.url, "http://localhost").searchParams;
        assert.equal(params.get("prefix"), PATHNAME);
        assert.equal(params.get("limit"), "1");
    }
    assert.equal(calls[3].method, "POST");
    assert.equal(calls[3].url, "/delete");
    assert.deepEqual(JSON.parse(calls[3].body), { urls: [blobUrl] });
});

test("direct upload tokens restrict uploads to the owner, size, and allowed CSV types", async (t) => {
    const now = new Date("2026-01-01T00:00:00Z");
    t.mock.timers.enable({ apis: ["Date"], now });
    const storage = new VercelBlobCsvStorage();
    const target = await storage.createDirectUploadTarget(OWNER, ` ${KEY.toUpperCase()} `, {
        filename: "data.csv",
        contentType: "Text/CSV; charset=utf-8",
        sizeBytes: 123,
    });

    assert.ok(target);
    assert.equal(target.type, "blob-client-token");
    assert.equal(target.pathname, PATHNAME);
    assert.equal(target.access, "private");
    assert.equal(target.multipart, true);
    assert.equal(target.contentType, "Text/CSV; charset=utf-8");
    const prefix = "vercel_blob_client_teststore_";
    assert.ok(target.token.startsWith(prefix));
    const decoded = Buffer.from(target.token.slice(prefix.length), "base64").toString("utf8");
    const payload = JSON.parse(Buffer.from(decoded.split(".")[1], "base64").toString("utf8"));
    assert.deepEqual(payload, {
        pathname: PATHNAME,
        addRandomSuffix: false,
        allowOverwrite: false,
        allowedContentTypes: ["text/csv", "application/vnd.ms-excel", "text/plain"],
        maximumSizeInBytes: 123,
        validUntil: now.getTime() + 30_000,
    });
});

test("direct uploads preserve public access and prioritize a recognized content type", async () => {
    process.env.BLOB_ACCESS = "PUBLIC";
    try {
        const target = await new VercelBlobCsvStorage().createDirectUploadTarget(OWNER, KEY, {
            filename: "data.csv",
            contentType: "text/plain",
            sizeBytes: 9,
        });
        assert.ok(target);
        assert.equal(target.type, "blob-client-token");
        assert.equal(target.access, "public");
        const encoded = target.token.slice("vercel_blob_client_teststore_".length);
        const decoded = Buffer.from(encoded, "base64").toString("utf8");
        const payload = JSON.parse(Buffer.from(decoded.split(".")[1], "base64").toString("utf8"));
        assert.deepEqual(payload.allowedContentTypes, ["text/plain", "text/csv", "application/vnd.ms-excel"]);
    } finally {
        delete process.env.BLOB_ACCESS;
    }
});

test("direct uploads reject invalid owners, keys, and access settings", async () => {
    const storage = new VercelBlobCsvStorage();
    const request = { filename: "data.csv", contentType: "text/csv", sizeBytes: 1 };
    await assert.rejects(() => storage.createDirectUploadTarget("../owner", KEY, request), /Invalid CSV owner/);
    await assert.rejects(() => storage.createDirectUploadTarget(OWNER, "../key", request), /Invalid CSV key/);
    process.env.BLOB_ACCESS = "invalid";
    try {
        await assert.rejects(() => storage.createDirectUploadTarget(OWNER, KEY, request), /Invalid BLOB_ACCESS/);
    } finally {
        delete process.env.BLOB_ACCESS;
    }
});
