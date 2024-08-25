import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import { ApiCalls } from "../logic/api/apiCalls";
import { graphPage } from "../logic/POM/graphPage";
import urls  from '../config/urls.json'

test.describe('Graph Tests', () => {
    let browser : BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test.beforeEach(async () => {
        const graph = await browser.createNewPage(graphPage, urls.graphUrl)
        await graph.removeAllGraphs();
    })

    test.afterEach(async () => {
        const graph = await browser.createNewPage(graphPage, urls.graphUrl)
        await graph.removeAllGraphs();
    })

    test("Add graph via api -> verify display in UI test", async () => {
        const graph = await browser.createNewPage(graphPage, urls.graphUrl)
        const preGraphCount = await graph.countGraphsInMenu()
        const apiCall = new ApiCalls()
        const graphName = `graph_${Date.now()}`
        await apiCall.addGraph(graphName)
        await graph.refreshPage()
        const postGraphCount = await graph.countGraphsInMenu()        
        expect(postGraphCount).toBe(preGraphCount + 1)
    })

    test("Add graph via UI -> remove graph via API -> Verify graph removal in UI test", async () => {
        const graph = await browser.createNewPage(graphPage, urls.graphUrl)
        const graphName = `graph_${Date.now()}`
        await graph.addGraph(graphName);
        const apiCall = new ApiCalls()
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        await apiCall.removeGraph(graphName);
        await graph.refreshPage()
        expect(await graph.countGraphsInMenu()).toBe(0)
        
    })

})