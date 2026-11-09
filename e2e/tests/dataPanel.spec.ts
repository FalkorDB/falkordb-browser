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
import getPropertyUrl from "../../lib/propertyUrl";

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
    await graph.addAttribute("age", "30", "integer");
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
    await graph.setAttribute("age", "70", "integer");
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

  test("@admin property mutations preserve legacy URLs and read-only protection", async ({ request }) => {
    const graphName = getRandomString("propertyApi");
    const key = "_NEXTSEP_name/part";
    try {
      const result = await apicalls.runQuery(graphName, `CREATE (n {legacy: 1, \`${key}\`: 2}) RETURN ID(n) AS id`);
      const id = Number(result.data[0].id);
      const legacyUrl = `${urls.api.graphUrl}${encodeURIComponent(graphName)}/${id}/legacy`;
      const readProperties = async () => (await apicalls.runQuery(graphName, "MATCH (n) RETURN n")).data[0].n.properties;
      const updated = await request.post(legacyUrl, { data: { type: true, value: 7, valueType: "integer" } });
      expect(updated.ok(), await updated.text()).toBe(true);
      expect(await readProperties()).toEqual({ legacy: 7, [key]: 2 });
      const removed = await request.delete(legacyUrl, { data: { type: true } });
      expect(removed.ok(), await removed.text()).toBe(true);
      expect(await readProperties()).toEqual({ [key]: 2 });
      const protectedUrl = new URL(getPropertyUrl(graphName, id, key, true), `${urls.localHost}/`).toString();
      const blockedUpdate = await request.post(protectedUrl, { data: { type: true, value: 9, valueType: "integer" } });
      const blockedDelete = await request.delete(protectedUrl, { data: { type: true } });
      expect(blockedUpdate.status()).toBe(403);
      expect(blockedDelete.status()).toBe(403);
      expect(await readProperties()).toEqual({ [key]: 2 });
    } finally {
      const { message } = await apicalls.removeGraph(graphName);
      expect(message).toMatch(/deleted|empty key/);
    }
  });

  for (const [key, isNode] of [["a?b", false], ["_NEXTSEP_name/part", false], ["_NEXTSEP_name/part", true]] as const) {
  test(`@admin editing and deleting ${isNode ? "node" : "relationship"} property "${key}" targets the exact key`, async () => {
    test.setTimeout(60_000);
    const graphName = getRandomString("relationshipProperty");
    await apicalls.addGraph(graphName);
    try {
      const properties = `{\`${key}\`: 1, a: 2, \`name/part\`: 3}`;
      await apicalls.runQuery(graphName, isNode
        ? `CREATE (n:Person ${properties}) SET n.name = 'Alice'`
        : `CREATE (:Person {name: 'Alice'})-[:KNOWS ${properties}]->(:Person {name: 'Bob'})`);
      const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
      await browser.setPageToFullScreen();
      await graph.selectGraphByName(graphName);
      await graph.insertQuery(isNode ? "MATCH (n) RETURN n" : "MATCH (a)-[r:KNOWS]->(b) RETURN a, r, b");
      await graph.clickRunQuery();
      await graph.waitForCanvasAnimationToEnd();
      if (isNode) {
        await graph.searchElementInCanvas("Alice");
      } else {
        await graph.clickCenterControl();
        await graph.waitForScaleToStabilize();
        const links = await graph.getLinksScreenPositions();
        expect(links).toHaveLength(1);
        await graph.clickCanvasElement(links[0].midX, links[0].midY);
      }
      const readProperties = async () => {
        const response = await apicalls.runQuery(graphName, isNode ? "MATCH (n) RETURN n AS element" : "MATCH ()-[r:KNOWS]->() RETURN r AS element");
        return response.data[0].element.properties;
      };
      const neighbours = { a: 2, "name/part": 3, ...(isNode ? { name: "Alice" } : {}) };
      await graph.setAttribute(key, "70", "integer");
      await expect.poll(readProperties, { timeout: 10000 }).toEqual({ [key]: 70, ...neighbours });
      await graph.removeAttribute(key);
      await expect.poll(readProperties, { timeout: 10000 }).toEqual(neighbours);
    } finally {
      await browser.closeBrowser();
      await apicalls.removeGraph(graphName);
    }
  });
  }

  for (const key of ["a?b", "c#d", "e/f", "g%h"]) {
    test(`@readwrite Validate modifying attribute with reserved URL character key "${key}" updates that key only`, async () => {
      const graphName = getRandomString("datapanel");
      await apicalls.addGraph(graphName);
      await apicalls.runQuery(
        graphName,
        `CREATE (:Person {name: "Alice", \`${key}\`: 1, a: 2, c: 3, e: 4, g: 5})`
      );
      const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
      await browser.setPageToFullScreen();
      await graph.selectGraphByName(graphName);
      await graph.insertQuery(FETCH_FIRST_TEN_NODES);
      await graph.clickRunQuery();
      await graph.searchElementInCanvas("Alice");
      await graph.setAttribute(key, "70", "integer");
      // The UI save is async, so poll until it lands before checking the other keys.
      await expect.poll(async () => {
        const response = await apicalls.runQuery(graphName, FETCH_FIRST_TEN_NODES ?? "");
        return response.data[0].n.properties;
      }, { timeout: 10000 }).toEqual({ name: "Alice", [key]: 70, a: 2, c: 3, e: 4, g: 5 });
      await apicalls.removeGraph(graphName);
    });

    test(`@readwrite Validate removing attribute with reserved URL character key "${key}" removes that key only`, async () => {
      const graphName = getRandomString("datapanel");
      await apicalls.addGraph(graphName);
      await apicalls.runQuery(
        graphName,
        `CREATE (:Person {name: "Alice", \`${key}\`: 1, a: 2, c: 3, e: 4, g: 5})`
      );
      const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
      await browser.setPageToFullScreen();
      await graph.selectGraphByName(graphName);
      await graph.insertQuery(FETCH_FIRST_TEN_NODES);
      await graph.clickRunQuery();
      await graph.searchElementInCanvas("Alice");
      await graph.removeAttribute(key);
      // The UI save is async, so poll until it lands before checking the other keys.
      await expect.poll(async () => {
        const response = await apicalls.runQuery(graphName, FETCH_FIRST_TEN_NODES ?? "");
        return response.data[0].n.properties;
      }, { timeout: 10000 }).toEqual({ name: "Alice", a: 2, c: 3, e: 4, g: 5 });
      await apicalls.removeGraph(graphName);
    });
  }

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
    await graph.setAttribute("id", "10", "integer");
    await graph.clickUnDoButtonInToast();
    // Undo only queues the write; the panel is not repainted until it returns.
    await expect.poll(() => graph.getAttributeValue("id")).toBe(valueAttribute);
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
    await graph.setAttribute("id", "10", "integer");
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
    // Undo only queues the write; the panel is not repainted until it returns.
    await expect.poll(() => graph.getContentDataPanelAttributesCount()).toBe(2);
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
    await apicalls.runQuery(graphName, CREATE_TWO_NODES_QUERY);
    const idRes = await apicalls.runQuery(
      graphName,
      'MATCH (n {name: "a"}) RETURN ID(n) AS id LIMIT 1'
    );
    const nodeId = idRes?.data?.[0]?.id ?? idRes?.data?.[0]?.n?.identity ?? "0";
    await apicalls.deleteGraphNode(graphName, String(nodeId), { type: true });
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("match (n) return n");
    await graph.clickRunQuery();
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

  // The mobile sheets close one another because they all cover the same region.
  // Desktop has the room to show them at once, so opening one leaves the rest.
  test(`@readwrite Validate selecting a node keeps the chat and graph info open`, async () => {
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

    const page = await browser.getPage();
    await page.getByTestId("chatToggleButton").click();
    await expect(page.getByTestId("chatPanel")).toBeVisible();
    await expect(page.getByTestId("graphInfoPanel")).toBeVisible();

    await graph.searchElementInCanvas("Bob");
    expect(await graph.isVisibleDataPanel()).toBe(true);
    await expect(page.getByTestId("chatPanel")).toBeVisible();
    await expect(page.getByTestId("graphInfoPanel")).toBeVisible();

    await apicalls.removeGraph(graphName);
  });

  // A phone has no hover, so there the pencil is always out and the value cell
  // is left alone to scroll the row. Desktop keeps the shortcut: clicking the
  // value is how most edits start.
  test(`@readwrite Validate clicking an attribute value starts an edit`, async () => {
    const graphName = getRandomString("datapanel");
    await apicalls.addGraph(graphName);
    await apicalls.runQuery(graphName, 'CREATE (:Person {name: "Alice"})');
    const graph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(FETCH_FIRST_TEN_NODES);
    await graph.clickRunQuery();
    await graph.searchElementInCanvas("Alice");

    await graph.clickDataPanelValueSetAttribute();
    expect(await graph.isEditingAttribute()).toBe(true);

    await graph.clickDataPanelSetAttributeCancel();
    await apicalls.removeGraph(graphName);
  });
});