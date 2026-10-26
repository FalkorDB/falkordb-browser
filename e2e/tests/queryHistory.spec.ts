
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import urls from '../config/urls.json';
import QueryHistory from "../logic/POM/queryHistoryComponent";
import { getRandomString } from "../infra/utils";

test.describe('Query history Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test(`@admin The history Metadata tab stays open and shows the query statistics`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        try {
            const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.selectGraphByName(graphName);
            const query = "CREATE (n:Person { name: 'Alice' }) RETURN n";
            await graph.insertQuery(query);
            await graph.clickRunQuery();
            await graph.clickQueryHistoryButton();
            await graph.selectQueryInHistory(query);
            await graph.clickHistoryTab("Metadata");

            await expect(graph.historyTabPanel).toContainText("Nodes created: 1");
            // The panel used to switch away from a tab it judged empty right after it opened
            await new Promise((resolve) => { setTimeout(resolve, 1000); });
            await expect(graph.historyTab("Metadata")).toHaveAttribute("data-state", "active");
            await expect(graph.historyTabPanel).toContainText("Query internal execution time:");
        } finally {
            await apicalls.removeGraph(graphName);
        }
    });

    test(`@admin Validate that running a query in the UI saves it in the query history`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        const query = "CREATE (n:Person { name: 'Alice' }) RETURN n";
        await graph.insertQuery(query);
        await graph.clickRunQuery();
        await graph.clickQueryHistoryButton();
        expect(await graph.getQueryHistory(query)).toBe(true);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Validate that executing a query from the query history correctly displays the results in the canvas`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        const query = "MERGE (n:Person { name: 'Alice' }) RETURN n";
        await graph.insertQuery(query);
        await graph.clickRunQuery();
        await graph.runAQueryFromHistory(query);
        const searchQuery = `Alice`;
        await graph.searchElementInCanvas(searchQuery);
        await graph.hoverAtCanvasCenter();
        expect(await graph.getNodeCanvasToolTip()).toBe(searchQuery);
        await apicalls.removeGraph(graphName);        
    });

    test(`@admin verify query selection from history displays the correct query`, async () => {
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        const graphName = getRandomString('queryhistory');
        await graph.addGraph(graphName);
        const query = "CREATE (n:Person { name: 'Alice' }) RETURN n";
        await graph.insertQuery(query);
        await graph.clickRunQuery(false);
        await graph.clickQueryHistoryButton();
        await graph.clickSelectQueryInHistory(query);
        expect(await graph.getQueryHistoryEditorContent(query)).toBe("CREATE (n:Person { name: 'Alice' }) RETURN n");
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Ctrl+F opens the find widget in the history panel editor`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        const query = "MATCH (n) RETURN n";
        await graph.insertQuery(query);
        await graph.clickRunQuery(false);
        await graph.clickQueryHistoryButton();
        await graph.clickSelectQueryInHistory(query);
        // Click inside the history panel editor to focus it
        await graph.clickHistoryPanelEditor();
        // Press Ctrl+F — should open Monaco's find widget
        await graph.openFindWidget();
        const findVisible = await graph.waitForFindWidget(5000);
        expect(findVisible).toBe(true);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin history panel editor shows autocomplete suggestions`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        const query = "MATCH (n) RETURN n";
        await graph.insertQuery(query);
        await graph.clickRunQuery(false);
        await graph.clickQueryHistoryButton();
        await graph.clickSelectQueryInHistory(query);
        // Click inside the history panel editor and trigger completions
        await graph.clickHistoryPanelEditor();
        // Monaco's suggest widget can be slow/racy under load; retry the trigger.
        let suggestVisible = false;
        for (let attempt = 0; attempt < 3 && !suggestVisible; attempt += 1) {
            await graph.triggerSuggestions();
            suggestVisible = await graph.waitForSuggestWidget(5000);
        }
        expect(suggestVisible).toBe(true);
        // At minimum, Cypher keywords (MATCH, RETURN, etc.) should be present
        const count = await graph.getSuggestionCount();
        expect(count).toBeGreaterThan(0);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Ctrl+F opens the find widget in the fullscreen dialog editor`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        const query = "MATCH (n) RETURN n";
        await graph.insertQuery(query);
        // Open the fullscreen dialog editor
        await graph.editorMaximize.click();
        // The dialog editor is a Monaco editor — click to focus it
        await graph.dialogEditor.waitFor({ state: 'visible', timeout: 5000 });
        await graph.dialogEditor.click();
        // Press Ctrl+F — should open Monaco's find widget
        await graph.openFindWidget();
        const findVisible = await graph.waitForFindWidget(5000);
        expect(findVisible).toBe(true);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Clearing a draft in the fullscreen editor stays cleared after browsing history`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery("RETURN 1");
        await graph.clickRunQuery(false);

        await graph.insertQuery("MATCH (n) RETURN n");
        await graph.editorMaximize.click();
        await graph.clickClearInEditorDialog();
        // The Monaco model itself, not just the React state behind data-value.
        await expect(graph.dialogEditor.locator(".view-lines")).toHaveText("");
        await graph.clickMinimizeEditorDialog();
        await expect(graph.editorDialog).toBeHidden();

        // Up to the history entry and Down back to the draft, which must be the cleared one.
        await graph.clickEditorInput();
        await graph.pressEditorKey("ArrowUp");
        await expect(graph.editorContainer).toHaveAttribute("data-value", "RETURN 1");
        await expect(graph.editorContainer.locator(".view-lines")).toHaveText("RETURN 1");
        await graph.pressEditorKey("ArrowDown");
        await expect(graph.editorContainer).toHaveAttribute("data-value", "");
        await expect(graph.editorContainer.locator(".view-lines")).toHaveText("");
        await apicalls.removeGraph(graphName);
    });

});