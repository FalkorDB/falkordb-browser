import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import GraphPage from "../logic/POM/graphPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

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

    test("Selecting a graph updates URL with ?graph= param", async () => {
        const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graph.selectGraphByName(graphName);

        const url = graph.getCurrentURL();
        expect(url).toContain(`graph=${encodeURIComponent(graphName)}`);
    });

    test("Navigating directly to ?graph=<name> selects that graph", async () => {
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}`
        );
        const page = await browser.getPage();

        // Wait for graph to load
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphName, { timeout: 15000 });

        // The graph should be selected — URL should still contain the param
        const url = graph.getCurrentURL();
        expect(url).toContain(`graph=${encodeURIComponent(graphName)}`);
    });

    test("Running a query updates URL with ?query= param", async () => {
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}`
        );
        await graph.waitForPageIdle();

        const query = "MATCH (n) RETURN n LIMIT 5";
        await graph.insertQuery(query);
        await graph.clickRunQuery();

        const url = graph.getCurrentURL();
        expect(url).toContain("query=");
        const urlObj = new URL(url);
        expect(urlObj.searchParams.get("query")).toBe(query);
    });

    test("Navigating to ?graph=<name>&query=<cypher> loads graph with query", async () => {
        const query = "MATCH (n) RETURN n LIMIT 1";
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}&query=${encodeURIComponent(query)}`
        );
        const page = await browser.getPage();
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphName, { timeout: 15000 });

        const url = graph.getCurrentURL();
        expect(url).toContain(`graph=${encodeURIComponent(graphName)}`);
        expect(url).toContain("query=");
    });

    test("Graph param persists after page refresh", async () => {
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}`
        );
        const page = await browser.getPage();
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphName, { timeout: 15000 });

        await graph.refreshPage();
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphName, { timeout: 15000 });

        const url = graph.getCurrentURL();
        expect(url).toContain(`graph=${encodeURIComponent(graphName)}`);
    });

    test("URL params order is graph, query, selected", async () => {
        const query = "MATCH (n) RETURN n LIMIT 5";
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}&query=${encodeURIComponent(query)}`
        );
        const page = await browser.getPage();
        await graph.waitForPageIdle();
        await expect(page.getByTestId("selectGraph")).toContainText(graphName, { timeout: 15000 });

        const url = graph.getCurrentURL();
        const graphIdx = url.indexOf("graph=");
        const queryIdx = url.indexOf("query=");

        // graph should come before query in the URL
        expect(graphIdx).toBeGreaterThan(-1);
        expect(queryIdx).toBeGreaterThan(-1);
        expect(graphIdx).toBeLessThan(queryIdx);
    });

    test("URL with existing graph: selector shows that graph and URL param is kept", async () => {
        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(graphName)}`
        );
        const page = await browser.getPage();

        // Wait until the selector reflects the URL graph — auto-retries until
        // React effects finish loading the graph list and setting graphName.
        await expect(page.getByTestId("selectGraph")).toContainText(graphName, { timeout: 15000 });

        // URL must still carry the graph param
        const url = graph.getCurrentURL();
        expect(url).toContain(`graph=${encodeURIComponent(graphName)}`);
    });

    test("URL with existing graph: URL graph wins over content-persistence saved graph", async () => {
        const otherGraph = getRandomString("persist");
        await apiCall.addGraph(otherGraph);

        try {
            // Land on a neutral page first so the init script runs and sets
            // defaults, then override content-persistence settings before the
            // actual /graph navigation.
            const graph = await browser.createNewPage(GraphPage, urls.localHost);
            const page = await browser.getPage();

            const storagePrefix = "localhost:6379:default:";
            await graph.setLocalStorageItem("contentPersistence", "true");
            await graph.setLocalStorageItem(
                `${storagePrefix}savedContent`,
                JSON.stringify({ graphName: otherGraph, query: "MATCH (n) RETURN n" }),
            );

            // Navigate to /graph with the URL graph param
            const graphListResponse = page.waitForResponse(
                (response) => response.url().includes("/api/graph") && response.request().method() === "GET"
            );
            await page.goto(`${urls.graphUrl}?graph=${encodeURIComponent(graphName)}`, {
                waitUntil: "domcontentloaded",
            });
            await graphListResponse;

            // URL graph must win — wait for selector to reflect URL graph (auto-retries)
            await expect(page.getByTestId("selectGraph")).toContainText(graphName, { timeout: 15000 });
            await expect(page.getByTestId("selectGraph")).not.toContainText(otherGraph, { timeout: 5000 });

            const url = graph.getCurrentURL();
            expect(url).toContain(`graph=${encodeURIComponent(graphName)}`);
            expect(url).not.toContain(encodeURIComponent(otherGraph));
        } finally {
            await apiCall.removeGraph(otherGraph);
        }
    });

    test("URL with non-existing graph: param is stripped and selector stays empty", async () => {
        // Use a name guaranteed not to exist
        const nonExistentGraph = `nonexistent-${Date.now()}`;

        const graph = await browser.createNewPage(
            GraphPage,
            `${urls.graphUrl}?graph=${encodeURIComponent(nonExistentGraph)}`
        );
        await graph.waitForPageIdle();

        // URL param must be cleared by the validation logic
        const url = graph.getCurrentURL();
        expect(url).not.toContain(`graph=${encodeURIComponent(nonExistentGraph)}`);

        // Selector must show the placeholder, not the invalid graph name
        const selectedName = await graph.getSelectedGraphName();
        expect(selectedName).not.toContain(nonExistentGraph);
        expect(selectedName).toContain("Select Graph");
    });
});
