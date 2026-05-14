import test, { expect } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";

/**
 * Smoke system tests that run against the dockerized stack: the locally-built
 * FalkorDB Browser image (built from this repo's Dockerfile in CI) plus a
 * FalkorDB "core" image. They are intentionally minimal and only assert that
 * the two containers are alive and able to talk to each other through the UI
 * happy-path:
 *   1. The Browser container serves the login page.
 *   2. The Browser container can connect to the FalkorDB core container with
 *      the default credentials and redirect the user to the graph page.
 *
 * Run with:
 *   npx playwright test --project="[Smoke] - Chromium"
 *
 * The smoke-docker GitHub Actions workflow builds the browser image from the
 * local Dockerfile (not the published falkordb/falkordb-browser image) and
 * runs these tests against that build alongside falkordb/falkordb:latest.
 */
test.describe("@smoke smoke tests against dockers", () => {
    let browser: BrowserWrapper;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test("browser container serves the login page", async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();
        expect(login.getCurrentURL()).toContain("/login");
    });

    test("browser container connects to FalkorDB core container", async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await browser.setPageToFullScreen();
        await login.clickOnConnect();
        expect(login.getCurrentURL()).toBe(urls.graphUrl);
    });
});
