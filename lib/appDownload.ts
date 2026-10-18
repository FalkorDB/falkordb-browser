/**
 * Which native app to offer a visitor of the web browser.
 *
 * Desktop installers are attached to every GitHub release under names without
 * a version (see desktop/electron-builder.yml), so the `latest/download` links
 * always reach the newest one. A phone app opens one particular server, so
 * only a deployment that has its own sets ANDROID_APP_URL / IOS_APP_URL (a
 * store page, or the release's FalkorDB-Browser-android.apk); without one,
 * Android gets nothing and iOS is offered "Add to Home Screen" instead.
 */

export type AppPlatform = "mac" | "windows" | "linux" | "android" | "ios";

export type AppLinks = {
    android?: string;
    ios?: string;
};

/** The CPU family, where the browser says (Chromium's client hints); undefined otherwise. */
export type CpuArch = "arm" | "x86";

/** A second build for the same OS, for the visitors the first one does not fit. */
export type AppAlternate = { label: string; href: string };

export type AppDownload =
    | { platform: AppPlatform; kind: "link"; label: string; href: string; alternate?: AppAlternate }
    | { platform: "ios"; kind: "homeScreen"; label: string };

export const DESKTOP_RELEASE_BASE = "https://github.com/FalkorDB/falkordb-browser/releases/latest/download";

// Keep in step with artifactName in desktop/electron-builder.yml and the
// runners in .github/workflows/desktop.yml.
export const DESKTOP_FILES = {
    macArm: "FalkorDB-Browser-mac-arm64.dmg",
    macIntel: "FalkorDB-Browser-mac-x64.dmg",
    windows: "FalkorDB-Browser-win-x64.exe",
    linux: "FalkorDB-Browser-linux-x86_64.AppImage",
} as const;

const release = (file: string) => `${DESKTOP_RELEASE_BASE}/${file}`;

/**
 * Reads the OS from a user agent. `maxTouchPoints` tells an iPad, whose Safari
 * reports itself as a Mac, from an actual Mac.
 */
export function detectPlatform(userAgent: string, maxTouchPoints = 0): AppPlatform | undefined {
    if (/Android/i.test(userAgent)) return "android";
    if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
    if (/Macintosh/i.test(userAgent)) return maxTouchPoints > 1 ? "ios" : "mac";
    if (/Windows/i.test(userAgent)) return "windows";
    // ChromeOS also says "Linux" in places but cannot run an AppImage.
    if (/CrOS/i.test(userAgent)) return undefined;
    // There is only an x86_64 AppImage; an ARM Linux machine cannot run it.
    if (/\b(aarch64|arm64|armv\d)/i.test(userAgent)) return undefined;
    if (/Linux|X11/i.test(userAgent)) return "linux";
    return undefined;
}

/**
 * True inside the desktop (Electron) or mobile (Capacitor) app itself, or when
 * the browser was opened from its Home Screen icon (`standalone`), which is
 * the iOS "app" already.
 */
export function isInsideApp(userAgent: string, hasCapacitor: boolean, standalone = false): boolean {
    return hasCapacitor || standalone || /\bElectron\//.test(userAgent);
}

/**
 * `arch` only matters on a Mac. Safari reports "Intel Mac OS X" on every Mac,
 * so without client hints Apple silicon (every Mac since 2020) comes first and
 * the Intel build is offered next to it.
 */
export function getAppDownload(platform: AppPlatform | undefined, links: AppLinks, arch?: CpuArch): AppDownload | undefined {
    switch (platform) {
        case "mac": {
            const appleSilicon = { label: "Apple silicon Mac? Get that version", href: release(DESKTOP_FILES.macArm) };
            const intel = { label: "Intel Mac? Get that version", href: release(DESKTOP_FILES.macIntel) };
            const [primary, alternate] = arch === "x86" ? [intel, appleSilicon] : [appleSilicon, intel];
            return { platform, kind: "link", label: "Download for macOS", href: primary.href, alternate };
        }
        case "windows":
            return { platform, kind: "link", label: "Download for Windows", href: release(DESKTOP_FILES.windows) };
        case "linux":
            return { platform, kind: "link", label: "Download for Linux", href: release(DESKTOP_FILES.linux) };
        case "android":
            return links.android ? { platform, kind: "link", label: "Get the Android app", href: links.android } : undefined;
        case "ios":
            return links.ios
                ? { platform, kind: "link", label: "Get the iOS app", href: links.ios }
                : { platform, kind: "homeScreen", label: "Add to Home Screen" };
        default:
            return undefined;
    }
}

