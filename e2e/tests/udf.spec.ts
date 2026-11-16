import { readFile } from "fs/promises";
import type { Route } from "@playwright/test";
import { expect, test } from "../infra/coverage";
import BrowserWrapper from "../infra/ui/browserWrapper";
import UdfPage from "../logic/POM/udfPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

// Registers one function per name; falkor.register is how a library exposes them to Cypher.
const libraryCode = (libraryName: string, functionNames: string[]): string =>
  [
    `// ${libraryName}`,
    ...functionNames.flatMap((fn) => [
      `function ${fn}(x) { return x; }`,
      `falkor.register('${fn}', ${fn});`,
    ]),
  ].join("\n");

test.describe("UDF page", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;
  let libraries: string[];

  const newLibraryName = (): string => {
    const name = getRandomString("udf");
    libraries.push(name);
    return name;
  };

  const expectEditorShows = async (udfPage: UdfPage, code: string) => {
    const lines = code.split("\n");
    await expect.poll(() => udfPage.getEditorText()).toContain(lines[0]);
    const text = await udfPage.getEditorText();
    lines.forEach((line) => expect(text).toContain(line));
  };

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
    libraries = [];
  });

  test.afterEach(async () => {
    try {
      await Promise.allSettled(libraries.map((name) => apiCall.deleteUdf(name)));
      // A deletion that did not take effect would leak into the shared server, so fail the teardown.
      const leaked = (await apiCall.listUdfs()).filter((name) => libraries.includes(name));
      expect(leaked, "UDF libraries left behind by the test").toEqual([]);
    } finally {
      await browser.closeBrowser();
    }
  });

  test("@admin load a library from the UI and see it listed", async () => {
    const name = newLibraryName();
    const functions = ["addOne", "shout"];
    const code = libraryCode(name, functions);
    const udfPage = await browser.createNewPage(UdfPage);
    await udfPage.openUdfPage();

    await udfPage.loadLibrary(name, code);

    await expect.poll(() => udfPage.getLibraryNames()).toContain(name);
    await expect.poll(async () => (await udfPage.getFunctionNames()).sort()).toEqual([...functions].sort());
    expect(await apiCall.listUdfs()).toContain(name);
  });

  test("@admin selecting a library shows its code and functions", async () => {
    const first = newLibraryName();
    const second = newLibraryName();
    const firstFunctions = ["alphaOne", "alphaTwo"];
    const secondFunctions = ["betaOne"];
    const firstCode = libraryCode(first, firstFunctions);
    const secondCode = libraryCode(second, secondFunctions);
    await apiCall.loadUdf(first, firstCode);
    await apiCall.loadUdf(second, secondCode);
    const udfPage = await browser.createNewPage(UdfPage);
    await udfPage.openUdfPage();

    await udfPage.selectLibrary(first);
    await expectEditorShows(udfPage, firstCode);
    await expect.poll(async () => (await udfPage.getFunctionNames()).sort()).toEqual([...firstFunctions].sort());

    await udfPage.selectLibrary(second);
    await expectEditorShows(udfPage, secondCode);
    await expect.poll(async () => (await udfPage.getFunctionNames()).sort()).toEqual([...secondFunctions].sort());
    expect(await udfPage.getEditorText()).not.toContain(first);
  });

  test("@admin a function clicked while its library loads does not jump within the shown one", async () => {
    const shown = newLibraryName();
    const loading = newLibraryName();
    // The shown library names the other one's function (in code, not a comment,
    // which navigation skips), so a jump there is visible.
    // A trailing line keeps it off the last line, where loading code leaves the cursor.
    const shownCode = `${libraryCode(shown, ["alphaOne"])}\nconst elsewhere = "betaOne";\nconst done = true;`;
    const mentionLine = 4;
    await apiCall.loadUdf(shown, shownCode);
    await apiCall.loadUdf(loading, libraryCode(loading, ["betaOne"]));
    const udfPage = await browser.createNewPage(UdfPage);
    const page = await browser.getPage();
    await udfPage.openUdfPage();
    await udfPage.selectLibrary(shown);
    await expectEditorShows(udfPage, shownCode);

    const fail = (route: Route) => route.fulfill({ status: 500, json: { message: "unavailable" } });
    const held: Route[] = [];
    let holding = true;
    await page.route(`**/api/udf/${loading}`, (route) => (holding ? held.push(route) : fail(route)));
    await udfPage.expandLibrary(loading);
    await expect.poll(() => udfPage.getFunctionNames()).toEqual(["betaOne"]);
    const selectionBefore = await udfPage.getEditorSelectionLine();
    expect(selectionBefore).not.toBe(mentionLine);
    await udfPage.clickFunction("betaOne");

    // The load fails, so the panel goes back to the library the editor shows.
    // Fail every request for it, including one the click may still be sending.
    holding = false;
    await Promise.all(held.map(fail));
    await expect.poll(() => udfPage.getFunctionNames()).toEqual(["alphaOne"]);
    expect(await udfPage.getEditorSelectionLine()).toBe(selectionBefore);
  });

  test("@admin export downloads the selected library", async () => {
    const name = newLibraryName();
    const code = libraryCode(name, ["addOne", "shout"]);
    await apiCall.loadUdf(name, code);
    const udfPage = await browser.createNewPage(UdfPage);
    await udfPage.openUdfPage();

    await udfPage.selectLibrary(name);
    // The export holds whatever library is selected when it is clicked, so wait for ours.
    await expectEditorShows(udfPage, code);
    const download = await udfPage.exportSelected();

    expect(download.suggestedFilename()).toContain(name);
    expect(await readFile(await download.path(), "utf8")).toBe(code);
  });

  test("@admin loading an invalid library shows an error and lists nothing", async () => {
    // Never created, so it is not queued for cleanup.
    const name = getRandomString("udf");
    const udfPage = await browser.createNewPage(UdfPage);
    await udfPage.openUdfPage();

    await udfPage.submitLibrary(name, "function ( {{ this is not javascript");

    await expect(udfPage.errorToast).toBeVisible();
    await udfPage.expandErrorDetails();
    await expect(udfPage.errorToastDetails).toContainText(name);
    expect(await apiCall.listUdfs()).not.toContain(name);
  });
});
