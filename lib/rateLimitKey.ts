/**
 * The pure parts of the proxy's rate limiter: reading its budgets from the
 * environment and deciding which client a request is charged to.
 *
 * Kept apart from `proxy.ts` and deliberately pure — no `next/*`, no `@/`
 * alias — so it stays loadable by `node --test`.
 */

/**
 * A full non-negative integer string, or `fallback`. `parseInt` would read
 * "0abc" as 0 — silently switching a limit off — and admit negatives, which
 * make every request look over budget.
 */
export function readNonNegativeInt(raw: string | undefined, fallback: number): number {
    const text = raw?.trim();
    if (!text || !/^\d+$/.test(text)) return fallback;
    const value = Number(text);
    return Number.isSafeInteger(value) ? value : fallback;
}

export const DEFAULT_TRUSTED_PROXY_HOPS = 1;

/**
 * The address a request is charged to, from its `X-Forwarded-For`.
 *
 * Next.js passes a client's `X-Forwarded-For` through untouched and only fills
 * in the socket address when the header is absent — it never appends. So the
 * left-most entry is whatever the client chose to send, and rotating it would
 * give each request a fresh budget. Each trusted reverse proxy appends the
 * address of whoever connected to it, so with `trustedHops` of them in front
 * the client is the entry that many places from the right.
 *
 * A header with fewer entries than that reached the server around a proxy;
 * its left-most entry is then the best there is.
 */
export function clientAddressFromForwardedFor(
    forwardedFor: string | null | undefined,
    trustedHops: number
): string | undefined {
    const hops = forwardedFor?.split(",").map(hop => hop.trim()).filter(Boolean) ?? [];
    if (hops.length === 0) return undefined;
    return hops[Math.max(0, hops.length - Math.max(1, trustedHops))];
}
