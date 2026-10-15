import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const mobileDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ENV_KEYS = ["FALKORDB_BROWSER_URL", "FALKORDB_BROWSER_ALLOW_HTTP"] as const;

type Config = {
    appId: string;
    webDir: string;
    server?: { url: string; allowNavigation: string[]; cleartext: boolean };
};

let loads = 0;

/** capacitor.config.ts reads the environment once, at import, so each case imports a fresh copy. */
async function loadConfig(env: Partial<Record<(typeof ENV_KEYS)[number], string>>): Promise<Config> {
    const saved = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
    for (const key of ENV_KEYS) {
        if (env[key] === undefined) delete process.env[key];
        else process.env[key] = env[key];
    }
    try {
        loads += 1;
        const mod = await import(`../capacitor.config.ts?load=${loads}`);
        return mod.default as Config;
    } finally {
        for (const key of ENV_KEYS) {
            if (saved[key] === undefined) delete process.env[key];
            else process.env[key] = saved[key];
        }
    }
}

test("with no server URL the app shows the 'no server configured' page", async () => {
    const config = await loadConfig({});
    assert.equal(config.appId, "com.falkordb.browser");
    assert.equal(config.webDir, "www");
    assert.equal(config.server, undefined);
});

test("a release build opens its https server and keeps only that host inside the app", async () => {
    const config = await loadConfig({ FALKORDB_BROWSER_URL: "https://browser.example.com" });
    assert.deepEqual(config.server, {
        url: "https://browser.example.com/",
        allowNavigation: ["browser.example.com"],
        cleartext: false,
    });
});

test("a plain http server URL is refused", async () => {
    await assert.rejects(loadConfig({ FALKORDB_BROWSER_URL: "http://192.168.1.52:3300" }), /must be https/);
    // Only the exact opt-in value counts.
    await assert.rejects(
        loadConfig({ FALKORDB_BROWSER_URL: "http://192.168.1.52:3300", FALKORDB_BROWSER_ALLOW_HTTP: "true" }),
        /must be https/,
    );
});

test("a dev build may open an http server on the local network when asked to", async () => {
    const config = await loadConfig({ FALKORDB_BROWSER_URL: "http://192.168.1.52:3300", FALKORDB_BROWSER_ALLOW_HTTP: "1" });
    assert.deepEqual(config.server, {
        url: "http://192.168.1.52:3300/",
        allowNavigation: ["192.168.1.52"],
        cleartext: true,
    });
});

test("the opt-in for http never relaxes anything but http", async () => {
    await assert.rejects(
        loadConfig({ FALKORDB_BROWSER_URL: "ftp://files.example.com", FALKORDB_BROWSER_ALLOW_HTTP: "1" }),
        /must be https/,
    );
    await assert.rejects(loadConfig({ FALKORDB_BROWSER_URL: "not a url" }));
});

function stampVersion(tag: string): string {
    const dir = mkdtempSync(path.join(tmpdir(), "falkordb-mobile-"));
    const gradle = path.join(dir, "build.gradle");
    writeFileSync(gradle, "android {\n    defaultConfig {\n        versionCode 1\n        versionName \"1.0\"\n    }\n}\n");
    execFileSync("sh", [path.join(mobileDir, "scripts/android-version.sh"), tag, gradle], { stdio: "pipe" });
    return readFileSync(gradle, "utf8");
}

test("a release tag becomes the app's version name and a growing version code", () => {
    const cases: [string, string, number][] = [
        ["v2.6.1", "2.6.1", 20601],
        ["v2.10.3", "2.10.3", 21003],
        ["v3.0.0", "3.0.0", 30000],
    ];
    for (const [tag, name, code] of cases) {
        const gradle = stampVersion(tag);
        assert.ok(gradle.includes(`versionCode ${code}\n`), `${tag}: versionCode ${code}`);
        assert.ok(gradle.includes(`versionName "${name}"`), `${tag}: versionName "${name}"`);
    }
    // Every release installs over the one before it.
    const order = ["v2.6.1", "v2.6.2", "v2.7.0", "v2.10.0", "v3.0.0"].map((tag) => Number(stampVersion(tag).match(/versionCode (\d+)/)?.[1]));
    assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test("a tag that is not a release version is refused instead of guessed", () => {
    for (const tag of ["latest", "v2.6", "v2.6.1.4", "v2.100.0", "v2..1", "v2.6.08", "v02.6.1", 'v2.6.1-rc"1', "v2.6.1-rc|1", "v2.6.1-", "v0.0.0", "v210001.0.0",
        // A pre-release would share one code with its final release, which then would not count as an update.
        "v3.0.0-rc1", "v3.0.0-beta.2"]) {
        assert.throws(() => stampVersion(tag), Error, tag);
    }
});
