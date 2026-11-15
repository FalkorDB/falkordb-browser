import test, { expect } from "playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import { closeBrowserThenCleanup } from "../infra/closeBrowserThenCleanup";
import MetadataView from "../logic/POM/metadataView";
import urls from "../config/urls.json";
import APICalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

test.describe('Metadata Tests', () => {
    let browser: BrowserWrapper;
    let apiCalls : APICalls;
    let GRAPH_NAME: string;
    let graphsToRemove: string[];

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCalls = new APICalls();
        GRAPH_NAME = getRandomString('metadata');
        graphsToRemove = [GRAPH_NAME];
        await apiCalls.addGraph(GRAPH_NAME);
    });
    
    test.afterEach(async () => {
        // Close first: a live graph page polls graph info, and that poll
        // re-creates a graph deleted out from under it.
        await closeBrowserThenCleanup(
            () => browser.closeBrowser(),
            async () => {
                await Promise.all(graphsToRemove.map(async (name) => {
                    const { message } = await apiCalls.removeGraph(name, "admin");
                    if (!message.includes("deleted") && !message.includes("empty key")) {
                        throw new Error(`Failed to remove ${name}: ${message}`);
                    }
                }));
            },
        );
    });

    test('@admin check metadata view tab is disabled when there is no metadata', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        const isMetadataViewTabEnabled = await metadataView.GetIsMetadataViewTabEnabled();
        expect(isMetadataViewTabEnabled).toBe(false);
    });

    test('@admin profiling a write query does not execute it again', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        await metadataView.selectGraphByName(GRAPH_NAME);
        await metadataView.insertQuery("CREATE (n:ProfileDup) RETURN n");
        await metadataView.clickRunQuery();
        await metadataView.clickMetadataViewTab();
        const page = await browser.getPage();
        const profileResponse = page.waitForResponse((response) => response.url().includes('/profile?'));
        await metadataView.clickProfileButton();
        expect((await profileResponse).status()).toBe(400);
        await expect(metadataView.errorToast).toContainText("Profile only supports valid read-only Cypher queries; update clauses and CALL procedures are not profiled.");
        await expect(metadataView.profileReadOnlyNotice).toHaveText("Only read-only Cypher is profiled. CALL procedures, including read-only procedures, are not supported.");
        const result = await apiCalls.runQuery(GRAPH_NAME, "MATCH (n:ProfileDup) RETURN count(n) AS c");
        expect(Number(result.data[0].c)).toBe(1);
    });

    test('@admin check metadata view tab is enabled when there is metadata', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        await metadataView.selectGraphByName(GRAPH_NAME);
        await metadataView.insertQuery("CREATE (n) RETURN n");
        await metadataView.clickRunQuery();
        const isMetadataViewTabEnabled = await metadataView.GetIsMetadataViewTabEnabled();
        expect(isMetadataViewTabEnabled).toBe(true);
    });

    test('@admin graph cleanup runs when browser closing rejects', async () => {
        let cleanupRan = false;
        await expect(closeBrowserThenCleanup(
            async () => {
                throw new Error("browser close failed");
            },
            async () => {
                cleanupRan = true;
            },
        )).rejects.toThrow("browser close failed");
        expect(cleanupRan).toBe(true);
    });

    test('@admin metadata replaces mutation statistics after a read query', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        const { metadataLines } = metadataView;
        const queryRunLines = [/^Cached execution: [01]$/, /^Query internal execution time: [\d.]+ milliseconds$/];
        await metadataView.selectGraphByName(GRAPH_NAME);
        await metadataView.insertQuery("CREATE (:MetadataCoverage {name: 'created'})");
        await metadataView.clickRunQuery(false);
        await metadataView.clickMetadataViewTab();
        await expect(metadataLines).toHaveText(["Labels added: 1", "Nodes created: 1", "Properties set: 1", ...queryRunLines]);
        await metadataView.insertQuery("MATCH (n:MetadataCoverage) RETURN n");
        await metadataView.clickRunQuery(false);
        await metadataView.clickMetadataViewTab();
        await expect(metadataLines).toHaveText(queryRunLines);
    });

    test('@admin failed profiling can be retried without losing metadata', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        const page = await browser.getPage();
        await metadataView.selectGraphByName(GRAPH_NAME);
        await metadataView.insertQuery("MATCH (n) RETURN n");
        await metadataView.clickRunQuery(false);
        await metadataView.clickMetadataViewTab();
        let attempts = 0;
        // A 4xx keeps the connection indicator online (a 5xx would disable Profile), and the
        // "Invalid input:" prefix makes the toast show the raw message.
        await page.route(`**/api/graph/${GRAPH_NAME}/profile?*`, async (route) => {
            attempts += 1;
            await route.fulfill(attempts === 1
                ? { status: 400, json: { message: 'Invalid input: profile temporarily unavailable' } }
                : { json: { result: ['Results | Records produced: 0', '    All Node Scan | Records produced: 0'] } });
        });
        const { metadataLines } = metadataView;
        await expect(metadataLines).toContainText([/Query internal execution time:/]);
        const metadataBeforeProfiling = await metadataLines.allTextContents();
        await metadataView.clickProfileButton();
        await expect(metadataView.errorToast).toContainText('Invalid input: profile temporarily unavailable');
        await expect(metadataView.profileButton).toBeEnabled();
        await expect(metadataLines).toHaveText(metadataBeforeProfiling);
        await expect(metadataView.profileTree).toHaveCount(0);
        await metadataView.clickProfileButton();
        await expect(metadataView.profileTree).toBeVisible();
        await expect(metadataView.profileTree).toContainText('Records produced: 0');
        expect(attempts).toBe(2);
    });

    test('@admin profile works for a graph name with reserved URL characters', async () => {
        const graphName = `${getRandomString('metadata')}#a/b%c`;
        const encodedName = encodeURIComponent(graphName);
        graphsToRemove.push(encodedName);
        await apiCalls.addGraph(encodedName);
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        await metadataView.selectGraphByName(graphName);
        await metadataView.insertQuery("MATCH (n) RETURN n");
        await metadataView.clickRunQuery();
        await metadataView.clickMetadataViewTab();
        const page = await browser.getPage();
        const profileResponse = page.waitForResponse((response) => response.url().includes('/profile?'));
        await metadataView.clickProfileButton();
        const response = await profileResponse;
        expect(response.status()).toBe(200);
        const segments = new URL(response.url()).pathname.split('/');
        expect(segments).toHaveLength(5);
        expect(decodeURIComponent(segments[3])).toBe(graphName);
        await expect(metadataView.profileTree).toBeVisible();
        await expect(metadataView.profileTree).not.toBeEmpty();
    });
});
