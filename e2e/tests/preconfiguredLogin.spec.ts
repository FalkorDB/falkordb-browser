import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import LoginPage from "../logic/POM/loginPage";

const DISCOVERY_ROUTE = "**/api/connections/preconfigured";
// next-auth appends the authorization params to the callback, so the pattern
// has to survive the empty "?" it leaves behind on a plain credentials sign-in.
const SIGN_IN_ROUTE = "**/api/auth/callback/credentials*";
const SESSION_ROUTE = "**/api/auth/session";

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

    test("carries a successful automatic login through to the graph", async ({ page }) => {
        // The server under test has no preconfigured connection, so the real
        // callback can only refuse — standing in for it is the only way to
        // reach the branch that redirects. `signedIn` flips with it because
        // next-auth re-reads the session before signIn() resolves, and the
        // page would otherwise be bounced straight back here.
        let signedIn = false;

        await page.route(DISCOVERY_ROUTE, (route) =>
            route.fulfill({
                json: { configured: true, autoConnect: true, host: "localhost", port: 6379, tls: false },
            })
        );
        await page.route(SESSION_ROUTE, (route) =>
            route.fulfill({
                json: signedIn
                    ? {
                          user: {
                              id: "preconfigured",
                              role: "Admin",
                              host: "localhost",
                              port: 6379,
                              tls: false,
                              url: "falkor://localhost:6379",
                          },
                          expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                      }
                    : null,
            })
        );
        await page.route(SIGN_IN_ROUTE, (route) => {
            signedIn = true;
            // What the next-auth client reads as success: a url it can parse
            // that carries no "error" query param.
            return route.fulfill({ json: { url: urls.graphUrl } });
        });

        const loginPage = new LoginPage(page);
        await page.goto(urls.loginUrl);

        await expect(page).toHaveURL(/\/graph/);
        await expect(loginPage.autoConnectError).toBeHidden();
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
