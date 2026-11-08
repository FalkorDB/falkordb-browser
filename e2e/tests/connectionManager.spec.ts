import { expect, test } from "../infra/coverage";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ConnectionManagerComponent from "../logic/POM/connectionManagerComponent";
import urls from "../config/urls.json";
import LoginPage from "../logic/POM/loginPage";
import { initializeLocalStorage } from "../infra/utils";
import { user } from "../config/user.json";

test.describe("Connection Manager Tests", () => {
  let browser: BrowserWrapper;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
  });

  test.describe("@admin Connection lifecycle", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.addInitScript(initializeLocalStorage("localhost", 6379));
      const login = new LoginPage(page);
      await page.goto(urls.loginUrl);
      await login.clickOnConnect();
      await login.handleSkipTutorial();
      await page.getByTestId("connections-dropdown-trigger").click();
      await page.getByRole("menuitem", { name: "Add Connection" }).click();
      const dialog = page.getByRole("dialog");
      await dialog.locator("#Username").fill("readwriteuser");
      await dialog.locator("#Password").fill(user.password);
      await dialog.getByRole("button", { name: "Add Connection", exact: true }).click();
      await expect(dialog).toBeHidden();
    });

    test("adding switches roles and removing an inactive connection preserves the active one", async ({ page }) => {
      await page.getByTestId("connections-dropdown-trigger").click();
      const secondary = page.getByTestId(/^connection-item-/).filter({ hasText: "readwriteuser@" });
      const primary = page.getByTestId(/^connection-item-/).filter({ hasText: "default@" });
      const primaryId = (await primary.getAttribute("data-testid"))?.replace("connection-item-", "");
      expect(primaryId).toBeTruthy();
      await expect(secondary.locator("svg.text-primary")).toHaveCount(1);
      await expect(secondary).toContainText("Read-Write");
      const session = await page.request.get(new URL("/api/auth/session", page.url()).href);
      expect(session.ok()).toBe(true);
      expect((await session.json()).user.role).toBe("Read-Write");
      const sessionUpdate = page.waitForResponse((response) =>
        new URL(response.url()).pathname === "/api/auth/session" && response.request().method() === "POST");
      await primary.click();
      const updatedSession = await sessionUpdate;
      expect(updatedSession.ok()).toBe(true);
      expect(await updatedSession.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await expect.poll(() => page.evaluate(() => localStorage.getItem("lastActiveConnectionId"))).toBe(primaryId);
      const persistedSession = page.waitForResponse((response) =>
        new URL(response.url()).pathname === "/api/auth/session" && response.request().method() === "POST");
      await page.reload();
      const persisted = await persistedSession;
      expect(persisted.ok()).toBe(true);
      expect(await persisted.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await page.getByTestId("connections-dropdown-trigger").click();
      await expect(page.getByTestId(/^connection-item-/)).toHaveCount(2);
      await expect(primary.locator("svg.text-primary")).toHaveCount(1);
      await expect(secondary).toContainText("Read-Write");
      await secondary.getByRole("button", { name: /Sign out of connection/ }).click();
      await expect(page.getByTestId("connectionLogoutDialog")).toContainText("other connections will remain active");
      await page.getByTestId("connectionLogoutConfirm").click();
      await expect(page.getByTestId("connectionLogoutDialog")).toBeHidden();
      await expect(page.getByTestId(/^connection-item-/)).toHaveCount(1);
      await expect(primary.locator("svg.text-primary")).toHaveCount(1);
      await page.keyboard.press("Escape");
      const restoredSession = page.waitForResponse((response) =>
        new URL(response.url()).pathname === "/api/auth/session" && response.request().method() === "POST");
      await page.reload();
      const restored = await restoredSession;
      expect(restored.ok()).toBe(true);
      expect(await restored.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await page.getByTestId("connections-dropdown-trigger").click();
      await expect(page.getByTestId(/^connection-item-/)).toHaveCount(1);
      await expect(primary).toContainText("Admin");
    });

    test("failed removal retains both connections and retry switches to the remaining one", async ({ page }) => {
      let attempts = 0;
      await page.route("**/api/connections/*", async (route) => {
        if (route.request().method() !== "DELETE") {
          await route.continue();
          return;
        }
        attempts += 1;
        if (attempts === 1) {
          await route.fulfill({ status: 400, json: { message: "Invalid input: connection removal rejected" } });
        } else {
          await route.continue();
        }
      });
      await page.getByTestId("connections-dropdown-trigger").click();
      const secondary = page.getByTestId(/^connection-item-/).filter({ hasText: "readwriteuser@" });
      await secondary.getByRole("button", { name: /Sign out of connection/ }).click();
      await page.getByTestId("connectionLogoutConfirm").click();
      await expect(page.getByTestId("connectionLogoutDialog")).toBeHidden();
      await expect(page.getByText("Failed to remove connection", { exact: true })).toBeVisible();
      await expect(page.getByTestId(/^connection-item-/)).toHaveCount(2);
      await expect(secondary.locator("svg.text-primary")).toHaveCount(1);
      await secondary.getByRole("button", { name: /Sign out of connection/ }).click();
      await page.getByTestId("connectionLogoutConfirm").click();
      await expect(page.getByTestId("connectionLogoutDialog")).toBeHidden();
      await expect(page.getByTestId(/^connection-item-/)).toHaveCount(1);
      const primary = page.getByTestId(/^connection-item-/).filter({ hasText: "default@" });
      await expect(primary.locator("svg.text-primary")).toHaveCount(1);
      const primaryId = (await primary.getAttribute("data-testid"))?.replace("connection-item-", "");
      expect(primaryId).toBeTruthy();
      const session = await page.request.get(new URL("/api/auth/session", page.url()).href);
      expect(session.ok()).toBe(true);
      expect(await session.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      expect(attempts).toBe(2);
    });
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@admin Verify connections dropdown is visible on graph page`, async () => {
    const connManager = await browser.createNewPage(ConnectionManagerComponent, urls.graphUrl);
    expect(await connManager.isTriggerVisible()).toBe(true);
  });

  test(`@admin Verify connections dropdown shows at least one connection`, async () => {
    const connManager = await browser.createNewPage(ConnectionManagerComponent, urls.graphUrl);
    const count = await connManager.getConnectionCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test(`@admin Verify active connection is marked in dropdown`, async () => {
    const connManager = await browser.createNewPage(ConnectionManagerComponent, urls.graphUrl);
    await connManager.openDropdown();
    expect(await connManager.hasActiveConnection()).toBe(true);
  });

  test(`@admin Verify connection labels contain host and port info`, async () => {
    const connManager = await browser.createNewPage(ConnectionManagerComponent, urls.graphUrl);
    const labels = await connManager.getConnectionLabels();
    expect(labels.length).toBeGreaterThanOrEqual(1);
    // Each label should match format: username@host:port
    for (const label of labels) {
      expect(label).toMatch(/@.*:\d+/);
    }
  });

  test("@admin cancelling last-connection logout preserves the session", async () => {
    const manager = await browser.createNewPage(ConnectionManagerComponent, urls.graphUrl);
    const page = await browser.getPage();
    let signOutRequests = 0;
    await page.route("**/api/auth/signout", async (route) => {
      signOutRequests += 1;
      await route.fulfill({ json: { url: urls.loginUrl } });
    });
    await manager.openDropdown();
    await page.getByTestId(/^connection-logout-/).first().click();
    await expect(page.getByTestId("connectionLogoutDialog")).toContainText("only connection");
    await page.getByTestId("connectionLogoutCancel").click();
    await expect(page.getByTestId("connectionLogoutDialog")).toBeHidden();
    await expect(page).toHaveURL(/\/graph/);
    expect(signOutRequests).toBe(0);
    await expect(page.getByTestId(/^connection-item-/)).toHaveCount(1);
  });

  test.describe("Rejected additional connections", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("@admin a rejected additional connection keeps the form editable for retry", async ({ page }) => {
      await page.addInitScript(initializeLocalStorage("localhost", 6379));
      const login = new LoginPage(page);
      await page.goto(urls.loginUrl);
      await login.clickOnConnect();
      await login.handleSkipTutorial();
      const manager = new ConnectionManagerComponent(page);
      const attempts: Record<string, unknown>[] = [];
      await page.route("**/api/connections", async (route) => {
        if (route.request().method() !== "POST") {
          await route.continue();
          return;
        }
        attempts.push(route.request().postDataJSON());
        if (attempts.length === 1) {
          await route.fulfill({ status: 400, json: { message: "Authentication failed: wrong password." } });
        } else {
          await route.continue();
        }
      });
      await manager.openDropdown();
      await page.getByRole("menuitem", { name: "Add Connection" }).click();
      const dialog = page.getByRole("dialog");
      await dialog.locator("#Username").fill("readwriteuser");
      await dialog.locator("#Password").fill("first-attempt");
      await dialog.getByRole("button", { name: "Add Connection", exact: true }).click();
      await expect(dialog.getByRole("button", { name: "Add Connection", exact: true })).toBeDisabled();
      await expect(page.getByText("Authentication failed: wrong password.", { exact: true })).toBeVisible();
      await dialog.locator("#Password").fill(user.password);
      await expect(dialog.getByRole("button", { name: "Add Connection", exact: true })).toBeEnabled();
      await dialog.getByRole("button", { name: "Add Connection", exact: true }).click();
      await expect.poll(() => attempts.length).toBe(2);
      expect(attempts.map(({ password }) => password)).toEqual(["first-attempt", user.password]);
      await expect(dialog).toBeHidden();
      await manager.openDropdown();
      await expect(page.getByTestId(/^connection-item-/)).toHaveCount(2);
      const added = page.getByTestId(/^connection-item-/).filter({ hasText: "readwriteuser@" });
      await expect(added).toContainText("Read-Write");
      await expect(added.locator("svg.text-primary")).toHaveCount(1);
    });
  });
});
