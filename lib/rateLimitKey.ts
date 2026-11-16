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

const PRECONFIGURED_SIGN_IN_PATH = "/api/auth/callback/credentials";
const SIGN_IN_BODY_CAP = 16 * 1024;

/**
 * True for a credentials sign-in that asks for the operator's preconfigured
 * connection. That sign-in needs no secret, yet each one opens a FalkorDB
 * client and writes a Token DB row, so it gets a far smaller budget than the
 * general API limit. A body with no Content-Length, or one over the cap, is
 * not read at all and counts as preconfigured: the real form is always small
 * and sized, so this charges a client padding or streaming its way around the
 * budget (and, at worst, a manual login with an unusually large CA bundle).
 */
export async function isPreconfiguredSignIn(request: Request): Promise<boolean> {
    if (request.method !== "POST" || new URL(request.url).pathname !== PRECONFIGURED_SIGN_IN_PATH) return false;
    const length = readNonNegativeInt(request.headers.get("content-length") ?? undefined, -1);
    if (length < 0 || length > SIGN_IN_BODY_CAP) return true;
    const reader = request.clone().body?.getReader();
    if (!reader) return false;
    try {
        return await readPreconfiguredFlag(request, reader).finally(() => reader.releaseLock());
    } catch {
        // A body this cannot read is one Auth.js cannot read either, so it is not a preconfigured sign-in.
        console.warn("Could not inspect sign-in request");
        return false;
    }
}

async function readPreconfiguredFlag(request: Request, reader: ReadableStreamDefaultReader<Uint8Array>): Promise<boolean> {
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > SIGN_IN_BODY_CAP) {
            void reader.cancel().catch(error => console.warn("Failed to cancel sign-in inspection:", error));
            return true;
        }
        chunks.push(value);
    }
    const body = new TextDecoder().decode(Buffer.concat(chunks));
    if (request.headers.get("content-type")?.includes("application/json")) {
        return (JSON.parse(body) as { preconfigured?: unknown } | null)?.preconfigured === "true";
    }
    return new URLSearchParams(body).getAll("preconfigured").includes("true");
}

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
