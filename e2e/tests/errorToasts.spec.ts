/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import { getRandomString } from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphPage from "../logic/POM/graphPage";
import urls from "../config/urls.json";
import { SYNTAX_ERROR_HINT } from "@/lib/cypherErrors";

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
    const graphToRemove = graphName;
    graphName = undefined;

    if (graphToRemove) {
      await apiCall.removeGraph(graphToRemove).catch(() => {});
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
    const toastTitle = await graph.getErrorToastTitle();
    const toastText = await graph.getErrorToastText();

    // Toast title should say "Syntax Error"
    expect(toastTitle).toBe("Syntax Error");
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
    const toastTitle = await graph.getErrorToastTitle();
    const toastText = await graph.getErrorToastText();

    expect(toastTitle).toBe("Syntax Error");
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
    const toastTitle3 = await graph.getErrorToastTitle();
    const toastText3 = await graph.getErrorToastText();

    expect(toastTitle3).toBe("Syntax Error");
    expect(toastText3).not.toContain("errMsg:");
    expect(toastText3).toContain("Invalid input");
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
    const toastTitle4 = await graph.getErrorToastTitle();
    const toastText4 = await graph.getErrorToastText();

    expect(toastTitle4).toBe("Syntax Error");
    expect(toastText4).not.toContain("errMsg:");
    expect(toastText4).not.toContain("errCtxOffset:");
    expect(toastText4).toContain("Invalid input");
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
    const toastTitle5 = await graph.getErrorToastTitle();
    const toastText5 = await graph.getErrorToastText();

    expect(toastTitle5).toBe("Syntax Error");
    expect(toastText5).not.toContain("errMsg:");
    expect(toastText5).toContain("Invalid input");
  });

  test(`@admin Syntax error toast includes the generic syntax hint`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("MATCH (n) RETsURN n");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastTitle = await graph.getErrorToastTitle();
    const toastText = await graph.getErrorToastText();

    // A syntax error shows the parsed message AND the generic remediation hint in the
    // toast itself (not only on editor hover). Assert against the source-of-truth string.
    expect(toastTitle).toBe("Syntax Error");
    expect(toastText).toContain(SYNTAX_ERROR_HINT);
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
    const toastTitleUndef = await graph.getErrorToastTitle();
    const toastText = await graph.getErrorToastText();

    expect(toastTitleUndef).toBe("Error");
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
    const toastTitleFn = await graph.getErrorToastTitle();
    const toastText = await graph.getErrorToastText();

    expect(toastTitleFn).toBe("Error");
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
    const toastTitleDup = await graph.getErrorToastTitle();
    const toastText = await graph.getErrorToastText();
    expect(toastTitleDup).toBe("Error");
    expect(toastText).toContain("already exists");
  });

  // ---------------------------------------------------------------------------
  // Inline editor diagnostics — Monaco markers for failed queries
  // ---------------------------------------------------------------------------

  test(`@admin Failed query shows an inline error marker in the editor`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("MATCH (n) RETsURN n");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    expect(await graph.hasEditorErrorMarker()).toBe(true);
  });

  test(`@admin "Fix with AI" button is hidden when AI is not configured`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("MATCH (n) RETsURN n");
    await graph.clickRunQuery(false);

    // The failure is processed (toast shown) but, with no configured AI model/key, the
    // "Fix with AI" button must not appear.
    expect(await graph.getNotificationErrorToast()).toBe(true);
    expect(await graph.fixWithAiButtonCount()).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Actionable hints — recognized Cypher errors carry a remediation tip
  // ---------------------------------------------------------------------------

  test(`@admin Undefined variable error shows an actionable hint`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("MATCH (p:Person) RETURN x");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    // Server message is still shown verbatim...
    expect(toastText).toContain("not defined");
    // ...and an actionable hint is added beside it.
    expect(toastText).toContain("in scope");
  });

  test(`@admin Unknown function typo shows a "Did you mean" suggestion`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery('RETURN lenght("hi")');
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastText = await graph.getErrorToastText();

    // Raw message verbatim, plus a concrete fix suggestion.
    expect(toastText).toContain("Unknown function");
    expect(toastText).toContain("Did you mean length()");
  });

  test(`@admin Unaliased WITH projection shows the specific message and a hint`, async () => {
    graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);

    const graph = await browser.createNewPage(GraphPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);

    await graph.insertQuery("MATCH (n) WITH n.name RETURN n.name");
    await graph.clickRunQuery(false);

    expect(await graph.getNotificationErrorToast()).toBe(true);
    const toastTitle = await graph.getErrorToastTitle();
    const toastText = await graph.getErrorToastText();

    expect(toastTitle).toBe("Error");
    // Previously this surfaced the generic "An unexpected error occurred" fallback;
    // now the recognized FalkorDB message is shown verbatim with a remediation hint.
    expect(toastText).not.toContain("An unexpected error occurred");
    expect(toastText).toContain("must be aliased");
    expect(toastText).toContain("AS");
  });
});
