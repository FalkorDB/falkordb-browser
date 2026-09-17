import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import LoginPage from "../logic/POM/loginPage";

const DISCOVERY_ROUTE = "**/api/connections/preconfigured";
const SIGN_IN_ROUTE = "**/api/auth/callback/credentials";

// The preconfigured connection is an operator-side environment setting, so the
// server under test has none. Mocking the discovery endpoint is what lets the
// suite drive every branch of the login page from a single deployment.
test.describe("@admin Preconfigured connection", () => {
    // The login page only renders itself for a visitor without a session; the
    // project's admin storage state would redirect straight to /graph.
    test.use({ storageState: { cookies: [], origins: [] } });

    test("signs in automatically and reports a connection it cannot reach", async ({ page }) => {
        await page.route(DISCOVERY_ROUTE, (route) =>
            route.fulfill({
                json: { configured: true, autoConnect: true, host: "localhost", port: 6379, tls: false },
            })
        );

        const loginPage = new LoginPage(page);
        await page.goto(urls.loginUrl);

        // The server has no preconfigured connection, so the attempt is
        // refused — which is exactly what proves the attempt was made.
        await expect(loginPage.autoConnectError).toBeVisible();
        // The failure hands the visitor back to the manual form.
        await expect(loginPage.logInButton).toBeVisible();
    });

    test("an explicit sign-out is not undone by the automatic login", async ({ page }) => {
        let signInAttempts = 0;

        await page.route(DISCOVERY_ROUTE, (route) =>
            route.fulfill({ json: { configured: true, autoConnect: true, host: "localhost", port: 6379 } })
        );
        await page.route(SIGN_IN_ROUTE, (route) => {
            signInAttempts += 1;
            return route.continue();
        });

        const loginPage = new LoginPage(page);
        await page.goto(`${urls.loginUrl}?signedOut=true`);

        await expect(loginPage.logInButton).toBeVisible();
        await expect(loginPage.autoConnecting).toBeHidden();
        await expect(loginPage.autoConnectError).toBeHidden();
        expect(signInAttempts).toBe(0);
    });

    test("prefills the form without signing in when auto connect is off", async ({ page }) => {
        let signInAttempts = 0;

        await page.route(DISCOVERY_ROUTE, (route) =>
            route.fulfill({
                json: {
                    configured: true,
                    autoConnect: false,
                    host: "preconfigured.example",
                    port: 6380,
                    username: "alice",
                    tls: false,
                },
            })
        );
        await page.route(SIGN_IN_ROUTE, (route) => {
            signInAttempts += 1;
            return route.continue();
        });

        const loginPage = new LoginPage(page);
        await page.goto(urls.loginUrl);

        await expect(loginPage.hostField).toHaveValue("preconfigured.example");
        await expect(loginPage.portField).toHaveValue("6380");
        await expect(loginPage.usernameField).toHaveValue("alice");
        expect(signInAttempts).toBe(0);
    });

    test("reports a broken preconfigured environment instead of hiding it", async ({ page }) => {
        await page.route(DISCOVERY_ROUTE, (route) =>
            route.fulfill({
                status: 500,
                json: { message: "The preconfigured connection environment is invalid. Check the server logs." },
            })
        );

        const loginPage = new LoginPage(page);
        await page.goto(urls.loginUrl);

        await expect(loginPage.preconfiguredError).toContainText("invalid");
        // A misconfigured environment still leaves a usable manual login.
        await expect(loginPage.logInButton).toBeVisible();
    });
});
