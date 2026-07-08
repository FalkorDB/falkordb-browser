/**
 * Abstract interface for CSV temp storage used by LOAD CSV imports.
 *
 * Two implementations:
 *   - LocalCsvStorage  — dev/same-machine; files served via /api/csv-temp/[id]
 *   - S3CsvStorage     — production; private S3 bucket + presigned GET URL
 *
 * Selection logic (checked once per request, process.env is stable):
 *   1. CSV_STORAGE=local          → always local
 *   2. S3_ACCESS_KEY_ID is set    → S3
 *   3. otherwise                  → local (dev fallback, no credentials needed)
 */

export interface CsvStorageProvider {
    /**
     * Persist the CSV bytes under `key`.
     * Returns the URL that FalkorDB should use in `LOAD CSV FROM '...'`.
     * For S3 this is a presigned GET URL; for local it is an HTTP path on this server.
     */
    store(key: string, bytes: Uint8Array): Promise<string>;

    /** Delete the stored object. Called in `finally` after the LOAD CSV query. */
    delete(key: string): Promise<void>;
}

let _provider: CsvStorageProvider | undefined;

/** Returns the singleton storage provider for this process. */
export function getCsvStorageProvider(): CsvStorageProvider {
    if (_provider) return _provider;

    const forceLocal =
        process.env.CSV_STORAGE === "local" || !process.env.S3_ACCESS_KEY_ID;

    if (forceLocal) {
        // Lazy-require to keep S3 SDK out of the local bundle.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { LocalCsvStorage } = require("./csv-storage-local") as typeof import("./csv-storage-local");
        _provider = new LocalCsvStorage();
    } else {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { S3CsvStorage } = require("./csv-storage-s3") as typeof import("./csv-storage-s3");
        _provider = new S3CsvStorage();
    }

    return _provider;
}
