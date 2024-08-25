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

    test("Add graph Test", async () => {
        const graph = await browser.createNewPage(graphPage, urls.graphUrl)
        const preGraphCount = await graph.countGraphsInMenu()
        const apiCall = new ApiCalls()
        await apiCall.addGraph()
        await graph.refreshPage()
        const postGraphCount = await graph.countGraphsInMenu()
        expect(postGraphCount).toBe(preGraphCount + 1)
    })

})