function readAppUrl(value: string | undefined, allowHttp: boolean): string | undefined {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    try {
        const { protocol } = new URL(trimmed);
        return protocol === "https:" || (allowHttp && protocol === "http:") ? trimmed : undefined;
    } catch {
        return undefined;
    }
}

/**
 * App links from the environment. Anything but an https:// URL is ignored,
 * except that APP_LINKS_ALLOW_HTTP=1 also accepts an http:// Android link so a
 * development setup can offer a debug APK served on the local network.
 */
export function readAppLinks(env: Record<string, string | undefined>): AppLinks {
    const links: AppLinks = {};
    const allowHttp = env.APP_LINKS_ALLOW_HTTP === "1";
    const android = readAppUrl(env.ANDROID_APP_URL, allowHttp);
    // An App Store page is always https; the opt-in is for a dev APK only.
    const ios = readAppUrl(env.IOS_APP_URL, false);
    if (android) links.android = android;
    if (ios) links.ios = ios;
    return links;
}

/**
 * The "Get the app" popup opens once per browser session until the visitor
 * ticks "Don't show this again" (or downloads), the same way the tutorial
 * remembers that it was seen. Storage can be missing or throw (private mode,
 * blocked site data); then the popup simply stays closed.
 */
export const APP_PROMPT_DISMISSED_KEY = "appDownloadPrompt";
export const APP_PROMPT_SHOWN_KEY = "appDownloadPromptShown";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function shouldShowAppPrompt(local: ReadableStorage, session: ReadableStorage): boolean {
    try {
        return local.getItem(APP_PROMPT_DISMISSED_KEY) !== "false"
            && session.getItem(APP_PROMPT_SHOWN_KEY) !== "true";
    } catch {
        return false;
    }
}

export function markAppPromptShown(session: WritableStorage): void {
    try {
        session.setItem(APP_PROMPT_SHOWN_KEY, "true");
    } catch {
        // Without session storage it may show again on the next page load.
    }
}

export function dismissAppPrompt(local: WritableStorage): void {
    try {
        local.setItem(APP_PROMPT_DISMISSED_KEY, "false");
    } catch {
        // Nothing to remember it in; the session flag still holds it back.
    }
}

export type PromptStorage = { local: Storage; session: Storage };

/**
 * The window's localStorage and sessionStorage, or undefined where merely
 * reading them throws (site data blocked). The popup then stays closed.
 */
export function getPromptStorage(win: Pick<Window, "localStorage" | "sessionStorage"> | undefined): PromptStorage | undefined {
    if (!win) return undefined;
    try {
        return { local: win.localStorage, session: win.sessionStorage };
    } catch {
        return undefined;
    }
}

// Installer files are downloaded in place: opening them in a new tab only
// leaves a blank page behind (the file is the whole response). Store pages
// and anything else still open in a new tab.
const INSTALLER_FILE = /\.(apk|dmg|exe|appimage|zip)$/i;

/** True for a link straight to an installer file rather than to a page. */
export function isDirectDownload(href: string): boolean {
    try {
        return INSTALLER_FILE.test(new URL(href).pathname);
    } catch {
        return false;
    }
}

/** What to do once the download finishes, shown after the visitor starts it. */
export const INSTALL_STEPS: Record<AppPlatform, string> = {
    android: "When the download finishes, open it from the notification (or Files → Downloads). If Android asks, allow installs from your browser, then tap Install.",
    mac: "Open the downloaded .dmg and drag FalkorDB Browser into Applications. The app is not code-signed yet, so the first time, right-click it and choose Open.",
    windows: "Run the downloaded installer. The app is not code-signed yet, so if Windows SmartScreen warns, choose More info → Run anyway.",
    linux: "Make the downloaded AppImage executable (chmod +x, or Properties → Allow executing) and run it.",
    ios: "Follow the App Store page to install it.",
};
