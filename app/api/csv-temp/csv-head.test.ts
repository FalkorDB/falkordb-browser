import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import {
    CsvHeadTransform,
    CsvValidationError,
    headLooksBinary,
    stripLeadingBom,
} from "./csv-head.ts";

async function runThrough(chunks: (string | Buffer)[]): Promise<Buffer> {
    const out: Buffer[] = [];
    const src = Readable.from(chunks.map((c) => (typeof c === "string" ? Buffer.from(c) : c)));
    const transform = new CsvHeadTransform();
    transform.on("data", (c: Buffer) => out.push(c));
    await pipeline(src, transform);
    return Buffer.concat(out);
}

test("stripLeadingBom removes a UTF-8 BOM and leaves other content", () => {
    const withBom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("name,age")]);
    assert.equal(stripLeadingBom(withBom).toString("utf-8"), "name,age");
    assert.equal(stripLeadingBom(Buffer.from("name,age")).toString("utf-8"), "name,age");
});

test("headLooksBinary flags a NUL byte", () => {
    assert.ok(headLooksBinary(Buffer.from([110, 0, 109])));
    assert.ok(!headLooksBinary(Buffer.from("name,age\nAlice,30\n")));
});

test("CsvHeadTransform passes normal CSV through unchanged", async () => {
    const out = await runThrough(["name,age\n", "Alice,30\n", "Bob,41\n"]);
    assert.equal(out.toString("utf-8"), "name,age\nAlice,30\nBob,41\n");
});

test("CsvHeadTransform strips a leading BOM even split across tiny chunks", async () => {
    const out = await runThrough([
        Buffer.from([0xef]),
        Buffer.from([0xbb]),
        Buffer.from([0xbf]),
        "name,age\n",
    ]);
    assert.equal(out.toString("utf-8"), "name,age\n");
});

test("CsvHeadTransform rejects binary content", async () => {
    await assert.rejects(
        () => runThrough([Buffer.from([110, 97, 0, 109, 101])]),
        (err) => err instanceof CsvValidationError && /binary/i.test(err.message)
    );
});

test("CsvHeadTransform rejects an empty stream", async () => {
    await assert.rejects(
        () => runThrough([]),
        (err) => err instanceof CsvValidationError && /empty/i.test(err.message)
    );
});

test("CsvHeadTransform rejects a BOM-only file as empty", async () => {
    await assert.rejects(
        () => runThrough([Buffer.from([0xef, 0xbb, 0xbf])]),
        (err) => err instanceof CsvValidationError && /empty/i.test(err.message)
    );
});

test("CsvValidationError carries a 400 status", () => {
    assert.equal(new CsvValidationError("x").status, 400);
});
