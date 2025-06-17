import { expect } from "@playwright/test";
import test from "playwright/test";
import ApiCalls from "../logic/api/apiCalls";
import BrowserWrapper from "../infra/ui/browserWrapper";
import urls from "../config/urls.json";
import QuerySettingsPage from "../logic/POM/settingsQueryPage";
import { getRandomString } from "../infra/utils";
import { getDefaultQuery } from "@/lib/utils";

test.describe("Query Settings", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@admin Validate that running a query with timeout returns an error`, async () => {
    const graphName = getRandomString("settingsQuery");
    await apiCall.addGraph(graphName);
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    const timeout = 1;
    await querySettings.fillTimeout(timeout);
    await querySettings.clickGraphsTabInHeader();
    await querySettings.selectGraphByName(graphName);
    const query = `UNWIND range(1, 100000000) AS x RETURN count(x)`;
    await querySettings.insertQuery(query);
    await querySettings.clickRunQuery(false);
    expect(await querySettings.getErrorNotification()).toBe(true);
    await apiCall.removeGraph(graphName);
  });

  test(`@admin Validate that running a query with limit returns limited results`, async () => {
    const graphName = getRandomString("settingsQuery");
    await apiCall.addGraph(graphName);
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    const limit = 5;
    await querySettings.fillLimit(limit);
    await querySettings.clickGraphsTabInHeader();
    await querySettings.selectGraphByName(graphName);
    const query = `UNWIND range(1, 10) AS i CREATE (p:Person {id: i, name: 'Person ' + toString(i)}) RETURN p`;
    await querySettings.insertQuery(query);
    await querySettings.clickRunQuery();
    const res = await querySettings.getNodesScreenPositions("graph");
    expect(res.length).toBe(5);
    await apiCall.removeGraph(graphName);
  });

  test(`@admin Validate that limit can't be negative with the input`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
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
    const timeout = -1;
    await querySettings.fillTimeout(timeout);
    const timeoutValue = await querySettings.getTimeout();
    expect(timeoutValue).toBe("∞");
  });

  test(`@admin Validate that limit can't be negative with the decrease button`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.fillLimit(0);
    await querySettings.clickDecreaseLimit();
    const limitValue = await querySettings.getLimit();
    expect(limitValue).toBe("∞");
  });

  test(`@admin Validate that timeout can't be negative with the decrease button`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.clickDecreaseTimeout();
    const timeoutValue = await querySettings.getTimeout();
    expect(timeoutValue).toBe("∞");
  });

  test(`@admin Validate that limit changed with the increase button`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.clickIncreaseLimit();
    const limitValue = await querySettings.getLimit();
    expect(limitValue).toBe("301");
  });

  test(`@admin Validate that timeout changed with the increase button`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.clickIncreaseTimeout();
    const timeoutValue = await querySettings.getTimeout();
    expect(timeoutValue).toBe("1");
  });

  test(`@admin Validate that limit changed with the decrease button`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.clickDecreaseLimit();
    const limitValue = await querySettings.getLimit();
    expect(limitValue).toBe("299");
  });

  test(`@admin Validate that timeout changed with the decrease button`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.fillTimeout(1);
    await querySettings.clickDecreaseTimeout();
    const timeoutValue = await querySettings.getTimeout();
    expect(timeoutValue).toBe("∞");
  });

  test(`@admin Validate that default query is set and saved`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    const defaultQuery = "MATCH (n) RETURN n";
    await querySettings.fillRunDefaultQueryInput(defaultQuery);
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.refreshPage();
    const defaultQueryValue = await querySettings.getRunDefaultQueryInput();
    expect(defaultQuery).toBe(defaultQueryValue);
  });

  test(`@admin Validate that default query is reset`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    const defaultQuery = "MATCH (n) RETURN n";
    await querySettings.fillRunDefaultQueryInput(defaultQuery);
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.refreshPage();
    const queryValue = await querySettings.getRunDefaultQueryInput();
    expect(queryValue).toBe(defaultQuery);
    await querySettings.clickRunDefaultQueryResetBtn();
    await querySettings.refreshPage();
    const defaultQueryValue = await querySettings.getRunDefaultQueryInput();
    expect(defaultQueryValue).toBe(getDefaultQuery());
  });

  test(`@admin Validate that run default query is set and saved`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.checkRunDefaultQueryCheckboxOn();
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.refreshPage();
    const runDefaultQueryCheckboxOn =
      await querySettings.getRunDefaultQueryCheckboxOn();
    expect(runDefaultQueryCheckboxOn).toBe(true);
    await querySettings.checkRunDefaultQueryCheckboxOff();
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.refreshPage();
    const runDefaultQueryCheckboxOff =
      await querySettings.getRunDefaultQueryCheckboxOff();
    expect(runDefaultQueryCheckboxOff).toBe(true);
  });

  test(`@admin Validate that content persistence is set and saved`, async () => {
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.checkContentPersistenceCheckboxOn();
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.refreshPage();
    const contentPersistenceCheckboxOn =
      await querySettings.getContentPersistenceCheckboxOn();
    expect(contentPersistenceCheckboxOn).toBe(true);
    await querySettings.checkContentPersistenceCheckboxOff();
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.refreshPage();
    const contentPersistenceCheckboxOff =
      await querySettings.getContentPersistenceCheckboxOff();
    expect(contentPersistenceCheckboxOff).toBe(true);
  });

  test(`@admin Validate that when run default query is on default query will run when graph is selected`, async () => {
    const graphName = getRandomString("settingsQuery");
    await apiCall.addGraph(graphName);
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    const defaultQuery = "MATCH (n) RETURN n";
    await querySettings.fillRunDefaultQueryInput(defaultQuery);
    await querySettings.checkRunDefaultQueryCheckboxOn();
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.clickGraphsTabInHeader();
    await querySettings.selectGraphByName(graphName);
    const tabEnabled =
      (await querySettings.getGraphTabEnabled()) ||
      (await querySettings.getTableTabEnabled()) ||
      (await querySettings.getMetadataTabEnabled());
    expect(tabEnabled).toBe(true);
    await apiCall.removeGraph(graphName);
  });

  test(`@admin Validate that content persistence is on and the content is saved`, async () => {
    const graphName = getRandomString("settingsQuery");
    await apiCall.addGraph(graphName);
    const querySettings = await browser.createNewPage(
      QuerySettingsPage,
      urls.settingsUrl
    );
    await querySettings.checkRunDefaultQueryCheckboxOn();
    await querySettings.checkContentPersistenceCheckboxOn();
    await querySettings.clickSaveQuerySettingsBtn();
    await querySettings.clickGraphsTabInHeader();
    await querySettings.selectGraphByName(graphName);
    const query = "MATCH (n) RETURN n";
    await querySettings.insertQuery(query);
    await querySettings.clickRunQuery();
    await querySettings.refreshPage();
    const tabEnabled =
      (await querySettings.getGraphTabEnabled()) ||
      (await querySettings.getTableTabEnabled()) ||
      (await querySettings.getMetadataTabEnabled());
    expect(tabEnabled).toBe(true);
    await apiCall.removeGraph(graphName);
  });
});
