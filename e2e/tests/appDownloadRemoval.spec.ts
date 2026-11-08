import { expect, test } from "../infra/coverage";
import urls from "../config/urls.json";

const RELEASE_ASSET = "https://github.com/FalkorDB/falkordb-browser/releases/download/v2.7.4/FalkorDB-Browser-mac-arm64.dmg";
const RELEASE_URL = "https://github.com/FalkorDB/falkordb-browser/releases/tag/v2.7.4";

test.describe("@admin App download removal", () => {
    test("desktop app downloads remain available only in release notes", async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem("whatsNewSeen", "v999.0.0"));
        await page.route("**/api/releases", (route) => route.fulfill({
            json: {
                releases: [{
                    tag: "v2.7.4",
                    name: "v2.7.4",
                    publishedAt: "2026-11-05T00:00:00Z",
                    body: `## Downloads\n[macOS](${RELEASE_ASSET})`,
                    url: RELEASE_URL,
                }],
            },
        }));

        await page.goto(urls.graphUrl);
        await page.waitForTimeout(2000);
        await expect(page.getByTestId("appDownloadPrompt")).toHaveCount(0);

        await page.getByRole("button", { name: "Help" }).click();
        await expect(page.getByTestId("appDownload")).toHaveCount(0);
        await expect(page.getByTestId("appDownloadAlternate")).toHaveCount(0);
        await page.getByTestId("releasesButton").click();

        const release = page.getByTestId("releaseNotes-v2.7.4");
        await expect(release.getByRole("link", { name: "macOS" })).toHaveAttribute("href", RELEASE_ASSET);
    });

    test("app download API endpoints are no longer available", async ({ request }) => {
        for (const path of ["/api/app-links", "/api/app-download/android"]) {
            const response = await request.get(`${urls.localHost}${path}`);
            expect(response.status(), `${path} should not expose an app download`).toBe(404);
        }
    });

    test("the login page has no app download link", async ({ browser }) => {
        const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        try {
            const page = await context.newPage();
            await page.goto(urls.loginUrl);
            await page.waitForTimeout(2000);
            await expect(page.getByTestId("appDownload")).toHaveCount(0);
            await expect(page.getByTestId("appDownloadPrompt")).toHaveCount(0);
        } finally {
            await context.close();
        }
    });

    test("the mobile navigation drawer has no app download link", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(urls.graphUrl);
        await page.waitForTimeout(2000);
        await page.getByTestId("mobileNavToggle").click();

        await expect(page.getByTestId("appDownload")).toHaveCount(0);
        await expect(page.getByTestId("mobileReleasesButton")).toBeVisible();
    });
});
