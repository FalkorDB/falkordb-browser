import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

// The tab strip in the /graph sub-header. Each tab is an independent working
// context (graph, query, view, canvas state), so these tests assert both the
// strip mechanics and the isolation between contexts.
test.describe("@admin Graph tabs", () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;
    let graphOne: string;
    let graphTwo: string;

    test.beforeAll(async () => {
        apiCall = new ApiCalls();
        graphOne = getRandomString("tabone");
        graphTwo = getRandomString("tabtwo");
        await apiCall.addGraph(graphOne);
        await apiCall.addGraph(graphTwo);
    });

    test.afterAll(async () => {
        await apiCall.removeGraph(graphOne);
        await apiCall.removeGraph(graphTwo);
    });

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test("A fresh connection opens on a single blank tab", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect(graph.stripTab("New tab")).toBeVisible();
    });

    test("A tab is labelled by the graph it holds", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await expect(graph.stripTab(graphOne)).toBeVisible({ timeout: 15000 });
    });

    test("Adding a tab opens a blank context next to the current one", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.addStripTab();
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(2);
        // The new tab is the active one and carries no graph yet.
        await expect(graph.stripTab("New tab")).toHaveAttribute("data-active", "true");
        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "false");
    });

    test("Each tab keeps its own graph", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.addStripTab();
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphTwo);
        await graph.waitForPageIdle();

        await expect(page.getByTestId("selectGraph")).toContainText(graphTwo, { timeout: 15000 });

        // Switching back brings the first context along with it.
        await graph.selectStripTab(graphOne);
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });

        await graph.selectStripTab(graphTwo);
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphTwo, { timeout: 15000 });
    });

    test("Switching tabs points the URL at the active tab", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const tabParam = () => new URL(graph.getCurrentURL()).searchParams.get("tab");

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await expect.poll(tabParam, { timeout: 15000 }).toBeTruthy();
        const firstTabId = tabParam();

        await graph.addStripTab();
        await graph.waitForPageIdle();
        await expect.poll(tabParam, { timeout: 15000 }).not.toBe(firstTabId);

        await graph.selectStripTab(graphOne);
        await expect.poll(tabParam, { timeout: 15000 }).toBe(firstTabId);
    });

    test("Renaming a tab replaces its label, and clearing it restores the graph name", async () => {
        const custom = getRandomString("renamed");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.renameStripTab(graphOne, custom);
        await expect(graph.stripTab(custom)).toBeVisible({ timeout: 15000 });
        await expect(graph.stripTab(graphOne)).toBeHidden();

        // An empty name is the way back to the graph name.
        await graph.renameStripTab(custom, "");
        await expect(graph.stripTab(graphOne)).toBeVisible({ timeout: 15000 });
    });

    test("A renamed tab survives a reload", async () => {
        const custom = getRandomString("persisted");
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await graph.renameStripTab(graphOne, custom);
        await expect(graph.stripTab(custom)).toBeVisible({ timeout: 15000 });

        await graph.refreshPage();
        await graph.waitForPageIdle();

        await expect(graph.stripTab(custom)).toBeVisible({ timeout: 15000 });
    });

    test("Closing a tab drops it and falls back to a neighbour", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();
        await graph.addStripTab();
        await graph.waitForPageIdle();
        await graph.selectGraphByName(graphTwo);
        await graph.waitForPageIdle();

        await graph.closeStripTab(graphTwo);
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
    });

    test("The last tab cannot be closed", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);

        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await expect(graph.stripTabClose(graphOne)).toBeDisabled({ timeout: 15000 });
    });

    test("The strip stops growing at the max-tabs limit", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();
        await graph.waitForPageIdle();

        // Read the limit actually in force instead of assuming the default, so
        // the assertion below can be exact. Mirrors clampMaxTabs (lib/graphTabs).
        const limit = await page.evaluate(() => {
            const stored = Number(window.localStorage.getItem("maxTabs"));
            return Number.isFinite(stored) && stored > 0 ? Math.min(10, Math.max(4, Math.round(stored))) : 8;
        });

        for (let i = 0; i < limit + 2; i += 1) {
            if (await page.getByTestId("graphTabAdd").isDisabled()) break;
            await graph.addStripTab();
        }

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(limit);
        await expect(page.getByTestId("graphTabAdd")).toBeDisabled();
    });
});
