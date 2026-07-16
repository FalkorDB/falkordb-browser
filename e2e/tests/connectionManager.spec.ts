import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ConnectionManagerComponent from "../logic/POM/connectionManagerComponent";
import urls from "../config/urls.json";

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

  // Regression for idea-7: overlapping connection switches (A→B→C) must converge
  // the persisted JWT on the LAST-selected connection. The switch session mutation
  // is serialized, so holding B's /api/auth/session update in-flight while C is
  // triggered must still end on C (never on the superseded B).
  test(`@admin overlapping connection switches converge on the last-selected connection`, async () => {
    const connManager = await browser.createNewPage(ConnectionManagerComponent, urls.graphUrl);
    const page = await browser.getPage();
    const origin = new URL(page.url()).origin;

    // The originally-active connection (A) — we switch A→B→C among the two we add.
    const activeId = (await (await page.request.get(`${origin}/api/auth/session`)).json()).activeConnectionId as string;

    // Need ≥3 connections to do A→B→C (selecting the active one is a no-op). Add two
    // extra connections to the same local FalkorDB via the API, capturing their ids.
    const added: string[] = [];
    for (let i = 0; i < 2; i += 1) {
      const res = await page.request.post(`${origin}/api/connections`, {
        data: { host: "localhost", port: "6379" },
      });
      expect(res.ok()).toBe(true);
      added.push((await res.json()).connection.id as string);
    }
    const [connB, connC] = added;

    try {
      await page.reload();
      await connManager.waitForPageIdle();

      // Hold B's session-update POST in-flight until C has also been triggered.
      let releaseFirst: () => void = () => {};
      const firstHeld = new Promise<void>((resolve) => { releaseFirst = resolve; });
      let heldOnce = false;
      await page.route("**/api/auth/session", async (route) => {
        const req = route.request();
        if (req.method() === "POST" && !heldOnce && (req.postData() || "").includes(connB)) {
          heldOnce = true;
          await firstHeld;
        }
        await route.continue();
      });

      // Switch to B (its update is held), then to C (queued behind B by the serializer).
      await connManager.selectConnectionById(connB);
      await connManager.selectConnectionById(connC);

      // Release B's update; the serializer then runs C's update, so the JWT ends on C.
      releaseFirst();

      await expect.poll(async () => {
        const res = await page.request.get(`${origin}/api/auth/session`);
        return (await res.json()).activeConnectionId;
      }, { timeout: 15000 }).toBe(connC);

      await page.unroute("**/api/auth/session");
    } finally {
      // Cleanup: move the session back to the original connection (so we don't delete
      // the active row), then remove the two temporary connections from the shared
      // session so they don't accumulate across tests/runs.
      try {
        await page.unroute("**/api/auth/session").catch(() => {});
        await connManager.selectConnectionById(activeId);
        await expect.poll(async () => {
          const res = await page.request.get(`${origin}/api/auth/session`);
          return (await res.json()).activeConnectionId;
        }, { timeout: 15000 }).toBe(activeId);
      } catch {
        // best-effort — still attempt to delete the temporary connections below
      }
      for (const id of added) {
        await page.request.delete(`${origin}/api/connections/${id}`).catch(() => {});
      }
    }
  });
});
