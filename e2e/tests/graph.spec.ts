/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import fs from "fs";
import {
  getRandomString,
  DEFAULT_CREATE_QUERY,
  CREATE_QUERY,
} from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from "../config/urls.json";
import queryData from "../config/queries.json";

test.describe("Graph Tests", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@admin Add graph via API -> verify graph exists via UI`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    expect(await graph.verifyGraphExists(graphName)).toBe(true);
    await apiCall.removeGraph(graphName);
  });

  test(`@admin Add graph via API -> remove graph via UI -> validate graph exists via API`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.removeGraph(graphName);
    await graph.refreshPage();
    const response = await apiCall.getGraphs();
    expect(response.opts.includes(graphName)).toBe(false);
    await apiCall.removeGraph(graphName);
  });

  test(`@admin Add graph via UI -> remove graph via API -> Verify graph removal in UI`, async () => {
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const graphName1 = getRandomString("graph");
    const graphName2 = getRandomString("graph");
    await graph.addGraph(graphName1);
    await graph.addGraph(graphName2);
    await graph.refreshPage();
    await apiCall.removeGraph(graphName1);
    await graph.refreshPage();
    const response = await apiCall.getGraphs();
    expect(response.opts.includes(graphName1)).toBe(false);
    const graphExistsInUI = await graph.verifyGraphExists(graphName1, apiCall);
    expect(graphExistsInUI).toBe(false);
  });

  test(`@admin Create graph -> click the Export Data button -> verify the file has been successfully downloaded`, async () => {
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const graphName = getRandomString("graph");
    await graph.addGraph(graphName);
    const download = await graph.exportGraphByName(graphName);
    const downloadPath = await download.path();
    expect(fs.existsSync(downloadPath)).toBe(true);
    await apiCall.removeGraph(graphName);
  });
   
  queryData.queries[0].failedQueries.forEach((query) => {
       test(`@admin Validate failure & error message when user runs an invalid queries: ${query.name}`, async () => {
           const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
           const graphName = getRandomString('graph');
           await graph.addGraph(graphName);
           await graph.insertQuery(query.query);
           await graph.clickRunQuery(false);
           expect(await graph.getNotificationErrorToast()).toBe(true);
           await apiCall.removeGraph(graphName);
       });
   });

  test(`@admin Validate that modifying the graph name updates it correctly`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    const newGraphName = getRandomString("graph");
    await graph.modifyGraphName(graphName, newGraphName);
    const response = await apiCall.getGraphs();
    expect(response.opts.includes(newGraphName)).toBeTruthy();
    await apiCall.removeGraph(newGraphName);
  });

  test(`@readonly Validate that the button for modifying a graph name is not visible for RO user`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    expect(await graph.isModifyGraphNameButtonVisible(graphName)).toBeFalsy();
    await apiCall.removeGraph(graphName, "admin");
  });

  test(`@readwrite Validate that creating a graph with an existing name is prevented`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.addGraph(graphName, false);
    expect(await graph.getNotificationErrorToast()).toBeTruthy();
    await apiCall.removeGraph(graphName);
  });

  test(`@admin Validate that modifying a graph name to an existing name is prevented`, async () => {
    const graphName1 = getRandomString("graph");
    await apiCall.addGraph(graphName1);
    const graphName2 = getRandomString("graph");
    await apiCall.addGraph(graphName2);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.modifyGraphName(graphName2, graphName1);
    const graphs = await apiCall.getGraphs();
    expect(graphs.opts.includes(graphName1)).toBeTruthy();
    expect(graphs.opts.includes(graphName2)).toBeTruthy();
    await apiCall.removeGraph(graphName1);
    await apiCall.removeGraph(graphName2);
  });
    
  test(`@readwrite Validate that running multiple queries updates the node and edge count correctly`, async () => {
    const graphName = getRandomString('graph');
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(DEFAULT_CREATE_QUERY);
    await graph.clickRunQuery();
    const nodes = await graph.getNodesCount();
    const edges = await graph.getEdgesCount();
    expect(parseInt(nodes ?? "0", 10)).toBe(20);
    expect(parseInt(edges ?? "0", 10)).toBe(10);
    await apiCall.removeGraph(graphName);
  });

  test.only(`@readwrite validate that deleting graph relation doesn't decreases node count`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    const initCount = parseInt((await graph.getNodesCount()) ?? "", 10);
    await graph.deleteElementByName("knows");
    expect(parseInt((await graph.getNodesCount()) ?? "", 10)).toBe(initCount);
    await apiCall.removeGraph(graphName);
  });

  test.only(`@readwrite validate that deleting graph connected node decreases relation count by one`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    const initEdgesCount = await graph.getEdgesCount();
    await graph.deleteElementByName("a");
    const edgesCount = await graph.getEdgesCount();
    expect(parseInt(edgesCount ?? "0", 10)).toBe(
      parseInt(initEdgesCount ?? "0", 10) - 1
    );
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite validate that deleting graph relation decreases relation count`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    const initEdgesCount = await graph.getEdgesCount();
    await graph.deleteElementByName("knows");
    const edgesCount = await graph.getEdgesCount();
    expect(parseInt(edgesCount ?? "0", 10)).toBe(
      parseInt(initEdgesCount ?? "0", 10) - 1
    );
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite validate that deleting graph node decreases node count`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    const initNodesCount = await graph.getNodesCount();
    await graph.deleteElementByName("a");
    const nodesCount = await graph.getNodesCount();
    expect(parseInt(nodesCount ?? "0", 10)).toBe(
      parseInt(initNodesCount ?? "0", 10) - 1
    );
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite validate deleting graph relation via the canvas panels`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    const initEdgesCount = await graph.getEdgesCount();
    await graph.deleteElementByName("knows");
    const edgesCount = await graph.getEdgesCount();
    expect(parseInt(edgesCount ?? "0", 10)).toBe(
      parseInt(initEdgesCount ?? "0", 10) - 1
    );
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite validate when adding graph node updates the canvas labels`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    expect(
      await graph.isVisibleLabelsButtonByName("Labels", "person1")
    ).toBeTruthy();
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite validate adding graph relation updates the canvas relationshipTypes`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    expect(
      await graph.isVisibleLabelsButtonByName("Relationships", "KNOWS")
    ).toBeTruthy();
    await apiCall.removeGraph(graphName);
  });

  const invalidQueriesRO = [
    {
      query: "CREATE (n:Person { name: 'Alice' }) RETURN n",
      description: "create node query",
    },
    {
      query: "MATCH (n:Person { name: 'Alice' }) SET n.age = 30 RETURN n",
      description: "update node query",
    },
    {
      query: "MATCH (n:Person { name: 'Alice' }) DELETE n",
      description: "delete node query",
    },
    {
      query: "CREATE INDEX ON :Person(name)",
      description: "create index query",
    },
    {
      query: "MERGE (n:Person { name: 'Alice' }) RETURN n",
      description: "merge query that creates node",
    },
    {
      query: "UNWIND [1,2,3] AS x CREATE (:Number {value: x})",
      description: "unwind with create query",
    },
  ];

  invalidQueriesRO.forEach(({ query, description }) => {
    test(`@readonly Validate failure when RO user attempts to execute : ${description}`, async () => {
      const graphName = getRandomString('graph');
      await apiCall.addGraph(graphName);
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      await browser.setPageToFullScreen();
      await graph.selectGraphByName(graphName);
      await graph.insertQuery(query);
      await graph.clickRunQuery(false);
      expect(await graph.getNotificationErrorToast()).toBeTruthy();
      await apiCall.removeGraph(graphName, "admin");
    });
  });

  test(`@readonly Validate success when RO user attempts to execute ro-query`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, CREATE_QUERY);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 10");
    await graph.clickRunQuery();
    expect(await graph.getNotificationErrorToast()).toBeFalsy();
    expect(
      await graph.isVisibleLabelsButtonByName("Labels", "person1")
    ).toBeTruthy();
    await apiCall.removeGraph(graphName, "admin");
  });

  const queriesInput = [
    { query: "C", keywords: ["call", "collect", "count", "create"] },
    { query: "M", keywords: ["max", "min", "match", "merge"] },
  ];
  queriesInput.forEach(({ query, keywords }) => {
    test(`@readwrite Validate auto complete in query search for: ${query}`, async () => {
      const graphName = getRandomString("graph");
      await apiCall.addGraph(graphName);
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      await browser.setPageToFullScreen();
      await graph.selectGraphByName(graphName);
      await graph.insertQuery(query);
      const response = await graph.getQuerySearchListText();
      const hasAny = response.some((s) => keywords.some((k) => s.includes(k)));
      expect(hasAny).toBeTruthy();
      await apiCall.removeGraph(graphName);
    });
  });

  test(`@admin run graph query via UI and validate node and edge count via API`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    const count = await apiCall.getGraphCount(graphName);
    const edgesCount = count.result.edges;
    const nodesCount = count.result.nodes;
    expect(edgesCount).toBe(1);
    expect(nodesCount).toBe(2);
    await apiCall.removeGraph(graphName);
  });

  test(`@readonly Validate that RO user can select graph`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.selectGraphByName(graphName);
    await graph.waitForCanvasAnimationToEnd();
    expect(await graph.getNotificationErrorToast()).toBeFalsy();
    await apiCall.removeGraph(graphName, "admin");
  });

  test(`@admin Validate duplicate graph functionality via UI and verify via API`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, CREATE_QUERY);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.duplicateGraph(graphName);
    const duplicatedGraphName = `${graphName} (copy)`;

    const response = await apiCall.getGraphs();
    expect(response.opts.includes(duplicatedGraphName)).toBeTruthy();

    const originalCount = await apiCall.getGraphCount(graphName);
    const duplicatedCount = await apiCall.getGraphCount(duplicatedGraphName);
    expect(duplicatedCount.result.nodes).toBe(originalCount.result.nodes);
    expect(duplicatedCount.result.edges).toBe(originalCount.result.edges);
    await apiCall.removeGraph(graphName);
    await apiCall.removeGraph(duplicatedGraphName);
  });
});
