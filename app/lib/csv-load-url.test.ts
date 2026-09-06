import { test } from "node:test";
import assert from "node:assert/strict";
import { assertFalkorFetchableCsvUrl, CsvUrlConfigError } from "./csv-load-url.ts";

test("accepts https URLs (real S3 / R2 / MinIO behind TLS)", () => {
    assert.doesNotThrow(() =>
        assertFalkorFetchableCsvUrl("https://my-bucket.s3.amazonaws.com/csv-temp/abc.csv?X-Amz-Signature=x")
    );
    assert.doesNotThrow(() => assertFalkorFetchableCsvUrl("https://minio.example.com/falkordb-csv-temp/x.csv"));
});

test("accepts file:// URLs (local shared IMPORT_FOLDER)", () => {
    assert.doesNotThrow(() => assertFalkorFetchableCsvUrl("file://falkordb-browser-csv-temp/owner/abc.csv"));
});

test("rejects http URLs (e.g. plain MinIO) with an actionable message", () => {
    let thrown: unknown;
    try {
        assertFalkorFetchableCsvUrl("http://localhost:9000/falkordb-csv-temp/abc.csv");
    } catch (err) {
        thrown = err;
    }
    assert.ok(thrown instanceof CsvUrlConfigError);
    const message = (thrown as CsvUrlConfigError).message;
    assert.match(message, /https:\/\/ or file:\/\//);
    assert.match(message, /http:\/\/localhost:9000/);
    assert.match(message, /MinIO behind TLS|CSV_STORAGE=local/);
    assert.equal((thrown as CsvUrlConfigError).code, "CSV_URL_UNSUPPORTED");
});

test("rejects a non-HTTPS local serve base (http CSV_SERVE_BASE_URL)", () => {
    assert.throws(
        () => assertFalkorFetchableCsvUrl("http://host.docker.internal:3000/api/csv-temp/x?o=1&t=2"),
        CsvUrlConfigError
    );
});

test("rejects other unsupported schemes (ftp, s3)", () => {
    assert.throws(() => assertFalkorFetchableCsvUrl("ftp://example.com/x.csv"), CsvUrlConfigError);
    assert.throws(() => assertFalkorFetchableCsvUrl("s3://bucket/key.csv"), CsvUrlConfigError);
});

test("rejects a malformed URL with a config-hint message", () => {
    let thrown: unknown;
    try {
        assertFalkorFetchableCsvUrl("not-a-url");
    } catch (err) {
        thrown = err;
    }
    assert.ok(thrown instanceof CsvUrlConfigError);
    assert.match((thrown as CsvUrlConfigError).message, /invalid url/i);
});
