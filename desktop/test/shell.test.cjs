const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const {
    DEFAULT_PORT,
    HOST,
    anyFreePort,
    buildServerEnv,
    choosePort,
    ensurePrivateDir,
    isAppUrl,
    isExternalWebUrl,
    isPortFree,
    isUsablePort,
    loadSecrets,
    pruneServer,
    resourcesDir,
} = require("../lib/shell.cjs");

function tempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), "falkordb-desktop-"));
}

function listen(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, HOST, () => resolve(server));
    });
}

test("loadSecrets generates two 32-byte hex secrets once and keeps them", () => {
    const dir = tempDir();
    const first = loadSecrets(dir);
    assert.match(first.authSecret, /^[0-9a-f]{64}$/);
    assert.match(first.encryptionKey, /^[0-9a-f]{64}$/);
    assert.notEqual(first.authSecret, first.encryptionKey);

    // A second launch must not sign everyone out or orphan stored credentials.
    assert.deepEqual(loadSecrets(dir), first);

    if (process.platform !== "win32") {
        const mode = fs.statSync(path.join(dir, "secrets.json")).mode & 0o777;
        assert.equal(mode, 0o600, "secrets.json must be readable by its owner only");
    }
});

test("loadSecrets makes a replaced secrets file owner-only, whatever its old mode", (t) => {
    if (process.platform === "win32") t.skip("POSIX file modes");
    const dir = tempDir();
    const file = path.join(dir, "secrets.json");
    fs.writeFileSync(file, "not json", { mode: 0o644 });
    fs.chmodSync(file, 0o644);
    loadSecrets(dir);
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
});

test("ensurePrivateDir creates owner-only folders and tightens existing ones", (t) => {
    if (process.platform === "win32") t.skip("POSIX file modes");
    const root = tempDir();
    const fresh = path.join(root, "data");
    ensurePrivateDir(fresh);
    assert.equal(fs.statSync(fresh).mode & 0o777, 0o700);

    const old = path.join(root, "import");
    fs.mkdirSync(old, { mode: 0o775 });
    fs.chmodSync(old, 0o775);
    ensurePrivateDir(old);
    assert.equal(fs.statSync(old).mode & 0o777, 0o700);
});

test("loadSecrets replaces a damaged or weak secrets file", () => {
    for (const content of ["not json", JSON.stringify({ authSecret: "SECRET", encryptionKey: "changeme" })]) {
        const dir = tempDir();
        fs.writeFileSync(path.join(dir, "secrets.json"), content);
        const secrets = loadSecrets(dir);
        assert.match(secrets.authSecret, /^[0-9a-f]{64}$/);
        assert.match(secrets.encryptionKey, /^[0-9a-f]{64}$/);
    }
});

test("choosePort keeps the same port across launches while it is free", async () => {
    const dir = tempDir();
    const free = await anyFreePort();
    fs.writeFileSync(path.join(dir, "settings.json"), JSON.stringify({ port: free }));
    assert.equal(await choosePort(dir), free);
    assert.equal(await choosePort(dir), free);
});

test("isUsablePort only accepts an unprivileged TCP port", () => {
    for (const port of [1024, 3210, 65535]) assert.equal(isUsablePort(port), true, String(port));
    for (const port of [0, 80, 1023, 65536, -1, 3210.5, "3210", null, undefined, NaN]) {
        assert.equal(isUsablePort(port), false, String(port));
    }
});

test("choosePort ignores a saved port that is not usable", async (t) => {
    if (!(await isPortFree(DEFAULT_PORT))) t.skip(`port ${DEFAULT_PORT} is in use on this machine`);
    for (const port of [0, 22, 70000, "3300"]) {
        const dir = tempDir();
        fs.writeFileSync(path.join(dir, "settings.json"), JSON.stringify({ port }));
        assert.equal(await choosePort(dir), DEFAULT_PORT, String(port));
    }
});

test("choosePort starts from the default port", async (t) => {
    if (!(await isPortFree(DEFAULT_PORT))) t.skip(`port ${DEFAULT_PORT} is in use on this machine`);
    assert.equal(await choosePort(tempDir()), DEFAULT_PORT);
});

test("choosePort moves off a taken port and remembers the new one", async () => {
    const dir = tempDir();
    const busy = await listen(0);
    const taken = busy.address().port;
    try {
        fs.writeFileSync(path.join(dir, "settings.json"), JSON.stringify({ port: taken, other: "kept" }));
        const port = await choosePort(dir);
        assert.notEqual(port, taken);
        const saved = JSON.parse(fs.readFileSync(path.join(dir, "settings.json"), "utf8"));
        assert.deepEqual(saved, { port, other: "kept" });
    } finally {
        busy.close();
    }
});

