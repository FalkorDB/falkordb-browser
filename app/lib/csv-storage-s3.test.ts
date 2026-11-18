import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { Readable } from "stream";
import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

process.env.S3_BUCKET = "csv-storage-test";
process.env.S3_ACCESS_KEY_ID = "test-access-key";
process.env.S3_SECRET_ACCESS_KEY = "test-secret-key";
process.env.S3_REGION = "us-east-1";
process.env.S3_ENDPOINT = "http://write.s3.test:9000";
process.env.S3_READ_ENDPOINT = "https://read.s3.test:9443";
process.env.S3_FORCE_PATH_STYLE = "true";
process.env.S3_VERIFY_OBJECT_EXISTS = "false";
process.env.AWS_USE_FIPS_ENDPOINT = "false";
process.env.AWS_USE_DUALSTACK_ENDPOINT = "false";
process.env.S3_KEY_PREFIX = "coverage/csv/";
process.env.S3_URL_EXPIRES_IN = "1234";
process.env.S3_UPLOAD_URL_EXPIRES_IN = "321";

const s3ModuleUrl = new URL("./csv-storage-s3.ts", import.meta.url).href;
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === "./csv-key" && context.parentURL === s3ModuleUrl) {
            return nextResolve("./csv-key.ts", context);
        }
        return nextResolve(specifier, context);
    },
});

const { S3CsvStorage } = await import("./csv-storage-s3.ts");

const OWNER = "a".repeat(32);
const KEY = "11111111-1111-4111-8111-111111111111";
const PREFIX = "coverage/csv/";
const BUCKET = "csv-storage-test";
const CONTENT_TYPE = "text/csv; charset=utf-8";

function streamOf(text: string): Readable {
    return Readable.from([Buffer.from(text, "utf-8")]);
}

async function bodyToString(body: unknown): Promise<string> {
    if (typeof body === "string") return body;
    if (Buffer.isBuffer(body) || body instanceof Uint8Array) return Buffer.from(body).toString("utf-8");
    assert.ok(body && typeof body === "object" && Symbol.asyncIterator in body);
    const chunks: Buffer[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array | string>) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf-8");
}

function objectPath(owner: string, key: string): string {
    return `${PREFIX}${owner}/${key}.csv`;
}

test("store uploads the supplied CSV stream to the owner-scoped key", async (t) => {
    const storage = new S3CsvStorage();
    const sends: unknown[] = [];
    let uploadedBody = "";

    t.mock.method(S3Client.prototype, "send", async (command: unknown) => {
        sends.push(command);
        assert.ok(command instanceof PutObjectCommand);
        assert.equal(command.input.Bucket, BUCKET);
        assert.equal(command.input.Key, objectPath(OWNER, KEY));
        assert.equal(command.input.ContentType, CONTENT_TYPE);
        uploadedBody = await bodyToString(command.input.Body);
        return {};
    });

    await storage.store(OWNER, KEY, streamOf("name,age\nAlice,30\n"));

    assert.equal(sends.length, 1);
    assert.equal(uploadedBody, "name,age\nAlice,30\n");
});

test("store rejects invalid owners, invalid keys, and a missing bucket without sending commands", async (t) => {
    const storage = new S3CsvStorage();
    const sends: unknown[] = [];
    t.mock.method(S3Client.prototype, "send", async (command: unknown) => {
        sends.push(command);
        return {};
    });

    await assert.rejects(() => storage.store("../evil", KEY, streamOf("x")), /Invalid CSV owner/);
    await assert.rejects(() => storage.store(OWNER, "../../etc/passwd", streamOf("x")), /Invalid CSV key/);

    const bucket = process.env.S3_BUCKET;
    try {
        delete process.env.S3_BUCKET;
        await assert.rejects(
            () => storage.store(OWNER, KEY, streamOf("x")),
            /S3_BUCKET env var is required for S3 CSV storage/
        );
    } finally {
        if (bucket === undefined) delete process.env.S3_BUCKET;
        else process.env.S3_BUCKET = bucket;
    }

    assert.equal(sends.length, 0);
});

