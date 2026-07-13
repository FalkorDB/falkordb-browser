import { BlobAccessError, del, issueSignedToken, list, presignUrl, put } from "@vercel/blob";
import type { Readable } from "stream";
import type { CsvStorageProvider } from "./csv-storage";
import { isValidOwner, normalizeCsvKey } from "./csv-key";

/**
 * Stores CSV files in Vercel Blob under owner-scoped pathnames
 * (`<prefix>/<owner>/<uuid>.csv`). A fresh short-lived presigned GET URL is
 * generated at execution time for private stores; public stores return the
 * blob URL. Cleanup only removes exact owner/uuid leaves under the prefix.
 */

type BlobAccessMode = "public" | "private";
const DEFAULT_PRIVATE_BLOB_URL_TTL_MS = 15 * 60 * 1000;

const OWNED_LEAF =
    /\/[0-9a-f]{32}\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.csv$/;

function buildPrefix(): string {
    return (process.env.BLOB_KEY_PREFIX ?? "csv-temp").replace(/^\/+|\/+$/g, "");
}

function requireOwner(owner: string): string {
    if (!isValidOwner(owner)) throw new Error("Invalid CSV owner.");
    return owner;
}

function buildPathname(owner: string, key: string): string {
    return `${buildPrefix()}/${requireOwner(owner)}/${normalizeCsvKey(key)}.csv`;
}

function getBlobAccessMode(): BlobAccessMode {
    const raw = process.env.BLOB_ACCESS?.toLowerCase();
    if (!raw) return "private";
    if (raw === "public" || raw === "private") return raw;
    throw new Error(`Invalid BLOB_ACCESS value "${process.env.BLOB_ACCESS}". Expected "public" or "private".`);
}

function getPrivateBlobUrlTtlMs(): number {
    const raw = Number(process.env.BLOB_PRIVATE_URL_TTL_MS ?? DEFAULT_PRIVATE_BLOB_URL_TTL_MS);
    return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_PRIVATE_BLOB_URL_TTL_MS;
}

async function createPrivatePresignedGetUrl(pathname: string): Promise<string> {
    const validUntil = Date.now() + getPrivateBlobUrlTtlMs();
    const signedToken = await issueSignedToken({ pathname, operations: ["get"], validUntil });
    const { presignedUrl } = await presignUrl(signedToken, {
        access: "private",
        operation: "get",
        pathname,
        validUntil,
    });
    return presignedUrl;
}

/** True when the store rejects public access because it is private. */
function isPrivateStoreAccessError(err: unknown): boolean {
    if (err instanceof BlobAccessError) return true;
    const message = err instanceof Error ? err.message : String(err);
    return /cannot use public access on a private store/i.test(message);
}

export class VercelBlobCsvStorage implements CsvStorageProvider {
    async store(owner: string, key: string, body: Readable): Promise<void> {
        const requestedAccess = getBlobAccessMode();
        const pathname = buildPathname(owner, key);

        try {
            await put(pathname, body, {
                access: requestedAccess,
                addRandomSuffix: false,
                contentType: "text/csv; charset=utf-8",
            });
        } catch (err) {
            if (requestedAccess === "public" && isPrivateStoreAccessError(err)) {
                await put(pathname, body, {
                    access: "private",
                    addRandomSuffix: false,
                    contentType: "text/csv; charset=utf-8",
                });
                return;
            }
            throw err;
        }
    }

    async resolveReadUrl(owner: string, key: string): Promise<string> {
        const pathname = buildPathname(owner, key);
        const { blobs } = await list({ prefix: pathname, limit: 1 });
        const exact = blobs.find((blob) => blob.pathname === pathname);
        if (!exact) {
            throw new Error("CSV temp object not found.");
        }
        if (getBlobAccessMode() === "private") {
            return createPrivatePresignedGetUrl(pathname);
        }
        return exact.url;
    }

    async delete(owner: string, key: string): Promise<void> {
        const pathname = buildPathname(owner, key);
        try {
            const { blobs } = await list({ prefix: pathname, limit: 1 });
            const exact = blobs.find((blob) => blob.pathname === pathname);
            if (exact) await del(exact.url);
        } catch (err) {
            console.error("[VercelBlobCsvStorage] delete failed:", err);
        }
    }

    async cleanupExpired(olderThanMs: number): Promise<number> {
        let deleted = 0;
        let cursor: string | undefined;
        const prefix = `${buildPrefix()}/`;

        do {
            // eslint-disable-next-line no-await-in-loop
            const result = await list({ prefix, cursor, limit: 1000 });
            const stale = result.blobs.filter((blob) => {
                if (!OWNED_LEAF.test(blob.pathname)) return false;
                const uploadedAt = new Date(blob.uploadedAt).getTime();
                return Number.isFinite(uploadedAt) && uploadedAt <= olderThanMs;
            });

            for (const blob of stale) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    await del(blob.url);
                    deleted += 1;
                } catch {
                    // best-effort cleanup
                }
            }

            cursor = result.hasMore ? result.cursor : undefined;
        } while (cursor);

        return deleted;
    }
}
