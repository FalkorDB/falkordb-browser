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
        await expect(page.getByText("Profile only supports valid read-only Cypher queries; update clauses and CALL procedures are not profiled.", { exact: true })).toBeVisible();
        await expect(page.getByText("Only read-only Cypher is profiled. CALL procedures, including read-only procedures, are not supported.", { exact: true })).toBeVisible();
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
        await expect(panel).not.toContainText(
            /(?:Labels (?:added|removed)|Nodes (?:created|deleted)|Properties (?:set|removed)|(?:Relationships|Indices|Constraints) (?:created|deleted)):/,
        );
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
        const metadataLines = panel.getByRole('heading', { name: 'Metadata', exact: true })
            .locator('..').getByRole('listitem');
        await expect(metadataLines).toContainText([/Query internal execution time:/]);
        const metadataBeforeProfiling = await metadataLines.allTextContents();
        await metadataView.clickProfileButton();
        await expect(page.getByText('Invalid input: profile temporarily unavailable', { exact: true })).toBeVisible();
        await expect(panel.getByRole('button', { name: 'Profile', exact: true })).toBeEnabled();
        await expect(metadataLines).toHaveText(metadataBeforeProfiling);
        await metadataView.clickProfileButton();
        await expect(panel).toContainText('Records produced: 0');
        expect(attempts).toBe(2);
    });

    test('@admin profile works for a graph name with reserved URL characters', async () => {
        const graphName = `${getRandomString('metadata')}#a/b%c`;
        const encodedName = encodeURIComponent(graphName);
        await apiCalls.addGraph(encodedName);
        try {
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
            await expect(page.getByTestId("profileTree")).toBeVisible();
            await expect(page.getByTestId("profileTree")).not.toBeEmpty();
        } finally {
            await apiCalls.removeGraph(encodedName);
        }
    });
});
