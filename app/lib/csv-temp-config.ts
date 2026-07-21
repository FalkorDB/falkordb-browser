const DEFAULT_CSV_TEMP_TTL_SECONDS = 1800;
const DEFAULT_CSV_MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

export function getCsvTempTtlSeconds(): number {
    const configured = process.env.CSV_TEMP_TTL_SECONDS?.trim();
    if (!configured) return DEFAULT_CSV_TEMP_TTL_SECONDS;

    const raw = Number(configured);
    return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_CSV_TEMP_TTL_SECONDS;
}

/**
 * Max accepted CSV upload size in bytes. CSV imports can be large, so this is
 * higher than the generic upload cap and is streamed (never buffered whole) to
 * storage. Configurable via CSV_MAX_FILE_SIZE_MB.
 */
export function getCsvMaxUploadBytes(): number {
    const raw = Number(process.env.CSV_MAX_FILE_SIZE_MB);
    return Number.isFinite(raw) && raw > 0
        ? Math.floor(raw * 1024 * 1024)
        : DEFAULT_CSV_MAX_UPLOAD_BYTES;
}

export function getCsvTempCleanupSecrets(): string[] {
    return [
        process.env.CSV_TEMP_CLEANUP_SECRET?.trim(),
        process.env.CRON_SECRET?.trim(),
    ].filter((secret): secret is string => Boolean(secret));
}

export function getCsvTempCleanupCutoffMs(nowMs: number = Date.now()): number {
    return nowMs - getCsvTempTtlSeconds() * 1000;
}
