import { del, issueSignedToken, list, presignUrl, put } from "@vercel/blob";
import type { CsvStorageProvider } from "./csv-storage";

type BlobAccessMode = "public" | "private";
const DEFAULT_PRIVATE_BLOB_URL_TTL_MS = 15 * 60 * 1000;

function buildPrefix(): string {
    return (process.env.BLOB_KEY_PREFIX ?? "csv-temp").replace(/^\/+|\/+$/g, "");
}

function buildPathname(key: string): string {
    return `${buildPrefix()}/${key}.csv`;
}

function getBlobAccessMode(): BlobAccessMode {
    const raw = process.env.BLOB_ACCESS?.toLowerCase();
    if (!raw) return "private";
    if (raw === "public" || raw === "private") return raw;
    throw new Error(`Invalid BLOB_ACCESS value \"${process.env.BLOB_ACCESS}\". Expected \"public\" or \"private\".`);
}

function getPrivateBlobUrlTtlMs(): number {
    const raw = Number(process.env.BLOB_PRIVATE_URL_TTL_MS ?? DEFAULT_PRIVATE_BLOB_URL_TTL_MS);
    return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_PRIVATE_BLOB_URL_TTL_MS;
}

async function createPrivatePresignedGetUrl(pathname: string): Promise<string> {
    const validUntil = Date.now() + getPrivateBlobUrlTtlMs();
    const signedToken = await issueSignedToken({
        pathname,
        operations: ["get"],
        validUntil,
    });

    const { presignedUrl } = await presignUrl(signedToken, {
        access: "private",
        operation: "get",
        pathname,
        validUntil,
    });

    return presignedUrl;
}

/**
 * Stores CSV files in Vercel Blob and returns a public URL for LOAD CSV.
 *
 * This mode is intended for Vercel-hosted deployments where local disk storage
 * is not durable across invocations.
 */
export class VercelBlobCsvStorage implements CsvStorageProvider {
    async store(key: string, bytes: Uint8Array): Promise<string> {
        const requestedAccess = getBlobAccessMode();
        const pathname = buildPathname(key);

        try {
            const blob = await put(pathname, Buffer.from(bytes), {
                access: requestedAccess,
                addRandomSuffix: false,
                contentType: "text/csv; charset=utf-8",
            });

            if (requestedAccess === "private") {
                return await createPrivatePresignedGetUrl(pathname);
            }

            return blob.url;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);

            // Safety-net: if the store is private but access wasn't configured,
            // retry with private access automatically.
            if (/cannot use public access on a private store/i.test(message)) {
                await put(pathname, Buffer.from(bytes), {
                    access: "private",
                    addRandomSuffix: false,
                    contentType: "text/csv; charset=utf-8",
                });

                return await createPrivatePresignedGetUrl(pathname);
            }

            throw err;
        }
    }

    async delete(key: string): Promise<void> {
        const pathname = buildPathname(key);

        try {
            const { blobs } = await list({ prefix: pathname, limit: 1 });
            const exact = blobs.find((blob) => blob.pathname === pathname);
            if (exact) {
                await del(exact.url);
            }
        } catch (err) {
            // Keep cleanup best-effort to avoid masking query success/failure.
            console.error("[VercelBlobCsvStorage] delete failed:", err);
        }
    }

    async cleanupExpired(olderThanMs: number): Promise<number> {
        let deleted = 0;
        let cursor: string | undefined;
        const prefix = `${buildPrefix()}/`;

        do {
            const result = await list({ prefix, cursor, limit: 1000 });
            const stale = result.blobs.filter((blob) => {
                const uploadedAt = new Date(blob.uploadedAt).getTime();
                return Number.isFinite(uploadedAt) && uploadedAt <= olderThanMs;
            });

            for (const blob of stale) {
                try {
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