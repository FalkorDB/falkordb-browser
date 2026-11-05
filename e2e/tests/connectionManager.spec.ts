import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ConnectionManagerComponent from "../logic/POM/connectionManagerComponent";
import urls from "../config/urls.json";

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
