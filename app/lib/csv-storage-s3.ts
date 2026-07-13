import {
    S3Client,
    GetObjectCommand,
    HeadObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import type { Readable } from "stream";
import type { CsvStorageProvider } from "./csv-storage";
import { isValidOwner, normalizeCsvKey } from "./csv-key";

/** How long (seconds) the presigned GET URL remains valid for FalkorDB to fetch. */
function resolveReadExpiresIn(): number {
    const raw = Number(process.env.S3_URL_EXPIRES_IN);
    return Number.isFinite(raw) && raw > 0 ? raw : 3600;
}
const READ_EXPIRES_IN = resolveReadExpiresIn(); // default 1 hour

function keyPrefix(): string {
    return (process.env.S3_KEY_PREFIX ?? "csv-temp/").replace(/\/?$/, "/");
}

function buildClient(): S3Client {
    return new S3Client({
        region: process.env.S3_REGION ?? "us-east-1",
        ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        ...(process.env.S3_FORCE_PATH_STYLE === "true" ? { forcePathStyle: true } : {}),
    });
}

function bucket(): string {
    const b = process.env.S3_BUCKET;
    if (!b) throw new Error("S3_BUCKET env var is required for S3 CSV storage.");
    return b;
}

function requireOwner(owner: string): string {
    if (!isValidOwner(owner)) throw new Error("Invalid CSV owner.");
    return owner;
}

/** Owner-scoped object key: `<prefix>/<owner>/<uuid>.csv`. */
function objectKey(owner: string, key: string): string {
    return `${keyPrefix()}${requireOwner(owner)}/${normalizeCsvKey(key)}.csv`;
}

// Exact owner/uuid leaf under the prefix — cleanup only deletes our own objects.
const OWNED_LEAF =
    /\/[0-9a-f]{32}\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.csv$/;

/**
 * Stores CSV files in a private S3 bucket (or compatible: R2, MinIO).
 *
 * Security layers:
 *   - Bucket is private — no public access.
 *   - A fresh presigned GET URL (≤1 h) is generated at execution time.
 *   - Objects are scoped per owner; cleanup only removes exact owner/uuid leaves.
 *   - Multipart streaming upload — never buffers the whole (large) file.
 */
export class S3CsvStorage implements CsvStorageProvider {
    private readonly client = buildClient();

    async store(owner: string, key: string, body: Readable): Promise<void> {
        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: bucket(),
                Key: objectKey(owner, key),
                Body: body,
                ContentType: "text/csv; charset=utf-8",
            },
        });
        await upload.done();
    }

    async resolveReadUrl(owner: string, key: string): Promise<string> {
        const s3Key = objectKey(owner, key);
        // Confirm the object exists (and thus belongs to this owner) before use.
        await this.client.send(new HeadObjectCommand({ Bucket: bucket(), Key: s3Key }));
        return getSignedUrl(
            this.client,
            new GetObjectCommand({ Bucket: bucket(), Key: s3Key }),
            { expiresIn: READ_EXPIRES_IN }
        );
    }

    async delete(owner: string, key: string): Promise<void> {
        await this.client
            .send(new DeleteObjectCommand({ Bucket: bucket(), Key: objectKey(owner, key) }))
            .catch((err: unknown) => {
                console.error("[S3CsvStorage] delete failed:", err);
            });
    }

    async cleanupExpired(olderThanMs: number): Promise<number> {
        const b = bucket();
        const prefix = keyPrefix();
        let continuationToken: string | undefined;
        let deleted = 0;

        do {
            // eslint-disable-next-line no-await-in-loop
            const listed = await this.client.send(
                new ListObjectsV2Command({ Bucket: b, Prefix: prefix, ContinuationToken: continuationToken })
            );

            const staleKeys = (listed.Contents ?? [])
                .filter(
                    (obj) =>
                        obj.Key &&
                        OWNED_LEAF.test(obj.Key) &&
                        obj.LastModified &&
                        obj.LastModified.getTime() <= olderThanMs
                )
                .map((obj) => ({ Key: obj.Key as string }));

            if (staleKeys.length > 0) {
                // eslint-disable-next-line no-await-in-loop
                const result = await this.client.send(
                    new DeleteObjectsCommand({ Bucket: b, Delete: { Objects: staleKeys, Quiet: true } })
                );
                deleted += result.Deleted?.length ?? 0;
            }

            continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
        } while (continuationToken);

        return deleted;
    }
}
