import { expect, test } from "@playwright/test";
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import TutotialPanel from "../logic/POM/tutorialPanelComponent";
import { getRandomString } from "../infra/utils";
import ApiCalls from "../logic/api/apiCalls";

test.describe(`Tutorial Test`, () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    })

    test.afterEach(async () => {
        await browser.closeBrowser();
    })

    test("@admin Validate adding a graph via tutorial and validate via API", async () => {
        const tutorial = await browser.createNewPage(TutotialPanel, urls.graphUrl);
        await tutorial.changeLocalStorage('true');
        await tutorial.refreshPage();
        const graphName = getRandomString('graph');
        await tutorial.createNewGraph(graphName);
        const graphs = await apiCall.getGraphs();
        expect(graphs.opts.includes(graphName)).toBeTruthy();
        await tutorial.changeLocalStorage('false');
        await apiCall.removeGraph(graphName);
    })

    test("@admin validate checking don't show this again will not display tutorial on refresh", async () => {
        const tutorial = await browser.createNewPage(TutotialPanel, urls.graphUrl);
        await tutorial.changeLocalStorage('true');
        await tutorial.refreshPage();
        await tutorial.dismissTutorial();
        await tutorial.refreshPage();
        expect(await tutorial.isContentInCenterHidden()).toBeTruthy();
        await tutorial.changeLocalStorage('false');
    })

    test("@admin validate that clicking away dismisses the tutorial panel", async () => {
        const tutorial = await browser.createNewPage(TutotialPanel, urls.graphUrl);
        await tutorial.changeLocalStorage('true');
        await tutorial.refreshPage();
        await tutorial.clickAtTopLeftCorner();
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(await tutorial.isContentInCenterHidden()).toBeTruthy();
        await tutorial.changeLocalStorage('false');
    })
})