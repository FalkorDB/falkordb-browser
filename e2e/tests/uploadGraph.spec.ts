/* eslint-disable no-await-in-loop */
import { expect, test } from "../infra/coverage";
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
    try {
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      await graph.uploadGraphData(graphName, "cypher", CYPHER_FIXTURE);
      expect(await graph.toast.textContent()).toContain("Upload completed");

      const result = await apiCall.runQuery(
        graphName,
        "MATCH (n:City) RETURN count(n) AS cnt"
      );
      const cnt = result.data[0]?.cnt ?? result.data[0]?.["count(n)"];
      expect(Number(cnt)).toBe(3);
    } finally {
      await apiCall.removeGraph(graphName).catch(() => undefined);
    }
  });

  test(`@admin Upload button is disabled when no file is selected`, async () => {
    const graphName = getRandomString("uploadNoFile");
    await apiCall.addGraph(graphName);
    try {
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      await graph.openUploadDialog(graphName);
      // No file attached — confirm button should be disabled (Cypher-only dialog)
      expect(await graph.uploadConfirm.isDisabled()).toBe(true);
    } finally {
      await apiCall.removeGraph(graphName).catch(() => undefined);
    }
  });

  test("@admin rejects unsupported Cypher replacements without losing the valid file or uploading", async () => {
    const graphName = getRandomString("uploadRejected");
    await apiCall.addGraph(graphName);
    try {
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      const page = await browser.getPage();
      let uploadRequests = 0;
      await page.route("**/api/upload", async (route) => {
        uploadRequests += 1;
        await route.fulfill({ json: { id: "should-not-upload" } });
      });
      await graph.openUploadDialog(graphName);
      await graph.setUploadFile(CYPHER_FIXTURE);
      await expect(graph.uploadConfirm).toBeEnabled();
      await expect(graph.uploadDialog).toContainText("upload-people.cypher");
      await graph.uploadFileInput.setInputFiles({
        name: "invalid.json", mimeType: "application/json", buffer: Buffer.from('{"invalid":true}'),
      });
      await expect(graph.errorToast).toContainText("Please choose a .txt or .cypher file.");
      await expect(graph.uploadConfirm).toBeEnabled();
      await expect(graph.uploadDialog).toContainText("upload-people.cypher");
      await expect(graph.uploadDialog).not.toContainText("invalid.json");
      await page.waitForLoadState("networkidle");
      expect(uploadRequests).toBe(0);
    } finally {
      try {
        await browser.closeBrowser();
      } finally {
        expect((await apiCall.removeGraph(graphName, "admin")).message).toMatch(/deleted|empty key/i);
      }
    }
  });

  test("@admin malformed upload responses keep the file available for retry", async () => {
    const graphName = getRandomString("uploadMalformed");
    await apiCall.addGraph(graphName);
    try {
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      const page = await browser.getPage();
      let uploads = 0;
      let processing = 0;
      const processingPayloads: unknown[] = [];
      await page.route("**/api/upload", async (route) => {
        uploads += 1;
        await route.fulfill({ json: uploads === 1 ? {} : { id: "retry-file" } });
      });
      await page.route(`**/api/graph/${graphName}/upload`, async (route) => {
        processing += 1;
        processingPayloads.push(route.request().postDataJSON());
        await route.fulfill({ json: { message: "Retry accepted" } });
      });
      await graph.openUploadDialog(graphName);
      await graph.setUploadFile(CYPHER_FIXTURE);
      await graph.uploadConfirm.click();
      await expect(graph.errorToast).toContainText("Unexpected response from server.");
      await expect(graph.uploadConfirm).toBeEnabled();
      expect(processing).toBe(0);
      await graph.uploadConfirm.click();
      await expect(graph.toast).toContainText("Retry accepted");
      await expect(graph.uploadConfirm).toBeHidden();
      expect(uploads).toBe(2);
      expect(processing).toBe(1);
      expect(processingPayloads).toEqual([{ fileId: "retry-file" }]);
    } finally {
      try {
        await browser.closeBrowser();
      } finally {
        expect((await apiCall.removeGraph(graphName, "admin")).message).toMatch(/deleted|empty key/i);
      }
    }
  });

  test("@admin rejected Cypher processing can be cancelled and reopened without stale files", async () => {
    const graphName = getRandomString("uploadProcessError");
    await apiCall.addGraph(graphName);
    try {
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      const page = await browser.getPage();
      await page.route("**/api/upload", (route) => route.fulfill({ json: { id: "rejected-file" } }));
      await page.route(`**/api/graph/${graphName}/upload`, (route) =>
        route.fulfill({ status: 400, json: { message: "Invalid input: Cypher batch rejected" } }));
      await graph.openUploadDialog(graphName);
      await graph.setUploadFile(CYPHER_FIXTURE);
      await graph.uploadConfirm.click();
      await expect(graph.errorToast).toContainText("Invalid input: Cypher batch rejected");
      await expect(graph.uploadConfirm).toBeEnabled();
      await expect(graph.uploadDialog).toContainText("upload-people.cypher");
      await graph.uploadCancel.click();
      await expect(graph.uploadConfirm).toBeHidden();
      await graph.uploadBtn.click();
      await expect(graph.uploadConfirm).toBeDisabled();
      await expect(graph.uploadDialog).not.toContainText("upload-people.cypher");
    } finally {
      try {
        await browser.closeBrowser();
      } finally {
        expect((await apiCall.removeGraph(graphName, "admin")).message).toMatch(/deleted|empty key/i);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Load CSV: import a .csv via FalkorDB's native LOAD CSV. The upload is streamed
// to storage; here CI uses local file:// mode with a shared IMPORT_FOLDER volume.
// ---------------------------------------------------------------------------
test.describe("Upload Graph – Load CSV", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@admin Load a CSV via LOAD CSV and verify nodes are created`, async ({ }, testInfo) => {
    testInfo.setTimeout(90000);
    const graphName = getRandomString("loadCsv");
    await apiCall.addGraph(graphName);
    try {
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      await graph.loadCsvData(
        graphName,
        CSV_FIXTURE,
        "CREATE (:Person {name: row.name, age: toInteger(row.age), city: row.city})",
        true
      );
      expect(await graph.toast.textContent()).toContain("LOAD CSV completed");

      const result = await apiCall.runQuery(
        graphName,
        "MATCH (n:Person) RETURN count(n) AS cnt"
      );
      const cnt = result.data[0]?.cnt ?? result.data[0]?.["count(n)"];
      expect(Number(cnt)).toBe(3);
    } finally {
      await apiCall.removeGraph(graphName).catch(() => undefined);
    }
  });

  test(`@admin Upload CSV button is disabled until a CSV file is selected`, async () => {
    const graphName = getRandomString("csvNoInput");
    await apiCall.addGraph(graphName);
    try {
      const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
      await graph.openUploadDialog(graphName);
      await graph.selectUploadTab("csv");
      // No file selected — the "Upload CSV" button should be disabled.
      expect(await graph.csvUploadTempConfirm.isDisabled()).toBe(true);
    } finally {
      await apiCall.removeGraph(graphName).catch(() => undefined);
    }
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
