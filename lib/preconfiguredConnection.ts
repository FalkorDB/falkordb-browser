/**
 * A single FalkorDB connection supplied by the operator through the
 * environment (Helm values, a Kubernetes Secret, `docker run -e …`) instead of
 * being typed into the login form.
 *
 * This module is deliberately pure — no `next/*`, no `@/` alias — so it stays
 * loadable by `node --test`.
 */

export const DEFAULT_PRECONFIGURED_HOST = "localhost";
export const DEFAULT_PRECONFIGURED_PORT = 6379;

/** What the server knows. `password` and `ca` never leave the server. */
export type PreconfiguredConnection = {
    host: string;
    port: number;
    username: string;
    password: string;
    tls: boolean;
    ca?: string;
    /** Log the operator in automatically instead of showing the login form. */
    autoConnect: boolean;
};

/** What the browser is allowed to see before anyone has authenticated. */
export type PreconfiguredConnectionInfo = {
    configured: boolean;
    autoConnect: boolean;
    host?: string;
    port?: number;
    username?: string;
    tls?: boolean;
};

/** The subset of `process.env` this module reads. */
export type PreconfiguredEnv = Record<string, string | undefined>;

const TLS_PROTOCOLS = new Set(["falkors", "rediss"]);
const KNOWN_PROTOCOLS = new Set(["falkor", "falkors", "redis", "rediss"]);

function trimmed(value: string | undefined): string | undefined {
    const text = value?.trim();
    return text ? text : undefined;
}

/**
 * Environment booleans are operator input, so anything that is not recognisably
 * true or false is a typo — report it rather than silently picking a side.
 */
function parseBoolean(value: string | undefined, fallback: boolean, name: string): boolean {
    const text = trimmed(value)?.toLowerCase();
    if (text === undefined) return fallback;
    if (text === "true" || text === "1" || text === "yes") return true;
    if (text === "false" || text === "0" || text === "no") return false;
    throw new Error(`${name} must be one of true/false (got "${value}")`);
}

function parsePort(value: string | undefined, fallback: number, name: string): number {
    const text = trimmed(value);
    if (text === undefined) return fallback;
    const port = Number(text);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`${name} must be an integer between 1 and 65535 (got "${value}")`);
    }
    return port;
}

function decodeUrlPart(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

type ParsedConnectionUrl = {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    tls?: boolean;
};

/**
 * Parses `falkor(s)://[user[:password]@]host[:port]`. Written by hand rather
 * than with `new URL()` because a password may contain characters `URL`
 * rejects, and because an unknown scheme has to be a hard error here.
 */
export function parsePreconfiguredUrl(raw: string, name = "FALKORDB_CONNECTION_URL"): ParsedConnectionUrl {
    let rest = raw.trim();
    let tls: boolean | undefined;

    const schemeEnd = rest.indexOf("://");
    if (schemeEnd >= 0) {
        const protocol = rest.slice(0, schemeEnd).toLowerCase();
        if (!KNOWN_PROTOCOLS.has(protocol)) {
            throw new Error(
                `${name} must use one of falkor://, falkors://, redis:// or rediss:// (got "${protocol}://")`
            );
        }
        tls = TLS_PROTOCOLS.has(protocol);
        rest = rest.slice(schemeEnd + 3);
    }

    // A password may itself contain "@", so split on the LAST one.
    let username: string | undefined;
    let password: string | undefined;
    const at = rest.lastIndexOf("@");
    if (at >= 0) {
        const creds = rest.slice(0, at);
        rest = rest.slice(at + 1);
        const colon = creds.indexOf(":");
        if (colon >= 0) {
            username = decodeUrlPart(creds.slice(0, colon));
            password = decodeUrlPart(creds.slice(colon + 1));
        } else {
            username = decodeUrlPart(creds);
        }
    }

    // Strip a path/query suffix such as the Redis database selector in "/0".
    const pathStart = rest.search(/[/?]/);
    if (pathStart >= 0) rest = rest.slice(0, pathStart);

    let host = rest;
    let port: number | undefined;
    const colon = rest.lastIndexOf(":");
    if (colon >= 0) {
        host = rest.slice(0, colon);
        port = parsePort(rest.slice(colon + 1), DEFAULT_PRECONFIGURED_PORT, `${name} port`);
    }

    if (!host) throw new Error(`${name} is missing a host`);

    return { host, port, username: username || undefined, password: password || undefined, tls };
}

/**
 * Reads the operator-supplied connection, or `null` when none is configured.
 *
 * `FALKORDB_CONNECTION_URL` seeds the values; the discrete `FALKORDB_*` vars
 * override it, so a Helm chart can put the URL in a Secret and still override
 * a single field from plain values. Throws on malformed input — a deployment
 * that half-parsed its own configuration should fail loudly at the first
 * request, not connect somewhere unintended.
 */
export function readPreconfiguredConnection(env: PreconfiguredEnv): PreconfiguredConnection | null {
    const url = trimmed(env.FALKORDB_CONNECTION_URL);
    const host = trimmed(env.FALKORDB_HOST);

    if (!url && !host) return null;

    const fromUrl = url ? parsePreconfiguredUrl(url) : {};

    return {
        host: host ?? fromUrl.host ?? DEFAULT_PRECONFIGURED_HOST,
        port: parsePort(env.FALKORDB_PORT, fromUrl.port ?? DEFAULT_PRECONFIGURED_PORT, "FALKORDB_PORT"),
        username: trimmed(env.FALKORDB_USERNAME) ?? fromUrl.username ?? "default",
        password: env.FALKORDB_PASSWORD ?? fromUrl.password ?? "",
        tls: parseBoolean(env.FALKORDB_TLS, fromUrl.tls ?? false, "FALKORDB_TLS"),
        ca: trimmed(env.FALKORDB_CA),
        autoConnect: parseBoolean(env.FALKORDB_AUTO_CONNECT, true, "FALKORDB_AUTO_CONNECT"),
    };
}

/** Strips the secrets, leaving only what the login form would prefill anyway. */
export function toPreconfiguredConnectionInfo(
    connection: PreconfiguredConnection | null
): PreconfiguredConnectionInfo {
    if (!connection) return { configured: false, autoConnect: false };

    return {
        configured: true,
        autoConnect: connection.autoConnect,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        tls: connection.tls,
    };
}
