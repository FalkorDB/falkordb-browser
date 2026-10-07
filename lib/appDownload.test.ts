import test from "node:test";
import assert from "node:assert/strict";
import {
    APP_PROMPT_DISMISSED_KEY,
    APP_PROMPT_SHOWN_KEY,
    DESKTOP_RELEASE_BASE,
    detectPlatform,
    dismissAppPrompt,
    getAppDownload,
    isInsideApp,
    markAppPromptShown,
    readAppLinks,
    shouldShowAppPrompt,
} from "./appDownload.ts";

const UA = {
    android: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36",
    iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
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

test("detectPlatform offers nothing to ChromeOS or an unknown agent", () => {
    assert.equal(detectPlatform(UA.chromeos), undefined);
    assert.equal(detectPlatform("curl/8.0"), undefined);
});

test("isInsideApp recognizes the Electron and Capacitor shells", () => {
    assert.equal(isInsideApp(UA.electron, false), true);
    assert.equal(isInsideApp(UA.android, true), true);
    assert.equal(isInsideApp(UA.linux, false), false);
});

test("getAppDownload links each desktop OS to its latest installer", () => {
    assert.deepEqual(getAppDownload("mac", {}), {
        platform: "mac", kind: "link", label: "Download for macOS", href: `${DESKTOP_RELEASE_BASE}/FalkorDB-Browser-mac-arm64.dmg`,
    });
    assert.deepEqual(getAppDownload("windows", {}), {
        platform: "windows", kind: "link", label: "Download for Windows", href: `${DESKTOP_RELEASE_BASE}/FalkorDB-Browser-win-x64.exe`,
    });
    assert.deepEqual(getAppDownload("linux", {}), {
        platform: "linux", kind: "link", label: "Download for Linux", href: `${DESKTOP_RELEASE_BASE}/FalkorDB-Browser-linux-x86_64.AppImage`,
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
