/**
 * Abstract interface for CSV temp storage used by LOAD CSV imports.
 *
 * Three implementations:
 *   - LocalCsvStorage  — dev/same-machine; files served via /api/csv-temp/[id]
 *   - S3CsvStorage     — production; private S3 bucket + presigned GET URL
 *   - VercelBlobCsvStorage — Vercel Blob public URL (for LOAD CSV reachability)
 *
 * Selection logic (checked once per request, process.env is stable):
 *   1. CSV_STORAGE=local|s3|blob  → explicit provider (always wins)
 *   2. both S3 + Blob present     → S3 (preferred)
 *   3. only S3 creds present      → S3
 *   4. only Blob creds present    → Blob
 *   5. otherwise                  → local (default)
 *
 * Notes:
 *   - Local is the default when no cloud credentials are configured.
 *   - A single configured cloud provider is selected automatically.
 *   - If both cloud providers are configured, S3 is preferred.
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

    /**
     * Best-effort cleanup for stale temp files/objects.
     * Removes entries older than the provided unix timestamp in milliseconds.
     * Returns the number of deleted entries.
     */
    cleanupExpired(olderThanMs: number): Promise<number>;
}

let _provider: CsvStorageProvider | undefined;

function hasS3Config(): boolean {
    return Boolean(
        process.env.S3_ACCESS_KEY_ID
        && process.env.S3_SECRET_ACCESS_KEY
        && process.env.S3_BUCKET
    );
}

function hasBlobConfig(): boolean {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Returns the singleton storage provider for this process. */
export function getCsvStorageProvider(): CsvStorageProvider {
    if (_provider) return _provider;

    const storageMode = process.env.CSV_STORAGE?.toLowerCase();

    if (storageMode && !["local", "s3", "blob"].includes(storageMode)) {
        throw new Error(`Invalid CSV_STORAGE value \"${process.env.CSV_STORAGE}\". Expected one of: local, s3, blob.`);
    }

    const s3Configured = hasS3Config();
    const blobConfigured = hasBlobConfig();

    let resolvedMode: "local" | "s3" | "blob";
    if (storageMode) {
        resolvedMode = storageMode as "local" | "s3" | "blob";
    } else if (s3Configured && blobConfigured) {
        resolvedMode = "s3";
    } else if (s3Configured) {
        resolvedMode = "s3";
    } else if (blobConfigured) {
        resolvedMode = "blob";
    } else {
        resolvedMode = "local";
    }

    if (resolvedMode === "local") {
        // Lazy-require to keep S3 SDK out of the local bundle.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { LocalCsvStorage } = require("./csv-storage-local") as typeof import("./csv-storage-local");
        _provider = new LocalCsvStorage();
    } else if (resolvedMode === "s3") {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { S3CsvStorage } = require("./csv-storage-s3") as typeof import("./csv-storage-s3");
        _provider = new S3CsvStorage();
    } else {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { VercelBlobCsvStorage } = require("./csv-storage-vercel-blob") as typeof import("./csv-storage-vercel-blob");
        _provider = new VercelBlobCsvStorage();
    }

    return _provider;
}
