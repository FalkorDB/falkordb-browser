/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { expect, test } from "@playwright/test";
import {
  getRandomString,
  CREATE_QUERY,
} from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import GraphInfoPage from "../logic/POM/graphInfoPage";
import urls from "../config/urls.json";

test.describe("Customize Style Tests", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@readwrite Validate customize style button is visible for each label`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    
    // Check if customize style button exists for person1 label
    const customizeButton = graph.page.getByTestId("customizeStyleperson1");
    expect(await customizeButton.isVisible()).toBeTruthy();
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate clicking customize style button opens customization panel`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    
    // Click customize style button
    const customizeButton = graph.page.getByTestId("customizeStyleperson1");
    await customizeButton.click();
    
    // Verify customization panel is visible
    await graph.page.waitForTimeout(500);
    const panelTitle = graph.page.getByText("Customize Style");
    expect(await panelTitle.isVisible()).toBeTruthy();
    
    // Verify color section is visible
    const colorSection = graph.page.getByText("Color:");
    expect(await colorSection.isVisible()).toBeTruthy();
    
    // Verify size section is visible
    const sizeSection = graph.page.getByText("Size:");
    expect(await sizeSection.isVisible()).toBeTruthy();
    
    // Verify caption section is visible
    const captionSection = graph.page.getByText("Caption:");
    expect(await captionSection.isVisible()).toBeTruthy();
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate color selection in customization panel`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    
    // Click customize style button
    const customizeButton = graph.page.getByTestId("customizeStyleperson1");
    await customizeButton.click();
    
    // Click a color option
    await graph.page.waitForTimeout(500);
    const colorButtons = graph.page.locator('button[aria-label^="Select color"]');
    const firstColorButton = colorButtons.first();
    await firstColorButton.click();
    
    await graph.page.waitForTimeout(500);
    
    // Close the panel
    const closeButton = graph.page.getByTitle("Close");
    await closeButton.click();
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate size selection in customization panel`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    
    // Click customize style button
    const customizeButton = graph.page.getByTestId("customizeStyleperson1");
    await customizeButton.click();
    
    // Click a size option
    await graph.page.waitForTimeout(500);
    const sizeButtons = graph.page.locator('button[aria-label^="Select size"]');
    const secondSizeButton = sizeButtons.nth(1);
    await secondSizeButton.click();
    
    await graph.page.waitForTimeout(500);
    
    // Close the panel
    const closeButton = graph.page.getByTitle("Close");
    await closeButton.click();
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate caption selection in customization panel`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    
    // Click customize style button
    const customizeButton = graph.page.getByTestId("customizeStyleperson1");
    await customizeButton.click();
    
    // Click a caption option
    await graph.page.waitForTimeout(500);
    const captionOption = graph.page.getByText("id");
    await captionOption.click();
    
    await graph.page.waitForTimeout(500);
    
    // Close the panel
    const closeButton = graph.page.getByTitle("Close");
    await closeButton.click();
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate ESC key closes customization panel`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(GraphInfoPage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    
    // Click customize style button
    const customizeButton = graph.page.getByTestId("customizeStyleperson1");
    await customizeButton.click();
    
    await graph.page.waitForTimeout(500);
    
    // Press ESC key
    await graph.page.keyboard.press("Escape");
    
    await graph.page.waitForTimeout(500);
    
    // Verify panel is closed - graph info should be visible again
    expect(await graph.isGraphInfoPanelContainerVisible()).toBeTruthy();
    
    await apiCall.removeGraph(graphName);
  });
});
