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
    await new LoginPage(page).clickConnect();
    const graphUrl = new URL(urls.graphUrl);
    await page.waitForURL(url => url.origin === graphUrl.origin && url.pathname === graphUrl.pathname);
    await initialSync;
  });

  test.afterEach(async ({ page }) => {
    // Keep the exercised document alive until coverage is saved on page close.
    const signOut = await manager.signOutSession();
    expect(signOut.ok()).toBe(true);
    await page.close();
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

  test(`@admin Confirming last-connection logout ends the session`, async ({ page }) => {
    await manager.openDropdown();
    await manager.requestRemoval(ADMIN_USERNAME);
    await expect(manager.logoutDialog).toContainText("only connection");
    const signOut = page.waitForResponse(response =>
      new URL(response.url()).pathname === "/api/auth/signout" && response.request().method() === "POST");
    await manager.confirmRemoval();
    expect((await signOut).ok()).toBe(true);
    const loginUrl = new URL(urls.loginUrl);
    await page.waitForURL(url => url.origin === loginUrl.origin && url.pathname === loginUrl.pathname);
    const session = await manager.getSession();
    expect(session.ok()).toBe(true);
    expect(await session.json()).toBeNull();
    const info = await page.request.get(new URL("/api/info", urls.loginUrl).href);
    expect(info.status()).toBe(401);
  });

  test(`@admin A rejected automatic switch keeps the new connection and reports the failure`, async ({ page }) => {
    await manager.openDropdown();
    const primaryId = await manager.getConnectionId(ADMIN_USERNAME);
    expect(primaryId).toBeTruthy();
    await manager.closeDropdown();
    const currentSession = await manager.getSession();
    expect(currentSession.ok()).toBe(true);
    const unchangedSession = await currentSession.json();
    expect(unchangedSession).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
    const { user: { host, port } }: { user: { host: string; port: number } } = unchangedSession;
    let updates = 0;
    await page.route("**/api/auth/session", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      updates += 1;
      await route.fulfill({ json: unchangedSession });
    });
    const added = manager.waitForAddConnectionResponse();
    await manager.submitAdditionalConnection(READ_WRITE_USERNAME, user.password, { host, port });
    expect((await added).ok()).toBe(true);
    await expect(manager.errorToast("Connection added but switch failed")).toBeVisible();
    await expect(manager.addDialog).toBeVisible();
    await manager.closeAddDialog();
    await manager.openDropdown();
    await expect(manager.connectionItems).toHaveCount(2);
    await expect(manager.activeMarkerForUser(ADMIN_USERNAME)).toHaveCount(1);
    await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(0);
    const session = await manager.getSession();
    expect(session.ok()).toBe(true);
    expect(await session.json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
    expect(updates).toBe(1);
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
    expect(await response.json()).toMatchObject({
      code: "invalid_credentials",
      message: "Invalid credentials. Please check your username and password.",
    });
    await expect(manager.addConnectionSubmit).toBeDisabled();
    await expect(manager.addDialog).toContainText("Invalid credentials. Please check your username and password.");
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
      const session = await manager.getSession();
      expect(session.ok()).toBe(true);
      const { user: { host, port } }: { user: { host: string; port: number } } = await session.json();
      await manager.submitAdditionalConnection(READ_WRITE_USERNAME, user.password, { host, port });
      await expect(manager.addDialog).toBeHidden();
    });

    test(`@admin A pending removal cannot be dismissed until the request finishes`, async ({ page }) => {
      await manager.openDropdown();
      const inactiveId = await manager.getConnectionId(ADMIN_USERNAME);
      const activeId = await manager.getConnectionId(READ_WRITE_USERNAME);
      if (!inactiveId || !activeId) throw new Error("Expected both connection IDs");
      let releaseDelete!: () => void;
      const deleteGate = new Promise<void>(resolve => { releaseDelete = resolve; });
      let notifyDelete!: () => void;
      const deleteStarted = new Promise<void>(resolve => { notifyDelete = resolve; });
      let deleteCount = 0;
      await page.route("**/api/connections/*", async route => {
        if (route.request().method() !== "DELETE") {
          await route.continue();
          return;
        }
        deleteCount += 1;
        notifyDelete();
        await deleteGate;
        await route.continue();
      });
      const deleteResponse = page.waitForResponse(response =>
        new URL(response.url()).pathname === `/api/connections/${inactiveId}` &&
        response.request().method() === "DELETE");
      try {
        await manager.requestRemoval(ADMIN_USERNAME);
        await manager.confirmRemoval();
        await deleteStarted;
        await expect(manager.logoutCancel).toBeDisabled();
        await manager.dismissRemovalWithEscape();
        await expect(manager.logoutDialog).toBeVisible();
        const pending = await page.request.get(new URL("/api/connections", page.url()).href);
        expect(pending.ok()).toBe(true);
        const { connections }: { connections: { id: string }[] } = await pending.json();
        expect(connections.map(connection => connection.id)).toEqual(expect.arrayContaining([inactiveId, activeId]));
        expect(connections).toHaveLength(2);
      } finally {
        releaseDelete();
      }
      expect((await deleteResponse).ok()).toBe(true);
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.connectionItems).toHaveCount(1);
      await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(1);
      const remaining = await page.request.get(new URL("/api/connections", page.url()).href);
      expect(remaining.ok()).toBe(true);
      expect((await remaining.json()).connections).toEqual([expect.objectContaining({ id: activeId })]);
      expect(deleteCount).toBe(1);
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

    test(`@admin A connection removal interrupted by a network error can be retried`, async ({ page }) => {
      await manager.openDropdown();
      const inactiveId = await manager.getConnectionId(ADMIN_USERNAME);
      const activeId = await manager.getConnectionId(READ_WRITE_USERNAME);
      if (!inactiveId || !activeId) throw new Error("Expected both connection IDs");
      let attempts = 0;
      await page.route(`**/api/connections/${inactiveId}`, async route => {
        if (route.request().method() !== "DELETE") {
          await route.continue();
          return;
        }
        attempts += 1;
        if (attempts === 1) await route.abort("connectionfailed");
        else await route.continue();
      });

      await manager.requestRemoval(ADMIN_USERNAME);
      await manager.confirmRemoval();
      await expect(manager.errorToast("Failed to remove connection")).toBeVisible();
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.connectionItems).toHaveCount(2);
      await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(1);
      const retained = await page.request.get(new URL("/api/connections", page.url()).href);
      expect(retained.ok()).toBe(true);
      const { connections }: { connections: { id: string }[] } = await retained.json();
      expect(connections).toHaveLength(2);
      expect(connections.map(connection => connection.id)).toEqual(expect.arrayContaining([inactiveId, activeId]));
      const session = await manager.getSession();
      expect(session.ok()).toBe(true);
      expect(await session.json()).toMatchObject({ activeConnectionId: activeId, user: { role: user.ReadWrite } });

      const removal = page.waitForResponse(response =>
        new URL(response.url()).pathname === `/api/connections/${inactiveId}` &&
        response.request().method() === "DELETE");
      await manager.requestRemoval(ADMIN_USERNAME);
      await manager.confirmRemoval();
      expect((await removal).ok()).toBe(true);
      await expect(manager.logoutDialog).toBeHidden();
      await expect(manager.connectionItems).toHaveCount(1);
      await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(1);
      const remaining = await page.request.get(new URL("/api/connections", page.url()).href);
      expect(remaining.ok()).toBe(true);
      expect((await remaining.json()).connections).toEqual([expect.objectContaining({ id: activeId })]);
      expect(attempts).toBe(2);
    });

    test(`@admin Selecting the active connection does not update the session`, async ({ page }) => {
      await manager.openDropdown();
      const activeId = await manager.getConnectionId(READ_WRITE_USERNAME);
      expect(activeId).toBeTruthy();
      let updates = 0;
      page.on("request", (request) => {
        if (request.method() === "POST" && new URL(request.url()).pathname === "/api/auth/session") updates += 1;
      });
      await manager.selectConnection(READ_WRITE_USERNAME);
      await manager.openDropdown();
      await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(1);
      const session = await manager.getSession();
      expect(session.ok()).toBe(true);
      expect(await session.json()).toMatchObject({ activeConnectionId: activeId, user: { role: user.ReadWrite } });
      expect(await manager.getLastActiveConnectionId()).toBe(activeId);
      expect(updates).toBe(0);
    });

    test(`@admin A rejected connection switch preserves the active connection and can be retried`, async ({ page }) => {
      await manager.openDropdown();
      const primaryId = await manager.getConnectionId(ADMIN_USERNAME);
      const activeId = await manager.getConnectionId(READ_WRITE_USERNAME);
      expect(primaryId).toBeTruthy();
      expect(activeId).toBeTruthy();
      const currentSession = await manager.getSession();
      expect(currentSession.ok()).toBe(true);
      const unchangedSession = await currentSession.json();
      expect(unchangedSession).toMatchObject({ activeConnectionId: activeId, user: { role: user.ReadWrite } });
      let updates = 0;
      await page.route("**/api/auth/session", async (route) => {
        if (route.request().method() !== "POST") {
          await route.continue();
          return;
        }
        updates += 1;
        if (updates === 1) {
          await route.fulfill({ json: unchangedSession });
        } else {
          await route.continue();
        }
      });
      await manager.selectConnection(ADMIN_USERNAME);
      await expect(manager.errorToast("Failed to switch connection")).toBeVisible();
      await manager.openDropdown();
      await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(1);
      await expect(manager.activeMarkerForUser(ADMIN_USERNAME)).toHaveCount(0);
      const rejectedSession = await manager.getSession();
      expect(rejectedSession.ok()).toBe(true);
      expect(await rejectedSession.json()).toMatchObject({ activeConnectionId: activeId, user: { role: user.ReadWrite } });

      const retriedUpdate = manager.waitForSessionUpdate();
      await manager.selectConnection(ADMIN_USERNAME);
      expect(await (await retriedUpdate).json()).toMatchObject({ activeConnectionId: primaryId, user: { role: "Admin" } });
      await manager.openDropdown();
      await expect(manager.activeMarkerForUser(ADMIN_USERNAME)).toHaveCount(1);
      await expect(manager.activeMarkerForUser(READ_WRITE_USERNAME)).toHaveCount(0);
      expect(updates).toBe(2);
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
      // The reload below closes the menu; after the removal dialog, Escape leaves it open.
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
