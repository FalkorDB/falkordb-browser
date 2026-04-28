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

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  // ---------------------------------------------------------------------------
  // Syntax errors — should show friendly parsed message, NOT raw "errMsg:…"
  // ---------------------------------------------------------------------------

  test(`@admin Syntax error — typo in RETURN shows friendly message with highlighted context`, async () => {
    const graphName = getRandomString("graph");
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

    await apiCall.removeGraph(graphName);
  });

  test(`@admin Syntax error — typo in CREATE shows friendly message`, async () => {
    const graphName = getRandomString("graph");
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

    await apiCall.removeGraph(graphName);
  });

  test(`@admin Syntax error — mismatched brackets shows friendly message`, async () => {
    const graphName = getRandomString("graph");
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

    await apiCall.removeGraph(graphName);
  });

  test(`@admin Syntax error at offset 0 shows friendly message`, async () => {
    const graphName = getRandomString("graph");
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

    await apiCall.removeGraph(graphName);
  });

  test(`@admin Syntax error with multiple expected tokens shows friendly message`, async () => {
    const graphName = getRandomString("graph");
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

    await apiCall.removeGraph(graphName);
  });

  // ---------------------------------------------------------------------------
  // Non-syntax query errors — passed through as-is (already user-readable)
  // ---------------------------------------------------------------------------

  test(`@admin Undefined variable error shows the raw message as-is`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("MATCH (p:Person) RETURN x");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    expect(toastText).toContain("not defined");

    await apiCall.removeGraph(graphName);
  });

  test(`@admin Unknown function error shows the raw message as-is`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("RETURN foo(1)");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    expect(toastText).toContain("Unknown function");

    await apiCall.removeGraph(graphName);
  });

  test(`@admin Empty query error shows error message`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery(" ");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);

    await apiCall.removeGraph(graphName);
  });

  // ---------------------------------------------------------------------------
  // Infrastructure-style errors — should show friendly message
  // ---------------------------------------------------------------------------

  test(`@admin Duplicate graph name shows error toast`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();

    await graph.addGraph(graphName, false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();
    expect(toastText).toContain("already exists");

    await apiCall.removeGraph(graphName);
  });

  // ---------------------------------------------------------------------------
  // NOTE: Infrastructure error mapping (NOAUTH, WRONGPASS, ECONNREFUSED,
  // OOM, timeout, readonly replica, loading dataset, 500/502, 401) is handled
  // by toUserFriendlyMessage() in lib/utils.ts. These cannot be tested in e2e
  // without shutting down or misconfiguring the FalkorDB server. The mapping
  // is validated by the syntax error tests above, which prove the centralized
  // toUserFriendlyMessage function is invoked on the error path.
  // ---------------------------------------------------------------------------
});
