import test from "node:test";
import assert from "node:assert/strict";
import {
    APP_PROMPT_DISMISSED_KEY,
    APP_PROMPT_SHOWN_KEY,
    DESKTOP_FILES,
    DESKTOP_RELEASE_BASE,
    detectPlatform,
    dismissAppPrompt,
    ANDROID_DOWNLOAD_ROUTE,
    createAndroidDownloadHandler,
    RESOLVED_FILE_TTL_MS,
    getAppDownload,
    getPromptStorage,
    isGitHubReleaseFile,
    isInsideApp,
    markAppPromptShown,
    readAppLinks,
    resolveReleaseFile,
    shouldShowAppPrompt,
} from "./appDownload.ts";

const UA = {
    android: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36",
    iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    linuxArm: "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    chromeos: "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    electron: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) falkordb-browser-desktop/2.6.0 Chrome/140.0 Electron/44.5.1 Safari/537.36",
};

test("detectPlatform reads each OS from its user agent", () => {
    assert.equal(detectPlatform(UA.android), "android");
    assert.equal(detectPlatform(UA.iphone), "ios");
    assert.equal(detectPlatform(UA.mac), "mac");
    assert.equal(detectPlatform(UA.windows), "windows");
    assert.equal(detectPlatform(UA.linux), "linux");
});

test("detectPlatform tells an iPad, which reports itself as a Mac, by its touch points", () => {
    assert.equal(detectPlatform(UA.mac, 5), "ios");
    assert.equal(detectPlatform(UA.mac, 0), "mac");
});

test("detectPlatform offers nothing to ChromeOS, ARM Linux or an unknown agent", () => {
    assert.equal(detectPlatform(UA.chromeos), undefined);
    // Only an x86_64 AppImage exists.
    assert.equal(detectPlatform(UA.linuxArm), undefined);
    assert.equal(detectPlatform("curl/8.0"), undefined);
});

test("isInsideApp recognizes the Electron and Capacitor shells", () => {
    assert.equal(isInsideApp(UA.electron, false), true);
    assert.equal(isInsideApp(UA.android, true), true);
    assert.equal(isInsideApp(UA.linux, false), false);
});

test("isInsideApp treats a Home Screen launch as the app", () => {
    assert.equal(isInsideApp(UA.iphone, false, true), true);
    assert.equal(isInsideApp(UA.iphone, false, false), false);
});

test("getAppDownload links each desktop OS to its latest installer", () => {
    assert.deepEqual(getAppDownload("windows", {}), {
        platform: "windows", kind: "link", label: "Download for Windows", href: `${DESKTOP_RELEASE_BASE}/${DESKTOP_FILES.windows}`,
    });
    assert.deepEqual(getAppDownload("linux", {}), {
        platform: "linux", kind: "link", label: "Download for Linux", href: `${DESKTOP_RELEASE_BASE}/${DESKTOP_FILES.linux}`,
    });
    assert.equal(DESKTOP_FILES.windows, "FalkorDB-Browser-win-x64.exe");
    assert.equal(DESKTOP_FILES.linux, "FalkorDB-Browser-linux-x86_64.AppImage");
});

test("getAppDownload offers a Mac both builds, Apple silicon first unless the browser says Intel", () => {
    const appleSilicon = `${DESKTOP_RELEASE_BASE}/FalkorDB-Browser-mac-arm64.dmg`;
    const intel = `${DESKTOP_RELEASE_BASE}/FalkorDB-Browser-mac-x64.dmg`;
    for (const arch of [undefined, "arm"] as const) {
        assert.deepEqual(getAppDownload("mac", {}, arch), {
            platform: "mac", kind: "link", label: "Download for macOS", href: appleSilicon,
            alternate: { label: "Intel Mac? Get that version", href: intel },
        });
    }
    assert.deepEqual(getAppDownload("mac", {}, "x86"), {
        platform: "mac", kind: "link", label: "Download for macOS", href: intel,
        alternate: { label: "Apple silicon Mac? Get that version", href: appleSilicon },
    });
});

test("getAppDownload offers Android only when a store link is configured", () => {
    assert.equal(getAppDownload("android", {}), undefined);
    assert.deepEqual(getAppDownload("android", { android: "https://play.google.com/store/apps/details?id=com.falkordb.browser" }), {
        platform: "android", kind: "link", label: "Get the Android app", href: "https://play.google.com/store/apps/details?id=com.falkordb.browser",
    });
});

test("getAppDownload falls back to Add to Home Screen on iOS", () => {
    assert.deepEqual(getAppDownload("ios", {}), { platform: "ios", kind: "homeScreen", label: "Add to Home Screen" });
    assert.deepEqual(getAppDownload("ios", { ios: "https://apps.apple.com/app/id1" }), {
        platform: "ios", kind: "link", label: "Get the iOS app", href: "https://apps.apple.com/app/id1",
    });
});

test("getAppDownload offers nothing for an unknown platform", () => {
    assert.equal(getAppDownload(undefined, { android: "https://x.test", ios: "https://y.test" }), undefined);
});

