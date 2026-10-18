import { readFileSync } from "fs";
import { Browser, BrowserContext, Page } from "playwright";
import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import AppDownloadComponent from "../logic/POM/appDownloadComponent";
import pkg from "../../package.json";

/**
 * The browser offers each visitor the app for their OS: a once-per-session
 * popup on whichever page they land, plus a link on the login page and in the
 * menus. The OS comes from the user agent, so every test here opens its own
 * context with the agent it is about, rather than the suite's shared one.
 */

const ADMIN_AUTH_FILE = "playwright/.auth/admin.json";
const RELEASES = "https://github.com/FalkorDB/falkordb-browser/releases/latest/download";
const APP_LINKS_ROUTE = "**/api/app-links";
const RELEASES_ROUTE = "**/api/releases";

const UA = {
    windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    android: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36",
    iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    electron: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Electron/44.5.1 Safari/537.36",
};

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

// The popup opens 1.5s after load; give it room on a slow runner.
const OPENS_WITHIN = 10_000;
// How long to watch for a popup that must not open at all.
const STAYS_CLOSED_FOR = 4_000;

type Visitor = {
    ua: string;
    viewport?: { width: number; height: number };
    signedIn?: boolean;
    /** Chromium's CPU hint; "none" stands for Safari and Firefox, which give none. */
    cpu?: "arm" | "x86" | "none";
    /** Whether the running release's What's New was already seen (default true). */
    seenWhatsNew?: boolean;
};

/**
 * A context for one kind of visitor. It reuses the admin session's cookies but
 * not its localStorage, which the suite seeds with "appDownloadPrompt=false"
 * to keep the popup away from every other test.
 */
async function openVisitor(browser: Browser, { ua, viewport = DESKTOP, signedIn = true, cpu, seenWhatsNew = true }: Visitor): Promise<BrowserContext> {
    const { cookies } = signedIn ? JSON.parse(readFileSync(ADMIN_AUTH_FILE, "utf8")) : { cookies: [] };
    const context = await browser.newContext({ userAgent: ua, viewport, storageState: { cookies, origins: [] } });
    // A returning user: the tutorial and (unless a test needs it) the latest
    // What's New were seen, so nothing else competes with the popup.
    await context.addInitScript((seen) => {
        if (!localStorage.getItem("tutorial")) localStorage.setItem("tutorial", "false");
        if (seen && !localStorage.getItem("whatsNewSeen")) localStorage.setItem("whatsNewSeen", "v999.0.0");
    }, seenWhatsNew);
    // The test browser would otherwise report the runner's own CPU.
    if (cpu) {
        await context.addInitScript((arch) => {
            const hints = arch === "none" ? undefined : { getHighEntropyValues: async () => ({ architecture: arch }) };
            Object.defineProperty(navigator, "userAgentData", { get: () => hints });
        }, cpu);
    }
    // What's New would take its turn first; keep GitHub's real release notes out of these tests.
    await context.route(RELEASES_ROUTE, (route) => route.fulfill({ json: { releases: [] } }));
    // Never fetch a real installer. GitHub serves release files as attachments,
    // which is what lets them download in place without leaving the page.
    await context.route("https://github.com/**", (route) => route.fulfill({
        status: 200,
        headers: { "content-type": "application/octet-stream", "content-disposition": "attachment; filename=installer" },
        body: "installer",
    }));
    return context;
}

async function openPage(context: BrowserContext, url: string): Promise<[Page, AppDownloadComponent]> {
    const page = await context.newPage();
    await page.goto(url);
    return [page, new AppDownloadComponent(page)];
}

async function expectNoPrompt(app: AppDownloadComponent) {
    await app.waitForTimeout(STAYS_CLOSED_FOR);
    await expect(app.prompt).toBeHidden();
}

