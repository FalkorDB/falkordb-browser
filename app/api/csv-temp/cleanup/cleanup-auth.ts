export type CleanupAuthResult =
    | { ok: true }
    | { ok: false; status: number; message: string };

/**
 * Fail closed: a cleanup secret MUST be configured. Missing configuration is a
 * server/config error (503); a wrong or absent caller credential is 401. The
 * caller may present the secret as a `Bearer` token (Vercel Cron sets
 * `Authorization: Bearer <CRON_SECRET>`) or via the `x-csv-cleanup-secret`
 * header. Extracted from the route handler so it can be unit-tested without the
 * `@/` alias / Next runtime.
 */
export function authorizeCleanup(
    configuredSecrets: string[],
    authorizationHeader: string | null,
    cleanupSecretHeader: string | null
): CleanupAuthResult {
    if (configuredSecrets.length === 0) {
        return {
            ok: false,
            status: 503,
            message:
                "Cleanup is not configured. Set CSV_TEMP_CLEANUP_SECRET or CRON_SECRET to enable this endpoint.",
        };
    }

    const auth = authorizationHeader ?? "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const headerSecret = cleanupSecretHeader?.trim() ?? "";

    if (
        (bearer && configuredSecrets.includes(bearer)) ||
        (headerSecret && configuredSecrets.includes(headerSecret))
    ) {
        return { ok: true };
    }
    return { ok: false, status: 401, message: "Unauthorized" };
}
