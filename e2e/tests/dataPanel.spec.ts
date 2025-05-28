/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import DataPanel from "../logic/POM/dataPanelComponent";
import urls from "../config/urls.json";
import { CREATE_NODE_QUERY, CREATE_TWO_NODES_QUERY, getRandomString } from "../infra/utils";
import { FETCH_FIRST_TEN_NODES } from "../config/constants";

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

    test(`@readwrite Validate modifying node attributes header via UI and validate via API`, async () => {
        const graphName = getRandomString('datapanel');        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(FETCH_FIRST_TEN_NODES);
        await graph.clickRunQuery();
        await graph.searchElementInCanvas("Bob");
        await graph.addLabel("attributetest", true);
        await graph.closeDataPanel();
        const response = await apicalls.runQuery(graphName, FETCH_FIRST_TEN_NODES ?? "");
        const labels = response.result.data.map(item => item.n.labels);
        expect(labels.flat()).toContain('attributetest');
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate modifying node attributes header via API and validate via UI`, async () => {
        const graphName = getRandomString('datapanel');       
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"})');
        await apicalls.runQuery(graphName, 'MATCH (n {name: "Alice"}) SET n:TestHeader REMOVE n:Person');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery("MATCH (n) RETURN n Limit 10");
        await graph.clickRunQuery(true);
        await graph.searchElementInCanvas("Alice");
        expect(await graph.getLabel("TestHeader")).toBe("TestHeader");
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate adding new attribute for node via ui and validation via API`, async () => {
        const graphName = getRandomString('datapanel');        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(FETCH_FIRST_TEN_NODES);
        await graph.clickRunQuery();
        await graph.searchElementInCanvas("Alice");
        await graph.addAttribute("age", "30");
        const response = await apicalls.runQuery(graphName, FETCH_FIRST_TEN_NODES ?? "");
        const person = response.result.data.find(item => 'age' in item.n.properties);
        expect(person?.n.properties.age).toBe("30");
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate adding new attribute for node via API and validation via UI`, async () => {
        const graphName = getRandomString('datapanel');        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(FETCH_FIRST_TEN_NODES);
        await graph.clickRunQuery();
        await graph.searchElementInCanvas("Alice");
        expect(await graph.getAttributeValueByName("age")).toContain("30");
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate remove attribute for node via ui and validation via API`, async () => {
        const graphName = getRandomString('datapanel');        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(FETCH_FIRST_TEN_NODES);
        await graph.clickRunQuery();
        await graph.searchElementInCanvas("Alice");
        await graph.removeAttribute("age");
        const response = await apicalls.runQuery(graphName, FETCH_FIRST_TEN_NODES ?? "");
        const person = response.result.data.find(item => 'age' in item.n.properties);
        expect(person?.n.properties.age).toBeUndefined();
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate remove attribute for node via API and validation via UI`, async () => {
        const graphName = getRandomString('datapanel');        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        await apicalls.runQuery(graphName, 'MATCH (a:Person {name: "Alice"}) REMOVE a.age');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(FETCH_FIRST_TEN_NODES);
        await graph.clickRunQuery();
        await graph.searchElementInCanvas("Alice");
        expect(await graph.isAttributeValueByNameVisible("age")).toBe(false);
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate modify attribute for node via ui and validation via API`, async () => {
        const graphName = getRandomString('datapanel');        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(FETCH_FIRST_TEN_NODES);
        await graph.clickRunQuery();
        await graph.searchElementInCanvas("Alice");
        await graph.setAttribute("age", "70");
        const response = await apicalls.runQuery(graphName, FETCH_FIRST_TEN_NODES ?? "");
        const person = response.result.data.find(item => 'age' in item.n.properties);
        expect(person?.n.properties.age).toBe("70");
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate modify attribute for node via API and validation via UI`, async () => {
        const graphName = getRandomString('datapanel');        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        await apicalls.runQuery(graphName, 'MATCH (a:Person {name: "Alice"}) SET a.age = 35');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(FETCH_FIRST_TEN_NODES);
        await graph.clickRunQuery();
        await graph.searchElementInCanvas("Alice");
        expect(await graph.getAttributeValueByName("age")).toContain("35");
        await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate delete node via ui and validation via API`, async () => {
        const graphName = getRandomString('datapanel');        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(FETCH_FIRST_TEN_NODES);
        await graph.clickRunQuery();
        await graph.searchElementInCanvas("Alice");
        await graph.deleteElementByName("Alice", "Node");
        const response = await apicalls.runQuery(graphName, FETCH_FIRST_TEN_NODES ?? "");
        expect(response.result.data.length).toBe(1);
        await apicalls.removeGraph(graphName);
    });
    //issue 988
    test.skip(`@readwrite Validate delete node via API and validation via UI`, async () => {
        const graphName = getRandomString('datapanel');        
        await apicalls.addGraph(graphName);
        await apicalls.runQuery(graphName, 'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})');
        await apicalls.runQuery(graphName, 'MATCH (b:Person {name: "Alice"}) DELETE b');
        const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
        await browser.setPageToFullScreen();
        await graph.selectGraphByName(graphName);
        await graph.insertQuery(FETCH_FIRST_TEN_NODES);
        await graph.clickRunQuery();
        const nodes = await graph.getNodesCount();
        expect(parseInt(nodes ?? "")).toBe(1);
        await apicalls.removeGraph(graphName);
    });

    test("@readwrite validate selecting node opens data panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName);
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        expect(await dataPanel.isVisibleDataPanel()).toBe(true);
    })

    test("@readwrite validate pressing x closes data panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName);
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.closeDataPanel();
        expect(await dataPanel.isVisibleDataPanel()).toBe(false);
    })
    
    test("@readwrite validate adding node label updates canvas labels", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName);
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.addLabel("test", true);
        await dataPanel.closeDataPanel();
        expect(await dataPanel.isVisibleLabelsButtonByName("Labels", "test")).toBe(true);
    })

    test("@readwrite validate removing node label updates canvas lables", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName);
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.addLabel("test", true);
        await dataPanel.removeLabel("test");
        expect(await dataPanel.isVisibleLabelsButtonByName("Labels", "test")).toBe(false);
    })
    
    test("@readwrite validate removing node label updates data panel lables", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName);
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_NODE_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.addLabel("test");
        await dataPanel.removeLabel("test");
        expect(await dataPanel.isVisibleLabel("test")).toBe(false);
    })
    
    test("@readwrite validate adding node attribute update attribute count", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName);
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
    
    test("@readwrite validate removing node attribute updates attribute count", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName);
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
    
    test("@readwrite validate deleting node closes data panel", async () => {
        const graphName = getRandomString("DataPanel")
        await apicalls.addGraph(graphName);
        const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
        await dataPanel.selectGraphByName(graphName);
        await dataPanel.insertQuery(CREATE_TWO_NODES_QUERY);
        await dataPanel.clickRunQuery();
        await dataPanel.searchElementInCanvas("a");
        await dataPanel.deleteElementByName("a", "Node");
        expect(await dataPanel.isVisibleDataPanel()).toBe(false);
    })
})