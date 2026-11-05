import { test, expect } from "../infra/coverage";
import BrowserWrapper from "../infra/ui/browserWrapper";
import MetadataView from "../logic/POM/metadataView";
import urls from "../config/urls.json";
import APICalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

test.describe('Metadata Tests', () => {
    let browser: BrowserWrapper;
    let apiCalls : APICalls;
    let GRAPH_NAME: string;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCalls = new APICalls();
        GRAPH_NAME = getRandomString('metadata');
        await apiCalls.addGraph(GRAPH_NAME);
    });
    
    test.afterEach(async () => {
        await browser.closeBrowser();
        await apiCalls.removeGraph(GRAPH_NAME, "admin");
    });

    test('@admin check metadata view tab is disabled when there is no metadata', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        const isMetadataViewTabEnabled = await metadataView.GetIsMetadataViewTabEnabled();
        expect(isMetadataViewTabEnabled).toBe(false);
    });

    test('@admin check metadata view tab is enabled when there is metadata', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        await metadataView.selectGraphByName(GRAPH_NAME);
        await metadataView.insertQuery("CREATE (n) RETURN n");
        await metadataView.clickRunQuery();
        const isMetadataViewTabEnabled = await metadataView.GetIsMetadataViewTabEnabled();
        expect(isMetadataViewTabEnabled).toBe(true);
    });

    test('@admin metadata replaces mutation statistics after a read query', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        const page = await browser.getPage();
        await metadataView.selectGraphByName(GRAPH_NAME);
        await metadataView.insertQuery("CREATE (:MetadataCoverage {name: 'created'})");
        await metadataView.clickRunQuery(false);
        await metadataView.clickMetadataViewTab();
        const panel = page.getByRole('tabpanel', { name: 'Metadata', exact: true });
        await expect(panel).toContainText('Nodes created: 1');
        await expect(panel).toContainText('Properties set: 1');
        await metadataView.insertQuery("MATCH (n:MetadataCoverage) RETURN n");
        await metadataView.clickRunQuery(false);
        await metadataView.clickMetadataViewTab();
        await expect(panel).toContainText('Query internal execution time:');
        await expect(panel).not.toContainText('Nodes created: 1');
        await expect(panel).not.toContainText('Properties set: 1');
    });

    test('@admin failed profiling can be retried without losing metadata', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        const page = await browser.getPage();
        await metadataView.selectGraphByName(GRAPH_NAME);
        await metadataView.insertQuery("MATCH (n) RETURN n");
        await metadataView.clickRunQuery(false);
        await metadataView.clickMetadataViewTab();
        let attempts = 0;
        await page.route(`**/api/graph/${GRAPH_NAME}/profile?*`, async (route) => {
            attempts += 1;
            await route.fulfill(attempts === 1
                ? { status: 400, json: { message: 'Invalid input: profile temporarily unavailable' } }
                : { json: { result: ['Results | Records produced: 0', '    All Node Scan | Records produced: 0'] } });
        });
        const panel = page.getByRole('tabpanel', { name: 'Metadata', exact: true });
        await metadataView.clickProfileButton();
        await expect(page.getByText('Invalid input: profile temporarily unavailable', { exact: true })).toBeVisible();
        await expect(panel.getByRole('button', { name: 'Profile', exact: true })).toBeEnabled();
        await expect(panel).toContainText('Query internal execution time:');
        await metadataView.clickProfileButton();
        await expect(panel).toContainText('Records produced: 0');
        expect(attempts).toBe(2);
    });
});