import { expect, test } from "../infra/coverage";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ConnectionManagerComponent from "../logic/POM/connectionManagerComponent";
import urls from "../config/urls.json";
import LoginPage from "../logic/POM/loginPage";
import { initializeLocalStorage } from "../infra/utils";
import { user, userRoles } from "../config/user.json";

// The admin login connects as the server's default user.
const ADMIN_USERNAME = "default";
const READ_WRITE_USERNAME = userRoles.find(({ role }) => role === "readwrite")!.name;

test("@admin Removed connections cannot be recovered from session fields", async ({ playwright }) => {
  const origin = new URL(urls.loginUrl).origin;
  const request = await playwright.request.newContext({
    baseURL: origin,
    storageState: { cookies: [], origins: [] },
    extraHTTPHeaders: { Origin: origin },
  });
  try {
    const csrf = await (await request.get("/api/auth/csrf")).json();
    const login = await request.post("/api/auth/callback/credentials", {
      headers: { "X-Auth-Return-Redirect": "1" },
      form: {
        csrfToken: csrf.csrfToken, callbackUrl: `${origin}/graph`,
        host: "localhost", port: "6379", username: "", password: "", tls: "false",
      },
    });
    expect(login.ok()).toBe(true);
    expect(new URL((await login.json()).url).searchParams.has("error")).toBe(false);
    expect((await request.get("/api/info")).ok()).toBe(true);
    const { connections }: { connections: { id: string }[] } =
      await (await request.get("/api/connections")).json();
    expect(connections).toHaveLength(1);
    const connectionId = connections[0].id;
    const existing = await request.post("/api/auth/migrate-session");
    expect(existing.status()).toBe(200);
    expect((await existing.json()).connection.id).toBe(connectionId);
    expect(existing.headers()["x-session-invalid"]).toBeUndefined();
    expect((await (await request.get("/api/connections")).json()).connections).toHaveLength(1);
    expect((await request.delete(`/api/connections/${connectionId}`)).ok()).toBe(true);
    const migration = await request.post("/api/auth/migrate-session");
    expect(migration.status()).toBe(401);
    expect((await migration.json()).code).toBe("SESSION_INVALID");
    expect(migration.headers()["x-session-invalid"]).toBe("1");

    const requestHeaders: Record<string, string>[] = [{}, { "X-Connection-Id": connectionId }];
    for (const headers of requestHeaders) {
      const response = await request.get("/api/info", { headers });
      expect(response.status()).toBe(401);
      expect((await response.json()).code).toBe("SESSION_INVALID");
    }
    await request.get("/api/auth/session");
    const remaining = await (await request.get("/api/connections")).json();
    expect(remaining.connections).toEqual([]);
    expect((await request.get("/api/info")).status()).toBe(401);
  } finally {
    try {
      const csrf = await (await request.get("/api/auth/csrf")).json();
      const signout = await request.post("/api/auth/signout", { form: { csrfToken: csrf.csrfToken } });
      if (!signout.ok()) console.warn(`Connection-test sign-out cleanup returned HTTP ${signout.status()}`);
    } catch (error) {
      console.warn("Connection-test sign-out cleanup failed:", error);
    } finally {
      await request.dispose();
    }
  }
});

test.describe("Connection Manager Tests", () => {
  let browser: BrowserWrapper;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
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
});

