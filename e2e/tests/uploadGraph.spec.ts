/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import path from "path";
import fs from "fs";
import { getRandomString } from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from "../config/urls.json";

const FIXTURES_DIR = path.join(__dirname, "../config/fixtures");
const CSV_FIXTURE = path.join(FIXTURES_DIR, "upload-people.csv");
const CYPHER_FIXTURE = path.join(FIXTURES_DIR, "upload-people.cypher");

// ---------------------------------------------------------------------------
// CSV upload: 3 data rows → 3 Person nodes created
// ---------------------------------------------------------------------------
const CSV_QUERY =
  "UNWIND [$row] AS row CREATE (:Person {name: row.name, age: toInteger(row.age), city: row.city})";

test.describe("Upload Graph – CSV", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@admin Upload a CSV file and verify nodes are created`, async () => {
    const graphName = getRandomString("uploadCsv");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.uploadGraphData(graphName, "csv", CSV_FIXTURE, CSV_QUERY);

    // Verify toast says Upload completed
    expect(await graph.toast.textContent()).toContain("Upload completed");

    // Verify 3 Person nodes were inserted via the API
    const result = await apiCall.runQuery(
      graphName,
      "MATCH (n:Person) RETURN count(n) AS cnt"
    );
    const cnt = result.data[0]?.cnt ?? result.data[0]?.["count(n)"];
    expect(Number(cnt)).toBe(3);

    await apiCall.removeGraph(graphName);
  });

  test(`@admin CSV upload without a query shows an error toast`, async () => {
    const graphName = getRandomString("uploadCsvNoQuery");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.openUploadDialog(graphName);
    await graph.selectUploadTab("csv");
    await graph.setUploadFile(CSV_FIXTURE);
    // Do NOT set a query — submit directly
    await graph.uploadConfirm.click();

    expect(await graph.getNotificationErrorToast()).toBe(true);

    await apiCall.removeGraph(graphName);
  });
});

// ---------------------------------------------------------------------------
// Cypher batch upload: 3 CREATE statements → 3 City nodes
// ---------------------------------------------------------------------------
test.describe("Upload Graph – Cypher batch", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@admin Upload a Cypher batch file and verify nodes are created`, async () => {
    const graphName = getRandomString("uploadCypher");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.uploadGraphData(graphName, "cypher", CYPHER_FIXTURE);

    expect(await graph.toast.textContent()).toContain("Upload completed");

    const result = await apiCall.runQuery(
      graphName,
      "MATCH (n:City) RETURN count(n) AS cnt"
    );
    const cnt = result.data[0]?.cnt ?? result.data[0]?.["count(n)"];
    expect(Number(cnt)).toBe(3);

    await apiCall.removeGraph(graphName);
  });

  test(`@admin Upload button is disabled when no file is selected`, async () => {
    const graphName = getRandomString("uploadNoFile");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.openUploadDialog(graphName);
    await graph.selectUploadTab("cypher");
    // No file attached — confirm button should be disabled
    expect(await graph.uploadConfirm.isDisabled()).toBe(true);

    await apiCall.removeGraph(graphName);
  });
});

// ---------------------------------------------------------------------------
// RDB upload: export a populated graph, restore it into a new empty graph
// ---------------------------------------------------------------------------
test.describe("Upload Graph – RDB restore", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@admin Export a graph as RDB then restore it into a new graph via upload`, async () => {
    const sourceGraph = getRandomString("rdbSource");
    const destGraph = getRandomString("rdbDest");

    // Create the source graph with 5 nodes
    await apiCall.addGraph(sourceGraph);
    await apiCall.runQuery(
      sourceGraph,
      "UNWIND range(1, 5) AS i CREATE (:Item {id: i})"
    );

    // Export → download the RDB file
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const download = await graph.exportGraphByName(sourceGraph);
    const rdbPath = await download.path();
    expect(fs.existsSync(rdbPath!)).toBe(true);

    // Create an empty destination graph
    await apiCall.addGraph(destGraph);

    // Navigate back to the graph page (manage panel is closed after export)
    await graph.refreshPage();

    // Upload the RDB into the destination graph
    await graph.uploadGraphData(destGraph, "rdb", rdbPath!);

    expect(await graph.toast.textContent()).toContain("Upload completed");

    // Verify the destination graph now has 5 Item nodes
    const result = await apiCall.runQuery(
      destGraph,
      "MATCH (n:Item) RETURN count(n) AS cnt"
    );
    const cnt = result.data[0]?.cnt ?? result.data[0]?.["count(n)"];
    expect(Number(cnt)).toBe(5);

    await apiCall.removeGraph(sourceGraph);
    await apiCall.removeGraph(destGraph);
  });
});
