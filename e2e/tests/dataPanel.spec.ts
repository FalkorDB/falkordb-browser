/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import DataPanel from "../logic/POM/dataPanelComponent";
import urls from "../config/urls.json";
import { CREATE_NODE_QUERY, getRandomString } from "../infra/utils";

test.describe('Data panel Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    })

    test.afterEach(async () => {
        await browser.closeBrowser();
    })

    test("@admin validate selecting node opens data panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        expect(await dataPanel.isVisibleDataPanel()).toBe(true);
    })

    test("@admin validate pressing x closes data panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.closeDataPanel();
        expect(await dataPanel.isVisibleDataPanel()).toBe(false);
    })
    
    test("@admin validate adding label to node via the canvas panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.addLabel("test", true);
        await dataPanel.closeDataPanel();
        expect(await dataPanel.isVisibleLabelsButtonByName("Labels", "test")).toBe(true);
    })

    test("@admin validate adding label to node via the data panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.addLabel("test", true);
        expect(await dataPanel.isVisibleLabel("test")).toBe(true);
    })

    test("@admin validate removing label to node via the canvas panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.addLabel("test", true);
        await dataPanel.removeLabel("test");
        expect(await dataPanel.isVisibleLabelsButtonByName("Labels", "test")).toBe(false);
    })
    
    test("@admin validate removing label to node via the data panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.addLabel("test");
        await dataPanel.removeLabel("test");
        expect(await dataPanel.isVisibleLabel("test")).toBe(false);
    })
    
    test("@admin validate adding attribute to node via the data panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.addAttribute("test", "test");
        expect(await dataPanel.isVisibleAttribute("test")).toBe(true);
    })
    
    test("@admin validate adding attribute to node via attribute count", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        const initialCount = await dataPanel.getContentDataPanelAttributesCount();
        await dataPanel.addAttribute("test", "test");
        const newCount = await dataPanel.getContentDataPanelAttributesCount();
        expect(newCount).toBe(initialCount + 1);
    })
    
    test("@admin validate removing attribute to node via the data panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.addAttribute("test", "test");
        await dataPanel.removeAttribute("test");
        expect(await dataPanel.isVisibleAttribute("test")).toBe(false);
    })
    
    test("@admin validate removing attribute to node via attribute count", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.addAttribute("test", "test");
        const initialCount = await dataPanel.getContentDataPanelAttributesCount();
        await dataPanel.removeAttribute("test");
        const newCount = await dataPanel.getContentDataPanelAttributesCount();
        expect(newCount).toBe(initialCount - 1);
    })
    
    test("@admin validate deleting node closes data panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName, "admin");
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.deleteElementByName("a");
        expect(await dataPanel.isVisibleDataPanel()).toBe(false);
    })
})