import { expect, test, type Request } from "@playwright/test";
import path from "path";
import fs from "fs";
import os from "os";
import { createServer } from "http";
import assert from "node:assert/strict";
import { getRandomString } from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from "../config/urls.json";

const FIXTURES_DIR = path.join(__dirname, "../config/fixtures");
const CYPHER_FIXTURE = path.join(FIXTURES_DIR, "upload-people.cypher");
const CYPHER_FILE_NAME = path.basename(CYPHER_FIXTURE);
const CSV_FIXTURE = path.join(FIXTURES_DIR, "upload-people.csv");
const CSV_FILE_NAME = path.basename(CSV_FIXTURE);
const CSV_LOAD_BODY = "CREATE (:Person {name: row.name, age: toInteger(row.age), city: row.city})";

const countPeople = async (apiCall: ApiCalls, graphName: string): Promise<number> => {
  const result = await apiCall.runQuery(graphName, "MATCH (n:Person) RETURN count(n) AS cnt");
  return Number(result.data[0]?.cnt ?? result.data[0]?.["count(n)"]);
};

const multipartFileNames = (request: Request): string[] =>
  Array.from((request.postDataBuffer()?.toString() ?? "").matchAll(/filename="([^"]*)"/g), (match) => match[1]);

// ---------------------------------------------------------------------------
// Cypher batch upload: 3 CREATE statements → 3 City nodes
// ---------------------------------------------------------------------------
test.describe("Upload Graph – Cypher batch", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;
  let graphName: string | undefined;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    const graphToRemove = graphName;
    graphName = undefined;

    // Close first: a live graph page polls graph info, and that poll
    // re-creates a graph deleted out from under it.
    try {
      await browser.closeBrowser();
    } finally {
      if (graphToRemove) {
        expect((await apiCall.removeGraph(graphToRemove, "admin")).message).toMatch(/deleted|empty key/i);
      }
    }
  });

  test(`@admin Upload a Cypher batch file and verify nodes are created`, async () => {
    graphName = getRandomString("uploadCypher");
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
  });

  test(`@admin Upload button is disabled when no file is selected`, async () => {
    graphName = getRandomString("uploadNoFile");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.openUploadDialog(graphName);
    // No file attached — confirm button should be disabled (Cypher-only dialog)
    expect(await graph.uploadConfirm.isDisabled()).toBe(true);
  });

  test(`@admin Preview a large Cypher file and hide the truncated preview`, async () => {
    graphName = getRandomString("uploadPreview");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.openUploadDialog(graphName);
    await graph.setUploadFile({
      name: "large.cypher",
      mimeType: "text/plain",
      buffer: Buffer.from(`RETURN 1;\n${"// preview line\n".repeat(16000)}`),
    });
    await expect(graph.uploadViewFile).toBeEnabled();
    await graph.uploadViewFile.click();
    await expect(graph.toast).toContainText("Preview truncated");
    await expect(graph.uploadFilePreview).toBeVisible();
    await expect.poll(async () => (await graph.getUploadPreviewContent())?.length).toBe(250_000);
    expect(await graph.getUploadPreviewContent()).toMatch(/^RETURN 1;\n/);
    await graph.uploadHidePreview.click();
    await expect(graph.uploadFilePreview).toBeHidden();
    await expect(graph.uploadConfirm).toBeEnabled();
  });

  test(`@admin Validate an unsupported Cypher replacement is rejected and the valid file is the one uploaded`, async () => {
    graphName = getRandomString("uploadRejected");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const page = await browser.getPage();
    const uploadedFileNames: string[] = [];
    await page.route("**/api/upload", async (route) => {
      uploadedFileNames.push(...multipartFileNames(route.request()));
      await route.fulfill({ json: { id: "valid-file" } });
    });
    await page.route(`**/api/graph/${graphName}/upload`, (route) =>
      route.fulfill({ json: { message: "Valid file processed" } }));
    await graph.openUploadDialog(graphName);
    await graph.setUploadFile(CYPHER_FIXTURE);
    await expect(graph.uploadConfirm).toBeEnabled();
    await expect(graph.uploadDialog).toContainText(CYPHER_FILE_NAME);
    await graph.setUploadFile({
      name: "invalid.json", mimeType: "application/json", buffer: Buffer.from('{"invalid":true}'),
    });
    await expect(graph.errorToast).toContainText("Please choose a .txt or .cypher file.");
    await expect(graph.uploadConfirm).toBeEnabled();
    await expect(graph.uploadDialog).toContainText(CYPHER_FILE_NAME);
    await expect(graph.uploadDialog).not.toContainText("invalid.json");
    await graph.clickUploadConfirm();
    await expect(graph.toast).toContainText("Valid file processed");
    await expect(graph.uploadConfirm).toBeHidden();
    expect(uploadedFileNames).toEqual([CYPHER_FILE_NAME]);
  });

  test(`@admin Validate a malformed upload response keeps the file available for retry`, async () => {
    graphName = getRandomString("uploadMalformed");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const page = await browser.getPage();
    const uploadedFileNames: string[] = [];
    const processingPayloads: unknown[] = [];
    let uploadCalls = 0;
    await page.route("**/api/upload", async (route) => {
      uploadCalls += 1;
      uploadedFileNames.push(...multipartFileNames(route.request()));
      await route.fulfill({ json: uploadCalls === 1 ? {} : { id: "retry-file" } });
    });
    await page.route(`**/api/graph/${graphName}/upload`, async (route) => {
      processingPayloads.push(route.request().postDataJSON());
      await route.fulfill({ json: { message: "Retry accepted" } });
    });
    await graph.openUploadDialog(graphName);
    await graph.setUploadFile(CYPHER_FIXTURE);
    await graph.submitUpload();
    await expect(graph.errorToast).toContainText("Unexpected response from server.");
    await expect(graph.uploadConfirm).toBeEnabled();
    expect(processingPayloads).toEqual([]);
    await graph.clickUploadConfirm();
    await expect(graph.toast).toContainText("Retry accepted");
    await expect(graph.uploadConfirm).toBeHidden();
    expect(uploadedFileNames).toEqual([CYPHER_FILE_NAME, CYPHER_FILE_NAME]);
    expect(processingPayloads).toEqual([{ fileId: "retry-file" }]);
  });

  test(`@admin Validate rejected Cypher processing can be cancelled and reopened without stale files`, async () => {
    graphName = getRandomString("uploadProcessError");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const page = await browser.getPage();
    await page.route("**/api/upload", (route) => route.fulfill({ json: { id: "rejected-file" } }));
    await page.route(`**/api/graph/${graphName}/upload`, (route) =>
      route.fulfill({ status: 400, json: { message: "Invalid input: Cypher batch rejected" } }));
    await graph.openUploadDialog(graphName);
    await graph.setUploadFile(CYPHER_FIXTURE);
    await graph.submitUpload();
    await expect(graph.errorToast).toContainText("Invalid input: Cypher batch rejected");
    await expect(graph.uploadConfirm).toBeEnabled();
    await expect(graph.uploadDialog).toContainText(CYPHER_FILE_NAME);
    await graph.clickUploadCancel();
    await expect(graph.uploadConfirm).toBeHidden();
    await graph.clickUploadButton();
    await expect(graph.uploadConfirm).toBeDisabled();
    await expect(graph.uploadDialog).not.toContainText(CYPHER_FILE_NAME);
  });
});

