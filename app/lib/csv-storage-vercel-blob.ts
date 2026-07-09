import { del, list, put } from "@vercel/blob";
import type { CsvStorageProvider } from "./csv-storage";

function buildPrefix(): string {
    return (process.env.BLOB_KEY_PREFIX ?? "csv-temp").replace(/^\/+|\/+$/g, "");
}

function buildPathname(key: string): string {
    return `${buildPrefix()}/${key}.csv`;
}

/**
 * Stores CSV files in Vercel Blob and returns a public URL for LOAD CSV.
 *
 * This mode is intended for Vercel-hosted deployments where local disk storage
 * is not durable across invocations.
 */
export class VercelBlobCsvStorage implements CsvStorageProvider {
    async store(key: string, bytes: Uint8Array): Promise<string> {
        const blob = await put(buildPathname(key), Buffer.from(bytes), {
            access: "public",
            addRandomSuffix: false,
            contentType: "text/csv; charset=utf-8",
        });

        return blob.url;
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
}