test("readAppLinks keeps only https URLs", () => {
    assert.deepEqual(readAppLinks({}), {});
    assert.deepEqual(readAppLinks({ ANDROID_APP_URL: " https://play.test/app ", IOS_APP_URL: "https://apps.test/app" }), {
        android: "https://play.test/app", ios: "https://apps.test/app",
    });
    assert.deepEqual(readAppLinks({ ANDROID_APP_URL: "http://play.test/app", IOS_APP_URL: "not a url" }), {});
    assert.deepEqual(readAppLinks({ ANDROID_APP_URL: "   " }), {});
});

test("readAppLinks accepts an http Android link only when APP_LINKS_ALLOW_HTTP=1", () => {
    const env = { ANDROID_APP_URL: "http://192.168.1.52:8000/app.apk", IOS_APP_URL: "http://apps.test/app" };
    assert.deepEqual(readAppLinks(env), {});
    assert.deepEqual(readAppLinks({ ...env, APP_LINKS_ALLOW_HTTP: "true" }), {});
    // An App Store page is always https; the dev opt-in never relaxes iOS.
    assert.deepEqual(readAppLinks({ ...env, APP_LINKS_ALLOW_HTTP: "1" }), { android: "http://192.168.1.52:8000/app.apk" });
});

function memoryStorage(initial: Record<string, string> = {}) {
    const data = new Map(Object.entries(initial));
    return {
        data,
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => { data.set(key, value); },
    };
}

const brokenStorage = {
    getItem: (): string | null => { throw new Error("SecurityError"); },
    setItem: (): void => { throw new Error("QuotaExceededError"); },
};

test("the app prompt shows once per session until it is dismissed", () => {
    const local = memoryStorage();
    const session = memoryStorage();
    assert.equal(shouldShowAppPrompt(local, session), true);

    markAppPromptShown(session);
    assert.equal(session.data.get(APP_PROMPT_SHOWN_KEY), "true");
    assert.equal(shouldShowAppPrompt(local, session), false);
    // A new session shows it again...
    assert.equal(shouldShowAppPrompt(local, memoryStorage()), true);

    // ...until "Don't show this again".
    dismissAppPrompt(local);
    assert.equal(local.data.get(APP_PROMPT_DISMISSED_KEY), "false");
    assert.equal(shouldShowAppPrompt(local, memoryStorage()), false);
});

test("the app prompt stays closed when storage is unavailable", () => {
    assert.equal(shouldShowAppPrompt(brokenStorage, memoryStorage()), false);
    assert.doesNotThrow(() => markAppPromptShown(brokenStorage));
    assert.doesNotThrow(() => dismissAppPrompt(brokenStorage));
});

test("getPromptStorage hands back both storages, or nothing where reading them throws", () => {
    const local = memoryStorage() as unknown as Storage;
    const session = memoryStorage() as unknown as Storage;
    assert.deepEqual(getPromptStorage({ localStorage: local, sessionStorage: session }), { local, session });
    assert.equal(getPromptStorage(undefined), undefined);

    const blocked = {
        get localStorage(): Storage { throw new Error("SecurityError: site data is blocked"); },
        sessionStorage: session,
    };
    assert.equal(getPromptStorage(blocked), undefined);
});

const APK = "https://github.com/FalkorDB/falkordb-browser/releases/latest/download/FalkorDB-Browser-android.apk";

test("an APK on a GitHub release is linked through the download route, so the GitHub app cannot open it", () => {
    assert.deepEqual(getAppDownload("android", { android: APK }), {
        platform: "android", kind: "link", label: "Get the Android app", href: ANDROID_DOWNLOAD_ROUTE,
    });
    // Anything else (a store page, a dev APK on the network) is linked as it is.
    const dev = "http://192.168.1.52:8000/FalkorDB-Browser-android-dev.apk";
    assert.equal((getAppDownload("android", { android: dev }) as { href: string }).href, dev);
});

test("isGitHubReleaseFile matches release files only", () => {
    assert.equal(isGitHubReleaseFile(APK), true);
    assert.equal(isGitHubReleaseFile("https://github.com/FalkorDB/falkordb-browser/releases/download/v2.7.2/FalkorDB-Browser-android.apk"), true);
    assert.equal(isGitHubReleaseFile("https://github.com/FalkorDB/falkordb-browser/releases"), false);
    assert.equal(isGitHubReleaseFile("https://github.com/FalkorDB/falkordb-browser"), false);
    assert.equal(isGitHubReleaseFile("http://github.com/FalkorDB/falkordb-browser/releases/latest/download/x.apk"), false);
    assert.equal(isGitHubReleaseFile("https://github.com.evil.test/a/b/releases/latest/download/x.apk"), false);
    assert.equal(isGitHubReleaseFile("https://play.google.com/store/apps/details?id=com.falkordb.browser"), false);
    assert.equal(isGitHubReleaseFile("not a url"), false);
});

/**
 * A stand-in for GitHub, answering each URL with the given status and Location.
 * Any other URL is a violation: the resolver must never reach one. Every
 * request must leave redirects to the resolver and carry its deadline.
 * Violations are recorded rather than thrown, since the code under test turns
 * a throwing fetch into a quiet fallback; each test asserts there were none.
 */
