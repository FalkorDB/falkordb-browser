import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

// The working context (graph, query, selection, viewport) lives on the active
// tab, not in the URL. All the URL carries is which tab to open, so these tests
// assert the handover: state → ?tab=, and ?tab= → rebuilt context.
test.describe("@admin Graph URL params", () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;
    let graphName: string;

    test.beforeAll(async () => {
        apiCall = new ApiCalls();
        graphName = getRandomString("urlparams");
        await apiCall.addGraph(graphName);
    });

    test.afterAll(async () => {
        await apiCall.removeGraph(graphName);
    });

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    const tabParam = (graph: GraphPage) =>
        new URL(graph.getCurrentURL()).searchParams.get("tab");

    test("Selecting a graph updates URL with ?tab= param", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphName);
        await graph.waitForPageIdle();

        await expect.poll(() => tabParam(graph), { timeout: 15000 }).toBeTruthy();
    });

    test("Working context is kept off the URL", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphName);
        await graph.waitForPageIdle();
        await graph.insertQuery("MATCH (n) RETURN n LIMIT 5");
        await graph.clickRunQuery();

        const params = new URL(graph.getCurrentURL()).searchParams;
        expect(params.get("graph")).toBeNull();
        expect(params.get("query")).toBeNull();
        expect(params.get("selected")).toBeNull();
    });

    test("Refreshing rebuilds the tab's graph and query", async () => {
        const query = "MATCH (n) RETURN n LIMIT 5";
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(graphName);
        await graph.waitForPageIdle();
        await graph.insertQuery(query);
        await graph.clickRunQuery();

        await expect.poll(() => tabParam(graph), { timeout: 15000 }).toBeTruthy();
        const tabId = tabParam(graph);

        await graph.refreshPage();
        await graph.waitForPageIdle();

        // Same tab, and its context is back without any of it being in the URL.
        await expect.poll(() => tabParam(graph), { timeout: 15000 }).toBe(tabId);
        await expect(page.getByTestId("selectGraph")).toContainText(graphName, { timeout: 15000 });
        // The query is the other half of the context — a reload that only
        // restored the graph would otherwise pass.
        await expect.poll(() => graph.getEditorInput(), { timeout: 15000 }).toBe(query);
    });

    test("URL naming an unknown tab falls back to a usable strip", async () => {
        const graph = await browser.createNewPage(GraphPage, `${urls.graphUrl}?tab=does-not-exist`);
        await graph.waitForPageIdle();

        // The stored strip wins; we must never be left pointing at a dead tab.
        await expect
            .poll(() => tabParam(graph), { timeout: 15000 })
            .not.toBe("does-not-exist");

        // …and what it points at has to be a tab that is actually in the strip.
        const active = tabParam(graph);
        expect(active).toBeTruthy();
        expect(await graph.getStripTabIds()).toContain(active!);
    });

    test("A tab naming a dropped graph does not resurrect it", async () => {
        const doomed = getRandomString("dropped");
        await apiCall.addGraph(doomed);

        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        const page = await browser.getPage();

        await graph.selectGraphByName(doomed);
        await graph.waitForPageIdle();

        // Drop it behind the tab's back, then reload so the tab is rebuilt cold.
        await apiCall.removeGraph(doomed);
        await graph.refreshPage();
        await graph.waitForPageIdle();

        await expect(page.getByTestId("selectGraph")).not.toContainText(doomed, { timeout: 15000 });
        const graphs = await apiCall.getGraphs();
        expect(JSON.stringify(graphs)).not.toContain(doomed);
    });
});
