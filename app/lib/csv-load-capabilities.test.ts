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

    it("blocks file:// only when an operator says so", () => {
        process.env.LOAD_CSV_FILE_URI = "false";
        assert.equal(isFileUriLoadSupported(), false);

        process.env.LOAD_CSV_FILE_URI = "true";
        assert.equal(isFileUriLoadSupported(), true);
    });

    it("reads the override case-insensitively and ignores surrounding space", () => {
        process.env.LOAD_CSV_FILE_URI = "  FALSE ";
        assert.equal(isFileUriLoadSupported(), false);
    });

    it("answers true for 'auto', an unset value, or junk", () => {
        ["auto", "", "   ", "yes-please"].forEach((value) => {
            process.env.LOAD_CSV_FILE_URI = value;
            assert.equal(isFileUriLoadSupported(), true, `LOAD_CSV_FILE_URI=${JSON.stringify(value)}`);
        });

        delete process.env.LOAD_CSV_FILE_URI;
        assert.equal(isFileUriLoadSupported(), true);
    });

    it("does not read failure into the CSV storage configuration", () => {
        // Uploading to S3 says nothing about the database's own import folder,
        // which may still be mounted and full of files a query can name.
        process.env.CSV_STORAGE = "s3";
        process.env.S3_BUCKET = "bucket";
        assert.equal(isFileUriLoadSupported(), true);

        // Nor does a storage config broken badly enough to throw.
        delete process.env.S3_BUCKET;
        assert.equal(isFileUriLoadSupported(), true);

        process.env.CSV_STORAGE = "local";
        process.env.CSV_LOCAL_LOAD_URI_MODE = "http";
        assert.equal(isFileUriLoadSupported(), true);
    });
});