test("resolveReadUrl signs an owner-scoped GET URL with the read endpoint and configured expiration", async (t) => {
    const signingDate = new Date("2026-01-01T00:00:00Z");
    t.mock.timers.enable({ apis: ["Date"], now: signingDate });
    const storage = new S3CsvStorage();
    const sends: unknown[] = [];
    t.mock.method(S3Client.prototype, "send", async (command: unknown) => {
        sends.push(command);
        return {};
    });

    const result = await storage.resolveReadUrl(OWNER, KEY);
    const url = new URL(result);

    assert.equal(url.origin, "https://read.s3.test:9443");
    assert.equal(decodeURIComponent(url.pathname), `/${BUCKET}/${objectPath(OWNER, KEY)}`);
    assert.equal(url.searchParams.get("X-Amz-Algorithm"), "AWS4-HMAC-SHA256");
    assert.ok(url.searchParams.get("X-Amz-Signature"));
    assert.equal(url.searchParams.get("X-Amz-Expires"), "1234");
    const expectedGetUrl = new URL(await getSignedUrl(
        new S3Client({
            region: "us-east-1",
            endpoint: "https://read.s3.test:9443",
            forcePathStyle: true,
            credentials: { accessKeyId: "test-access-key", secretAccessKey: "test-secret-key" },
        }),
        new GetObjectCommand({ Bucket: BUCKET, Key: objectPath(OWNER, KEY) }),
        { expiresIn: 1234, signingDate }
    ));
    assert.equal(url.searchParams.get("X-Amz-Signature"), expectedGetUrl.searchParams.get("X-Amz-Signature"));
    assert.equal(sends.length, 0);
});

test("resolveReadUrl maps missing objects to the stable not-found error and rethrows other failures", async (t) => {
    const storage = new S3CsvStorage();
    const previous = process.env.S3_VERIFY_OBJECT_EXISTS;
    process.env.S3_VERIFY_OBJECT_EXISTS = "true";
    const sends: unknown[] = [];
    const notFound = Object.assign(new Error("missing"), { $metadata: { httpStatusCode: 404 } });
    const unexpected = new Error("storage unavailable");
    let nextError: Error = notFound;

    t.mock.method(S3Client.prototype, "send", async (command: unknown) => {
        sends.push(command);
        assert.ok(command instanceof HeadObjectCommand);
        assert.equal(command.input.Bucket, BUCKET);
        assert.equal(command.input.Key, objectPath(OWNER, KEY));
        throw nextError;
    });

    try {
        await assert.rejects(
            () => storage.resolveReadUrl(OWNER, KEY),
            (error: unknown) => error instanceof Error && error.message === "CSV temp object not found."
        );
        nextError = unexpected;
        await assert.rejects(() => storage.resolveReadUrl(OWNER, KEY), (error) => error === unexpected);
    } finally {
        if (previous === undefined) delete process.env.S3_VERIFY_OBJECT_EXISTS;
        else process.env.S3_VERIFY_OBJECT_EXISTS = previous;
    }

    assert.equal(sends.length, 2);
});

test("delete sends a DeleteObjectCommand for the owner-scoped key", async (t) => {
    const storage = new S3CsvStorage();
    const sends: unknown[] = [];
    t.mock.method(S3Client.prototype, "send", async (command: unknown) => {
        sends.push(command);
        return {};
    });

    await storage.delete(OWNER, KEY);

    assert.equal(sends.length, 1);
    assert.ok(sends[0] instanceof DeleteObjectCommand);
    assert.deepEqual(sends[0].input, { Bucket: BUCKET, Key: objectPath(OWNER, KEY) });
});

test("delete logs an AWS failure and resolves", async (t) => {
    const storage = new S3CsvStorage();
    const failure = new Error("delete failed");
    const logged: unknown[][] = [];
    const sends: unknown[] = [];
    t.mock.method(S3Client.prototype, "send", async (command: unknown) => {
        sends.push(command);
        assert.ok(command instanceof DeleteObjectCommand);
        throw failure;
    });
    t.mock.method(console, "error", (...args: unknown[]) => {
        logged.push(args);
    });

    await assert.doesNotReject(() => storage.delete(OWNER, KEY));

    assert.equal(sends.length, 1);
    assert.deepEqual(logged, [["[S3CsvStorage] delete failed:", failure]]);
});

