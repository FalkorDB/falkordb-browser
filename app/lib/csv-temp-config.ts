const DEFAULT_CSV_TEMP_TTL_SECONDS = 1800;

export function getCsvTempTtlSeconds(): number {
    const raw = Number(process.env.CSV_TEMP_TTL_SECONDS ?? DEFAULT_CSV_TEMP_TTL_SECONDS);
    return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_CSV_TEMP_TTL_SECONDS;
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
