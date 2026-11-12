import { type Request } from "@playwright/test";
import { test, expect } from "../infra/coverage";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import { userRoles, user } from '../config/user.json';
import { urlPath } from "../infra/utils";

test.describe("@admin Login connection details", () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    let login: LoginPage;

    const callback = "**/api/auth/callback/credentials*";
    const connectionError = "Invalid credentials please recheck username and password or your connection settings. Check server logs for more info.";
    const credentials = (request: Request) => {
        const body = request.postData();
        if (body === null) throw new Error("Sign-in request has no body");
        return new URLSearchParams(body);
    };

    test.beforeEach(async ({ page }) => {
        login = new LoginPage(page);
        await page.addInitScript(() => {
            localStorage.setItem("appDownloadPrompt", "false");
            localStorage.setItem("whatsNewSeen", "v999.0.0");
        });
        await page.route("**/api/connections/preconfigured", route =>
            route.fulfill({ json: { configured: false } }));
        // Exercise the real form/signIn client without needing a database or
        // creating sessions that could affect parallel login tests.
        await page.route(callback, route =>
            route.fulfill({ json: { url: `${urls.loginUrl}?error=CredentialsSignin` } }));
        await page.goto(urls.loginUrl);
        await expect(login.portField).toBeVisible();
    });

    test("uses default connection settings and clears a rejected login after editing", async ({ page }) => {
        const request = page.waitForRequest(callback);
        await login.clickConnect();
        const body = credentials(await request);
        expect(body.get("host")).toBe("localhost");
        expect(body.get("port")).toBe("6379");
        expect(body.get("tls")).toBe("false");
        expect(body.has("username")).toBe(false);
        expect(body.has("password")).toBe(false);
        await expect(login.validationMessage(connectionError)).toBeVisible();
        await login.fillHost("corrected.example");
        await expect(login.validationMessage(connectionError)).toBeHidden();
    });

    test("round-trips escaped credentials and TLS between manual and URL modes", async () => {
        await login.fillHost("db.example");
        await login.fillPort("6380");
        await login.fillUsername("user:name%@");
        await login.fillPassword("p@ss:/%");
        await login.setTlsEnabled(true);
        await login.clickUrlMode();
        const url = login.falkordbUrlInput;
        await expect(url).toHaveValue("falkors://user%3Aname%25%40:p%40ss%3A%2F%25@db.example:6380");

        await login.fillFalkorDBUrl("rediss://other%25:next%40password@other.example:6381");
        await login.clickManualMode();
        await expect(login.hostField).toHaveValue("other.example");
        await expect(login.portField).toHaveValue("6381");
        await expect(login.usernameField).toHaveValue("other%");
        await expect(login.passwordInput).toHaveValue("next@password");
        await expect(login.tlsCheckbox).toBeChecked();
        await login.setTlsEnabled(false);
        await login.clickUrlMode();
        await expect(url).toHaveValue("falkor://other%25:next%40password@other.example:6381");
    });

    test("submits decoded URL credentials after URL validation", async ({ page }) => {
        await page.route("**/api/validate-url", route => route.fulfill({ json: { result: false } }));
        await login.clickUrlMode();
        await login.fillFalkorDBUrl("rediss://user%25:pass%40word@db.example:6380");
        const validated = page.waitForRequest("**/api/validate-url");
        const signedIn = page.waitForRequest(callback);
        await login.clickConnect();
        expect((await validated).postDataJSON()).toEqual({ url: "rediss://user%25:pass%40word@db.example:6380" });
        const body = credentials(await signedIn);
        expect(Object.fromEntries(["host", "port", "username", "password", "tls"].map(key => [key, body.get(key)]))).toEqual({
            host: "db.example", port: "6380", username: "user%", password: "pass@word", tls: "true",
        });
        await expect(login.validationMessage(connectionError)).toBeVisible();
    });

    for (const { title, kind, name, error } of [
        {
            title: "Upload Client Certificate", kind: "cert", name: "client.crt",
            error: "Upload the client private key to use this client certificate.",
        },
        {
            title: "Upload Client Key", kind: "key", name: "client.key",
            error: "Upload the client certificate that matches this private key.",
        },
    ] as const) {
        test(`blocks an incomplete mTLS pair after ${title}`, async ({ page }) => {
            await page.waitForLoadState("networkidle");
            const requests: string[] = [];
            page.on("request", request => {
                if (new URL(request.url()).pathname.startsWith("/api/auth/")) requests.push(request.url());
            });
            await login.setTlsEnabled(true);
            await login.attachTlsFile(kind, name, "synthetic TLS upload");
            await expect(login.tlsAttachment(kind).status).toContainText(name);
            await login.clickConnect();
            await expect(login.validationMessage(error)).toBeVisible();
            await page.waitForLoadState("networkidle");
            await login.removeTlsAttachment(kind);
            await expect(login.tlsAttachment(kind).status).toBeHidden();
            await expect(login.validationMessage(error)).toBeHidden();
            await expect(login.tlsAttachment(kind).prompt).toBeVisible();
            await page.waitForLoadState("networkidle");
            expect(requests).toEqual([]);
        });
    }

    test("sends uploaded TLS bytes and clears every attachment when TLS is disabled", async ({ page }) => {
        await login.setTlsEnabled(true);
        const files = [
            { name: "ca.crt", contents: "synthetic CA", field: "ca" },
            { name: "client.crt", contents: "synthetic certificate", field: "cert" },
            { name: "client.key", contents: "synthetic key", field: "key" },
        ] as const;
        for (const file of files) {
            await login.attachTlsFile(file.field, file.name, file.contents);
            await expect(login.tlsAttachment(file.field).status).toContainText(file.name);
        }
        const first = page.waitForRequest(callback);
        await login.clickConnect();
        const body = credentials(await first);
        for (const file of files) expect(body.get(file.field)).toBe(Buffer.from(file.contents).toString("base64"));
        await expect(login.validationMessage(connectionError)).toBeVisible();
        await login.setTlsEnabled(false);
        await expect(login.tlsSection).toBeHidden();
        await expect(login.validationMessage(connectionError)).toBeHidden();
        await login.setTlsEnabled(true);
        for (const file of files) {
            await expect(login.tlsAttachment(file.field).status).toBeHidden();
            await expect(login.tlsAttachment(file.field).prompt).toBeVisible();
        }
        const second = page.waitForRequest(callback);
        await login.clickConnect();
        const cleared = credentials(await second);
        for (const file of files) expect(cleared.get(file.field)).toBe("undefined");
        await expect(login.validationMessage(connectionError)).toBeVisible();
    });

    test("reports an unreadable certificate and allows the upload to be retried", async ({ page }) => {
        await page.evaluate(() => {
            const original = FileReader.prototype.readAsDataURL;
            FileReader.prototype.readAsDataURL = function readOnce() {
                FileReader.prototype.readAsDataURL = original;
                this.dispatchEvent(new ProgressEvent("error"));
            };
        });
        await login.setTlsEnabled(true);
        await login.attachTlsFile("ca", "unreadable.crt", "synthetic CA");
        await expect(login.validationMessage("Could not read unreadable.crt")).toBeVisible();
        await expect(login.tlsAttachment("ca").status).toBeHidden();
        await login.attachTlsFile("ca", "readable.crt", "synthetic CA");
        await expect(login.tlsAttachment("ca").status).toContainText("readable.crt");
        await expect(login.validationMessage("Could not read unreadable.crt")).toBeHidden();
    });
});

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