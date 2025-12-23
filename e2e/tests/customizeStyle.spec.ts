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
import CustomizeStylePage from "../logic/POM/customizeStylePage";
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
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();
    expect(await graph.isCustomizeStyleButtonVisible("person1")).toBeTruthy();
    expect(await graph.isCustomizeStyleButtonVisible("person2")).toBeTruthy();
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate clicking customize style button opens customization panel`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Click customize style button
    await graph.clickCustomizeStyleButton("person1");

    // Verify customization panel is visible
    expect(await graph.isPanelVisible()).toBeTruthy();

    // Verify color section is visible
    expect(await graph.isColorSectionVisible()).toBeTruthy();

    // Verify size section is visible
    expect(await graph.isSizeSectionVisible()).toBeTruthy();

    // Verify caption section is visible
    expect(await graph.isCaptionSectionVisible()).toBeTruthy();

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate color selection in customization panel`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Click customize style button
    await graph.clickCustomizeStyleButton("person1");

    // Get initial selected color button
    const initialColorIndex = await graph.getSelectedColorButtonIndex();

    // Select a different color option (pick different from current)
    const newColorIndexToSelect = initialColorIndex === 0 ? 2 : 0;
    await graph.selectColorByIndex(newColorIndexToSelect);

    // Verify color changed in UI
    const newColorIndex = await graph.getSelectedColorButtonIndex();
    expect(newColorIndex).toBe(newColorIndexToSelect);
    expect(newColorIndex).not.toBe(initialColorIndex);

    // Close the panel with ESC key
    await graph.closePanelWithEscape();

    // Reopen the panel
    await graph.clickCustomizeStyleButton("person1");

    // Verify the selected color persists in UI
    const colorAfterReopen = await graph.getSelectedColorButtonIndex();
    expect(colorAfterReopen).toBe(newColorIndexToSelect);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate size selection in customization panel`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Click customize style button
    await graph.clickCustomizeStyleButton("person1");

    // Get initial selected size button
    const initialSizeIndex = await graph.getSelectedSizeButtonIndex();

    // Select a different size option (pick different from current)
    const newSizeIndexToSelect = initialSizeIndex === 3 ? 5 : 3;
    await graph.selectSizeByIndex(newSizeIndexToSelect);

    // Verify size changed in UI
    const newSizeIndex = await graph.getSelectedSizeButtonIndex();
    expect(newSizeIndex).toBe(newSizeIndexToSelect);
    expect(newSizeIndex).not.toBe(initialSizeIndex);

    // Close the panel with ESC key
    await graph.closePanelWithEscape();

    // Reopen the panel
    await graph.clickCustomizeStyleButton("person1");

    // Verify the selected size persists in UI
    const sizeAfterReopen = await graph.getSelectedSizeButtonIndex();
    expect(sizeAfterReopen).toBe(newSizeIndexToSelect);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate caption selection in customization panel`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Click customize style button
    await graph.clickCustomizeStyleButton("person1");

    // Select caption "id"
    await graph.selectCaption("id");

    // Close the panel with ESC
    await graph.closePanelWithEscape();

    // Wait for canvas to re-render with new caption
    await graph.waitForCanvasAnimationToEnd();

    // Verify the caption change persisted in localStorage
    const savedStyle = await graph.getLabelStyleFromLocalStorage("person1");
    expect(savedStyle?.customCaption).toBe("id");

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate ESC key closes customization panel`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Click customize style button
    await graph.clickCustomizeStyleButton("person1");

    // Verify panel is visible
    expect(await graph.isPanelVisible()).toBeTruthy();

    // Press ESC key
    await graph.closePanelWithEscape();

    // Verify panel is closed - graph info should be visible again
    expect(await graph.isPanelNotVisible()).toBeTruthy();
    expect(await graph.isGraphInfoPanelContainerVisible()).toBeTruthy();

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate color and size persist after page refresh`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Click customize style button
    await graph.clickCustomizeStyleButton("person1");

    // Get current selections and pick different ones
    const initialColorIndex = await graph.getSelectedColorButtonIndex();
    const initialSizeIndex = await graph.getSelectedSizeButtonIndex();

    const newColorIndex = initialColorIndex === 0 ? 2 : 0;
    const newSizeIndex = initialSizeIndex === 3 ? 5 : 3;

    // Select different color and size
    await graph.selectColorByIndex(newColorIndex);
    await graph.selectSizeByIndex(newSizeIndex);

    // Get the selected values
    const selectedColor = await graph.getLabelButtonColor("person1");
    const selectedStyle = await graph.getLabelStyleFromLocalStorage("person1");

    // Close panel
    await graph.closePanelWithEscape();

    // Refresh the page
    await graph.refreshPage();
    await graph.waitForPageIdle();

    // Select the same graph again and query existing nodes
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("MATCH (n) RETURN n");
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Verify color persisted after refresh
    const colorAfterRefresh = await graph.getLabelButtonColor("person1");
    expect(colorAfterRefresh).toBe(selectedColor);

    // Verify size persisted after refresh
    const styleAfterRefresh = await graph.getLabelStyleFromLocalStorage("person1");
    expect(styleAfterRefresh?.customSize).toBe(selectedStyle?.customSize);

    await apiCall.removeGraph(graphName);
  });
});
