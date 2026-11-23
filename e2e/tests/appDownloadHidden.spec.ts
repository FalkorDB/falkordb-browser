import { Page } from "playwright";
import { expect, test } from "../infra/coverage";
import urls from "../config/urls.json";
import AppDownloadRemovalPage from "../logic/POM/appDownloadRemovalPage";
import HeaderComponent from "../logic/POM/headerComponent";
import LoginPage from "../logic/POM/loginPage";
import MobileGraphPage from "../logic/POM/mobileGraphPage";

/**
 * The browser does not offer the desktop or phone apps directly (#2210): no
 * popup, no login-page link, no menu item. Installers are reached only through
 * the GitHub release linked from the release notes.
 */

const RELEASE_URL = "https://github.com/FalkorDB/falkordb-browser/releases/tag/v2.7.4";
const RELEASE = { tag: "v2.7.4", name: "v2.7.4", publishedAt: "2026-11-05T00:00:00Z", body: "Bug fixes and improvements.", url: RELEASE_URL };

const UA = {
    mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
};

// The hidden popup used to open 1.5 seconds after the page settled.
const FORMER_PROMPT_DELAY_MS = 2000;

/** A returning visitor whose browser has never dismissed the app popup. */
async function prepare(page: Page, releases: (typeof RELEASE)[] = []): Promise<void> {
    await page.clock.install();
    await page.addInitScript(() => {
        localStorage.setItem("whatsNewSeen", "v999.0.0");
        localStorage.setItem("tutorial", "false");
        localStorage.removeItem("appDownloadPrompt");
        sessionStorage.removeItem("appDownloadPromptShown");
    });
    await page.route("**/api/releases", (route) => route.fulfill({ json: { releases } }));
}

test.describe("@admin App download hidden", () => {
    test("the removed app download endpoints return 404", async ({ request }) => {
        const links = await request.get(`${urls.localHost}/api/app-links`);
        expect(links.status()).toBe(404);
        const android = await request.get(`${urls.localHost}/api/app-download/android`, { maxRedirects: 0 });
        expect(android.status()).toBe(404);
    });

    test("the release notes link to the GitHub release", async ({ page }) => {
        await prepare(page, [RELEASE]);
        const header = new HeaderComponent(page);
        const downloads = new AppDownloadRemovalPage(page);
        await page.goto(urls.graphUrl);
        await header.clickOnHelpBtn();
        await header.releasesButton.click();

        await expect(downloads.releaseLink(RELEASE.tag, RELEASE.name)).toHaveAttribute("href", RELEASE_URL);
    });

    for (const [os, ua] of [["macOS", UA.mac], ["Windows", UA.windows], ["Linux", UA.linux]] as const) {
        test.describe(os, () => {
            test.use({ userAgent: ua });

            test("no download popup and no download item in the help menu", async ({ page }) => {
                await prepare(page);
                const header = new HeaderComponent(page);
                const downloads = new AppDownloadRemovalPage(page);
                await page.goto(urls.graphUrl);
                await header.clickOnHelpBtn();

                await expect(header.releasesButton).toBeVisible();
                await expect(downloads.downloadLink).toHaveCount(0);
                await expect(downloads.alternateDownloadLink).toHaveCount(0);
                await page.clock.runFor(FORMER_PROMPT_DELAY_MS);
                await expect(downloads.prompt).toHaveCount(0);
            });
        });
    }

    test.describe("login page", () => {
        test.use({ userAgent: UA.mac, storageState: { cookies: [], origins: [] } });

        test("no download link and no popup before signing in", async ({ page }) => {
            await prepare(page);
            const login = new LoginPage(page);
            const downloads = new AppDownloadRemovalPage(page);
            await page.goto(urls.loginUrl);

            await expect(login.logInButton).toBeVisible();
            await expect(downloads.downloadLink).toHaveCount(0);
            await expect(downloads.alternateDownloadLink).toHaveCount(0);
            await page.clock.runFor(FORMER_PROMPT_DELAY_MS);
            await expect(downloads.prompt).toHaveCount(0);
        });
    });

    test.describe("mobile", () => {
        test.use({ userAgent: UA.iphone, viewport: { width: 390, height: 844 } });

        test("no Home Screen popup and no download item in the navigation drawer", async ({ page }) => {
            await prepare(page);
            const graph = new MobileGraphPage(page);
            const downloads = new AppDownloadRemovalPage(page);
            await page.goto(urls.graphUrl);
            await graph.navToggle.click();

            await expect(graph.releasesButton).toBeVisible();
            await expect(downloads.downloadLink).toHaveCount(0);
            await page.clock.runFor(FORMER_PROMPT_DELAY_MS);
            await expect(downloads.prompt).toHaveCount(0);
        });
    });
});
