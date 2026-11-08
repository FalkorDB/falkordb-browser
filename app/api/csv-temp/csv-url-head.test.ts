import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { validateCsvHeadFromUrl } from "./csv-url-head.ts";
import { CSV_HEAD_INSPECT_BYTES } from "./csv-head.ts";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test("stops and cancels after 8 KiB even when the response ignores Range", async () => {
    let read = 0;
    let cancelled = false;
    globalThis.fetch = async (_url, init) => {
        assert.equal(new Headers(init?.headers).get("Range"), "bytes=0-8191");
        assert.ok(init?.signal);
        return new Response(new ReadableStream({
            pull(controller) {
                read += 1024;
                controller.enqueue(new Uint8Array(1024).fill(65));
            },
            cancel() { cancelled = true; },
        }, { highWaterMark: 0 }));
    };
    assert.deepEqual(await validateCsvHeadFromUrl("https://storage.example/file.csv"), { status: "valid" });
    assert.equal(read, CSV_HEAD_INSPECT_BYTES);
    assert.equal(cancelled, true);
});

test("does not inspect or retain bytes beyond the head in a large chunk", async () => {
    const chunk = new Uint8Array(1024 * 1024).fill(65);
    chunk[CSV_HEAD_INSPECT_BYTES] = 0;
    globalThis.fetch = async () => new Response(chunk);
    assert.deepEqual(await validateCsvHeadFromUrl("https://storage.example/file.csv"), { status: "valid" });
});

test("validates BOM, binary, and empty heads", async () => {
    for (const [body, expected] of [
        [Buffer.from("\uFEFFname\nAlice\n"), null],
        [Buffer.from([65, 0, 66]), "The uploaded file does not appear to be a valid CSV (contains binary data)."],
        [Buffer.alloc(0), "The uploaded CSV is empty."],
    ] as const) {
        globalThis.fetch = async () => new Response(body);
        assert.deepEqual(await validateCsvHeadFromUrl("https://storage.example/file.csv"),
            expected ? { status: "invalid", message: expected } : { status: "valid" });
    }
});

test("distinguishes an unavailable browser precheck from valid content and logs delegation to FalkorDB", async (t) => {
    const warning = t.mock.method(console, "warn", () => {});
    globalThis.fetch = async () => new Response("denied", { status: 403 });
    assert.deepEqual(await validateCsvHeadFromUrl("https://storage.example/file.csv"), { status: "unavailable" });
    globalThis.fetch = async () => { throw new Error("network unavailable"); };
    assert.deepEqual(await validateCsvHeadFromUrl("https://storage.example/file.csv"), { status: "unavailable" });
    assert.equal(warning.mock.callCount(), 2);
    assert.match(String(warning.mock.calls[0].arguments[0]), /FalkorDB.*authoritative/);
});

test("aborts stalled header requests after ten seconds", async (t) => {
    t.mock.method(console, "warn", () => {});
    t.mock.timers.enable({ apis: ["setTimeout"] });
    globalThis.fetch = async (_url, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    });
    const pending = validateCsvHeadFromUrl("https://storage.example/file.csv");
    t.mock.timers.tick(10_000);
    assert.deepEqual(await pending, { status: "unavailable" });
});

test("a range response confirms an empty object only when its total size is zero", async (t) => {
    t.mock.method(console, "warn", () => {});
    for (const total of ["0", "123", null]) {
        globalThis.fetch = async () => new Response(null, {
            status: 416, headers: total === null ? {} : { "Content-Range": `bytes */${total}` },
        });
        assert.deepEqual(await validateCsvHeadFromUrl("https://storage.example/file.csv"),
            total === "0" ? { status: "invalid", message: "The uploaded CSV is empty." } : { status: "unavailable" });
    }
});

test("file imports remain supported without an HTTP precheck", async () => {
    globalThis.fetch = async () => { throw new Error("must not fetch file imports"); };
    assert.deepEqual(await validateCsvHeadFromUrl("file://imports/owner/file.csv"), { status: "skipped" });
});

test("cancels a real HTTP response that ignores Range", async (t) => {
    let range: string | undefined;
    let closed = false;
    const server = createServer((request, response) => {
        range = request.headers.range;
        response.writeHead(200, { "Content-Type": "text/csv" });
        response.write(Buffer.alloc(CSV_HEAD_INSPECT_BYTES, 65));
        response.on("close", () => { closed = true; });
        // Keep the remaining response open; validation must not wait for EOF.
    });
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    t.after(async () => {
        server.closeAllConnections();
        await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    });
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    assert.deepEqual(await validateCsvHeadFromUrl(`http://127.0.0.1:${address.port}/file.csv`), { status: "valid" });
    assert.equal(range, "bytes=0-8191");
    await new Promise(resolve => setImmediate(resolve));
    // Socket shutdown can be delivered after the validation promise resolves.
    for (let attempt = 0; !closed && attempt < 20; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    assert.equal(closed, true);
});
