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
            return links.android
                ? { platform, kind: "link", label: "Get the Android app", href: isGitHubReleaseFile(links.android) ? ANDROID_DOWNLOAD_ROUTE : links.android }
                : undefined;
        case "ios":
            return links.ios
                ? { platform, kind: "link", label: "Get the iOS app", href: links.ios }
                : { platform, kind: "homeScreen", label: "Add to Home Screen" };
        default:
            return undefined;
    }
}

/**
 * Android hands a tapped github.com link to the GitHub app when it is
 * installed, and that app opens a release file in its own in-app browser,
 * where Chrome's download prompt never shows. So an APK attached to a GitHub
 * release is linked through this route instead, which redirects to the file's
 * address on GitHub's file host: no app claims that one, so Chrome downloads it.
 */
export const ANDROID_DOWNLOAD_ROUTE = "/api/app-download/android";

const GITHUB_RELEASE_FILE = /^\/[^/]+\/[^/]+\/releases\/(?:latest\/download|download\/[^/]+)\/[^/]+$/;

/** True for a file attached to a GitHub release, latest or tagged. */
export function isGitHubReleaseFile(href: string): boolean {
    try {
        const url = new URL(href);
        return url.protocol === "https:" && url.hostname === "github.com" && GITHUB_RELEASE_FILE.test(url.pathname);
    } catch {
        return false;
    }
}

// Where GitHub serves release files from, past its own redirects.
const isGitHubFileHost = (url: URL) => url.protocol === "https:" && url.hostname.endsWith(".githubusercontent.com");

/**
 * The address GitHub's file host serves a release file from. GitHub answers a
 * release download with redirects, first from latest/ to the tagged release,
 * then to a short-lived signed URL; they are followed here, on github.com only,
 * until that URL. Going through the download URL keeps GitHub's download count.
 * Undefined when GitHub answers anything else, so the caller can fall back to
 * the plain link.
 */
export async function resolveReleaseFile(href: string, fetchImpl: typeof fetch): Promise<string | undefined> {
    let url = new URL(href);
    // One deadline for the whole lookup, however many redirects it takes.
    const signal = AbortSignal.timeout(5_000);
    for (let hop = 0; hop < 5; hop += 1) {
        // Sequential by nature: each hop is where the previous one pointed.
        const res = await fetchImpl(url, { method: "GET", redirect: "manual", signal });
        await res.body?.cancel();
        const location = res.headers.get("location");
        if (res.status < 300 || res.status >= 400 || !location) return undefined;
        url = new URL(location, url);
        if (isGitHubFileHost(url)) return url.toString();
        if (url.protocol !== "https:" || url.hostname !== "github.com") return undefined;
    }
    return undefined;
}

/**
 * How long a resolved file address is reused. GitHub signs it for an hour; a
 * minute keeps a burst of taps to one lookup. Downloads still count: GitHub
 * counts the file being fetched from its file host, which every tap does.
 */
export const RESOLVED_FILE_TTL_MS = 60_000;

const redirectTo = (location: string) => new Response(null, {
    status: 302,
    // The file host's address is signed and short-lived.
    headers: { Location: location, "Cache-Control": "no-store" },
});

/**
 * The handler behind ANDROID_DOWNLOAD_ROUTE. It sends the visitor to the
 * configured Android app, an APK on a GitHub release by way of GitHub's file
 * host. The target only ever comes from the server's configuration, never the
 * request. A resolved address is reused for RESOLVED_FILE_TTL_MS, and requests
 * arriving while one is being looked up share that lookup, so the route never
 * sends GitHub more than one lookup at a time. If GitHub doesn't answer as
 * expected, the plain link is used: it still downloads in a browser, but where
 * the GitHub app is installed Android may hand it to that app instead, the very
 * case this route exists to avoid.
 */
export function createAndroidDownloadHandler(fetchImpl: typeof fetch, now: () => number) {
    const resolved = new Map<string, { url: string; expires: number }>();
    const pending = new Map<string, Promise<string | undefined>>();

    return async (env: Record<string, string | undefined>): Promise<Response> => {
        const { android } = readAppLinks(env);
        if (!android) return Response.json({ message: "No Android app is configured." }, { status: 404 });
        if (!isGitHubReleaseFile(android)) return redirectTo(android);

        const cached = resolved.get(android);
        if (cached && now() < cached.expires) return redirectTo(cached.url);

        let lookup = pending.get(android);
        if (!lookup) {
            lookup = resolveReleaseFile(android, fetchImpl)
                .catch(() => undefined)
                .finally(() => pending.delete(android));
            pending.set(android, lookup);
        }
        const url = await lookup;
        if (url) resolved.set(android, { url, expires: now() + RESOLVED_FILE_TTL_MS });
        return redirectTo(url ?? android);
    };
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

