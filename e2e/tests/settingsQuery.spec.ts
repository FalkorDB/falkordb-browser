import { expect, test } from "../infra/coverage";
import { getDefaultQuery } from "@/lib/utils";
import ApiCalls from "../logic/api/apiCalls";
import BrowserWrapper from "../infra/ui/browserWrapper";
import urls from "../config/urls.json";
import QuerySettingsPage from "../logic/POM/settingsQueryPage";
import { getRandomString } from "../infra/utils";

test.describe.serial("Query Settings", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  const savedLimit = 41;
  const savedTimeout = 7;

  async function saveLimitAndTimeoutAndReload(settings: QuerySettingsPage, limit: number, timeout: number) {
    await settings.fillLimit(limit);
    await settings.fillTimeout(timeout);
    await settings.clickSaveQuerySettingsBtn();
    await settings.refreshPage();
    await settings.expandQueryExecutionSection();
  }

  async function expectLimitAndTimeout(settings: QuerySettingsPage, limit: string, timeout: string) {
    await expect(settings.limitInput).toHaveValue(limit);
    await expect(settings.timeoutInput).toHaveValue(timeout);
  }

  async function openSettingsWithSavedLimitAndTimeout(): Promise<QuerySettingsPage> {
    const settings = await browser.createNewPage(QuerySettingsPage, urls.settingsUrl);
    await settings.expandQueryExecutionSection();
    // Limit and timeout start at 0 ("∞") until the stored settings load; filling
    // earlier would be overwritten by the default limit of 300.
    await expect(settings.limitInput).toHaveValue("300");
    await saveLimitAndTimeoutAndReload(settings, savedLimit, savedTimeout);
    await expectLimitAndTimeout(settings, `${savedLimit}`, `${savedTimeout} seconds`);
    return settings;
  }

  test(`@admin Validate that cancelling query settings restores the saved limit and timeout, also after reload`, async () => {
    const settings = await openSettingsWithSavedLimitAndTimeout();
    await settings.fillLimit(17);
    await settings.fillTimeout(23);
    await expectLimitAndTimeout(settings, "17", "23 seconds");
    await settings.clickCancelQuerySettingsBtn();
    await expectLimitAndTimeout(settings, `${savedLimit}`, `${savedTimeout} seconds`);
    await expect(settings.saveQuerySettingsBtn).toBeHidden();
    await settings.refreshPage();
    await settings.expandQueryExecutionSection();
    await expectLimitAndTimeout(settings, `${savedLimit}`, `${savedTimeout} seconds`);
  });

  // "∞" is also what the inputs show before the stored settings load, so each
  // "∞" is asserted after a finite value saved with it: limit and timeout load together.
  test(`@admin Validate that a zero limit and timeout are saved as infinity and finite values persist again`, async () => {
    const settings = await openSettingsWithSavedLimitAndTimeout();
    await saveLimitAndTimeoutAndReload(settings, 0, savedTimeout);
    await expect(settings.timeoutInput).toHaveValue(`${savedTimeout} seconds`);
    await expect(settings.limitInput).toHaveValue("∞");
    await saveLimitAndTimeoutAndReload(settings, savedLimit, 0);
    await expectLimitAndTimeout(settings, `${savedLimit}`, "∞");
    await saveLimitAndTimeoutAndReload(settings, 1, 1);
    await expectLimitAndTimeout(settings, "1", "1 seconds");
  });

  test(`@admin Validate that running a query with timeout returns an error`, async () => {
    const graphName = getRandomString("settingsQuery");
    await apiCall.addGraph(graphName);
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.expandQueryExecutionSection();
    const timeout = 1;
    await querySettings.fillTimeout(timeout);
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.clickGraphsTabInHeader();
    await querySettings.selectGraphByName(graphName);
    const query = `UNWIND range(1, 100000000) AS x RETURN count(x)`;
    await querySettings.insertQuery(query);
    await querySettings.clickRunQuery(false);
    expect(await querySettings.getNotificationErrorToast()).toBe(true);
    await apiCall.removeGraph(graphName);
  });

  const limitQueries = [
    `UNWIND range(1, 10) AS x CREATE (n) RETURN n`,
    `UNWIND range(1, 10) AS x CREATE (n) RETURN n UNION UNWIND range(1, 10) AS x CREATE (n) RETURN n`,
    `CALL { UNWIND range(1, 10) AS x CREATE (n) RETURN n UNION UNWIND range(1, 10) AS x CREATE (n) RETURN n } RETURN n`,
  ];

  limitQueries.forEach((query) => {
    test(`@admin Validate that results are limited to the query: ${query}`, async () => {
      const graphName = getRandomString("settingsQuery");
      await apiCall.addGraph(graphName);
      const querySettings = await browser.createNewPage(
        QuerySettingsPage,
        urls.settingsUrl
      );
      await querySettings.expandQueryExecutionSection();
      const limit = 5;
      await querySettings.fillLimit(limit);
      await querySettings.clickSaveQuerySettingsBtn();
      await querySettings.clickGraphsTabInHeader();
      await querySettings.selectGraphByName(graphName);
      await querySettings.insertQuery(query);
      await querySettings.clickRunQuery();
      const res = await querySettings.getNodesScreenPositions();
      expect(res.length).toBe(5);
      await apiCall.removeGraph(graphName);
    });
  });

  const noLimitQueries = [
    `CREATE (n)`,
    `MATCH (n) RETURN n LIMIT 50`,
    `MATCH (n) SET n.name = 'test'`,
    `MERGE (n:Person {id: 1})`,
    `MATCH (n) RETURN n UNION MATCH (n) RETURN n LIMIT 10`,
    `CALL { MATCH (n) RETURN n UNION MATCH (n) RETURN n } RETURN n LIMIT 10`,
  ];

  noLimitQueries.forEach((query) => {
    test(`@admin Validate that limit was not added to the query: ${query}`, async () => {
      const graphName = getRandomString("settingsQuery");
      await apiCall.addGraph(graphName);
      const querySettings = await browser.createNewPage(
        QuerySettingsPage,
        urls.settingsUrl
      );
      await browser.setPageToFullScreen();
      await querySettings.expandQueryExecutionSection();
      const limit = 5;
      await querySettings.fillLimit(limit);
      await querySettings.clickSaveQuerySettingsBtn();
      await querySettings.clickGraphsTabInHeader();
      await querySettings.selectGraphByName(graphName);

      await querySettings.insertQuery(query);
      await querySettings.clickRunQuery(false);

      expect(await querySettings.getNotificationErrorToast()).toBe(false);
      await apiCall.removeGraph(graphName);
    });
  });

  test(`@admin Validate that limit can't be negative with the input`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.expandQueryExecutionSection();
    const limit = -1;
    await querySettings.fillLimit(limit);
    const limitValue = await querySettings.getLimit();
    expect(limitValue).toBe("300");
  });

  test(`@admin Validate that timeout can't be negative with the input`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.expandQueryExecutionSection();
    const timeout = -1;
    await querySettings.fillTimeout(timeout);
    const timeoutValue = await querySettings.getTimeout();
    expect(timeoutValue).toBe("∞");
  });

  test(`@admin Validate that default query is set and saved`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.expandQueryExecutionSection();
    const defaultQuery = "MATCH (n) RETURN n";
    await querySettings.clickRunDefaultQuerySwitchOn();
    await querySettings.fillRunDefaultQueryInput(defaultQuery);
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.refreshPage();
    await querySettings.expandQueryExecutionSection();
    const defaultQueryValue = await querySettings.getRunDefaultQueryInput();
    expect(defaultQuery).toBe(defaultQueryValue);
  });

  test(`@admin Validate that default query is reset`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.expandQueryExecutionSection();
    const defaultQuery = "MATCH (n) RETURN n";
    await querySettings.clickRunDefaultQuerySwitchOn();
    await querySettings.fillRunDefaultQueryInput(defaultQuery);
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.refreshPage();
    await querySettings.expandQueryExecutionSection();
    const queryValue = await querySettings.getRunDefaultQueryInput();
    expect(queryValue).toBe(defaultQuery);
    await querySettings.clickRunDefaultQueryResetBtn();
    await querySettings.refreshPage();
    await querySettings.expandQueryExecutionSection();
    const defaultQueryValue = await querySettings.getRunDefaultQueryInput();
    expect(defaultQueryValue).toBe(getDefaultQuery());
  });

  test(`@admin Validate that run default query is set and saved`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.expandQueryExecutionSection();
    await querySettings.clickRunDefaultQuerySwitchOn();
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.refreshPage();
    await querySettings.expandQueryExecutionSection();
    const runDefaultQuerySwitchOn =
      await querySettings.getRunDefaultQuerySwitch();
    expect(runDefaultQuerySwitchOn).toBeTruthy();
    await querySettings.clickRunDefaultQuerySwitchOff();
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.refreshPage();
    await querySettings.expandQueryExecutionSection();
    const runDefaultQuerySwitchOff =
      await querySettings.getRunDefaultQuerySwitch();
    expect(runDefaultQuerySwitchOff).toBeFalsy();
  });

  test(`@admin Validate that when run default query is on default query will run when graph is selected`, async () => {
    const graphName = getRandomString("settingsQuery");
    await apiCall.addGraph(graphName);
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.expandQueryExecutionSection();
    const defaultQuery = "MATCH (n) RETURN n";
    await querySettings.clickRunDefaultQuerySwitchOn();
    await querySettings.fillRunDefaultQueryInput(defaultQuery);
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.clickGraphsTabInHeader();
    await querySettings.selectGraphByName(graphName);
    await querySettings.isEnabledEditorRun();
    const tabEnabled = await Promise.all([
      querySettings.getMetadataTabEnabled(),
      querySettings.getTableTabEnabled(),
      querySettings.getGraphTabEnabled(),
    ]);
    expect(tabEnabled).toContain(true);
    await apiCall.removeGraph(graphName);
  });

  test(`@admin Validate that the active tab rebuilds its results after a refresh`, async () => {
    const graphName = getRandomString("settingsQuery");
    await apiCall.addGraph(graphName);
    try {
      // Seed a node: on an empty graph `MATCH (n) RETURN n` returns nothing, so
      // the tabs could report enabled without any result having been rebuilt.
      await apiCall.runQuery(graphName, "CREATE (:Seeded {name: 'seed'})");
      const querySettings = await browser.createNewPage(
        QuerySettingsPage,
        urls.settingsUrl
      );
      await querySettings.expandQueryExecutionSection();
      await querySettings.clickRunDefaultQuerySwitchOn();
      await querySettings.clickSaveQuerySettingsBtn();
      await querySettings.clickGraphsTabInHeader();
      await querySettings.selectGraphByName(graphName);
      const query = "MATCH (n) RETURN n";
      await querySettings.insertQuery(query);
      await querySettings.clickRunQuery(false);
      await querySettings.refreshPage();
      // The tabs can be enabled by the graph selection alone, so assert on the
      // rebuilt result itself: the seeded node has to be back on the canvas.
      expect(await querySettings.getNodesScreenPositions()).toHaveLength(1);
    } finally {
      await apiCall.removeGraph(graphName);
    }
  });
});
