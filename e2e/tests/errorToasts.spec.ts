/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import { getRandomString } from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from "../config/urls.json";

test.describe("Error Toast Messages", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;
  let graphName: string | undefined;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
    graphName = undefined;
  });

  test.afterEach(async () => {
    if (graphName) {
      await apiCall.removeGraph(graphName).catch(() => {});
    }
    await browser.closeBrowser();
  });

  // ---------------------------------------------------------------------------
  // Syntax errors — should show friendly parsed message, NOT raw "errMsg:…"
  // ---------------------------------------------------------------------------

  test(`@admin Syntax error — typo in RETURN shows friendly message with highlighted context`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("MATCH (n) RETsURN n");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    // Should contain the human-readable message, not "errMsg:"
    expect(toastText).not.toContain("errMsg:");
    expect(toastText).not.toContain("errCtx:");
    expect(toastText).not.toContain("errCtxOffset:");
    // Should contain the parsed error description
    expect(toastText).toContain("Invalid input");
    // Should contain the word with the error for context
    expect(toastText).toContain("RETsURN");
  });

  test(`@admin Syntax error — typo in CREATE shows friendly message`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("MATCH (n) CRETE (m)");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    expect(toastText).not.toContain("errMsg:");
    expect(toastText).toContain("Invalid input");
  });

  test(`@admin Syntax error — mismatched brackets shows friendly message`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery('CREATE (n:Person { name: "Alice" )');
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    expect(toastText).not.toContain("errMsg:");
    expect(toastText).toContain("Invalid input");
  });

  test(`@admin Syntax error at offset 0 shows friendly message`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("XMATCH (n) RETURN n");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    expect(toastText).not.toContain("errMsg:");
    expect(toastText).not.toContain("errCtxOffset:");
    expect(toastText).toContain("Invalid input");
  });

  test(`@admin Syntax error with multiple expected tokens shows friendly message`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("CREATE INDEX FOR (p:Person) ON (p.m.n)");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    expect(toastText).not.toContain("errMsg:");
    expect(toastText).toContain("Invalid input");
  });

  // ---------------------------------------------------------------------------
  // Non-syntax query errors — passed through as-is (already user-readable)
  // ---------------------------------------------------------------------------

  test(`@admin Undefined variable error shows the raw message as-is`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("MATCH (p:Person) RETURN x");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    expect(toastText).toContain("not defined");
  });

  test(`@admin Unknown function error shows the raw message as-is`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("RETURN foo(1)");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    expect(toastText).toContain("Unknown function");
  });

  // ---------------------------------------------------------------------------
  // Infrastructure-style errors — should show friendly message
  // ---------------------------------------------------------------------------

  test(`@admin Duplicate graph name shows error toast`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();

    await graph.addGraph(graphName, false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();
    expect(toastText).toContain("already exists");
  });
});
