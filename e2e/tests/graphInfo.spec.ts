/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import {
  getRandomString,
  DEFAULT_CREATE_QUERY,
  CREATE_QUERY,
} from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphInfoPage from "../logic/POM/graphInfoPage";
import urls from "../config/urls.json";

test.describe("Graph Info Panel Tests", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@readwrite Validate graph info panel displays correct node and edge counts`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    const nodesCount = await graph.getGraphInfoNodesCount();
    const edgesCount = await graph.getGraphInfoEdgesCount();
    expect(parseInt(nodesCount ?? "0", 10)).toBe(2);
    expect(parseInt(edgesCount ?? "0", 10)).toBe(1);
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate graph info panel displays node labels`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    expect(await graph.isGraphInfoNodeButtonVisible("person1")).toBeTruthy();
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate graph info panel displays relationship types`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    expect(await graph.isGraphInfoEdgeButtonVisible("KNOWS")).toBeTruthy();
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate graph info panel displays property keys count`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    const propertyKeysCount = await graph.getGraphInfoPropertyKeysCount();
    expect(parseInt(propertyKeysCount ?? "0", 10)).toBeGreaterThan(0);
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate clicking 'All Nodes' button in graph info panel inserts correct query`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(DEFAULT_CREATE_QUERY);
    await graph.clickRunQuery();

    await graph.openGraphInfoButton();

    // Click All Nodes button and verify the query inserted in editor
    await graph.clickGraphInfoAllNodesButton();
    const editorQuery = await graph.getEditorInput();
    expect(editorQuery).toBe("MATCH (n) RETURN n");
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate clicking 'All Edges' button in graph info panel inserts correct query`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(DEFAULT_CREATE_QUERY);
    await graph.clickRunQuery();

    await graph.openGraphInfoButton();

    // Click All Edges button and verify the query inserted in editor
    await graph.clickGraphInfoAllEdgesButton();
    const editorQuery = await graph.getEditorInput();
    expect(editorQuery).toBe("MATCH p=()-[]-() RETURN p");
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate clicking node label button in graph info panel inserts correct query`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();

    await graph.openGraphInfoButton();

    // Click person1 label button and verify the query inserted in editor
    await graph.clickGraphInfoNodeButton("person1");
    const editorQuery = await graph.getEditorInput();
    expect(editorQuery).toBe("MATCH (n:person1) RETURN n");
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate clicking relationship type button in graph info panel inserts correct query`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();

    await graph.openGraphInfoButton();

    // Click KNOWS relationship button and verify the query inserted in editor
    await graph.clickGraphInfoEdgeButton("KNOWS");
    const editorQuery = await graph.getEditorInput();
    expect(editorQuery).toBe("MATCH p=()-[:KNOWS]-() RETURN p");
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate graph info panel updates after adding more nodes`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    const initialNodesCount = await graph.getGraphInfoNodesCount();
    await graph.clickClearEditorInput();
    await graph.insertQuery("CREATE (c:person1 { name: 'Charlie' })");
    await graph.clickRunQuery(false);
    const updatedNodesCount = await graph.getGraphInfoNodesCount();
    expect(parseInt(updatedNodesCount ?? "0", 10)).toBe(
      parseInt(initialNodesCount ?? "0", 10) + 1
    );
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate graph info panel updates after adding new label type`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    expect(await graph.isGraphInfoNodeButtonNotVisible("person3")).toBeTruthy();
    await graph.clickClearEditorInput();
    await graph.insertQuery("CREATE (d:person3 { name: 'Diana' })");
    await graph.clickRunQuery(false);
    expect(await graph.isGraphInfoNodeButtonVisible("person3")).toBeTruthy();
    await apiCall.removeGraph(graphName);
  });

  test(`@readonly Validate graph info panel is accessible to RO user`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, CREATE_QUERY);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.openGraphInfoButton();
    const nodesCount = await graph.getGraphInfoNodesCount();
    const edgesCount = await graph.getGraphInfoEdgesCount();
    expect(parseInt(nodesCount ?? "0", 10)).toBe(2);
    expect(parseInt(edgesCount ?? "0", 10)).toBe(1);
    await apiCall.removeGraph(graphName, "admin");
  });

  test(`@readwrite Validate toggling graph info panel closes and opens it`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.openGraphInfoButton();
    expect(await graph.isGraphInfoPanelVisible()).toBeTruthy();
    await graph.clickGraphInfoButton();
    await new Promise(() => { setTimeout(() => {}, 1000)})
    expect(await graph.isGraphInfoPanelVisible()).toBeFalsy();
    await apiCall.removeGraph(graphName);
  });
  
  test(`@readwrite Validate graph info panel is not visible when no graph is selected`, async () => {
    const graphName1 = getRandomString("graph");
    const graphName2 = getRandomString("graph");
    await apiCall.addGraph(graphName1);
    await apiCall.addGraph(graphName2);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await new Promise(() => { setTimeout(() => {}, 1000)})
    expect(await graph.isGraphInfoPanelVisible()).toBeFalsy();
    await apiCall.removeGraph(graphName1);
    await apiCall.removeGraph(graphName2);
  });

  test(`@readwrite Validate graph info panel updates in real-time after deleting nodes`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    const initialNodesCount = await graph.getGraphInfoNodesCount();
    await graph.deleteElementByName("a");
    const updatedNodesCount = await graph.getGraphInfoNodesCount();
    expect(parseInt(updatedNodesCount ?? "0", 10)).toBe(
      parseInt(initialNodesCount ?? "0", 10) - 1
    );
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate graph info panel updates in real-time after deleting edges`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    const initialEdgesCount = await graph.getGraphInfoEdgesCount();
    await graph.deleteElementByName("knows");
    const updatedEdgesCount = await graph.getGraphInfoEdgesCount();
    expect(parseInt(updatedEdgesCount ?? "0", 10)).toBe(
      parseInt(initialEdgesCount ?? "0", 10) - 1
    );
    await apiCall.removeGraph(graphName);
  });

  test(`@admin Validate graph info panel displays memory usage`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    await apiCall.removeGraph(graphName);
  });
});
