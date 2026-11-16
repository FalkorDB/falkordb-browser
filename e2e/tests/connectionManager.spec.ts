import { expect, test } from "../infra/coverage";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ConnectionManagerComponent from "../logic/POM/connectionManagerComponent";
import urls from "../config/urls.json";
import LoginPage from "../logic/POM/loginPage";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString, initializeLocalStorage } from "../infra/utils";
import { user, userRoles } from "../config/user.json";

// The admin login connects as the server's default user.
const ADMIN_USERNAME = "default";
// CI runs a second FalkorDB on 6380 next to the one the tests log in to on 6379; the
// switching test needs it locally too (`docker run -d -p 6380:6379 falkordb/falkordb`).
const PRIMARY_PORT = 6379;
const SECONDARY_SERVER = { host: "localhost", port: 6380 };
const READ_WRITE_USERNAME = userRoles.find(({ role }) => role === "readwrite")!.name;

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

  test(`@admin Verify switching connections moves the active marker, the session and the graph list`, async ({ page }) => {
    test.setTimeout(60_000);
    const apiCall = new ApiCalls();
    const graph = new GraphPage(page);
    const suffix = getRandomString("switch");
    const primaryGraph = `primary-${suffix}`;
    const secondaryGraph = `secondary-${suffix}`;
    await manager.openDropdown();
    const primaryId = await manager.getConnectionIdOnPort(PRIMARY_PORT);
    expect(primaryId).toBeTruthy();
    await manager.closeDropdown();
    let secondaryId: string | undefined;
    let cleanup: PromiseSettledResult<number>[] = [];
    try {
      await apiCall.addGraphOnConnection(page.request, primaryGraph, primaryId!);
      await manager.submitAdditionalConnection(ADMIN_USERNAME, "", SECONDARY_SERVER);
      await expect(manager.addDialog).toBeHidden();
      await manager.openDropdown();
      secondaryId = await manager.getConnectionIdOnPort(SECONDARY_SERVER.port);
      expect(secondaryId).toBeTruthy();
      await apiCall.addGraphOnConnection(page.request, secondaryGraph, secondaryId!);
      await expect(manager.activeMarkerOnPort(SECONDARY_SERVER.port)).toHaveCount(1);
      await expect(manager.activeMarkerOnPort(PRIMARY_PORT)).toHaveCount(0);
      await manager.closeDropdown();

      const switchConnection = async (port: number, connectionId: string, graphName: string) => {
        const switchedSession = manager.waitForSessionUpdate();
        await manager.openDropdown();
        await manager.selectConnectionOnPort(port);
        expect(await (await switchedSession).json()).toMatchObject({ activeConnectionId: connectionId });
        await manager.openDropdown();
        await expect(manager.connectionItems).toHaveCount(2);
        await expect(manager.activeMarkerOnPort(port)).toHaveCount(1);
        await manager.closeDropdown();
        await expect.poll(() => graph.readGraphNamesInList(suffix)).toEqual([graphName]);
        await graph.closeGraphList();
      };
      // The list shows only the active server's graphs.
      await switchConnection(PRIMARY_PORT, primaryId!, primaryGraph);
      await switchConnection(SECONDARY_SERVER.port, secondaryId!, secondaryGraph);
    } finally {
      cleanup = await Promise.allSettled([
        apiCall.removeGraphOnConnection(page.request, primaryGraph, primaryId!),
        ...(secondaryId ? [apiCall.removeGraphOnConnection(page.request, secondaryGraph, secondaryId)] : []),
      ]);
    }
    // Reached only when the scenario passed, so a cleanup failure never masks its error.
    expect(cleanup.map((result) => (result.status === "fulfilled" ? result.value : result.reason))).toEqual(cleanup.map(() => 200));
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

    test(`@admin Verify cancelling a removal keeps the connection and confirming it removes only that one`, async ({ page }) => {
      const deleteRequests: string[] = [];
      page.on("request", (request) => {
        const { pathname } = new URL(request.url());
        if (request.method() === "DELETE" && pathname.startsWith("/api/connections/")) deleteRequests.push(pathname);
      });
      await manager.openDropdown();
      const primaryId = await manager.getConnectionId(ADMIN_USERNAME);
      const secondaryId = await manager.getConnectionId(READ_WRITE_USERNAME);
      expect(primaryId).toBeTruthy();
      expect(secondaryId).toBeTruthy();
      await manager.requestRemoval(ADMIN_USERNAME);
      await expect(manager.logoutDialog).toContainText("other connections will remain active");
      await manager.cancelRemoval();
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.connectionItems).toHaveCount(2);
      await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(1);
      expect(deleteRequests).toEqual([]);
      const keptSession = await manager.getSession();
      expect(keptSession.ok()).toBe(true);
      expect(await keptSession.json()).toMatchObject({ activeConnectionId: secondaryId, user: { role: user.ReadWrite } });
      await manager.requestRemoval(ADMIN_USERNAME);
      await manager.confirmRemoval();
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.connectionItems).toHaveCount(1);
      await expect(manager.connectionForUser(ADMIN_USERNAME)).toHaveCount(0);
      await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(1);
      expect(deleteRequests).toEqual([`/api/connections/${primaryId}`]);
      const session = await manager.getSession();
      expect(session.ok()).toBe(true);
      expect(await session.json()).toMatchObject({ activeConnectionId: secondaryId, user: { role: user.ReadWrite } });
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