// ---------------------------------------------------------------------------
// Load CSV: import a .csv via FalkorDB's native LOAD CSV. The upload is streamed
// to storage; here CI uses local file:// mode with a shared IMPORT_FOLDER volume.
// ---------------------------------------------------------------------------
test.describe("Upload Graph – Load CSV", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;
  let graphName: string | undefined;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    const graphToRemove = graphName;
    graphName = undefined;

    // Close first: a live graph page polls graph info, and that poll
    // re-creates a graph deleted out from under it.
    try {
      await browser.closeBrowser();
    } finally {
      if (graphToRemove) {
        expect((await apiCall.removeGraph(graphToRemove, "admin")).message).toMatch(/deleted|empty key/i);
      }
    }
  });

  test(`@admin Load a CSV via LOAD CSV and verify nodes are created`, async ({ }, testInfo) => {
    testInfo.setTimeout(90000);
    graphName = getRandomString("loadCsv");
    await apiCall.addGraph(graphName);
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
  });

  test(`@admin Validate an unsupported file is rejected on the Load CSV step and a valid CSV can still be chosen`, async () => {
    graphName = getRandomString("csvRejected");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.openUploadDialog(graphName);
    await graph.selectUploadTab("csv");
    await graph.setUploadFile({
      name: "people.json", mimeType: "application/json", buffer: Buffer.from('{"name":"Alice"}'),
    });
    await expect(graph.errorToast).toContainText("Please choose a .csv file.");
    await expect(graph.csvUploadTempConfirm).toBeDisabled();
    await expect(graph.uploadDialog).not.toContainText("people.json");
    await expect(graph.loadCsvRunConfirm).toBeHidden();

    await graph.setUploadFile(CSV_FIXTURE);
    await expect(graph.csvUploadTempConfirm).toBeEnabled();
    await expect(graph.uploadDialog).toContainText(CSV_FILE_NAME);
  });

  test(`@admin CSV preview follows a replacement file and can be hidden`, async () => {
    graphName = getRandomString("csvPreview");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.openUploadDialog(graphName);
    await graph.selectUploadTab("csv");
    await graph.setUploadFile({
      name: "first.csv", mimeType: "text/csv", buffer: Buffer.from("name\nAlice\n"),
    });
    await graph.uploadViewFile.click();
    await expect.poll(() => graph.getUploadPreviewContent()).toBe("name\nAlice\n");

    await graph.setUploadFile({
      name: "second.csv", mimeType: "text/csv", buffer: Buffer.from("name\nBob\n"),
    });
    await expect.poll(() => graph.getUploadPreviewContent()).toBe("name\nBob\n");
    await expect(graph.uploadDialog).toContainText("second.csv");
    await graph.uploadHidePreview.click();
    await expect(graph.uploadFilePreview).toBeHidden();
    await expect(graph.csvUploadTempConfirm).toBeEnabled();
  });

  test(`@admin Validate cancelling after the temp upload and reopening starts clean on the first step`, async () => {
    graphName = getRandomString("csvCancel");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const page = await browser.getPage();
    const [tempUpload] = await Promise.all([
      page.waitForResponse((response) =>
        response.request().method() === "POST" && new URL(response.url()).pathname === "/api/csv-temp"),
      graph.uploadCsvToTemp(graphName, CSV_FIXTURE),
    ]);
    const { key } = await tempUpload.json() as { key: string };

    const [cleanup] = await Promise.all([
      page.waitForResponse((response) =>
        response.request().method() === "DELETE" && new URL(response.url()).pathname.startsWith("/api/csv-temp/")),
      graph.clickUploadCancel(),
    ]);
    expect(new URL(cleanup.url()).pathname.endsWith(`/${encodeURIComponent(key)}`)).toBe(true);
    expect(cleanup.status()).toBe(204);

    // The temp CSV is really gone: LOAD CSV with its key no longer finds it.
    const reload = await apiCall.loadCsvWithRequest(page.request, graphName, key, "RETURN 1");
    expect(reload.status).toBe(404);
    expect(reload.body.message).toBe("Uploaded CSV not found. Please re-upload and try again.");
    await expect(graph.loadCsvRunConfirm).toBeHidden();

    await graph.clickUploadButton();
    await graph.selectUploadTab("csv");
    await expect(graph.csvUploadTempConfirm).toBeDisabled();
    await expect(graph.loadCsvRunConfirm).toBeHidden();
    await expect(graph.uploadDialog).not.toContainText(CSV_FILE_NAME);
  });

  // A LOAD CSV query failure is HTTP 200 with an `error` envelope (the route streams, so it
  // cannot change the status). A 5xx would flip the connection indicator to offline and
  // disable Run until the next 30s status poll, blocking the retry.
  test(`@admin Validate a failed LOAD CSV keeps the uploaded CSV and a retry imports the rows`, async ({ }, testInfo) => {
    testInfo.setTimeout(90000);
    graphName = getRandomString("csvRetry");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const page = await browser.getPage();
    let loadCsvCalls = 0;
    await page.route(`**/api/graph/${graphName}/load-csv`, async (route) => {
      loadCsvCalls += 1;
      if (loadCsvCalls === 1) {
        await route.fulfill({ json: { error: { message: "Failed to process the CSV file.", status: 422 } } });
        return;
      }
      await route.continue();
    });
    await graph.uploadCsvToTemp(graphName, CSV_FIXTURE);
    await graph.setLoadCsvBody(CSV_LOAD_BODY);
    await graph.clickLoadCsvRun();

    await expect(graph.errorToast).toContainText("Failed to process the CSV file.");
    await expect(graph.loadCsvRunConfirm).toBeEnabled();
    await expect(graph.csvUploadTempConfirm).toBeHidden();
    expect(await countPeople(apiCall, graphName)).toBe(0);

    await graph.clickLoadCsvRun();
    await expect(graph.toast).toContainText("LOAD CSV completed");
    await expect(graph.loadCsvRunConfirm).toBeHidden();
    expect(loadCsvCalls).toBe(2);
    expect(await countPeople(apiCall, graphName)).toBe(3);
  });

  test(`@admin CSV proxy fallback failures preserve the file for a successful upload`, async () => {
    graphName = getRandomString("csvFallback");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const page = await browser.getPage();
    let preparations = 0;
    let uploads = 0;
    const uploadedNames: string[] = [];
    await page.route("**/api/csv-temp/direct", async route => {
      preparations += 1;
      await route.fulfill(preparations === 1
        ? { status: 503, json: { message: "Direct storage unavailable" } }
        : { status: 409, json: { message: "Direct upload disabled" } });
    });
    await page.route("**/api/csv-temp", async route => {
      if (route.request().method() !== "POST") return route.continue();
      uploads += 1;
      uploadedNames.push(...multipartFileNames(route.request()));
      if (uploads === 1) return route.fulfill({ status: 400, json: { message: "Proxy rejected upload" } });
      if (uploads === 2) return route.fulfill({ json: {} });
      return route.continue();
    });
    await graph.openUploadDialog(graphName);
    await graph.selectUploadTab("csv");
    await graph.setUploadFile(CSV_FIXTURE);
    await graph.csvUploadTempConfirm.click();
    await expect(graph.errorToast).toContainText("Direct storage unavailable");
    await expect(graph.csvUploadTempConfirm).toBeEnabled();
    await expect(graph.uploadDialog).toContainText(CSV_FILE_NAME);

    await graph.csvUploadTempConfirm.click();
    await expect(graph.errorToast).toContainText("Unexpected response from server.");
    await expect(graph.csvUploadTempConfirm).toBeEnabled();
    await expect(graph.uploadDialog).toContainText(CSV_FILE_NAME);

    const [tempUpload] = await Promise.all([
      page.waitForResponse(response => response.request().method() === "POST"
        && new URL(response.url()).pathname === "/api/csv-temp"),
      graph.csvUploadTempConfirm.click(),
    ]);
    expect(tempUpload.status()).toBe(201);
    const { key } = await tempUpload.json() as { key: string };
    await expect(graph.loadCsvRunConfirm).toBeVisible();
    const [cleanup] = await Promise.all([
      page.waitForResponse(response => response.request().method() === "DELETE"
        && new URL(response.url()).pathname === `/api/csv-temp/${key}`),
      graph.clickUploadCancel(),
    ]);
    expect(cleanup.status()).toBe(204);
    expect(preparations).toBe(3);
    expect(uploads).toBe(3);
    expect(uploadedNames).toEqual([CSV_FILE_NAME, CSV_FILE_NAME, CSV_FILE_NAME]);
  });

  test(`@admin A malformed direct upload target keeps the CSV available for a successful retry`, async () => {
    graphName = getRandomString("csvDirectRetry");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const page = await browser.getPage();
    const uploaded: Array<{ body: Buffer; method: string | undefined; marker: string | string[] | undefined }> = [];
    const imports: unknown[] = [];
    let preparations = 0;
    const storage = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        uploaded.push({ body: Buffer.concat(chunks), method: request.method, marker: request.headers["x-upload-marker"] });
        response.writeHead(200);
        response.end();
      });
    });
    await new Promise<void>((resolve, reject) => {
      storage.once("error", reject);
      storage.listen(0, "127.0.0.1", resolve);
    });
    try {
      const address = storage.address();
      assert.ok(address && typeof address !== "string");
      await page.route("**/api/csv-temp/direct", async (route) => {
        preparations += 1;
        await route.fulfill({ json: preparations === 1
          ? { key: "direct-key", upload: { type: "s3-presigned-put", method: "POST" } }
          : { key: "direct-key", upload: {
            type: "s3-presigned-put", method: "PUT", url: new URL("/mock-direct-csv", page.url()).href,
            headers: { "x-upload-marker": "fixture" },
          } } });
      });
      await page.route("**/mock-direct-csv", (route) =>
        route.continue({ url: `http://127.0.0.1:${address.port}/mock-direct-csv` }));
      await page.route(`**/api/graph/${graphName}/load-csv`, async (route) => {
        imports.push(route.request().postDataJSON());
        await route.fulfill({ json: { message: "Direct import accepted" } });
      });
      await page.route("**/api/csv-temp/direct-key", (route) => route.fulfill({ status: 204 }));

      await graph.openUploadDialog(graphName);
      await graph.selectUploadTab("csv");
      await graph.setUploadFile(CSV_FIXTURE);
      await graph.csvUploadTempConfirm.click();
      await expect(graph.errorToast).toContainText("Unexpected direct-upload response.");
      await expect(graph.csvUploadTempConfirm).toBeEnabled();
      await expect(graph.uploadDialog).toContainText(CSV_FILE_NAME);
      expect(uploaded).toEqual([]);

      await graph.csvUploadTempConfirm.click();
      await expect(graph.loadCsvRunConfirm).toBeVisible();
      expect(uploaded).toEqual([{ body: fs.readFileSync(CSV_FIXTURE), method: "PUT", marker: "fixture" }]);
      await graph.setLoadCsvBody(CSV_LOAD_BODY);
      await graph.clickLoadCsvRun();
      await expect(graph.toast).toContainText("Direct import accepted");
      expect(preparations).toBe(2);
      expect(imports).toEqual([{ key: "direct-key", withHeaders: true, body: CSV_LOAD_BODY }]);
    } finally {
      await new Promise<void>((resolve, reject) => storage.close((error) => error ? reject(error) : resolve()));
    }
  });

  test(`@admin A rejected direct CSV upload reports the storage error and allows retry`, async () => {
    graphName = getRandomString("csvDirectFailure");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    const page = await browser.getPage();
    let uploads = 0;
    await page.route("**/api/csv-temp/direct", (route) => route.fulfill({ json: {
      key: "direct-key", upload: {
        type: "s3-presigned-put", method: "PUT", url: new URL("/mock-direct-csv", page.url()).href, headers: {},
      },
    } }));
    await page.route("**/mock-direct-csv", async (route) => {
      uploads += 1;
      await route.fulfill(uploads === 1 ? { status: 403, body: "Storage rejected upload" } : { status: 200 });
    });
    await page.route("**/api/csv-temp/direct-key", (route) => route.fulfill({ status: 204 }));

    await graph.openUploadDialog(graphName);
    await graph.selectUploadTab("csv");
    await graph.setUploadFile(CSV_FIXTURE);
    await graph.csvUploadTempConfirm.click();
    await expect(graph.errorToast).toContainText("S3 upload failed (403): Storage rejected upload.");
    await expect(graph.csvUploadTempConfirm).toBeEnabled();
    await expect(graph.uploadDialog).toContainText(CSV_FILE_NAME);
    await graph.csvUploadTempConfirm.click();
    await expect(graph.loadCsvRunConfirm).toBeVisible();
    expect(uploads).toBe(2);
    await graph.clickUploadCancel();
  });

  test(`@admin Upload CSV button is disabled until a CSV file is selected`, async () => {
    graphName = getRandomString("csvNoInput");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await graph.openUploadDialog(graphName);
    await graph.selectUploadTab("csv");
    // No file selected — the "Upload CSV" button should be disabled.
    expect(await graph.csvUploadTempConfirm.isDisabled()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST /api/upload: multipart validation and the read-only guard
// ---------------------------------------------------------------------------
test.describe("Upload API – /api/upload", () => {
  const apiCall = new ApiCalls();
  const cypherPart = (overrides: { name?: string; mimeType?: string } = {}) => ({
    name: "valid.cypher",
    mimeType: "text/plain",
    buffer: Buffer.from("CREATE (:City {name: 'Rome'});"),
    ...overrides,
  });

  test(`@admin Validate a request whose only part uses the wrong field name is rejected as having no file`, async ({ request }) => {
    // The route only reads the "file" field and ignores any other part, so no file is seen.
    const { status, body } = await apiCall.uploadFile(request, { attachment: cypherPart() });
    expect(status).toBe(400);
    expect(body.error).toBe("No file uploaded.");
  });

  for (const [description, part] of [
    ["an extension that is not allowed", cypherPart({ name: "people.json", mimeType: "application/json" })],
    ["a MIME type that does not match the extension", cypherPart({ mimeType: "image/png" })],
  ] as const) {
    test(`@admin Validate a file with ${description} is rejected`, async ({ request }) => {
      const { status, body } = await apiCall.uploadFile(request, { file: part });
      expect(status).toBe(400);
      expect(body.error).toBe("Invalid file type.");
    });
  }

  test(`@readonly Validate a read-only user cannot upload a file`, async ({ request }) => {
    const { status, body } = await apiCall.uploadFile(request, { file: cypherPart() });
    expect(status).toBe(403);
    expect(body.error).toBe("You do not have permission to upload files.");
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
