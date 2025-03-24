/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import urls from '../config/urls.json'
import { FETCH_ALL_NODES } from "../config/constants";
import DataPanel from "../logic/POM/dataPanelComponent";

test.describe('Data panel Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test(`@readwrite Validate modifying node attributes header via UI and validate via API`, async () => {
        const graphName = `dataTable${Date.now()}`;        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(FETCH_ALL_NODES);
        await graph.clickRunQuery();
        await graph.searchForElementInCanvas("bob");
        await graph.rightClickAtCanvasCenter();
        await graph.modifyNodeHeaderAttribute("attributetest");
        const response = await apicalls.runQuery(graphName, FETCH_ALL_NODES ?? "");
        const labels = response.result.data.map(item => item.n.labels);
        expect(labels.flat()).toContain('attributetest');
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate modifying node attributes header via API and validate via UI`, async () => {
        const graphName = `dataTable${Date.now()}`;        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"})');
        await apicalls.runQuery(graphName, 'MATCH (n {name: "Alice"}) SET n:TestHeader REMOVE n:Person');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(FETCH_ALL_NODES);
        await graph.clickRunQuery();
        await graph.searchForElementInCanvas("alice");
        await graph.rightClickAtCanvasCenter();
        expect(await graph.getAttributeHeaderLabelInDataPanelHeader()).toBe("TestHeader");
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate adding new attribute for node via ui and validation via API`, async () => {
        const graphName = `dataTable${Date.now()}`;        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(FETCH_ALL_NODES);
        await graph.clickRunQuery();
        await graph.searchForElementInCanvas("alice");
        await graph.rightClickAtCanvasCenter();
        await graph.addAttribute("age", "30");
        const response = await apicalls.runQuery(graphName, FETCH_ALL_NODES ?? "");
        const person = response.result.data.find(item => 'age' in item.n.properties);
        expect(person?.n.properties.age).toBe("30");
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate adding new attribute for node via API and validation via UI`, async () => {
        const graphName = `dataTable${Date.now()}`;        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(FETCH_ALL_NODES);
        await graph.clickRunQuery();
        await graph.searchForElementInCanvas("alice");
        await graph.rightClickAtCanvasCenter();
        expect(await graph.getAttributeValueInGraphDataPanel()).toBe("30");
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate remove attribute for node via ui and validation via API`, async () => {
        const graphName = `dataTable${Date.now()}`;        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(FETCH_ALL_NODES);
        await graph.clickRunQuery();
        await graph.searchForElementInCanvas("alice");
        await graph.rightClickAtCanvasCenter();
        await graph.removeAttribute();
        const response = await apicalls.runQuery(graphName, FETCH_ALL_NODES ?? "");
        const person = response.result.data.find(item => 'age' in item.n.properties);
        expect(person?.n.properties.age).toBeUndefined();
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate remove attribute for node via API and validation via UI`, async () => {
        const graphName = `dataTable${Date.now()}`;        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        await apicalls.runQuery(graphName, 'MATCH (a:Person {name: "Alice"}) REMOVE a.age');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(FETCH_ALL_NODES);
        await graph.clickRunQuery();
        await graph.searchForElementInCanvas("alice");
        await graph.rightClickAtCanvasCenter(); 
        expect(await graph.isLastAttributeNameCellInGraphDataPanel("age")).toBe(false)
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate modify attribute for node via ui and validation via API`, async () => {
        const graphName = `dataTable${Date.now()}`;        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(FETCH_ALL_NODES);
        await graph.clickRunQuery();
        await graph.searchForElementInCanvas("alice");
        await graph.rightClickAtCanvasCenter();
        await graph.modifyAttribute("70");
        const response = await apicalls.runQuery(graphName, FETCH_ALL_NODES ?? "");
        const person = response.result.data.find(item => 'age' in item.n.properties);
        expect(person?.n.properties.age).toBe("70");
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate modify attribute for node via API and validation via UI`, async () => {
        const graphName = `dataTable${Date.now()}`;        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        await apicalls.runQuery(graphName, 'MATCH (a:Person {name: "Alice"}) SET a.age = 35');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(FETCH_ALL_NODES);
        await graph.clickRunQuery();
        await graph.searchForElementInCanvas("alice");
        await graph.rightClickAtCanvasCenter();
        expect(await graph.getAttributeValueInGraphDataPanel()).toBe("35")
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate delete node via ui and validation via API`, async () => {
        const graphName = `dataTable${Date.now()}`;        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(FETCH_ALL_NODES);
        await graph.clickRunQuery();
        await graph.searchForElementInCanvas("alice");
        await graph.rightClickAtCanvasCenter();
        await graph.deleteNodeViaDataPanel();
        const response = await apicalls.runQuery(graphName, FETCH_ALL_NODES ?? "");
        expect(response.result.data.length).toBe(1);
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate delete node via API and validation via UI`, async () => {
        const graphName = `dataTable${Date.now()}`;        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        await apicalls.runQuery(graphName, 'MATCH (b:Person {name: "Alice"}) DELETE b');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectExistingGraph(graphName);
        await graph.insertQuery(FETCH_ALL_NODES);
        await graph.clickRunQuery();
        const nodes = await graph.getNodesGraphStats();
        expect(parseInt(nodes ?? "")).toBe(1);
        await apicalls.removeGraph(graphName);
    });
})