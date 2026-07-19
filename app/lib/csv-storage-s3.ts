import {
    S3Client,
    HeadObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import type { Readable } from "stream";
import type { CsvDirectUploadRequest, CsvDirectUploadTarget, CsvStorageProvider } from "./csv-storage";
import { isValidOwner, normalizeCsvKey } from "./csv-key";

/** How long (seconds) the presigned GET URL remains valid for FalkorDB to fetch. */
function resolveReadExpiresIn(): number {
    const raw = Number(process.env.S3_URL_EXPIRES_IN);
    return Number.isFinite(raw) && raw > 0 ? raw : 3600;
}
const READ_EXPIRES_IN = resolveReadExpiresIn(); // default 1 hour

function resolveWriteExpiresIn(): number {
    const raw = Number(process.env.S3_UPLOAD_URL_EXPIRES_IN);
    return Number.isFinite(raw) && raw > 0 ? raw : 900;
}
const WRITE_EXPIRES_IN = resolveWriteExpiresIn(); // default 15 minutes

function resolveReadEndpoint(): string | undefined {
    const explicitEndpoint = process.env.S3_READ_ENDPOINT?.trim();
    if (explicitEndpoint) return explicitEndpoint;

    const raw = process.env.S3_ENDPOINT;
    if (!raw) return undefined;

    let parsed: URL;
    try {
        parsed = new URL(raw);
    } catch {
        return raw;
    }

    const explicitHost = process.env.S3_READ_URL_HOST?.trim();
    const explicitPort = process.env.S3_READ_URL_PORT?.trim();
    const explicitProtocol = process.env.S3_READ_URL_PROTOCOL?.trim();

    const autoGatewayRewriteEnabled = process.env.S3_READ_URL_AUTO_DOCKER_GATEWAY === "true";
    const autoHost =
        autoGatewayRewriteEnabled
        && !explicitHost
        && /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname)
            ? (process.env.S3_READ_URL_DOCKER_GATEWAY?.trim() || "172.17.0.1")
            : "";

    const host = explicitHost || autoHost;
    if (host) parsed.hostname = host;

    // Local MinIO setups commonly bind :9000 to host loopback only (not
    // reachable from sibling containers). When we auto-switch to the docker
    // gateway host and no explicit read overrides are set, prefer HTTPS on a
    // non-default port (444) so SigV4 host canonicalization remains explicit.
    // This avoids default-port Host formatting differences across clients.
    if (autoHost && !explicitPort && !explicitProtocol && parsed.port === "9000") {
        parsed.protocol = "https:";
        parsed.port = "444";
    }

    // If writes already use the TLS proxy on :9443, keep writes unchanged but
    // still prefer :444 for LOAD CSV presigned reads for the same reason.
    if (autoHost && !explicitPort && !explicitProtocol && parsed.port === "9443") {
        parsed.protocol = "https:";
        parsed.port = "444";
    }

    if (explicitPort) parsed.port = explicitPort;
    if (explicitProtocol) {
        parsed.protocol = explicitProtocol.endsWith(":") ? explicitProtocol : `${explicitProtocol}:`;
    }

    return parsed.toString();
}

function keyPrefix(): string {
    return (process.env.S3_KEY_PREFIX ?? "csv-temp/").replace(/\/?$/, "/");
}

function buildClient(endpointOverride?: string): S3Client {
    return new S3Client({
        region: process.env.S3_REGION ?? "us-east-1",
        // Keep presigned browser PUTs simple (host/content-type) for broad
        // S3-compatible compatibility; optional checksum signing adds
        // x-amz-checksum-* headers the browser upload path does not send.
        requestChecksumCalculation: "WHEN_REQUIRED",
        ...((endpointOverride ?? process.env.S3_ENDPOINT) ? { endpoint: endpointOverride ?? process.env.S3_ENDPOINT } : {}),
        // Only pass static credentials when both are configured; otherwise omit
        // them so the AWS SDK's default credential provider chain (IAM role /
        // instance profile / ECS task role) stays enabled instead of being
        // disabled by `credentials: { accessKeyId: undefined, ... }`.
        ...(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
            ? {
                credentials: {
                    accessKeyId: process.env.S3_ACCESS_KEY_ID,
                    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
                },
            }
            : {}),
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
    private readonly readClient = buildClient(resolveReadEndpoint());

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
        // Optional existence check for early, deterministic 404s before LOAD CSV.
        if (process.env.S3_VERIFY_OBJECT_EXISTS === "true") {
            try {
                await this.readClient.send(new HeadObjectCommand({ Bucket: bucket(), Key: s3Key }));
            } catch (err) {
                const asObj = err as { name?: string; $metadata?: { httpStatusCode?: number } };
                if (
                    asObj?.name === "NotFound"
                    || asObj?.name === "NoSuchKey"
                    || asObj?.$metadata?.httpStatusCode === 404
                ) {
                    throw new Error("CSV temp object not found.");
                }
                throw err;
            }
        }

        return getSignedUrl(
            this.readClient,
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
                const result = await this.client.send(
                    new DeleteObjectsCommand({ Bucket: b, Delete: { Objects: staleKeys } })
                );
                deleted += result.Deleted?.length ?? 0;
            }

            continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
        } while (continuationToken);

        return deleted;
    }

    async createDirectUploadTarget(
        owner: string,
        key: string,
        request: CsvDirectUploadRequest
    ): Promise<CsvDirectUploadTarget | null> {
        const s3Key = objectKey(owner, key);
        const contentType = request.contentType || "text/csv; charset=utf-8";

        const url = await getSignedUrl(
            this.client,
            new PutObjectCommand({
                Bucket: bucket(),
                Key: s3Key,
                ContentType: contentType,
                ContentLength: request.sizeBytes,
            }),
            { expiresIn: WRITE_EXPIRES_IN }
        );

        return {
            type: "s3-presigned-put",
            method: "PUT",
            url,
            headers: {
                "Content-Type": contentType,
            },
        };
    }
}
