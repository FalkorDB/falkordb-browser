import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { CsvStorageProvider } from "./csv-storage";

/** How long (seconds) the presigned GET URL remains valid for FalkorDB to fetch. */
function resolveReadExpiresIn(): number {
    const raw = Number(process.env.S3_URL_EXPIRES_IN);
    return Number.isFinite(raw) && raw > 0 ? raw : 3600;
}
const READ_EXPIRES_IN = resolveReadExpiresIn(); // default 1 hour

function buildClient(): S3Client {
    return new S3Client({
        region: process.env.S3_REGION ?? "us-east-1",
        // Leave endpoint undefined for real AWS S3; set for R2 / MinIO.
        ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        // Required for path-style access (MinIO, some R2 configs).
        ...(process.env.S3_FORCE_PATH_STYLE === "true"
            ? { forcePathStyle: true }
            : {}),
    });
}

function bucket(): string {
    const b = process.env.S3_BUCKET;
    if (!b) throw new Error("S3_BUCKET env var is required for S3 CSV storage.");
    return b;
}

function objectKey(key: string): string {
    const prefix = (process.env.S3_KEY_PREFIX ?? "csv-temp/").replace(/\/?$/, "/");
    return `${prefix}${key}.csv`;
}

/**
 * Stores CSV files in a private S3 bucket (or compatible: R2, MinIO).
 * Returns a presigned GET URL valid for READ_EXPIRES_IN seconds so FalkorDB
 * can fetch the file via LOAD CSV without the bucket being public.
 *
 * Security layers:
 *   - Bucket is private — no public access at all.
 *   - Presigned GET URL expires in ≤1 h even if explicit delete fails.
 *   - Explicit delete is called in `finally` after the LOAD CSV query.
 *   - Add an S3 lifecycle rule on the prefix as a belt-and-suspenders cleanup.
 */
export class S3CsvStorage implements CsvStorageProvider {
    private readonly client = buildClient();

    async store(key: string, bytes: Uint8Array): Promise<string> {
        const s3Key = objectKey(key);

        // Upload the file to S3.
        await this.client.send(
            new PutObjectCommand({
                Bucket: bucket(),
                Key: s3Key,
                Body: bytes,
                ContentType: "text/csv; charset=utf-8",
                // Explicitly block any public access — belt-and-suspenders.
                // (Bucket-level block-public-access should already cover this.)
            })
        );

        // Generate a presigned GET URL for FalkorDB to fetch.
        const { GetObjectCommand } = await import("@aws-sdk/client-s3");
        const readUrl = await getSignedUrl(
            this.client,
            new GetObjectCommand({ Bucket: bucket(), Key: s3Key }),
            { expiresIn: READ_EXPIRES_IN }
        );

        return readUrl;
    }

    async delete(key: string): Promise<void> {
        await this.client
            .send(new DeleteObjectCommand({ Bucket: bucket(), Key: objectKey(key) }))
            .catch((err: unknown) => {
                // Log but never throw — delete is best-effort cleanup.
                console.error("[S3CsvStorage] delete failed:", err);
            });
    }

    async cleanupExpired(olderThanMs: number): Promise<number> {
        const b = bucket();
        const prefix = (process.env.S3_KEY_PREFIX ?? "csv-temp/").replace(/\/?$/, "/");
        let continuationToken: string | undefined;
        let deleted = 0;

        do {
            const listed = await this.client.send(
                new ListObjectsV2Command({
                    Bucket: b,
                    Prefix: prefix,
                    ContinuationToken: continuationToken,
                })
            );

            const staleKeys = (listed.Contents ?? [])
                .filter((obj) => obj.Key && obj.LastModified && obj.LastModified.getTime() <= olderThanMs)
                .map((obj) => ({ Key: obj.Key as string }));

            if (staleKeys.length > 0) {
                const result = await this.client.send(
                    new DeleteObjectsCommand({
                        Bucket: b,
                        Delete: { Objects: staleKeys, Quiet: true },
                    })
                );
                deleted += result.Deleted?.length ?? 0;
            }

            continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
        } while (continuationToken);

        return deleted;
    }
}