function fakeFetch(answers: Record<string, [number, string?] | Error>) {
    const seen: string[] = [];
    const violations: string[] = [];
    const impl = (async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input);
        seen.push(url);
        if (init?.redirect !== "manual") violations.push(`${url} must not follow redirects itself`);
        if (!init?.signal) violations.push(`${url} must have a deadline`);
        const answer = answers[url];
        if (!answer) {
            violations.push(`Unexpected fetch: ${url}`);
            throw new Error(`Unexpected fetch: ${url}`);
        }
        if (answer instanceof Error) throw answer;
        const [status, location] = answer;
        // GitHub's redirects carry a short body, which is discarded unread.
        return new Response(location ? "Moved" : null, { status, headers: location ? { location } : {} });
    }) as typeof fetch;
    return { impl, seen, violations };
}

test("resolveReleaseFile follows GitHub's redirects to the file host", async () => {
    const tagged = "https://github.com/FalkorDB/falkordb-browser/releases/download/v2.7.2/FalkorDB-Browser-android.apk";
    const file = "https://release-assets.githubusercontent.com/github-production-release-asset/1/2?sig=abc";
    const { impl, seen, violations } = fakeFetch({ [APK]: [302, tagged], [tagged]: [302, file] });
    assert.equal(await resolveReleaseFile(APK, impl), file);
    assert.deepEqual(seen, [APK, tagged], "it stops at the file host and never fetches the file");
    assert.deepEqual(violations, []);
});

test("resolveReleaseFile gives up on anything but redirects within GitHub, without following the rest", async () => {
    for (const [why, answer, calls] of [
        ["no such file", [404], 1],
        ["no redirect", [200], 1],
        ["off GitHub", [302, "https://evil.test/x.apk"], 1],
        ["not https", [302, "http://x.githubusercontent.com/f"], 1],
        ["a redirect loop ends", [302, APK], 5],
    ] as const) {
        const { impl, seen, violations } = fakeFetch({ [APK]: [...answer] });
        assert.equal(await resolveReleaseFile(APK, impl), undefined, why);
        assert.deepEqual(seen, Array(calls).fill(APK), `${why}: only github.com is ever fetched`);
        assert.deepEqual(violations, [], why);
    }
});

const FILE = "https://release-assets.githubusercontent.com/github-production-release-asset/1/2?sig=abc";
const CONFIGURED = { ANDROID_APP_URL: APK };

/** A handler on a clock the test moves by hand. */
function handlerWith(answers: Record<string, [number, string?] | Error>) {
    const github = fakeFetch(answers);
    let time = 1_000;
    const handle = createAndroidDownloadHandler(github.impl, () => time);
    return { handle, seen: github.seen, violations: github.violations, advance: (ms: number) => { time += ms; } };
}

const expectRedirect = (res: Response, location: string) => {
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), location);
    assert.equal(res.headers.get("cache-control"), "no-store");
};

test("the download route: 404 without an Android app, and other links as they are", async () => {
    const { handle, seen, violations } = handlerWith({});
    const none = await handle({});
    assert.equal(none.status, 404);
    assert.deepEqual(await none.json(), { message: "No Android app is configured." });
    const store = "https://play.google.com/store/apps/details?id=com.falkordb.browser";
    expectRedirect(await handle({ ANDROID_APP_URL: store }), store);
    assert.deepEqual(seen, [], "GitHub is never asked about a link that is not its own");
    assert.deepEqual(violations, []);
});

test("the download route sends a release APK to GitHub's file host, and reuses it for a minute", async () => {
    const { handle, seen, violations, advance } = handlerWith({ [APK]: [302, FILE] });
    expectRedirect(await handle(CONFIGURED), FILE);
    advance(RESOLVED_FILE_TTL_MS - 1);
    expectRedirect(await handle(CONFIGURED), FILE);
    assert.equal(seen.length, 1, "reused while fresh");
    advance(1);
    expectRedirect(await handle(CONFIGURED), FILE);
    assert.equal(seen.length, 2, "looked up again once stale");
    assert.deepEqual(violations, []);
});

test("the download route shares one lookup between requests that arrive together", async () => {
    const { handle, seen, violations } = handlerWith({ [APK]: [302, FILE] });
    const all = await Promise.all([handle(CONFIGURED), handle(CONFIGURED), handle(CONFIGURED)]);
    for (const res of all) expectRedirect(res, FILE);
    assert.equal(seen.length, 1);
    assert.deepEqual(violations, []);
});

test("the download route falls back to the plain link when GitHub fails, and tries again next time", async () => {
    for (const answer of [[404] as [number], new Error("network down")]) {
        const { handle, seen, violations } = handlerWith({ [APK]: answer });
        expectRedirect(await handle(CONFIGURED), APK);
        expectRedirect(await handle(CONFIGURED), APK);
        assert.equal(seen.length, 2, "a failure is not cached");
        assert.deepEqual(violations, []);
    }
});
