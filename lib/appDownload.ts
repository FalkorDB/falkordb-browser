/**
 * Which native app to offer a visitor of the web browser.
 *
 * Desktop installers are attached to every GitHub release under names without
 * a version (see desktop/electron-builder.yml), so the `latest/download` links
 * always reach the newest one. The phone apps live in stores whose URLs the
 * operator supplies (ANDROID_APP_URL / IOS_APP_URL); without one, Android gets
 * nothing and iOS is offered "Add to Home Screen" instead.
 */

export type AppPlatform = "mac" | "windows" | "linux" | "android" | "ios";

export type AppLinks = {
    android?: string;
    ios?: string;
};

export type AppDownload =
    | { platform: AppPlatform; kind: "link"; label: string; href: string }
    | { platform: "ios"; kind: "homeScreen"; label: string };

export const DESKTOP_RELEASE_BASE = "https://github.com/FalkorDB/falkordb-browser/releases/latest/download";

const DESKTOP_DOWNLOADS: Record<"mac" | "windows" | "linux", { label: string; file: string }> = {
    // Built on Apple Silicon only. Safari reports "Intel Mac OS X" on every
    // Mac, so the architecture cannot be told apart from here.
    mac: { label: "Download for macOS", file: "FalkorDB-Browser-mac-arm64.dmg" },
    windows: { label: "Download for Windows", file: "FalkorDB-Browser-win-x64.exe" },
    linux: { label: "Download for Linux", file: "FalkorDB-Browser-linux-x86_64.AppImage" },
};

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
    if (/Linux|X11/i.test(userAgent)) return "linux";
    return undefined;
}

/** True inside the desktop (Electron) or mobile (Capacitor) app itself. */
export function isInsideApp(userAgent: string, hasCapacitor: boolean): boolean {
    return hasCapacitor || /\bElectron\//.test(userAgent);
}

export function getAppDownload(platform: AppPlatform | undefined, links: AppLinks): AppDownload | undefined {
    switch (platform) {
        case "mac":
        case "windows":
        case "linux": {
            const { label, file } = DESKTOP_DOWNLOADS[platform];
            return { platform, kind: "link", label, href: `${DESKTOP_RELEASE_BASE}/${file}` };
        }
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

function readHttpsUrl(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    try {
        return new URL(trimmed).protocol === "https:" ? trimmed : undefined;
    } catch {
        return undefined;
    }
}

/** Store links from the environment. Anything but an https:// URL is ignored. */
export function readAppLinks(env: Record<string, string | undefined>): AppLinks {
    const links: AppLinks = {};
    const android = readHttpsUrl(env.ANDROID_APP_URL);
    const ios = readHttpsUrl(env.IOS_APP_URL);
    if (android) links.android = android;
    if (ios) links.ios = ios;
    return links;
}