test("buildServerEnv gives the server what the Docker entrypoint would", () => {
    const secrets = { authSecret: "a".repeat(64), encryptionKey: "b".repeat(64) };
    const env = buildServerEnv(
        { PATH: "/bin", FALKORDB_HOST: "db.example", NEXTAUTH_SECRET: "old", NEXTAUTH_URL: "http://old", AUTH_SECRET: "user-set" },
        { host: HOST, port: 3210, secrets, dataDir: "/data", importDir: "/import" },
    );

    assert.equal(env.AUTH_URL, "http://127.0.0.1:3210");
    assert.equal(env.ALLOWED_ORIGINS, "http://127.0.0.1:3210");
    assert.equal(env.HOSTNAME, HOST, "the server must only listen on loopback");
    assert.equal(env.PORT, "3210");
    assert.equal(env.NODE_ENV, "production");
    assert.equal(env.AUTH_SECRET, secrets.authSecret, "the shell's own secret always wins");
    assert.equal(env.ENCRYPTION_KEY, secrets.encryptionKey);
    assert.equal(env.API_TOKEN_STORAGE_PATH, path.join("/data", "api_tokens.json"));
    assert.equal(env.CSV_STORAGE, "local");
    assert.equal(env.CSV_LOCAL_TEMP_DIR, "/import");
    // The user's own settings still reach the server...
    assert.equal(env.FALKORDB_HOST, "db.example");
    assert.equal(env.PATH, "/bin");
    // ...but not the v4 names, which would shadow the values above.
    assert.equal("NEXTAUTH_SECRET" in env, false);
    assert.equal("NEXTAUTH_URL" in env, false);
});

test("buildServerEnv keeps a CSV storage the user chose", () => {
    const env = buildServerEnv(
        { CSV_STORAGE: "s3", CSV_LOCAL_TEMP_DIR: "/mine" },
        { host: HOST, port: 1, secrets: { authSecret: "", encryptionKey: "" }, dataDir: "/d", importDir: "/i" },
    );
    assert.equal(env.CSV_STORAGE, "s3");
    assert.equal(env.CSV_LOCAL_TEMP_DIR, "/mine");
});

test("isAppUrl keeps the app's own pages, under either loopback name, in the window", () => {
    const origin = "http://127.0.0.1:3210";
    assert.equal(isAppUrl("http://127.0.0.1:3210/graph", origin), true);
    assert.equal(isAppUrl("http://localhost:3210/login?signedOut=true", origin), true);
    assert.equal(isAppUrl("http://127.0.0.1:3000/", origin), false, "another local server is not the app");
    assert.equal(isAppUrl("https://127.0.0.1:3210/", origin), false);
    assert.equal(isAppUrl("https://docs.falkordb.com/", origin), false);
    assert.equal(isAppUrl("not a url", origin), false);
});

test("isExternalWebUrl only lets web links out to the system browser", () => {
    assert.equal(isExternalWebUrl("https://docs.falkordb.com/"), true);
    assert.equal(isExternalWebUrl("HTTP://example.com"), true);
    assert.equal(isExternalWebUrl("file:///etc/passwd"), false);
    assert.equal(isExternalWebUrl("javascript:alert(1)"), false);
    assert.equal(isExternalWebUrl("smb://host/share"), false);
});

test("pruneServer leaves a developer's env files and local state out of the app", () => {
    const dir = tempDir();
    for (const name of ["server.js", "package.json"]) fs.writeFileSync(path.join(dir, name), "");
    for (const name of [".env", ".env.local", ".env.production"]) fs.writeFileSync(path.join(dir, name), "AUTH_SECRET=SECRET");
    for (const name of [".data", "uploads", "tls", "e2e", "falkordb-import", ".next", "node_modules"]) {
        fs.mkdirSync(path.join(dir, name));
        fs.writeFileSync(path.join(dir, name, "file"), "");
    }

    assert.deepEqual(pruneServer(dir), [".data", ".env", ".env.local", ".env.production", "e2e", "falkordb-import", "tls", "uploads"]);
    assert.deepEqual(fs.readdirSync(dir).sort(), [".next", "node_modules", "package.json", "server.js"]);
});

test("resourcesDir points at each platform's resources folder", () => {
    assert.equal(resourcesDir("darwin", "/out", "FalkorDB Browser"), path.join("/out", "FalkorDB Browser.app", "Contents", "Resources"));
    assert.equal(resourcesDir("linux", "/out", "FalkorDB Browser"), path.join("/out", "resources"));
    assert.equal(resourcesDir("win32", "/out", "FalkorDB Browser"), path.join("/out", "resources"));
});
