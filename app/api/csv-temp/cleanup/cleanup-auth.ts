import { createHash, timingSafeEqual } from "node:crypto";

export type CleanupAuthResult =
    | { ok: true }
    | { ok: false; status: number; message: string };

/**
 * Compare two secrets without leaking how far they matched.
 *
 * Both sides are hashed first so the comparison is always over 32 equal-length
 * bytes: `timingSafeEqual` throws on a length mismatch, and the length of the
 * configured secret is itself something we would rather not leak.
 */
function secretMatches(candidate: string, configured: string): boolean {
    const a = createHash("sha256").update(candidate, "utf8").digest();
    const b = createHash("sha256").update(configured, "utf8").digest();
    return timingSafeEqual(a, b);
}

/**
 * Check a candidate against every configured secret. Deliberately does not
 * short-circuit, so the time taken does not reveal which entry matched.
 */
function matchesAnySecret(candidate: string, configuredSecrets: string[]): boolean {
    return configuredSecrets.reduce(
        (matched, configured) => secretMatches(candidate, configured) || matched,
        false
    );
}

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
        (bearer !== "" && matchesAnySecret(bearer, configuredSecrets)) ||
        (headerSecret !== "" && matchesAnySecret(headerSecret, configuredSecrets))
    ) {
        return { ok: true };
    }
    return { ok: false, status: 401, message: "Unauthorized" };
}
