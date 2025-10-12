/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import DataPanel from "../logic/POM/dataPanelComponent";
import urls from "../config/urls.json";
import {
  CREATE_NODE_QUERY,
  CREATE_QUERY,
  CREATE_TWO_NODES_QUERY,
  getRandomString,
} from "../infra/utils";
import { FETCH_FIRST_TEN_NODES } from "../config/constants";

test.describe("Data panel Tests", () => {
  let browser: BrowserWrapper;
  let apicalls: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apicalls = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@readwrite Validate modifying node attributes header via UI and validate via API`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"})'
    );
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(FETCH_FIRST_TEN_NODES);
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Bob");
    await graph.addLabel("attributetest", true);
    await graph.closeDataPanel();
    const response = await apicalls.runQuery(
      graphName,
      FETCH_FIRST_TEN_NODES ?? ""
    );
    const labels = response.data.map((item) => item.n.labels);
    expect(labels.flat()).toContain("attributetest");
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite Validate modifying node attributes header via API and validate via UI`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"})'
    );
    await apicalls.runQuery(
      graphName,
      'MATCH (n {name: "Alice"}) SET n:TestHeader REMOVE n:Person'
    );
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("MATCH (n) RETURN n Limit 10");
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    expect(await graph.getLabel("TestHeader")).toBe("TestHeader");
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite Validate adding new attribute for node via ui and validation via API`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"})'
    );
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(FETCH_FIRST_TEN_NODES);
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    await graph.addAttribute("age", "30", "number");
    const response = await apicalls.runQuery(
      graphName,
      FETCH_FIRST_TEN_NODES ?? ""
    );
    const person = response.data.find(
      (item) => "age" in item.n.properties
    );
    expect(person?.n.properties.age).toBe(30);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite Validate adding new boolean attribute for node via ui and validation via API`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (:Person {name: "Alice"}), (:Person {name: "Bob"})'
    );
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(FETCH_FIRST_TEN_NODES);
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    await graph.addAttribute("isLocal", true, "boolean");
    const response = await apicalls.runQuery(
      graphName,
      FETCH_FIRST_TEN_NODES ?? ""
    );
    const person = response.data.find(
      (item) => "isLocal" in item.n.properties
    );
    expect(person?.n.properties.isLocal).toBe(true);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite Validate adding new attribute for node via API and validation via UI`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})'
    );
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(FETCH_FIRST_TEN_NODES);
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    expect(await graph.getAttributeValueByName("30")).toContain("30");
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite Validate remove attribute for node via ui and validation via API`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})'
    );
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(FETCH_FIRST_TEN_NODES);
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    await graph.removeAttribute("age");
    const response = await apicalls.runQuery(
      graphName,
      FETCH_FIRST_TEN_NODES ?? ""
    );
    const person = response.data.find(
      (item) => "age" in item.n.properties
    );
    expect(person?.n.properties.age).toBeUndefined();
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite Validate remove attribute for node via API and validation via UI`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})'
    );
    await apicalls.runQuery(
      graphName,
      'MATCH (a:Person {name: "Alice"}) REMOVE a.age'
    );
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
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})'
    );
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(FETCH_FIRST_TEN_NODES);
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    await graph.setAttribute("age", "70", "number");
    const response = await apicalls.runQuery(
      graphName,
      FETCH_FIRST_TEN_NODES ?? ""
    );
    const person = response.data.find(
      (item) => "age" in item.n.properties
    );
    expect(person?.n.properties.age).toBe(70);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite Validate modify attribute for node via API and validation via UI`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})'
    );
    await apicalls.runQuery(
      graphName,
      'MATCH (a:Person {name: "Alice"}) SET a.age = 35'
    );
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(FETCH_FIRST_TEN_NODES);
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    expect(await graph.getAttributeValueByName("35")).toContain("35");
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite Validate delete node via ui and validation via API`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})'
    );
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(FETCH_FIRST_TEN_NODES);
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    await graph.deleteElementByName("Alice");
    const response = await apicalls.runQuery(
      graphName,
      FETCH_FIRST_TEN_NODES ?? ""
    );
    expect(response.data.length).toBe(1);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite Validate delete node via API and validation via UI`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(
      graphName,
      'CREATE (a:Person {name: "Alice", age: 30}), (b:Person {name: "Bob"})'
    );
    await apicalls.runQuery(
      graphName,
      'MATCH (b:Person {name: "Alice"}) DELETE b'
    );
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(FETCH_FIRST_TEN_NODES);
    await graph.clickRunQuery();
    const nodes = await graph.getNodesCount();
    expect(parseInt(nodes ?? "0", 10)).toBe(1);
    await apicalls.removeGraph(graphName);
  });

  test("@readwrite validate selecting node opens data panel", async () => {
    const graphName = getRandomString("DataPanel");
    await apicalls.addGraph(graphName);
    const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
    await dataPanel.selectGraphByName(graphName);
    await dataPanel.insertQuery(CREATE_NODE_QUERY);
    await dataPanel.clickRunQuery();
    await dataPanel.searchElementInCanvas("a");
    expect(await dataPanel.isVisibleDataPanel()).toBe(true);
    await apicalls.removeGraph(graphName);
  });

  test("@readwrite validate pressing x closes data panel", async () => {
    const graphName = getRandomString("DataPanel");
    await apicalls.addGraph(graphName);
    const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
    await dataPanel.selectGraphByName(graphName);
    await dataPanel.insertQuery(CREATE_NODE_QUERY);
    await dataPanel.clickRunQuery();
    await dataPanel.searchElementInCanvas("a");
    await dataPanel.closeDataPanel();
    expect(await dataPanel.isVisibleDataPanel()).toBe(false);
    await apicalls.removeGraph(graphName);
  });

  test("@readwrite validate adding node label updates canvas labels", async () => {
    const graphName = getRandomString("DataPanel");
    await apicalls.addGraph(graphName);
    const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
    await dataPanel.selectGraphByName(graphName);
    await dataPanel.insertQuery(CREATE_NODE_QUERY);
    await dataPanel.clickRunQuery();
    await dataPanel.searchElementInCanvas("a");
    await dataPanel.addLabel("test", true);
    await dataPanel.closeDataPanel();
    expect(
      await dataPanel.isVisibleLabelsButtonByName("Labels", "test")
    ).toBe(true);
    await apicalls.removeGraph(graphName);
  });

  test("@readwrite validate removing node label updates canvas lables", async () => {
    const graphName = getRandomString("DataPanel");
    await apicalls.addGraph(graphName);
    const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
    await dataPanel.selectGraphByName(graphName);
    await dataPanel.insertQuery(CREATE_NODE_QUERY);
    await dataPanel.clickRunQuery();
    await dataPanel.searchElementInCanvas("a");
    await dataPanel.addLabel("test", true);
    await dataPanel.removeLabel("person1");
    await dataPanel.closeDataPanel();
    expect(
      await dataPanel.isVisibleLabelsButtonByName("Labels", "test")
    ).toBe(true);
    await apicalls.removeGraph(graphName);
  });

  test("@readwrite validate removing node label updates data panel lables", async () => {
    const graphName = getRandomString("DataPanel");
    await apicalls.addGraph(graphName);
    const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
    await dataPanel.selectGraphByName(graphName);
    await dataPanel.insertQuery(CREATE_NODE_QUERY);
    await dataPanel.clickRunQuery();
    await dataPanel.searchElementInCanvas("a");
    await dataPanel.addLabel("test");
    await dataPanel.removeLabel("person1");
    expect(await dataPanel.isVisibleLabel("person1")).toBe(false);
    await apicalls.removeGraph(graphName);
  });

  test("@readwrite validate adding node attribute update attribute count", async () => {
    const graphName = getRandomString("DataPanel");
    await apicalls.addGraph(graphName);
    const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
    await dataPanel.selectGraphByName(graphName);
    await dataPanel.insertQuery(CREATE_NODE_QUERY);
    await dataPanel.clickRunQuery();
    await dataPanel.searchElementInCanvas("a");
    const initialCount = await dataPanel.getContentDataPanelAttributesCount();
    await dataPanel.addAttribute("test", "test", "string");
    const newCount = await dataPanel.getContentDataPanelAttributesCount();
    expect(newCount).toBe(initialCount + 1);
    await apicalls.removeGraph(graphName);
  });

  test("@readwrite validate removing node attribute updates attribute count", async () => {
    const graphName = getRandomString("DataPanel");
    await apicalls.addGraph(graphName);
    const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await dataPanel.selectGraphByName(graphName);
    await dataPanel.insertQuery(CREATE_NODE_QUERY);
    await dataPanel.clickRunQuery();
    await dataPanel.searchElementInCanvas("a");
    await dataPanel.addAttribute("testname", "testvalue", "string");
    const initialCount = await dataPanel.getContentDataPanelAttributesCount();
    await dataPanel.removeAttribute("testname");
    const newCount = await dataPanel.getContentDataPanelAttributesCount();
    expect(newCount).toBe(initialCount - 1);
    await apicalls.removeGraph(graphName);
  });

  test("@readwrite validate deleting node closes data panel", async () => {
    const graphName = getRandomString("DataPanel");
    await apicalls.addGraph(graphName);
    const dataPanel = await browser.createNewPage(DataPanel, urls.graphUrl);
    await dataPanel.selectGraphByName(graphName);
    await dataPanel.insertQuery(CREATE_TWO_NODES_QUERY);
    await dataPanel.clickRunQuery();
    await dataPanel.searchElementInCanvas("a");
    await dataPanel.deleteElementByName("a");
    expect(await dataPanel.isVisibleDataPanel()).toBe(false);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite validate undo functionally after modifying node attributes update correctly`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(
      'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b'
    );
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("1");
    const valueAttribute = await graph.getAttributeValue("id");
    await graph.setAttribute("id", "10", "number");
    await graph.clickUnDoButtonInToast();
    expect(await graph.getAttributeValue("id")).toBe(valueAttribute);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite validate adding attribute updates attributes count in data panel`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(
      'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b'
    );
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("1");
    await graph.addAttribute("name", "Naseem", "string");
    expect(await graph.getContentDataPanelAttributesCount()).toBe(2);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite validate removing attribute updates attributes count in data panel`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(
      'CREATE (a:Person {id: "1", name: "Alice"}) RETURN a'
    );
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    await graph.removeAttribute("name");
    expect(await graph.getContentDataPanelAttributesCount()).toBe(1);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite validate modifying attribute via UI and verify via API`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(
      'CREATE (a:person1 {id: "1"}), (b:person2 {id: "2"}) RETURN a, b'
    );
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("1");
    await graph.setAttribute("id", "10", "number");
    const response = await apicalls.runQuery(graphName, "match (n) return n");
    expect(response.data.length).toBeGreaterThan(1);
    expect(response.data[1].n.properties.id).toBe(10);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite validate deleting attribute via UI and verify via API`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(
      'CREATE (a:Person {id: "1", name: "Alice"}) RETURN a'
    );
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    await graph.removeAttribute("name");
    const response = await apicalls.runQuery(graphName, "match (n) return n");
    expect(response.data[0].n.properties).not.toHaveProperty("name");
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite validate undo functionally after deleting attribute update correctly`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(
      'CREATE (a:Person {id: "1", name: "Alice"}) RETURN a'
    );
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    await graph.removeAttribute("name");
    await graph.clickUnDoButtonInToast();
    expect(await graph.getContentDataPanelAttributesCount()).toBe(2);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite Attempting to add existing label name for a node display error`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(
      'CREATE (a:Person {id: "1", name: "Alice"}) RETURN a'
    );
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");
    await graph.addLabel("Person");
    expect(await graph.getNotificationErrorToast()).toBeTruthy();
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite add node label via API and validate label exists via UI`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(graphName, CREATE_QUERY);
    await apicalls.addGraphNodeLabel(graphName, "0", { label: "artist" });

    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("match (n) return n");
    await graph.clickRunQuery();
    expect(
      await graph.isVisibleLabelsButtonByName("Labels", "artist")
    ).toBeTruthy();
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite delete node label via API and validate label doesn't exists via UI`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_NODE_QUERY);
    await graph.clickRunQuery(false);
    await apicalls.deleteGraphNodeLabel(graphName, "0", { label: "Employee" });
    await graph.refreshPage();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("match (n) return n");
    await graph.clickRunQuery(false);
    expect(
      await graph.isVisibleLabelsButtonByName("Labels", "Employee")
    ).toBeFalsy();
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite delete node via API and validate node count via UI`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_TWO_NODES_QUERY);
    await graph.clickRunQuery(false);
    await apicalls.deleteGraphNode(graphName, "0", { type: "true" });
    await graph.refreshPage();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("match (n) return n");
    await graph.clickRunQuery(false);
    const nodesCount = await graph.getNodesCount();
    expect(parseInt(nodesCount ?? "0", 10)).toBe(1);
    await apicalls.removeGraph(graphName);
  });

  test(`@readwrite add node via API and validate node count via UI`, async () => {
    const graphName = getRandomString("graph");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(graphName, CREATE_QUERY);
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("match (n) return n");
    await graph.clickRunQuery(false);
    const nodesCount = await graph.getNodesCount();
    expect(parseInt(nodesCount ?? "0", 10)).toBe(2);
    await apicalls.removeGraph(graphName);
  });
});