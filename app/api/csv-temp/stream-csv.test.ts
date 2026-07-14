import { test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { streamCsvUpload, type CsvUploadResult } from "./stream-csv.ts";

type StreamCsvRequest = Parameters<typeof streamCsvUpload>[0];

/** Build a NextRequest-like object backed by a real multipart body. */
function multipartRequest(
    parts: Array<{ field: string; filename?: string; content: Buffer | string }>
): StreamCsvRequest {
    const form = new FormData();
    for (const part of parts) {
        if (part.filename === undefined) {
            form.append(part.field, typeof part.content === "string" ? part.content : part.content.toString());
        } else {
            const bytes = typeof part.content === "string" ? Buffer.from(part.content) : part.content;
            form.append(part.field, new File([new Uint8Array(bytes)], part.filename, { type: "text/csv" }));
        }
    }
    const req = new Request("http://localhost/api/csv-temp", { method: "POST", body: form });
    return { body: req.body, headers: req.headers } as unknown as StreamCsvRequest;
}

/** Drain the streamed body into a buffer (also lets transform errors surface). */
function collectingStore() {
    const chunks: Buffer[] = [];
    const store = async (body: Readable): Promise<void> => {
        for await (const chunk of body) chunks.push(Buffer.from(chunk));
    };
    return { store, get bytes() { return Buffer.concat(chunks); } };
}

async function run(
    parts: Array<{ field: string; filename?: string; content: Buffer | string }>,
    store: (body: Readable) => Promise<void>
): Promise<CsvUploadResult> {
    return streamCsvUpload(multipartRequest(parts), store);
}

/** Fail fast (instead of hanging the whole suite) if the upload deadlocks. */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        p,
        new Promise<T>((_, reject) => {
            setTimeout(() => reject(new Error(`timed out after ${ms}ms (deadlock?)`)), ms).unref();
        }),
    ]);
}

test("streamCsvUpload stores a valid .csv and resolves ok", async () => {
    const sink = collectingStore();
    const content = "name,age\nAlice,30\nBob,25\n";
    const result = await run([{ field: "file", filename: "people.csv", content }], sink.store);
    assert.deepEqual(result, { ok: true });
    assert.equal(sink.bytes.toString(), content);
});

test("streamCsvUpload strips a leading UTF-8 BOM before storing", async () => {
    const sink = collectingStore();
    const result = await run(
        [{ field: "file", filename: "people.csv", content: "\uFEFFname,age\nAlice,30\n" }],
        sink.store
    );
    assert.deepEqual(result, { ok: true });
    assert.equal(sink.bytes.toString(), "name,age\nAlice,30\n");
});

test("streamCsvUpload rejects a BOM-only CSV with 400", async () => {
    const sink = collectingStore();
    const result = await run(
        [{ field: "file", filename: "empty.csv", content: "\uFEFF" }],
        sink.store
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
        assert.equal(result.status, 400);
        assert.match(result.error, /empty/i);
    }
});

test("streamCsvUpload rejects binary content (NUL byte) with 400", async () => {
    const sink = collectingStore();
    const result = await run(
        [{ field: "file", filename: "evil.csv", content: Buffer.from([0x61, 0x00, 0x62]) }],
        sink.store
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
});

test("streamCsvUpload rejects a non-.csv filename with 400", async () => {
    const sink = collectingStore();
    const result = await run(
        [{ field: "file", filename: "notes.txt", content: "a,b\n1,2\n" }],
        sink.store
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
        assert.equal(result.status, 400);
        assert.match(result.error, /\.csv/i);
    }
});

test("streamCsvUpload returns 400 when no file part is present", async () => {
    const sink = collectingStore();
    const result = await run([{ field: "notfile", filename: "x.csv", content: "a,b\n" }], sink.store);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
});

test("streamCsvUpload rejects unexpected non-file form fields with 400", async () => {
    const sink = collectingStore();
    const result = await run([{ field: "evil", content: "value" }], sink.store);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
});

test("streamCsvUpload enforces the size cap with 413", async () => {
    const prev = process.env.CSV_MAX_FILE_SIZE_MB;
    process.env.CSV_MAX_FILE_SIZE_MB = "0.00001"; // ~10 bytes
    try {
        const sink = collectingStore();
        const result = await run(
            [{ field: "file", filename: "big.csv", content: "a,b,c,d,e,f,g,h,i,j,k,l\n" }],
            sink.store
        );
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.status, 413);
    } finally {
        if (prev === undefined) delete process.env.CSV_MAX_FILE_SIZE_MB;
        else process.env.CSV_MAX_FILE_SIZE_MB = prev;
    }
});

test("streamCsvUpload rejects a large binary file with an early NUL without deadlocking", async () => {
    const sink = collectingStore();
    // >8 KiB so CsvHeadTransform flushes/validates the head mid-stream (via
    // _transform, not _flush at EOF), with a NUL in the first bytes. If the
    // source is not drained on reject, busboy never emits "close" and the upload
    // deadlocks — the timeout guard turns that regression into a fast failure.
    const content = Buffer.concat([Buffer.from("a,b\n\0"), Buffer.alloc(9000, 0x61)]);
    const result = await withTimeout(
        run([{ field: "file", filename: "big.csv", content }], sink.store),
        5000
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
});

test("streamCsvUpload settles when the store rejects immediately (no deadlock)", async () => {
    // A store that rejects without consuming the stream leaves the source
    // undrained; the orchestrator must drain it so busboy can close.
    const store = async (): Promise<void> => {
        throw new Error("store unavailable");
    };
    const content = Buffer.concat([Buffer.from("a,b\n"), Buffer.alloc(9000, 0x61)]);
    const result = await withTimeout(
        run([{ field: "file", filename: "big.csv", content }], store),
        5000
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 500);
});

test("streamCsvUpload rejects a second large file part without hanging", async () => {
    const sink = collectingStore();
    const bigSecondFile = Buffer.alloc(8 * 1024 * 1024, 0x61);
    const result = await withTimeout(
        run(
            [
                { field: "file", filename: "first.csv", content: "a,b\n1,2\n" },
                { field: "file", filename: "second.csv", content: bigSecondFile },
            ],
            sink.store
        ),
        5000
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
        assert.equal(result.status, 400);
        assert.match(result.error, /single file/i);
    }
});

test("streamCsvUpload settles (500) without crashing when the source errors mid-store", async () => {
    // Build a raw multipart body that starts a file part (so the store begins),
    // then the underlying source stream errors before the closing boundary. The
    // orchestrator must abort the in-flight store, settle 500, and — critically —
    // not emit an unhandled "error" on the file stream (which would crash Node).
    const boundary = "TESTBOUNDARY";
    const head =
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="x.csv"\r\n` +
        `Content-Type: text/csv\r\n\r\n`;
    const src = new Readable({ read() {} });
    src.push(Buffer.from(head + "a,b\n1,2\n"));
    setTimeout(() => src.destroy(new Error("connection reset")), 30);

    // Slow store: still actively consuming (pending) when the source errors,
    // because the multipart part never ends (no closing boundary is sent).
    const store = (body: Readable): Promise<void> =>
        new Promise((resolve, reject) => {
            body.on("data", () => undefined);
            body.on("end", () => resolve());
            body.on("error", reject);
        });

    const headers = {
        get: (k: string) =>
            k.toLowerCase() === "content-type"
                ? `multipart/form-data; boundary=${boundary}`
                : null,
    };
    const request = {
        body: Readable.toWeb(src),
        headers,
    } as unknown as StreamCsvRequest;

    const result = await withTimeout(streamCsvUpload(request, store), 5000);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 500);
});
