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
 *   3. only S3 bucket present     → S3 (credentials may come from the AWS default chain)
 *   4. only Blob creds present    → Blob
 *   5. otherwise                  → local (default)
 *
 * Notes:
 *   - Local is the default when no cloud credentials are configured.
 *   - A single configured cloud provider is selected automatically.
 *   - If both cloud providers are configured, S3 is preferred.
 */

import type { Readable } from "stream";

export interface CsvStorageProvider {
    /**
     * Persist the CSV `body` stream for `(owner, key)`, without buffering the
     * whole (possibly very large) file in memory. The owner scopes storage so one
     * user can never read/delete another user's temp CSV, and so cleanup only
     * ever touches files created by this feature.
     */
    store(owner: string, key: string, body: Readable): Promise<void>;

    /**
     * Resolve the URL that FalkorDB should use in `LOAD CSV FROM $csvUrl`.
     * Generated server-side (presigned GET for S3/Blob, a signed capability URL
     * or `file://` path for local) so the client never controls the fetched URL.
     */
    resolveReadUrl(owner: string, key: string): Promise<string>;

    /** Delete the stored object for `(owner, key)`. Best-effort; never throws. */
    delete(owner: string, key: string): Promise<void>;

    /**
     * Best-effort cleanup for stale temp files/objects created by this feature.
     * Removes entries older than the provided unix timestamp in milliseconds.
     * Returns the number of deleted entries.
     */
    cleanupExpired(olderThanMs: number): Promise<number>;
}

let _provider: CsvStorageProvider | undefined;

function hasS3Config(): boolean {
    // S3_BUCKET is the only hard requirement to auto-detect S3: credentials can
    // come from static keys OR the AWS SDK default provider chain (IAM role /
    // instance profile / ECS task role), which S3CsvStorage.buildClient() supports.
    return Boolean(process.env.S3_BUCKET);
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
