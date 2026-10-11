// The parts of the desktop shell that do not need Electron, kept here so they
// can be tested with plain `node --test` (see test/shell.test.cjs).

const crypto = require("node:crypto");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

const HOST = "127.0.0.1";
const DEFAULT_PORT = 3210;

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
        return null;
    }
}

function writeJson(file, value) {
    fs.writeFileSync(file, JSON.stringify(value, null, 2), { mode: 0o600 });
}

const HEX_32_BYTES = /^[0-9a-f]{64}$/;

// Generated once and kept: a new AUTH_SECRET would sign every user out, and a
// new ENCRYPTION_KEY would make stored credentials unreadable.
function loadSecrets(dir) {
    const file = path.join(dir, "secrets.json");
    const stored = readJson(file);
    if (stored && HEX_32_BYTES.test(stored.authSecret) && HEX_32_BYTES.test(stored.encryptionKey)) {
        return stored;
    }
    const secrets = {
        authSecret: crypto.randomBytes(32).toString("hex"),
        encryptionKey: crypto.randomBytes(32).toString("hex"),
    };
    writeJson(file, secrets);
    return secrets;
}

function isPortFree(port, host = HOST) {
    return new Promise((resolve) => {
        const probe = net.createServer();
        probe.once("error", () => resolve(false));
        probe.listen(port, host, () => probe.close(() => resolve(true)));
    });
}

function anyFreePort(host = HOST) {
    return new Promise((resolve, reject) => {
        const probe = net.createServer();
        probe.once("error", reject);
        probe.listen(0, host, () => {
            const { port } = probe.address();
            probe.close(() => resolve(port));
        });
    });
}

// The port is part of the page's origin, and the browser keeps settings and
// its client-side key in localStorage, so reuse the same port across launches
// and only move when something else has taken it.
async function choosePort(dir, { host = HOST, defaultPort = DEFAULT_PORT } = {}) {
    const file = path.join(dir, "settings.json");
    const settings = readJson(file) || {};
    const preferred = Number.isInteger(settings.port) ? settings.port : defaultPort;
    if (await isPortFree(preferred, host)) return preferred;
    const port = await anyFreePort(host);
    writeJson(file, { ...settings, port });
    return port;
}

/**
 * The environment the bundled server runs with: everything the Docker
 * entrypoint would provide, with the state under the app-data directory.
 */
function buildServerEnv(baseEnv, { host, port, secrets, dataDir, importDir }) {
    const origin = `http://${host}:${port}`;
    const env = {
        // Inherit the user's environment so FALKORDB_* preconfigured
        // connections and other documented settings keep working.
        ...baseEnv,
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: "1",
        PORT: String(port),
        HOSTNAME: host,
        AUTH_URL: origin,
        AUTH_TRUST_HOST: "true",
        AUTH_SECRET: secrets.authSecret,
        ENCRYPTION_KEY: secrets.encryptionKey,
        ALLOWED_ORIGINS: origin,
        API_TOKEN_STORAGE_PATH: path.join(dataDir, "api_tokens.json"),
        CSV_STORAGE: baseEnv.CSV_STORAGE || "local",
        CSV_LOCAL_TEMP_DIR: baseEnv.CSV_LOCAL_TEMP_DIR || importDir,
    };
    // The v4 names would shadow the values above.
    delete env.NEXTAUTH_SECRET;
    delete env.NEXTAUTH_URL;
    return env;
}

// The server's own redirects can name the host "localhost" even though the
// window loads 127.0.0.1, so treat both as the app on its port.
function isAppUrl(url, origin) {
    try {
        const target = new URL(url);
        const app = new URL(origin);
        return target.protocol === app.protocol
            && target.port === app.port
            && (target.hostname === "127.0.0.1" || target.hostname === "localhost");
    } catch {
        return false;
    }
}

/** Only web links leave for the system browser; never file:, javascript: and the like. */
function isExternalWebUrl(url) {
    return /^https?:\/\//i.test(url);
}

// A developer's env files and local state sit next to the build in
// .next/standalone; none of it may ship inside the app.
const NEVER_SHIP = [".data", "uploads", "tls", "e2e", "falkordb-import"];

function pruneServer(dir) {
    const removed = [];
    for (const name of fs.readdirSync(dir)) {
        if (name.startsWith(".env") || NEVER_SHIP.includes(name)) {
            fs.rmSync(path.join(dir, name), { recursive: true, force: true });
            removed.push(name);
        }
    }
    return removed.sort();
}

/** Where electron-builder puts an app's resources on each platform. */
function resourcesDir(platform, appOutDir, productFilename) {
    return platform === "darwin"
        ? path.join(appOutDir, `${productFilename}.app`, "Contents", "Resources")
        : path.join(appOutDir, "resources");
}

module.exports = {
    HOST,
    DEFAULT_PORT,
    loadSecrets,
    isPortFree,
    anyFreePort,
    choosePort,
    buildServerEnv,
    isAppUrl,
    isExternalWebUrl,
    pruneServer,
    resourcesDir,
};