// These tests add and remove connections, so each logs in with its own session
// (not the shared admin storage state) and signs it out afterwards.
test.describe("Connection Manager Tests: own session", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let manager: ConnectionManagerComponent;

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(initializeLocalStorage("localhost", 6379));
    await page.goto(urls.loginUrl);
    manager = new ConnectionManagerComponent(page);
    // After login the provider pins the restored connection into the session; let it finish first.
    const initialSync = manager.waitForSessionUpdate();
    await new LoginPage(page).clickOnConnect();
    await initialSync;
  });

  test.afterEach(async ({ page }) => {
    // Reload first: a menu, dialog or toast left open would block the header logout.
    await manager.refreshPage();
    await new LoginPage(page).Logout();
  });

  test(`@admin Verify cancelling last-connection logout preserves the session`, async ({ page }) => {
    let signOutRequests = 0;
    page.on("request", (request) => {
      if (new URL(request.url()).pathname === "/api/auth/signout") signOutRequests += 1;
    });
    await manager.openDropdown();
    await expect(manager.connectionItems).toHaveCount(1);
    await manager.requestRemoval(ADMIN_USERNAME);
    await expect(manager.logoutDialog).toContainText("only connection");
    await manager.cancelRemoval();
    await expect(manager.logoutDialog).toBeHidden();
    expect(manager.getCurrentURL()).toContain(urls.graphUrl);
    expect(signOutRequests).toBe(0);
    await expect(manager.connectionItems).toHaveCount(1);
    const session = await manager.getSession();
    expect(session.ok()).toBe(true);
    expect(await session.json()).toMatchObject({ user: { role: "Admin" } });
  });

  test(`@admin Verify a rejected additional connection keeps the form editable for retry`, async ({ page }) => {
    const submittedPasswords: unknown[] = [];
    page.on("request", (request) => {
      if (request.method() !== "POST" || new URL(request.url()).pathname !== "/api/connections") return;
      submittedPasswords.push(request.postDataJSON().password);
    });
    const rejectedResponse = manager.waitForAddConnectionResponse();
    await manager.submitAdditionalConnection(READ_WRITE_USERNAME, "first-attempt");
    const response = await rejectedResponse;
    expect(response.status()).toBe(400);
    expect((await response.json()).message).toMatch(/^Authentication failed/);
    await expect(manager.addConnectionSubmit).toBeDisabled();
    await expect(manager.addDialog).toContainText("Failed to add connection");
    await manager.fillAdditionalPassword(user.password);
    await expect(manager.addConnectionSubmit).toBeEnabled();
    await manager.submitConnectionForm();
    await expect(manager.addDialog).toBeHidden();
    expect(submittedPasswords).toEqual(["first-attempt", user.password]);
    await manager.openDropdown();
    await expect(manager.connectionItems).toHaveCount(2);
    await expect(manager.connectionForUser(READ_WRITE_USERNAME)).toContainText(user.ReadWrite);
    await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(1);
  });

  test.describe("with an added read-write connection", () => {
    test.beforeEach(async () => {
      await manager.submitAdditionalConnection(READ_WRITE_USERNAME, user.password);
      await expect(manager.addDialog).toBeHidden();
    });

    test(`@admin Verify adding a connection selects it and activates its role`, async () => {
      await manager.openDropdown();
      const secondaryId = await manager.getConnectionId(READ_WRITE_USERNAME);
      expect(secondaryId).toBeTruthy();
      await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(1);
      await expect(manager.connectionForUser(READ_WRITE_USERNAME)).toContainText(user.ReadWrite);
      const session = await manager.getSession();
      expect(session.ok()).toBe(true);
      expect(await session.json()).toMatchObject({ activeConnectionId: secondaryId, user: { role: user.ReadWrite } });
    });

    test(`@admin Verify the selected connection persists across reload with both connections present`, async () => {
      await manager.openDropdown();
      const primaryId = await manager.getConnectionId(ADMIN_USERNAME);
      expect(primaryId).toBeTruthy();
      const sessionUpdate = manager.waitForSessionUpdate();
      await manager.selectConnection(ADMIN_USERNAME);
      const updatedSession = await sessionUpdate;
      expect(updatedSession.ok()).toBe(true);
      expect(await updatedSession.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await expect.poll(() => manager.getLastActiveConnectionId()).toBe(primaryId);
      const persistedSession = manager.waitForSessionUpdate();
      await manager.refreshPage();
      const persisted = await persistedSession;
      expect(persisted.ok()).toBe(true);
      expect(await persisted.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await manager.openDropdown();
      await expect(manager.connectionItems).toHaveCount(2);
      await expect(manager.activeMarkerForUser(ADMIN_USERNAME)).toHaveCount(1);
      await expect(manager.connectionForUser(READ_WRITE_USERNAME)).toContainText(user.ReadWrite);
    });

    test(`@admin Verify removing an inactive connection preserves the active one across reload`, async () => {
      await manager.openDropdown();
      const primaryId = await manager.getConnectionId(ADMIN_USERNAME);
      expect(primaryId).toBeTruthy();
      const switchedSession = manager.waitForSessionUpdate();
      await manager.selectConnection(ADMIN_USERNAME);
      expect(await (await switchedSession).json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await manager.openDropdown();
      await manager.requestRemoval(READ_WRITE_USERNAME);
      await expect(manager.logoutDialog).toContainText("other connections will remain active");
      await manager.confirmRemoval();
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.connectionItems).toHaveCount(1);
      await expect(manager.activeMarkerForUser(ADMIN_USERNAME)).toHaveCount(1);
      await manager.closeDropdown();
      const restoredSession = manager.waitForSessionUpdate();
      await manager.refreshPage();
      const restored = await restoredSession;
      expect(restored.ok()).toBe(true);
      expect(await restored.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await manager.openDropdown();
      await expect(manager.connectionItems).toHaveCount(1);
      await expect(manager.connectionForUser(ADMIN_USERNAME)).toContainText("Admin");
    });

    test(`@admin Verify a failed removal retains both connections and retry switches to the remaining one`, async ({ page }) => {
      let attempts = 0;
      await page.route("**/api/connections/*", async (route) => {
        if (route.request().method() !== "DELETE") {
          await route.continue();
          return;
        }
        attempts += 1;
        if (attempts === 1) {
          await route.fulfill({ status: 404, json: { message: "Connection not found" } });
        } else {
          await route.continue();
        }
      });
      await manager.openDropdown();
      await manager.requestRemoval(READ_WRITE_USERNAME);
      await manager.confirmRemoval();
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.errorToast("Failed to remove connection")).toBeVisible();
      await expect(manager.connectionItems).toHaveCount(2);
      await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(1);
      await manager.requestRemoval(READ_WRITE_USERNAME);
      await manager.confirmRemoval();
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.connectionItems).toHaveCount(1);
      await expect(manager.activeMarkerForUser(ADMIN_USERNAME)).toHaveCount(1);
      const primaryId = await manager.getConnectionId(ADMIN_USERNAME);
      expect(primaryId).toBeTruthy();
      const session = await manager.getSession();
      expect(session.ok()).toBe(true);
      expect(await session.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      expect(attempts).toBe(2);
    });
  });
});
