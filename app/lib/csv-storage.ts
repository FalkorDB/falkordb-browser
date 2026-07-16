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

export type CsvStorageMode = "local" | "s3" | "blob";

export interface CsvDirectUploadRequest {
    filename: string;
    contentType: string;
    sizeBytes: number;
}

export type CsvDirectUploadTarget =
    | {
        type: "s3-presigned-put";
        method: "PUT";
        url: string;
        headers: Record<string, string>;
    }
    | {
        type: "blob-client-token";
        pathname: string;
        token: string;
        access: "public" | "private";
        multipart: boolean;
        contentType: string;
    };

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

    /**
     * Optional direct-upload target generation for cloud providers. When this
     * returns a value, the browser uploads file bytes directly to storage
     * without proxying through the backend.
     */
    createDirectUploadTarget?(
        owner: string,
        key: string,
        request: CsvDirectUploadRequest
    ): Promise<CsvDirectUploadTarget | null>;
}

let _provider: CsvStorageProvider | undefined;
let _providerSignature: string | undefined;

function hasS3Config(): boolean {
    // S3_BUCKET is the only hard requirement to auto-detect S3: credentials can
    // come from static keys OR the AWS SDK default provider chain (IAM role /
    // instance profile / ECS task role), which S3CsvStorage.buildClient() supports.
    return Boolean(process.env.S3_BUCKET);
}

function hasBlobConfig(): boolean {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function resolveStorageMode(): { mode: CsvStorageMode; explicit: boolean } {
    const storageMode = process.env.CSV_STORAGE?.trim().toLowerCase();

    if (storageMode && !["local", "s3", "blob"].includes(storageMode)) {
        throw new Error(`Invalid CSV_STORAGE value \"${process.env.CSV_STORAGE}\". Expected one of: local, s3, blob.`);
    }

    const s3Configured = hasS3Config();
    const blobConfigured = hasBlobConfig();

    if (storageMode) {
        const explicitMode = storageMode as CsvStorageMode;
        if (explicitMode === "s3" && !s3Configured) {
            throw new Error("CSV_STORAGE is set to \"s3\" but S3_BUCKET is not configured.");
        }
        if (explicitMode === "blob" && !blobConfigured) {
            throw new Error("CSV_STORAGE is set to \"blob\" but BLOB_READ_WRITE_TOKEN is not configured.");
        }
        return { mode: explicitMode, explicit: true };
    }

    if (s3Configured && blobConfigured) return { mode: "s3", explicit: false };
    if (s3Configured) return { mode: "s3", explicit: false };
    if (blobConfigured) return { mode: "blob", explicit: false };
    return { mode: "local", explicit: false };
}

function providerSignature(mode: CsvStorageMode): string {
    // Include relevant env values so a provider selected in dev does not stay
    // pinned after env changes (e.g. switching from local to blob without a
    // full process restart).
    return [
        mode,
        process.env.CSV_STORAGE ?? "",
        process.env.S3_BUCKET ?? "",
        process.env.S3_REGION ?? "",
        process.env.S3_ENDPOINT ?? "",
        process.env.S3_ACCESS_KEY_ID ?? "",
        process.env.S3_SECRET_ACCESS_KEY ?? "",
        process.env.S3_FORCE_PATH_STYLE ?? "",
        process.env.S3_READ_ENDPOINT ?? "",
        process.env.S3_READ_URL_HOST ?? "",
        process.env.S3_READ_URL_PORT ?? "",
        process.env.S3_READ_URL_PROTOCOL ?? "",
        process.env.S3_READ_URL_DOCKER_GATEWAY ?? "",
        process.env.BLOB_READ_WRITE_TOKEN ?? "",
        process.env.BLOB_ACCESS ?? "",
        process.env.BLOB_KEY_PREFIX ?? "",
    ].join("|");
}

/** Returns the currently resolved CSV storage mode (after env/config checks). */
export function getResolvedCsvStorageMode(): CsvStorageMode {
    return resolveStorageMode().mode;
}

/** Returns the singleton storage provider for this process. */
export function getCsvStorageProvider(): CsvStorageProvider {
    const { mode } = resolveStorageMode();
    const signature = providerSignature(mode);
    if (_provider && _providerSignature === signature) return _provider;

    if (mode === "local") {
        // Lazy-require to keep S3 SDK out of the local bundle.
        const { LocalCsvStorage } = require("./csv-storage-local") as typeof import("./csv-storage-local");
        _provider = new LocalCsvStorage();
    } else if (mode === "s3") {
        const { S3CsvStorage } = require("./csv-storage-s3") as typeof import("./csv-storage-s3");
        _provider = new S3CsvStorage();
    } else {
        const { VercelBlobCsvStorage } = require("./csv-storage-vercel-blob") as typeof import("./csv-storage-vercel-blob");
        _provider = new VercelBlobCsvStorage();
    }

    _providerSignature = signature;

    return _provider;
}