test.describe("@admin App download", () => {
    let context: BrowserContext;

    test.afterEach(async () => {
        await context?.close();
    });

    test("nothing configured: the server offers no phone app links", async ({ request }) => {
        const response = await request.get(`${urls.localHost}/api/app-links`);
        expect(response.ok()).toBeTruthy();
        expect(await response.json()).toEqual({});
    });

    for (const [os, ua, title, file] of [
        ["Windows", UA.windows, "FalkorDB Browser for Windows", "FalkorDB-Browser-win-x64.exe"],
        ["Linux", UA.linux, "FalkorDB Browser for Linux", "FalkorDB-Browser-linux-x86_64.AppImage"],
    ] as const) {
        test(`${os}: a signed-in user going straight to /graph is offered the ${os} installer`, async ({ browser }) => {
            context = await openVisitor(browser, { ua });
            const [, app] = await openPage(context, urls.graphUrl);

            await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
            await expect(app.promptTitle).toHaveText(title);
            await expect(app.promptDownload).toHaveAttribute("href", `${RELEASES}/${file}`);
            await expect(app.promptAlternate).toHaveCount(0);
        });
    }

    test("macOS without a CPU hint (Safari): Apple silicon first, the Intel build beside it", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.mac, cpu: "none" });
        const [, app] = await openPage(context, urls.graphUrl);

        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        await expect(app.promptTitle).toHaveText("FalkorDB Browser for macOS");
        await expect(app.promptDownload).toHaveAttribute("href", `${RELEASES}/FalkorDB-Browser-mac-arm64.dmg`);
        await expect(app.promptAlternate).toHaveText("Intel Mac? Get that version");
        await expect(app.promptAlternate).toHaveAttribute("href", `${RELEASES}/FalkorDB-Browser-mac-x64.dmg`);
    });

    test("macOS on an Intel Mac that says so: the Intel build first", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.mac, cpu: "x86" });
        const [, app] = await openPage(context, urls.graphUrl);

        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        await expect(app.promptDownload).toHaveAttribute("href", `${RELEASES}/FalkorDB-Browser-mac-x64.dmg`);
        await expect(app.promptAlternate).toHaveAttribute("href", `${RELEASES}/FalkorDB-Browser-mac-arm64.dmg`);
    });

    test("opens once per session, and never again after \"Don't show this again\"", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.linux });
        const [first, app] = await openPage(context, urls.graphUrl);

        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        await app.dismiss();
        await expect(app.prompt).toBeHidden();

        // Same tab, same session: it stays closed.
        await first.reload();
        await expectNoPrompt(app);

        // A new tab is a new session, and the popup was only put off.
        const [, secondTab] = await openPage(context, urls.graphUrl);
        await expect(secondTab.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        await secondTab.dismiss(true);

        // Ticked: no session brings it back.
        const [thirdPage, thirdTab] = await openPage(context, urls.graphUrl);
        await expectNoPrompt(thirdTab);
        // The help menu keeps the link for whoever changes their mind.
        await thirdPage.getByRole("button", { name: "Help" }).click();
        await expect(thirdTab.link).toHaveText("Download for Linux");
    });

    test("waits for What's New: the release's news first, then the download offer", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.windows, seenWhatsNew: false });
        // Stands in for GitHub: a release for the running version with a What's New section.
        await context.route(RELEASES_ROUTE, (route) => route.fulfill({
            json: {
                releases: [{
                    tag: `v${pkg.version}`,
                    name: `v${pkg.version}`,
                    publishedAt: "2026-10-01T00:00:00Z",
                    body: "## What's New\n- Something worth knowing",
                    url: "https://github.com/FalkorDB/falkordb-browser/releases",
                }],
            },
        }));
        const [page, app] = await openPage(context, urls.graphUrl);

        const whatsNew = page.getByTestId("whatsNewContent");
        await expect(whatsNew).toBeVisible({ timeout: OPENS_WITHIN });
        await app.waitForTimeout(STAYS_CLOSED_FOR);
        await expect(app.prompt).toBeHidden();

        await page.getByTestId("whatsNewGotIt").click();
        await expect(whatsNew).toBeHidden();
        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
    });

    test("downloading answers the question for good", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.windows });
        const [page, app] = await openPage(context, urls.graphUrl);

        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        const download = page.waitForEvent("download");
        await app.promptDownload.click();
        expect((await download).url()).toBe(`${RELEASES}/FalkorDB-Browser-win-x64.exe`);
        await expect(app.prompt).toBeHidden();

        const [, nextSession] = await openPage(context, urls.graphUrl);
        await expectNoPrompt(nextSession);
    });

    test("an installer downloads in place, and the page says what to do next", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.windows });
        const [page, app] = await openPage(context, urls.graphUrl);
        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        // No new tab: one would hold nothing but a blank page while the file downloads.
        await expect(app.promptDownload).not.toHaveAttribute("target", "_blank");

        const download = page.waitForEvent("download");
        await app.promptDownload.click();
        expect((await download).url()).toBe(`${RELEASES}/FalkorDB-Browser-win-x64.exe`);
        await expect(page).toHaveURL(/\/graph/);
        expect(context.pages()).toHaveLength(1);
        // The toast also copies its text into a screen-reader announcement; check the visible one.
        await expect(page.getByText("Downloading FalkorDB Browser").first()).toBeVisible();
        await expect(page.getByText(/More info → Run anyway/).first()).toBeVisible();
    });

    test("Android: the APK downloads in place with install steps; a store page opens in a new tab", async ({ browser }) => {
        const apk = "https://github.com/FalkorDB/falkordb-browser/releases/latest/download/FalkorDB-Browser-android.apk";
        context = await openVisitor(browser, { ua: UA.android, viewport: PHONE });
        await context.route(APP_LINKS_ROUTE, (route) => route.fulfill({ json: { android: apk } }));
        const [page, app] = await openPage(context, urls.graphUrl);
        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        const download = page.waitForEvent("download");
        await app.promptDownload.click();
        expect((await download).url()).toBe(apk);
        await expect(page.getByText(/open it from the notification/).first()).toBeVisible();
        await context.close();

        const store = "https://play.google.com/store/apps/details?id=com.falkordb.browser";
        context = await openVisitor(browser, { ua: UA.android, viewport: PHONE });
        await context.route(APP_LINKS_ROUTE, (route) => route.fulfill({ json: { android: store } }));
        const [, storeApp] = await openPage(context, urls.graphUrl);
        await expect(storeApp.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        await expect(storeApp.promptDownload).toHaveAttribute("target", "_blank");
        await expect(storeApp.promptDownload).toHaveAttribute("href", store);
    });

    test("is offered on the login page too, before anyone signs in", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.mac, signedIn: false, cpu: "arm" });
        const [, app] = await openPage(context, urls.loginUrl);

        await expect(app.link).toHaveText("Download for macOS");
        await expect(app.link).toHaveAttribute("href", `${RELEASES}/FalkorDB-Browser-mac-arm64.dmg`);
        // Intel Macs can still find their build without the popup.
        await expect(app.alternateLink).toHaveText("Intel Mac? Get that version");
        await expect(app.alternateLink).toHaveAttribute("href", `${RELEASES}/FalkorDB-Browser-mac-x64.dmg`);
        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
    });

    test("desktop: the help menu links to the installer", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.windows });
        const [page, app] = await openPage(context, urls.graphUrl);
        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        await app.dismiss(true);

        await page.getByRole("button", { name: "Help" }).click();
        await expect(app.link).toHaveText("Download for Windows");
        await expect(app.link).toHaveAttribute("href", `${RELEASES}/FalkorDB-Browser-win-x64.exe`);
        // A real menu item, so the arrow keys reach it like the others.
        await expect(app.link).toHaveAttribute("role", "menuitem");
    });

    test("macOS: the help menu offers both builds, each as a menu item", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.mac, cpu: "none" });
        const [page, app] = await openPage(context, urls.graphUrl);
        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        await app.dismiss(true);

        await page.getByRole("button", { name: "Help" }).click();
        await expect(app.link).toHaveAttribute("href", `${RELEASES}/FalkorDB-Browser-mac-arm64.dmg`);
        await expect(app.alternateLink).toHaveAttribute("href", `${RELEASES}/FalkorDB-Browser-mac-x64.dmg`);
        await expect(app.alternateLink).toHaveAttribute("role", "menuitem");
    });

    test("Android with no app link configured: no popup and no menu item", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.android, viewport: PHONE });
        const [page, app] = await openPage(context, urls.graphUrl);

        await expectNoPrompt(app);
        await page.getByTestId("mobileNavToggle").click();
        await expect(app.link).toHaveCount(0);
    });

    test("Android with an app link: the popup and the menu offer it", async ({ browser }) => {
        const apk = "https://github.com/FalkorDB/falkordb-browser/releases/latest/download/FalkorDB-Browser-android.apk";
        context = await openVisitor(browser, { ua: UA.android, viewport: PHONE });
        // ANDROID_APP_URL is an operator setting the server under test leaves unset.
        await context.route(APP_LINKS_ROUTE, (route) => route.fulfill({ json: { android: apk } }));
        const [page, app] = await openPage(context, urls.graphUrl);

        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        await expect(app.promptTitle).toHaveText("FalkorDB Browser for Android");
        await expect(app.promptDownload).toHaveAttribute("href", apk);
        await app.dismiss();

        await page.getByTestId("mobileNavToggle").click();
        await expect(app.link).toHaveText("Get the Android app");
        await expect(app.link).toHaveAttribute("href", apk);
    });

    test("iOS: offers Add to Home Screen until there is an App Store app", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.iphone, viewport: PHONE });
        const [, app] = await openPage(context, urls.graphUrl);

        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        await expect(app.promptTitle).toHaveText("Add FalkorDB Browser to your Home Screen");
        await expect(app.prompt).toContainText("Add to Home Screen");
        await expect(app.promptDownload).toHaveCount(0);
        await app.promptClose.click();
        await expect(app.prompt).toBeHidden();
    });

    test("iOS: an App Store link replaces the Home Screen steps", async ({ browser }) => {
        const store = "https://apps.apple.com/app/id0000000000";
        context = await openVisitor(browser, { ua: UA.iphone, viewport: PHONE });
        await context.route(APP_LINKS_ROUTE, (route) => route.fulfill({ json: { ios: store } }));
        const [, app] = await openPage(context, urls.graphUrl);

        await expect(app.prompt).toBeVisible({ timeout: OPENS_WITHIN });
        await expect(app.promptDownload).toHaveAttribute("href", store);
    });

    test("iOS: opened from the Home Screen, it is already the app", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.iphone, viewport: PHONE });
        // Safari's flag for a Home Screen launch.
        await context.addInitScript(() => Object.defineProperty(navigator, "standalone", { get: () => true }));
        const [, app] = await openPage(context, urls.graphUrl);

        await expectNoPrompt(app);
    });

    test("inside the desktop app: no popup and no download link", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.electron });
        const [page, app] = await openPage(context, urls.graphUrl);

        await expectNoPrompt(app);
        await page.getByRole("button", { name: "Help" }).click();
        await expect(app.link).toHaveCount(0);
    });

    test("inside the mobile app: no popup and no download link", async ({ browser }) => {
        context = await openVisitor(browser, { ua: UA.android, viewport: PHONE });
        await context.route(APP_LINKS_ROUTE, (route) => route.fulfill({ json: { android: "https://example.com/app.apk" } }));
        // Capacitor's bridge object, present only in the native shell.
        await context.addInitScript(() => Object.assign(window, { Capacitor: {} }));
        const [page, app] = await openPage(context, urls.graphUrl);

        await expectNoPrompt(app);
        await page.getByTestId("mobileNavToggle").click();
        await expect(app.link).toHaveCount(0);
    });
});
