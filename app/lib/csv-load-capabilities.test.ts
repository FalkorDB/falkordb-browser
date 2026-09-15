import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isFileUriLoadSupported } from "./csv-load-capabilities.ts";

// Every env var that can steer the answer, so one test cannot leak into the next.
const OWNED = [
    "LOAD_CSV_FILE_URI",
    "CSV_STORAGE",
    "CSV_LOCAL_LOAD_URI_MODE",
    "S3_BUCKET",
    "BLOB_READ_WRITE_TOKEN",
] as const;

describe("isFileUriLoadSupported", () => {
    let saved: Record<string, string | undefined>;

    beforeEach(() => {
        saved = Object.fromEntries(OWNED.map((name) => [name, process.env[name]]));
        OWNED.forEach((name) => { delete process.env[name]; });
    });

    afterEach(() => {
        OWNED.forEach((name) => {
            if (saved[name] === undefined) delete process.env[name];
            else process.env[name] = saved[name];
        });
    });

    it("lets an explicit LOAD_CSV_FILE_URI override the inference", () => {
        // s3 storage would otherwise infer false.
        process.env.CSV_STORAGE = "s3";
        process.env.S3_BUCKET = "bucket";
        process.env.LOAD_CSV_FILE_URI = "true";
        assert.equal(isFileUriLoadSupported(), true);

        // Local + file:// would otherwise infer true.
        delete process.env.CSV_STORAGE;
        delete process.env.S3_BUCKET;
        process.env.CSV_LOCAL_LOAD_URI_MODE = "file";
        process.env.LOAD_CSV_FILE_URI = "false";
        assert.equal(isFileUriLoadSupported(), false);
    });

    it("reads the override case-insensitively and ignores surrounding space", () => {
        process.env.CSV_LOCAL_LOAD_URI_MODE = "file";
        process.env.LOAD_CSV_FILE_URI = "  FALSE ";
        assert.equal(isFileUriLoadSupported(), false);
    });

    it("falls through to inference for 'auto', an empty value, or junk", () => {
        process.env.CSV_STORAGE = "local";
        process.env.CSV_LOCAL_LOAD_URI_MODE = "file";

        ["auto", "", "   ", "yes-please"].forEach((value) => {
            process.env.LOAD_CSV_FILE_URI = value;
            assert.equal(isFileUriLoadSupported(), true, `LOAD_CSV_FILE_URI=${JSON.stringify(value)}`);
        });
    });

    it("infers true only when local storage hands FalkorDB file:// URIs", () => {
        process.env.CSV_STORAGE = "local";

        process.env.CSV_LOCAL_LOAD_URI_MODE = "file";
        assert.equal(isFileUriLoadSupported(), true);

        // Local storage that serves CSVs over HTTPS proves nothing about the
        // database's filesystem — it may well be on another host.
        process.env.CSV_LOCAL_LOAD_URI_MODE = "http";
        assert.equal(isFileUriLoadSupported(), false);
    });

    it("infers false for remote storage providers", () => {
        process.env.CSV_LOCAL_LOAD_URI_MODE = "file";

        process.env.CSV_STORAGE = "s3";
        process.env.S3_BUCKET = "bucket";
        assert.equal(isFileUriLoadSupported(), false);

        delete process.env.S3_BUCKET;
        process.env.CSV_STORAGE = "blob";
        process.env.BLOB_READ_WRITE_TOKEN = "token";
        assert.equal(isFileUriLoadSupported(), false);
    });

    it("stays quiet rather than throwing when storage is misconfigured", () => {
        // Resolving the storage mode throws on these; a broken upload config is
        // not evidence that the database cannot read its own import folder, and
        // answering false here would block a query that may be fine.
        process.env.CSV_STORAGE = "s3"; // no S3_BUCKET
        assert.equal(isFileUriLoadSupported(), true);

        process.env.CSV_STORAGE = "not-a-provider";
        assert.equal(isFileUriLoadSupported(), true);
    });
});
