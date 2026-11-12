import test, { expect } from "playwright/test";
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
        await apiCalls.removeGraph(GRAPH_NAME);
        await browser.closeBrowser();
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
