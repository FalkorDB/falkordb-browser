
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import urls from '../config/urls.json';
import QueryHistory from "../logic/POM/queryHistoryComponent";
import { getRandomString } from "../infra/utils";

/**
 * Runs `body`, then removes `graphs` (read after `body`, so it may add to the list).
 * removeGraph resolves with the HTTP status instead of throwing on error responses, so check it;
 * a leak fails the test only when the body passed, so cleanup never replaces the test's own error.
 */
async function withGraphCleanup(apicalls: ApiCalls, graphs: string[], body: () => Promise<void>): Promise<void> {
    let bodyFailed = true;
    try {
        await body();
        bodyFailed = false;
    } finally {
        const results = await Promise.allSettled(graphs.map((name) => apicalls.removeGraph(name, "admin")));
        const failures = results.flatMap((result, index) => {
            if (result.status === "rejected") return [`${graphs[index]}: ${String(result.reason)}`];
            return result.value.status >= 400 ? [`${graphs[index]}: HTTP ${result.value.status}`] : [];
        });
        if (failures.length > 0 && !bodyFailed) throw new Error(`Failed to remove graph(s): ${failures.join("; ")}`);
    }
}

test.describe('Query history Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;
    let browserClosed: boolean;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
        browserClosed = false;
    });

    test.afterEach(async () => {
        if (!browserClosed) await browser.closeBrowser();
    });

    test(`@admin profiling a selected history entry saves its profile to that entry`, async () => {
        const graphName = getRandomString('queryhistory-profile');
        const query = "MATCH (n) RETURN n";
        const historyQuery = "RETURN 3";
        const profile = ["Results | Records produced: 3"];
        const draftProfile = ["Results | Records produced: 0"];
        const timestamp = Date.now();
        const history = [query, historyQuery].map((text, index) => ({
            text,
            explain: [],
            profile: [],
            graphName,
            timestamp: timestamp + index,
            status: "Success" as const,
            elementsCount: 0,
            fav: false
        }));

        await withGraphCleanup(apicalls, [graphName], async () => {
            let releaseProfileResponse = () => {};
            let releaseDraftProfileResponse = () => {};
            try {
                await apicalls.addGraph(graphName);
                const graph = await browser.createNewPage(QueryHistory);
                const page = await browser.getPage();
                await page.addInitScript((queries) => {
                    localStorage.setItem("localhost:6379:default:query history", JSON.stringify(queries));
                }, history);
                await browser.navigateTo(urls.graphUrl);
                await browser.setPageToFullScreen();
                await graph.selectGraphByName(graphName);
                await graph.insertQuery(query);
                await graph.clickQueryHistoryButton();
                await expect(graph.historyTab("Edit Query")).toBeEnabled();
                await expect(graph.historyPanelEditor).toBeVisible();
                await expect(graph.historyTab("Profile")).toBeDisabled();
                await expect(graph.historyTab("Metadata")).toBeDisabled();
                await expect(graph.historyTab("Explain")).toBeDisabled();
                await graph.selectQueryInHistory(historyQuery);
                await expect(graph.historyTab("Profile")).toBeEnabled();

                let profiledRequest: unknown;
                let notifyProfileRequest = () => {};
                const profileRequestStarted = new Promise<void>((resolve) => {
                    notifyProfileRequest = resolve;
                });
                const profileResponseGate = new Promise<void>((resolve) => {
                    releaseProfileResponse = resolve;
                });
                let pendingProfiledRequest: unknown;
                let notifyPendingProfileRequest = () => {};
                const pendingProfileRequestStarted = new Promise<void>((resolve) => {
                    notifyPendingProfileRequest = resolve;
                });
                const draftProfileResponseGate = new Promise<void>((resolve) => {
                    releaseDraftProfileResponse = resolve;
                });
                await page.route("**/api/graph/*/profile", async (route) => {
                    const request = route.request().postDataJSON();
                    if (request.query === historyQuery) {
                        profiledRequest = request;
                        notifyProfileRequest();
                        await profileResponseGate;
                        await route.fulfill({ json: { result: profile } });
                    } else if (request.query === query) {
                        pendingProfiledRequest = request;
                        notifyPendingProfileRequest();
                        await draftProfileResponseGate;
                        await route.fulfill({ json: { result: draftProfile } });
                    } else {
                        await route.continue();
                    }
                });
                await graph.clickHistoryTab("Profile");
                await graph.clickHistoryProfileButton();
                await profileRequestStarted;
                expect(profiledRequest).toEqual({ query: historyQuery });

                await graph.selectQueryInHistory(query);
                await expect(graph.historyTab("Profile")).toBeEnabled();
                await graph.clickHistoryTab("Profile");
                await expect(graph.historyTab("Profile")).toHaveAttribute("data-state", "active");
                releaseProfileResponse();
                await expect.poll(async () => {
                    const stored = JSON.parse(await graph.getStoredQueryHistory()) as Array<{
                        text: string;
                        profile: string[];
                    }>;
                    return stored.find((entry) => entry.text === historyQuery)?.profile;
                }).toEqual(profile);
                await expect(graph.profileTree).not.toBeVisible();

                await graph.clickHistoryProfileButton();
                await pendingProfileRequestStarted;
                expect(pendingProfiledRequest).toEqual({ query });
                await graph.closeHistoryPanel();
                releaseDraftProfileResponse();
                await expect.poll(async () => {
                    const stored = JSON.parse(await graph.getStoredQueryHistory()) as Array<{
                        text: string;
                        profile: string[];
                    }>;
                    return stored.find((entry) => entry.text === query)?.profile;
                }).toEqual(draftProfile);

                await graph.clickQueryHistoryButton();
                await expect(graph.historyTab("Profile")).toBeEnabled();
                await graph.clickHistoryTab("Profile");
                await expect(graph.profileTree).toContainText("Records produced: 0");

                const stored = JSON.parse(await graph.getStoredQueryHistory()) as Array<{
                    text: string;
                    profile: string[];
                    graphName: string;
                }>;
                expect(stored.find((entry) => entry.text === historyQuery)).toMatchObject({
                    profile,
                    graphName
                });
                expect(stored.find((entry) => entry.text === query)).toMatchObject({
                    profile: draftProfile,
                    graphName
                });
            } finally {
                releaseProfileResponse();
                releaseDraftProfileResponse();
                await browser.closeBrowser();
                browserClosed = true;
            }
        });
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
            await apicalls.removeGraph(graphName, "admin");
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
        await expect(graph.nodeCanvasToolTip).toBeVisible();
        await expect(graph.nodeCanvasToolTip).toHaveText(searchQuery);
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
        const propertyKey = "historyAutocompleteProperty";
        await withGraphCleanup(apicalls, [graphName], async () => {
            await apicalls.addGraph(graphName);
            const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.selectGraphByName(graphName);
            const query = `CREATE (n:HistoryAutocomplete { ${propertyKey}: 1 }) RETURN n`;
            await graph.insertQuery(query);
            await graph.clickRunQuery(false);
            await graph.clickQueryHistoryButton();
            await expect(graph.historyTab("Profile")).toBeDisabled();
            await graph.clickHistoryPanelEditor();
            const page = await browser.getPage();
            await page.keyboard.press("Control+a");
            await page.keyboard.type("MATCH (n) RETURN n.");

            const suggestVisible = await graph.waitForSuggestWidget(5000);
            expect(suggestVisible).toBe(true);
            await expect(graph.monacoSuggestRows.filter({ hasText: propertyKey })).toHaveCount(1);
        });
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

    test(`@admin favorite filter shows only favorites and clearing the selected favorite removes the star`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        await withGraphCleanup(apicalls, [graphName], async () => {
            const tag = getRandomString('fav');
            const [plainA, favorite, plainB] = [`RETURN '${tag}-a'`, `RETURN '${tag}-b'`, `RETURN '${tag}-c'`];
            const favoriteName = `name-${tag}`;
            const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.selectGraphByName(graphName);
            await graph.runQueries([plainA, favorite, plainB]);
            await graph.clickQueryHistoryButton();
            for (const query of [plainA, favorite, plainB]) {
                await expect(graph.selectQueryHistory(query)).toBeVisible();
            }

            await graph.addHistoryQueryToFavorites(favorite, favoriteName);
            await expect(graph.historyFavButton(favorite)).toHaveAttribute("aria-label", "Remove from favorites");
            await expect(graph.selectQueryHistory(favorite)).toContainText(favoriteName);

            await graph.clickHistoryFavFilter();
            await expect(graph.selectQueryHistory(favorite)).toBeVisible();
            await expect(graph.selectQueryHistory(plainA)).toHaveCount(0);
            await expect(graph.selectQueryHistory(plainB)).toHaveCount(0);

            await graph.clickHistoryFavFilter();
            await expect(graph.selectQueryHistory(plainA)).toBeVisible();
            await expect(graph.selectQueryHistory(plainB)).toBeVisible();

            await graph.selectHistoryQueries([favorite]);
            await graph.clickHistoryClearSelected();
            await expect(graph.historyFavButton(favorite)).toHaveAttribute("aria-label", "Add to favorites");
            await expect(graph.selectQueryHistory(favorite)).not.toContainText(favoriteName);

            await graph.clickHistoryFavFilter();
            await expect(graph.selectQueryHistory(favorite)).toHaveCount(0);
        });
    });

    test(`@admin delete selected removes only those entries`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        await withGraphCleanup(apicalls, [graphName], async () => {
            const tag = getRandomString('delete');
            const [deletedA, deletedB, kept] = [`RETURN '${tag}-a'`, `RETURN '${tag}-b'`, `RETURN '${tag}-c'`];
            const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.selectGraphByName(graphName);
            await graph.runQueries([deletedA, deletedB, kept]);
            await graph.clickQueryHistoryButton();
            await expect(graph.selectQueryHistory(kept)).toBeVisible();

            await expect.poll(() => graph.getStoredQueryHistory()).toContain(deletedA);
            await graph.selectHistoryQueries([deletedA, deletedB]);
            await expect(graph.historySelectedCount).toHaveText("2");
            await graph.clickHistoryDelete();

            await expect(graph.selectQueryHistory(deletedA)).toHaveCount(0);
            await expect(graph.selectQueryHistory(deletedB)).toHaveCount(0);
            await expect(graph.selectQueryHistory(kept)).toBeVisible();
            await expect(graph.historySelectedCount).toHaveText("");
            await expect(graph.historyDeleteButton).toBeDisabled();

            await expect.poll(() => graph.getStoredQueryHistory()).toContain(kept);
            const stored = await graph.getStoredQueryHistory();
            expect(stored).not.toContain(deletedA);
            expect(stored).not.toContain(deletedB);
        });
    });

    test(`@admin export selected downloads a .cypher file with those queries`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        await withGraphCleanup(apicalls, [graphName], async () => {
            const tag = getRandomString('export');
            const [exportedA, exportedB, skipped] = [`RETURN '${tag}-a'`, `RETURN '${tag}-b'`, `RETURN '${tag}-c'`];
            const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.selectGraphByName(graphName);
            await graph.runQueries([exportedA, exportedB, skipped]);
            await graph.clickQueryHistoryButton();
            await expect(graph.selectQueryHistory(skipped)).toBeVisible();

            await graph.selectHistoryQueries([exportedA, exportedB]);
            const { filename, content } = await graph.exportSelectedHistory();

            expect(filename).toMatch(/^falkordb-queries-.+\.cypher$/);
            expect(content).toBe(
                `// graph: ${graphName}\n${exportedA}\n;\n\n// graph: ${graphName}\n${exportedB}\n;\n`
            );
        });
    });

    test(`@admin search and graph filter narrow the list; select-all affects visible rows only`, async () => {
        const firstGraph = getRandomString('queryhistory');
        const secondGraph = getRandomString('queryhistory');
        const created: string[] = [];
        await withGraphCleanup(apicalls, created, async () => {
            await apicalls.addGraph(firstGraph);
            created.push(firstGraph);
            await apicalls.addGraph(secondGraph);
            created.push(secondGraph);
            const tag = getRandomString('filter');
            const [alpha, beta, gamma] = [`RETURN '${tag}-alpha'`, `RETURN '${tag}-beta'`, `RETURN '${tag}-gamma'`];
            const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.selectGraphByName(firstGraph);
            await graph.runQueries([alpha, beta]);
            await graph.selectGraphByName(secondGraph);
            await graph.runQueries([gamma]);
            await graph.clickQueryHistoryButton();

            // The panel opens scoped to the selected graph
            await expect(graph.selectQueryHistory(gamma)).toBeVisible();
            await expect(graph.selectQueryHistory(alpha)).toHaveCount(0);
            await expect(graph.selectQueryHistory(beta)).toHaveCount(0);

            await graph.clickHistoryGraphFilter(firstGraph);
            await expect(graph.selectQueryHistory(alpha)).toBeVisible();
            await expect(graph.selectQueryHistory(beta)).toBeVisible();
            await expect(graph.selectQueryHistory(gamma)).toBeVisible();

            await graph.clickHistoryGraphFilter(secondGraph);
            await expect(graph.selectQueryHistory(gamma)).toHaveCount(0);
            await expect(graph.selectQueryHistory(alpha)).toBeVisible();
            await expect(graph.selectQueryHistory(beta)).toBeVisible();

            await graph.insertSearchQueryInput(`${tag}-alpha`);
            await expect(graph.selectQueryHistory(beta)).toHaveCount(0);
            await expect(graph.selectQueryHistory(alpha)).toBeVisible();

            await graph.clickHistorySelectAll();
            await expect(graph.historySelectedCount).toHaveText("1");
            await expect(graph.historySelectAllButton).toHaveAttribute("aria-label", "Deselect all queries");

            // Widening the search brings back a row that select-all never touched
            await graph.insertSearchQueryInput("");
            await expect(graph.selectQueryHistory(beta)).toBeVisible();
            await expect(graph.historySelectedCount).toHaveText("1");
            await expect(graph.historySelectAllButton).toHaveAttribute("aria-label", "Select all queries");
        });
    });

    test(`@admin wrap lines toggles; editing a history query and running it adds a new entry`, async () => {
        const graphName = getRandomString('queryhistory');
        await apicalls.addGraph(graphName);
        await withGraphCleanup(apicalls, [graphName], async () => {
            const tag = getRandomString('edit');
            const [original, edited] = [`RETURN '${tag}-original'`, `RETURN '${tag}-edited'`];
            const graph = await browser.createNewPage(QueryHistory, urls.graphUrl);
            await browser.setPageToFullScreen();
            await graph.selectGraphByName(graphName);
            await graph.runQueries([original]);
            await graph.clickQueryHistoryButton();
            await graph.selectQueryInHistory(original);

            await expect(graph.historyWrapLinesCheckbox).toHaveAttribute("aria-checked", "false");
            await expect.poll(() => graph.getHistoryPanelWordWrap()).toBe("off");
            await graph.clickHistoryWrapLines();
            await expect(graph.historyWrapLinesCheckbox).toHaveAttribute("aria-checked", "true");
            await expect.poll(() => graph.getHistoryPanelWordWrap()).toBe("on");
            await graph.clickHistoryWrapLines();
            await expect(graph.historyWrapLinesCheckbox).toHaveAttribute("aria-checked", "false");
            await expect.poll(() => graph.getHistoryPanelWordWrap()).toBe("off");

            await graph.setHistoryPanelQuery(edited);
            await expect(graph.historyPanelEditor).toContainText(edited);
            await graph.clickRunInQueryHistory();
            await expect(graph.historyPanel).toBeHidden();

            await graph.clickQueryHistoryButton();
            await expect(graph.selectQueryHistory(edited)).toBeVisible();
            await expect(graph.selectQueryHistory(original)).toBeVisible();
        });
    });

});