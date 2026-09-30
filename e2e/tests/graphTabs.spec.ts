import { expect, test, type Page } from "@playwright/test";
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

    // A share link carries the tab's graph and query, not its id, so it opens
    // for anyone — including a browser that has never seen the tab.
    const shareLink = (graphName: string, query: string, view = "Graph") => {
        const url = new URL(urls.graphUrl);
        url.searchParams.set("graph", graphName);
        url.searchParams.set("query", query);
        url.searchParams.set("view", view);
        return url.toString();
    };

    test("A share link opens its graph in a tab of its own, then clears itself off the URL", async () => {
        const graph = await browser.createNewPage(GraphPage, shareLink(graphOne, "MATCH (n) RETURN n LIMIT 1"));
        const page = await browser.getPage();
        await graph.waitForPageIdle();

        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "true", { timeout: 15000 });
        await expect(page.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
        // The untouched tab the visitor already had takes the link — no leftover "New tab".
        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);

        // The address bar goes back to naming the user's own tab.
        await expect.poll(() => new URL(graph.getCurrentURL()).searchParams.get("tab"), { timeout: 15000 }).toBeTruthy();
        const params = new URL(graph.getCurrentURL()).searchParams;
        expect(params.get("graph")).toBeNull();
        expect(params.get("query")).toBeNull();
    });

    test("Opening a link to a tab you already have reuses it", async () => {
        const query = "MATCH (n) RETURN n LIMIT 2";
        const graph = await browser.createNewPage(GraphPage, shareLink(graphOne, query));
        await graph.waitForPageIdle();
        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);

        await browser.navigateTo(shareLink(graphOne, query));
        await graph.waitForPageIdle();

        await expect.poll(() => graph.getStripTabCount(), { timeout: 15000 }).toBe(1);
        await expect(graph.stripTab(graphOne)).toHaveAttribute("data-active", "true");
    });

    test("A tab without a graph cannot be shared", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.waitForPageIdle();

        await expect(graph.stripTabShare("New tab")).toBeDisabled({ timeout: 15000 });
    });

    /**
     * Opens /graph with the clipboard writer replaced before any app code runs.
     * Deterministic across browsers — the e2e context grants clipboard access
     * on Chromium only. Copies land on `window.__copied`; `fail` makes the
     * writer reject instead.
     */
    // The toast title, not the screen-reader live region that repeats it.
    const toastTitle = (page: Page, text: string) => page.getByTestId("toast-title").filter({ hasText: text });

    const openWithStubbedClipboard = async (fail = false) => {
        const graph = await browser.createNewPage(GraphPage);
        const page = await browser.getPage();
        await page.addInitScript((shouldFail) => {
            Object.defineProperty(navigator, "clipboard", {
                configurable: true,
                value: {
                    writeText: async (text: string) => {
                        if (shouldFail) throw new Error("denied");
                        (window as unknown as { __copied?: string }).__copied = text;
                    },
                },
            });
        }, fail);
        await browser.navigateTo(urls.graphUrl);
        return { graph, page };
    };

    test("Copying a tab's link hands over its graph and query, not its id", async () => {
        const { graph, page } = await openWithStubbedClipboard();
        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.shareStripTab(graphOne);
        await expect(toastTitle(page, "Link copied")).toBeVisible({ timeout: 15000 });

        const copied = await page.evaluate(() => (window as unknown as { __copied?: string }).__copied ?? "");
        const link = new URL(copied);
        expect(link.pathname).toBe("/graph");
        expect(link.searchParams.get("graph")).toBe(graphOne);
        expect(link.searchParams.get("view")).toBeTruthy();
        expect(link.searchParams.get("tab")).toBeNull();

        // A browser that has never seen the tab opens the same context.
        const other = new BrowserWrapper();
        try {
            const otherGraph = await other.createNewPage(GraphPage, copied);
            const otherPage = await other.getPage();
            await otherGraph.waitForPageIdle();

            await expect(otherGraph.stripTab(graphOne)).toHaveAttribute("data-active", "true", { timeout: 15000 });
            await expect(otherPage.getByTestId("selectGraph")).toContainText(graphOne, { timeout: 15000 });
        } finally {
            await other.closeBrowser();
        }
    });

    test("A failed copy says so instead of claiming success", async () => {
        const { graph, page } = await openWithStubbedClipboard(true);
        await graph.selectGraphByName(graphOne);
        await graph.waitForPageIdle();

        await graph.shareStripTab(graphOne);
        await expect(toastTitle(page, "Error")).toBeVisible({ timeout: 15000 });
        await expect(page.getByTestId("toast-description").filter({ hasText: "Couldn't copy the link to the clipboard" })).toBeVisible();
        await expect(toastTitle(page, "Link copied")).toBeHidden();
    });
});
