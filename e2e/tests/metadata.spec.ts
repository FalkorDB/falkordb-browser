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
    })
    
    test.afterEach(async () => {
        await apiCalls.removeGraph(GRAPH_NAME);
        await browser.closeBrowser();
    })

    test('@admin check metadata view tab is disabled when there is no metadata', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        const isMetadataViewTabEnabled = await metadataView.GetIsMetadataViewTabEnabled();
        expect(isMetadataViewTabEnabled).toBe(false);
    })

    test('@admin check metadata view tab is enabled when there is metadata', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        await metadataView.selectExistingGraph(GRAPH_NAME);
        await metadataView.insertQuery("CREATE (n) RETURN n");
        await metadataView.clickRunQuery(false);
        const isMetadataViewTabEnabled = await metadataView.GetIsMetadataViewTabEnabled();
        expect(isMetadataViewTabEnabled).toBe(true);
    })
    
    test('@admin check that metadata view tab is selected by default when only metadata is returned from a query', async () => {
        const metadataView = await browser.createNewPage(MetadataView, urls.graphUrl);
        await metadataView.selectExistingGraph(GRAPH_NAME);
        await metadataView.insertQuery("CREATE (n)");
        await metadataView.clickRunQuery(false);
        const isMetadataViewTabSelected = await metadataView.GetIsMetadataViewTabSelected();
        expect(isMetadataViewTabSelected).toBe(true);
    })
})