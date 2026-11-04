import test, { expect } from "@playwright/test";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import { userRoles, user } from '../config/user.json';
import { urlPath } from "../infra/utils";

for (const scenario of [
    { code: "credentials_required", message: "This database requires credentials.", showCredentials: true },
    { code: "invalid_credentials", message: "Invalid credentials.", showCredentials: true },
    { code: "connection_failed", message: "Could not connect to the database.", showCredentials: false },
]) {
    test(`@admin URL login handles ${scenario.code} without a separate probe`, async ({ page }) => {
        await page.route("**/api/connections/preconfigured", route => route.fulfill({
            json: { configured: false, autoConnect: false },
        }));
        await page.route("**/api/auth/session", route => route.fulfill({ json: null }));
        await page.route("**/api/auth/providers", route => route.fulfill({
            json: { credentials: { id: "credentials", type: "credentials" } },
        }));
        await page.route("**/api/auth/csrf", route => route.fulfill({ json: { csrfToken: "test-csrf" } }));
        const attempts: URLSearchParams[] = [];
        await page.route("**/api/auth/callback/credentials**", route => {
            attempts.push(new URLSearchParams(route.request().postData() ?? ""));
            return route.fulfill({
                json: { url: `${urls.loginUrl}?error=CredentialsSignin&code=${scenario.code}` },
            });
        });
        let probes = 0;
        await page.route("**/api/validate-url", route => {
            probes += 1;
            return route.fulfill({ status: 410 });
        });

        await page.goto(`${urls.loginUrl}?signedOut=true`);
        await page.getByRole("radio", { name: "FalkorDB URL", exact: true }).click();
        await page.locator('input[id="FalkorDB URL"]').fill("falkors://database.example:6380");
        await page.getByRole("button", { name: "Log in", exact: true }).click();
        await expect(page.getByText(scenario.message, { exact: false })).toBeVisible();
        expect(attempts).toHaveLength(1);
        expect(attempts[0].get("host")).toBe("database.example");
        expect(attempts[0].get("port")).toBe("6380");
        expect(attempts[0].get("tls")).toBe("true");
        if (scenario.showCredentials) {
            await expect(page.locator('input[id="Password"]')).toBeVisible();
            await page.locator('input[id="Username"]').fill("alice");
            await page.locator('input[id="Password"]').fill("test-password");
            await page.getByRole("button", { name: "Log in", exact: true }).click();
            await expect.poll(() => attempts.length).toBe(2);
            expect(attempts[1].get("username")).toBe("alice");
            expect(attempts[1].get("password")).toBe("test-password");
            expect(attempts[1].get("host")).toBe("database.example");
            expect(attempts[1].get("tls")).toBe("true");
        } else {
            await expect(page.locator('input[id="FalkorDB URL"]')).toBeVisible();
        }
        expect(probes).toBe(0);
    });
}

test.describe(`Login tests`, () => {
    let browser: BrowserWrapper;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test(`@admin validate login as default user without credentials`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.disconnectConnection();
        await browser.setPageToFullScreen();
        await login.clickOnConnect();
        // clickOnConnect waits for the normalized path; poll the exact URL so a
        // transient trailing-slash/param during navigation doesn't flake the check.
        await expect.poll(() => urlPath(login.getCurrentURL()), { timeout: 10000 }).toBe(urlPath(urls.graphUrl));
    });

    test(`@admin validate user login with credentials`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.disconnectConnection();
        await browser.setPageToFullScreen();
        await login.connectWithCredentials("readonlyuser", user.password);
        await login.waitForUrl(urls.graphUrl);
        expect(urlPath(login.getCurrentURL())).toBe(urlPath(urls.graphUrl));
    });

    const invalidInputs = [
        { description: 'invalid host', host: 'localhostt', port: '6379', username: userRoles[1].name, password: user.password },
        { description: 'invalid port', host: 'localhost', port: '6378', username: userRoles[1].name, password: user.password },
        { description: 'invalid username', host: 'localhost', port: '6379', username: "user1", password: user.password },
        { description: 'invalid password', host: 'localhost', port: '6379', username: userRoles[1].name, password: "password1!" },
    ];

    invalidInputs.forEach(({ description, host, port, username, password }) => {
        test(`@admin validate user login with wrong credentials: ${description}`, async () => {
            const login = await browser.createNewPage(LoginPage, urls.loginUrl);
            await login.disconnectConnection();
            await browser.setPageToFullScreen();
            await login.connectWithCredentials(username, password, host, port);
            await new Promise((res) => { setTimeout(res, 500); });
            expect(urlPath(login.getCurrentURL())).not.toBe(urlPath(urls.graphUrl));
        });
    });

    test(`@admin validate login with FalkorDB URL - default user`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.disconnectConnection();
        await browser.setPageToFullScreen();
        await login.connectWithUrl("falkor://localhost:6379");
        await login.waitForSuccessfulLogin(urls.graphUrl);
        expect(urlPath(login.getCurrentURL())).toBe(urlPath(urls.graphUrl));
    });

    test(`@admin validate login with FalkorDB URL - with credentials`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.disconnectConnection();
        await browser.setPageToFullScreen();
        await login.connectWithUrl(`falkor://readonlyuser:${encodeURIComponent(user.password)}@localhost:6379`);
        await login.waitForSuccessfulLogin(urls.graphUrl);
        expect(urlPath(login.getCurrentURL())).toBe(urlPath(urls.graphUrl));
    });

    test(`@admin validate toggle between manual and URL modes`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.disconnectConnection();
        await browser.setPageToFullScreen();
        
        // Verify manual mode is selected by default
        expect(await login.isManualModeSelected()).toBe(true);
        
        // Switch to URL mode
        await login.clickUrlMode();
        expect(await login.isUrlModeSelected()).toBe(true);
        
        // Switch back to manual mode
        await login.clickManualMode();
        expect(await login.isManualModeSelected()).toBe(true);
    });

    // URL format validation tests (pre-submit, no network request)
    const formatErrors = [
        { description: 'missing @ with credentials', url: 'redis://falkordb:password.cloud:52649' },
        { description: 'empty credentials with @', url: 'redis://@localhost:6379' },
        { description: 'colon before @ but no password', url: 'redis://user:@localhost:6379' },
        { description: 'colon after host but no port', url: 'redis://user:pass@localhost:' },
    ];

    formatErrors.forEach(({ description, url }) => {
        test(`@admin validate URL format error blocks submit: ${description}`, async () => {
            const login = await browser.createNewPage(LoginPage, urls.loginUrl);
            await login.disconnectConnection();
            await browser.setPageToFullScreen();
            await login.submitUrlWithoutWait(url);
            expect(await login.isFormatErrorVisible()).toBe(true);
            // Should NOT navigate — blocked before request
            expect(urlPath(login.getCurrentURL())).not.toBe(urlPath(urls.graphUrl));
        });
    });

    test(`@admin validate valid URL format does not show format error`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.disconnectConnection();
        await browser.setPageToFullScreen();
        await login.submitUrlWithoutWait('falkor://wronguser:wrongpass@localhost:6379');
        // Format is valid, so format error should NOT appear (credentials error may appear instead)
        expect(await login.isFormatErrorVisible()).toBe(false);
    });
});