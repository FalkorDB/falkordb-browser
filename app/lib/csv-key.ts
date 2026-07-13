import { createHmac, randomUUID, timingSafeEqual } from "crypto";

/**
 * Shared helpers for the Load CSV temp-storage subsystem: strict key
 * validation/normalization, a stable non-reversible per-user owner id, and a
 * short-lived signed capability token for the (unauthenticated) local serve
 * endpoint. Keeping these in one place guarantees every route and storage
 * provider agrees on the exact key/owner format so store/serve/delete match.
 */

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const OWNER_LEN = 32;
const OWNER_PATTERN = new RegExp(`^[0-9a-f]{${OWNER_LEN}}$`);

export function generateCsvKey(): string {
    return randomUUID();
}

export function isValidCsvKey(key: unknown): boolean {
    return typeof key === "string" && UUID_V4.test(key.trim().toLowerCase());
}

/** Returns the lowercase UUID for `key`, or throws if it is not a valid UUID v4. */
export function normalizeCsvKey(key: unknown): string {
    const normalized = typeof key === "string" ? key.trim().toLowerCase() : "";
    if (!UUID_V4.test(normalized)) {
        throw new Error("Invalid CSV key.");
    }
    return normalized;
}

export function isValidOwner(owner: unknown): boolean {
    return typeof owner === "string" && OWNER_PATTERN.test(owner);
}

function signingSecret(): string {
    const secret =
        process.env.CSV_TEMP_SIGNING_SECRET?.trim() ||
        process.env.ENCRYPTION_KEY?.trim() ||
        process.env.NEXTAUTH_SECRET?.trim() ||
        process.env.AUTH_SECRET?.trim();
    if (!secret) {
        throw new Error(
            "A signing secret (CSV_TEMP_SIGNING_SECRET, ENCRYPTION_KEY, NEXTAUTH_SECRET or AUTH_SECRET) is required for CSV temp storage."
        );
    }
    return secret;
}

/**
 * Stable, non-reversible per-user id used to scope temp storage (subdir / object
 * key prefix). Never exposes the raw user id in file paths, object keys or URLs.
 */
export function hashOwner(userId: string): string {
    if (!userId) {
        throw new Error("A user id is required to derive the CSV owner.");
    }
    return createHmac("sha256", signingSecret())
        .update(`csv-owner:${userId}`)
        .digest("hex")
        .slice(0, OWNER_LEN);
}

function capabilitySignature(owner: string, key: string, expMs: number): string {
    return createHmac("sha256", signingSecret())
        .update(`csv-cap:${owner}.${key}.${expMs}`)
        .digest("hex")
        .slice(0, 32);
}

/**
 * Short-lived signed token so the unauthenticated local serve endpoint can
 * confirm the caller was handed this exact (owner, key) by us. FalkorDB fetches
 * the URL without a session, so this is a bearer capability — keep TTLs short.
 */
export function signCsvCapability(
    owner: string,
    key: string,
    ttlMs: number
): { expMs: number; token: string } {
    const expMs = Date.now() + ttlMs;
    return { expMs, token: `${expMs}.${capabilitySignature(owner, key, expMs)}` };
}

export function verifyCsvCapability(owner: string, key: string, token: unknown): boolean {
    if (typeof token !== "string") return false;
    const dot = token.indexOf(".");
    if (dot <= 0) return false;
    const expMs = Number(token.slice(0, dot));
    const sig = token.slice(dot + 1);
    if (!Number.isFinite(expMs) || expMs < Date.now()) return false;
    const expected = capabilitySignature(owner, key, expMs);
    if (sig.length !== expected.length) return false;
    try {
        return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
        return false;
    }
}
