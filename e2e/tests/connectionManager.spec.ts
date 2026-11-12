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
      const dialog = await new ConnectionManagerComponent(page).submitAdditionalConnection("readwriteuser", user.password);
      await expect(dialog).toBeHidden();
    });

    test("adding a connection selects it and activates its role", async ({ page }) => {
      const manager = new ConnectionManagerComponent(page);
      await manager.openDropdown();
      const secondary = manager.connectionForUser("readwriteuser");
      const secondaryId = (await secondary.getAttribute("data-testid"))?.replace("connection-item-", "");
      expect(secondaryId).toBeTruthy();
      await expect(manager.activeMarkerForUser("readwriteuser")).toHaveCount(1);
      await expect(secondary).toContainText("Read-Write");
      const session = await page.request.get(new URL("/api/auth/session", page.url()).href);
      expect(session.ok()).toBe(true);
      expect(await session.json()).toMatchObject({ activeConnectionId: secondaryId, user: { role: "Read-Write" } });
    });

    test("switching roles persists the selected connection across reload with both connections present", async ({ page }) => {
      const manager = new ConnectionManagerComponent(page);
      await manager.openDropdown();
      const secondary = manager.connectionForUser("readwriteuser");
      const primary = manager.connectionForUser("default");
      const primaryId = (await primary.getAttribute("data-testid"))?.replace("connection-item-", "");
      expect(primaryId).toBeTruthy();
      const sessionUpdate = manager.waitForSessionUpdate();
      await manager.selectConnection("default");
      const updatedSession = await sessionUpdate;
      expect(updatedSession.ok()).toBe(true);
      expect(await updatedSession.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await expect.poll(() => page.evaluate(() => localStorage.getItem("lastActiveConnectionId"))).toBe(primaryId);
      const persistedSession = manager.waitForSessionUpdate();
      await page.reload();
      const persisted = await persistedSession;
      expect(persisted.ok()).toBe(true);
      expect(await persisted.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await manager.openDropdown();
      await expect(manager.connectionItems).toHaveCount(2);
      await expect(manager.activeMarkerForUser("default")).toHaveCount(1);
      await expect(secondary).toContainText("Read-Write");
    });

    test("removing an inactive connection preserves the active one across reload", async ({ page }) => {
      const manager = new ConnectionManagerComponent(page);
      await manager.openDropdown();
      const primary = manager.connectionForUser("default");
      const primaryId = (await primary.getAttribute("data-testid"))?.replace("connection-item-", "");
      expect(primaryId).toBeTruthy();
      const switchedSession = manager.waitForSessionUpdate();
      await manager.selectConnection("default");
      expect(await (await switchedSession).json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await manager.openDropdown();
      await manager.requestRemoval("readwriteuser");
      await expect(manager.logoutDialog).toContainText("other connections will remain active");
      await manager.confirmRemoval();
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.connectionItems).toHaveCount(1);
      await expect(manager.activeMarkerForUser("default")).toHaveCount(1);
      await manager.closeDropdown();
      const restoredSession = manager.waitForSessionUpdate();
      await page.reload();
      const restored = await restoredSession;
      expect(restored.ok()).toBe(true);
      expect(await restored.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await manager.openDropdown();
      await expect(manager.connectionItems).toHaveCount(1);
      await expect(primary).toContainText("Admin");
    });

    test("failed removal retains both connections and retry switches to the remaining one", async ({ page }) => {
      const manager = new ConnectionManagerComponent(page);
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
      await manager.openDropdown();
      await manager.requestRemoval("readwriteuser");
      await manager.confirmRemoval();
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.feedbackMessage("Failed to remove connection")).toBeVisible();
      await expect(manager.connectionItems).toHaveCount(2);
      await expect(manager.activeMarkerForUser("readwriteuser")).toHaveCount(1);
      await manager.requestRemoval("readwriteuser");
      await manager.confirmRemoval();
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.connectionItems).toHaveCount(1);
      const primary = manager.connectionForUser("default");
      await expect(manager.activeMarkerForUser("default")).toHaveCount(1);
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
    await manager.requestFirstRemoval();
    await expect(manager.logoutDialog).toContainText("only connection");
    await manager.cancelRemoval();
    await expect(manager.logoutDialog).toBeHidden();
    await expect(page).toHaveURL(/\/graph/);
    expect(signOutRequests).toBe(0);
    await expect(manager.connectionItems).toHaveCount(1);
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
        await route.continue();
      });
      const rejectedResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname === "/api/connections"
        && response.request().method() === "POST");
      const dialog = await manager.submitAdditionalConnection("readwriteuser", "first-attempt");
      const response = await rejectedResponse;
      expect(response.status()).toBe(400);
      expect((await response.json()).message).toMatch(/^Authentication failed/);
      await expect(manager.addConnectionSubmit).toBeDisabled();
      await expect(dialog).toContainText("Failed to add connection");
      await manager.fillAdditionalPassword(user.password);
      await expect(manager.addConnectionSubmit).toBeEnabled();
      await manager.submitConnectionForm();
      await expect.poll(() => attempts.length).toBe(2);
      expect(attempts.map(({ password }) => password)).toEqual(["first-attempt", user.password]);
      await expect(dialog).toBeHidden();
      await manager.openDropdown();
      await expect(manager.connectionItems).toHaveCount(2);
      const added = manager.connectionForUser("readwriteuser");
      await expect(added).toContainText("Read-Write");
      await expect(manager.activeMarkerForUser("readwriteuser")).toHaveCount(1);
    });
  });
});