test("cleanupExpired paginates and deletes only expired, well-formed owner-scoped CSV objects", async (t) => {
    const storage = new S3CsvStorage();
    const cutoff = Date.UTC(2026, 0, 1);
    const old = new Date(cutoff - 1);
    const fresh = new Date(cutoff + 1);
    const firstPageKeys = [
        objectPath(OWNER, KEY),
        objectPath(OWNER, "22222222-2222-4222-8222-222222222222"),
        "coverage/csv/notes.csv",
        "coverage/csv/not-an-owner/11111111-1111-4111-8111-111111111111.csv",
        objectPath(OWNER, "44444444-4444-4444-8444-444444444444"),
        objectPath(OWNER, "55555555-5555-1555-8555-555555555555"),
        objectPath(OWNER, "66666666-6666-4666-8666-666666666666"),
    ];
    const secondPageKey = objectPath(OWNER, "33333333-3333-4333-8333-333333333333");
    const listCommands: ListObjectsV2Command[] = [];
    const deleteCommands: DeleteObjectsCommand[] = [];

    t.mock.method(S3Client.prototype, "send", async (command: unknown) => {
        if (command instanceof ListObjectsV2Command) {
            listCommands.push(command);
            assert.equal(command.input.Bucket, BUCKET);
            assert.equal(command.input.Prefix, PREFIX);
            if (listCommands.length === 1) {
                return {
                    IsTruncated: true,
                    NextContinuationToken: "page-2",
                    Contents: [
                        { Key: firstPageKeys[0], LastModified: old },
                        { Key: firstPageKeys[1], LastModified: old },
                        { Key: firstPageKeys[2], LastModified: old },
                        { Key: firstPageKeys[3], LastModified: old },
                        { Key: firstPageKeys[4], LastModified: fresh },
                        { Key: firstPageKeys[5], LastModified: old },
                        { Key: firstPageKeys[6], LastModified: new Date(cutoff) },
                    ],
                };
            }
            assert.equal(command.input.ContinuationToken, "page-2");
            return {
                IsTruncated: false,
                Contents: [
                    { Key: secondPageKey, LastModified: old },
                    { Key: objectPath(OWNER, "77777777-7777-4777-8777-777777777777"), LastModified: fresh },
                ],
            };
        }

        assert.ok(command instanceof DeleteObjectsCommand);
        deleteCommands.push(command);
        assert.equal(command.input.Bucket, BUCKET);
        return deleteCommands.length === 1
            ? { Deleted: [{ Key: firstPageKeys[0] }] }
            : { Deleted: [] };
    });

    const deleted = await storage.cleanupExpired(cutoff);

    assert.equal(listCommands.length, 2);
    assert.equal(listCommands[0].input.ContinuationToken, undefined);
    assert.deepEqual(
        deleteCommands.map((command) => command.input.Delete?.Objects?.map((object) => object.Key)),
        [[firstPageKeys[0], firstPageKeys[1], firstPageKeys[6]], [secondPageKey]]
    );
    assert.equal(deleted, 1);
});

test("createDirectUploadTarget signs PUT URLs with the owner-scoped key and requested or default content type", async (t) => {
    const signingDate = new Date("2026-01-01T00:00:00Z");
    t.mock.timers.enable({ apis: ["Date"], now: signingDate });
    const storage = new S3CsvStorage();
    const suppliedContentType = "text/csv";

    const supplied = await storage.createDirectUploadTarget(OWNER, KEY, {
        filename: "data.csv",
        contentType: suppliedContentType,
        sizeBytes: 123,
    });
    const fallback = await storage.createDirectUploadTarget(OWNER, KEY, {
        filename: "data.csv",
        contentType: "",
        sizeBytes: 456,
    });

    assert.ok(supplied);
    assert.equal(supplied.type, "s3-presigned-put");
    assert.equal(supplied.method, "PUT");
    assert.equal(supplied.headers["Content-Type"], suppliedContentType);
    const suppliedUrl = new URL(supplied.url);
    assert.equal(suppliedUrl.origin, "http://write.s3.test:9000");
    assert.equal(decodeURIComponent(suppliedUrl.pathname), `/${BUCKET}/${objectPath(OWNER, KEY)}`);
    assert.equal(suppliedUrl.searchParams.get("X-Amz-Expires"), "321");
    const expectedPutUrl = new URL(await getSignedUrl(
        new S3Client({
            region: "us-east-1",
            endpoint: "http://write.s3.test:9000",
            forcePathStyle: true,
            requestChecksumCalculation: "WHEN_REQUIRED",
            credentials: { accessKeyId: "test-access-key", secretAccessKey: "test-secret-key" },
        }),
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: objectPath(OWNER, KEY),
            ContentType: suppliedContentType,
            ContentLength: 123,
        }),
        { expiresIn: 321, signingDate }
    ));
    assert.equal(suppliedUrl.searchParams.get("X-Amz-Signature"), expectedPutUrl.searchParams.get("X-Amz-Signature"));

    assert.ok(fallback);
    assert.equal(fallback.type, "s3-presigned-put");
    assert.equal(fallback.method, "PUT");
    assert.equal(fallback.headers["Content-Type"], CONTENT_TYPE);
});

test("read URL endpoint overrides are signed locally without sending S3 requests", async (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-01-01T00:00:00Z") });
    const previous = process.env.S3_READ_ENDPOINT;
    process.env.S3_READ_ENDPOINT = "https://override.read.test:7443";
    const sends: unknown[] = [];
    t.mock.method(S3Client.prototype, "send", async (command: unknown) => {
        sends.push(command);
        return {};
    });

    try {
        const result = await new S3CsvStorage().resolveReadUrl(OWNER, KEY);
        assert.equal(new URL(result).origin, "https://override.read.test:7443");
        assert.equal(new URL(result).searchParams.get("X-Amz-Expires"), "1234");
    } finally {
        if (previous === undefined) delete process.env.S3_READ_ENDPOINT;
        else process.env.S3_READ_ENDPOINT = previous;
    }
    assert.equal(sends.length, 0);
});
