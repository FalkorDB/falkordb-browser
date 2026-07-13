/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import path from "path";
import fs from "fs";
import os from "os";
import { getRandomString } from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from "../config/urls.json";

const FIXTURES_DIR = path.join(__dirname, "../config/fixtures");
const CYPHER_FIXTURE = path.join(FIXTURES_DIR, "upload-people.cypher");
const CSV_FIXTURE = path.join(FIXTURES_DIR, "upload-people.csv");

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
    // No file attached — confirm button should be disabled (Cypher-only dialog)
    expect(await graph.uploadConfirm.isDisabled()).toBe(true);

    await apiCall.removeGraph(graphName);
  });
});

// ---------------------------------------------------------------------------
// CSV upload: run a per-row Cypher statement over each CSV row
// Temporarily skipped — the "Load CSV" mode is gated off behind
// CSV_UPLOAD_ENABLED (lib/graphUpload.ts) while its CSV temp-storage subsystem
// is hardened and given full coverage in a follow-up PR, so the CSV tab is
// hidden in the UI. Re-enable together with the flag. Note: these cases target
// the older per-row UNWIND flow and must be rewritten for the LOAD CSV flow.
// ---------------------------------------------------------------------------
test.describe.skip("Upload Graph – CSV", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@admin Upload a CSV file with a per-row query and verify nodes are created`, async () => {
    const graphName = getRandomString("uploadCsv");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.uploadGraphData(
      graphName,
      "csv",
      CSV_FIXTURE,
      "CREATE (:Person {name: row.name, age: row.age, city: row.city})"
    );

    expect(await graph.toast.textContent()).toContain("Upload completed");

    const result = await apiCall.runQuery(
      graphName,
      "MATCH (n:Person) RETURN count(n) AS cnt"
    );
    const cnt = result.data[0]?.cnt ?? result.data[0]?.["count(n)"];
    expect(Number(cnt)).toBe(3);

    await apiCall.removeGraph(graphName);
  });

  test(`@admin Upload button is disabled until a CSV file and query are provided`, async () => {
    const graphName = getRandomString("csvNoInput");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.openUploadDialog(graphName);
    await graph.selectUploadTab("csv");
    // No file and no query — confirm button should be disabled
    expect(await graph.uploadConfirm.isDisabled()).toBe(true);

    await apiCall.removeGraph(graphName);
  });
});

// ---------------------------------------------------------------------------
// Dump restore: export a populated graph, restore it into an existing graph
// Temporarily skipped — dump restore is disabled (DUMP_RESTORE_ENABLED=false)
// due to a FalkorDB RESTORE bug. Re-enable this suite when the flag is flipped.
// ---------------------------------------------------------------------------
test.describe.skip("Upload Graph – Dump restore", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@admin Export a graph as a dump then restore it into another graph via Upload Data`, async () => {
    const sourceGraph = getRandomString("dumpSource");
    const destGraph = getRandomString("dumpDest");

    // Create source graph with 5 nodes
    await apiCall.addGraph(sourceGraph);
    await apiCall.runQuery(
      sourceGraph,
      "UNWIND range(1, 5) AS i CREATE (:Item {id: i})"
    );

    // Export → download the .dump file, saving it with its real filename so the
    // extension is preserved (the upload API validates by file extension).
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const download = await graph.exportGraphByName(sourceGraph);
    const dumpPath = path.join(os.tmpdir(), download.suggestedFilename());
    await download.saveAs(dumpPath);
    expect(fs.existsSync(dumpPath)).toBe(true);

    // Create an empty destination graph
    await apiCall.addGraph(destGraph);

    // Navigate back (manage panel closes after export)
    await graph.refreshPage();

    // Restore into the destination graph via Upload Data → Restore tab
    await graph.uploadGraphData(destGraph, "dump", dumpPath);

    expect(await graph.toast.textContent()).toContain("Graph restored successfully");

    // Verify destination graph now has 5 Item nodes
    const result = await apiCall.runQuery(
      destGraph,
      "MATCH (n:Item) RETURN count(n) AS cnt"
    );
    const cnt = result.data[0]?.cnt ?? result.data[0]?.["count(n)"];
    expect(Number(cnt)).toBe(5);

    await fs.promises.unlink(dumpPath).catch(() => {});
    await apiCall.removeGraph(sourceGraph);
    await apiCall.removeGraph(destGraph);
  });

  test(`@admin Restore button is disabled when no file is selected`, async () => {
    const graphName = getRandomString("dumpNoFile");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.openUploadDialog(graphName);
    // Restore tab is the default — confirm should be disabled with no file
    expect(await graph.uploadConfirm.isDisabled()).toBe(true);

    await apiCall.removeGraph(graphName);
  });
});
