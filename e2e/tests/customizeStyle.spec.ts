import { expect, test } from "@playwright/test";
import {
  getRandomString,
  CREATE_QUERY,
} from "../infra/utils";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import CustomizeStylePage from "../logic/POM/customizeStylePage";
import DataPanel from "../logic/POM/dataPanelComponent";
import urls from "../config/urls.json";

test.describe("Customize Style Tests", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;
  let relationshipGraph: string | undefined;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
    relationshipGraph = undefined;
  });

  test.afterEach(async () => {
    const graphToRemove = relationshipGraph;
    relationshipGraph = undefined;
    try {
      // Close first: a live graph page polls graph info, and that poll
      // re-creates a graph deleted out from under it.
      await browser.closeBrowser();
    } finally {
      if (graphToRemove) await apiCall.removeGraph(graphToRemove, "admin");
    }
  });

  test(`@readwrite Validate relationship style saves color and all scaled dimensions without changing node styles`, async () => {
    relationshipGraph = getRandomString("relationshipStyle");
    await apiCall.addGraph(relationshipGraph);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(relationshipGraph);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    await graph.clickCustomizeStyleButton("person1");
    const nodeColor = await graph.getColorByIndex(4);
    await graph.selectColorByIndex(4);
    await graph.selectSizeByIndex(2);
    await graph.clickSaveStyleButton();
    expect(await graph.isSaveButtonNotVisible()).toBe(true);
    // Size option 2 is 0.75x the canvas default node size of 9.
    const nodeStyle = { color: nodeColor, size: 6.75 };
    expect(await graph.getLabelStyleFromLocalStorage("person1")).toEqual(nodeStyle);
    const nodesBefore = await graph.readNodeStyles();
    expect(nodesBefore).toHaveLength(2);

    await graph.clickCustomizeRelationshipStyleButton("KNOWS");
    const color = await graph.getColorByIndex(2);
    await graph.selectColorByIndex(2);
    await graph.selectSizeByIndex(5);
    await graph.clickSaveStyleButton();
    expect(await graph.isSaveButtonNotVisible()).toBe(true);
    // Size option 5 is 1.5x the canvas defaults: width 1, font size 6, arrow size 8.
    const saved = { color, width: 1.5, fontSize: 9, arrowSize: 12 };
    expect(await graph.getRelationshipStyleFromLocalStorage("KNOWS")).toEqual(saved);
    await expect.poll(() => graph.readRelationshipStyles("KNOWS")).toEqual([saved]);
    expect(await graph.getLabelStyleFromLocalStorage("person1")).toEqual(nodeStyle);
    expect(await graph.readNodeStyles()).toEqual(nodesBefore);

    await graph.refreshPage();
    await graph.selectGraphByName(relationshipGraph);
    await graph.insertQuery("MATCH (n)-[e]->(m) RETURN n,e,m");
    await graph.clickRunQuery();
    await expect.poll(() => graph.readRelationshipStyles("KNOWS")).toEqual([saved]);
    await graph.openGraphInfoButton();
    await graph.clickCustomizeRelationshipStyleButton("KNOWS");
    expect(await graph.isColorSectionVisible()).toBe(true);
    expect(await graph.getSelectedColorButtonIndex()).toBe(2);
    expect(await graph.getSelectedSizeButtonIndex()).toBe(5);
  });

  test(`@readwrite Validate cancelling relationship style restores both controls and does not persist previews`, async () => {
    relationshipGraph = getRandomString("relationshipCancel");
    await apiCall.addGraph(relationshipGraph);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(relationshipGraph);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Save a known style first, so the checks below compare against it rather than an absent key.
    await graph.clickCustomizeRelationshipStyleButton("KNOWS");
    const savedColor = await graph.getColorByIndex(3);
    await graph.selectColorByIndex(3);
    await graph.selectSizeByIndex(1);
    await graph.clickSaveStyleButton();
    expect(await graph.isSaveButtonNotVisible()).toBe(true);
    // Size option 1 is 0.5x the canvas defaults: width 1, font size 6, arrow size 8.
    const saved = { color: savedColor, width: 0.5, fontSize: 3, arrowSize: 4 };
    expect(await graph.getRelationshipStyleFromLocalStorage("KNOWS")).toEqual(saved);
    await expect.poll(() => graph.readRelationshipStyles("KNOWS")).toEqual([saved]);

    await graph.clickCustomizeRelationshipStyleButton("KNOWS");
    expect(await graph.isColorSectionVisible()).toBe(true);
    expect(await graph.getSelectedColorButtonIndex()).toBe(3);
    expect(await graph.getSelectedSizeButtonIndex()).toBe(1);
    const previewColor = await graph.getColorByIndex(0);
    await graph.selectColorByIndex(0);
    await graph.selectSizeByIndex(5);
    await expect.poll(() => graph.readRelationshipStyles("KNOWS"))
      .toEqual([{ color: previewColor, width: 1.5, fontSize: 9, arrowSize: 12 }]);
    expect(await graph.getRelationshipStyleFromLocalStorage("KNOWS")).toEqual(saved);

    await graph.clickCancelStyleButton();
    expect(await graph.isSaveButtonNotVisible()).toBe(true);
    expect(await graph.getSelectedColorButtonIndex()).toBe(3);
    expect(await graph.getSelectedSizeButtonIndex()).toBe(1);
    expect(await graph.getRelationshipStyleFromLocalStorage("KNOWS")).toEqual(saved);
    expect(await graph.readRelationshipStyles("KNOWS")).toEqual([saved]);

    await graph.closePanel();
    expect(await graph.isSaveButtonNotVisible()).toBe(true);
    await graph.refreshPage();
    await graph.selectGraphByName(relationshipGraph);
    await graph.insertQuery("MATCH (n)-[e]->(m) RETURN n,e,m");
    await graph.clickRunQuery();
    await expect.poll(() => graph.readRelationshipStyles("KNOWS")).toEqual([saved]);
    expect(await graph.getRelationshipStyleFromLocalStorage("KNOWS")).toEqual(saved);
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

    // Verify Save button is visible
    expect(await graph.isSaveButtonVisible()).toBeTruthy();

    // Click Save to persist changes
    await graph.clickSaveStyleButton();

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

    // Verify Save button is visible
    expect(await graph.isSaveButtonVisible()).toBeTruthy();

    // Click Save to persist changes
    await graph.clickSaveStyleButton();

    // Reopen the panel
    await graph.clickCustomizeStyleButton("person1");

    // Verify the selected size persists in UI
    const sizeAfterReopen = await graph.getSelectedSizeButtonIndex();
    expect(sizeAfterReopen).toBe(newSizeIndexToSelect);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate ESC key reverts changes in customization panel`, async () => {
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

    // Get initial selections
    const initialColorIndex = await graph.getSelectedColorButtonIndex();
    const initialSizeIndex = await graph.getSelectedSizeButtonIndex();

    // Make changes
    const newColorIndex = initialColorIndex === 0 ? 2 : 0;
    const newSizeIndex = initialSizeIndex === 3 ? 5 : 3;
    await graph.selectColorByIndex(newColorIndex);
    await graph.selectSizeByIndex(newSizeIndex);

    // Verify changes were made
    expect(await graph.getSelectedColorButtonIndex()).toBe(newColorIndex);
    expect(await graph.getSelectedSizeButtonIndex()).toBe(newSizeIndex);

    // Press ESC key - should revert changes but keep panel open
    await graph.closePanelWithEscape();

    // Verify panel is still visible
    expect(await graph.isPanelVisible()).toBeTruthy();

    // Verify changes were reverted
    expect(await graph.getSelectedColorButtonIndex()).toBe(initialColorIndex);
    expect(await graph.getSelectedSizeButtonIndex()).toBe(initialSizeIndex);

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

    // Click Save to persist changes
    await graph.clickSaveStyleButton();

    // Get the saved style from localStorage after saving
    const selectedStyle = await graph.getLabelStyleFromLocalStorage("person1");

    // Close panel
    await graph.closePanelWithEscape();

    // Get the selected color after closing the panel
    const selectedColor = await graph.getLabelButtonColor("person1");

    // Refresh the page
    await graph.refreshPage();

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
    expect(styleAfterRefresh?.size).toBe(selectedStyle?.size);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate RGB color picker functionality`, async () => {
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

    // Click RGB picker button to open the color picker
    await graph.clickRgbPickerButton();

    // Verify RGB picker panel is visible
    expect(await graph.isRgbPickerPanelVisible()).toBeTruthy();

    // Set a custom hex color
    const customColor = "#FF5733";
    await graph.setRgbColorHexInput(customColor);

    // Verify the hex input reflects the custom color
    const hexValue = await graph.getRgbColorHexInputValue();
    expect(hexValue.toUpperCase()).toBe(customColor.toUpperCase());

    // Verify Save button is visible
    expect(await graph.isSaveButtonVisible()).toBeTruthy();

    // Click Save to persist changes
    await graph.clickSaveStyleButton();

    // Verify the custom color persists in localStorage
    const savedStyle = await graph.getLabelStyleFromLocalStorage("person1");
    expect(savedStyle?.color?.toUpperCase()).toBe(customColor.toUpperCase());

    // Close the panel to verify the color on the label button
    await graph.closePanelWithEscape();

    // Verify the color is applied to the label button
    const labelColor = await graph.getLabelButtonColor("person1");
    // Convert hex to rgb for comparison
    const expectedRgb = "rgb(255, 87, 51)"; // #FF5733 in RGB
    expect(labelColor).toBe(expectedRgb);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate changes are not persisted without saving`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Get original color before making changes
    const originalColor = await graph.getLabelButtonColor("person1");
    const originalStyle = await graph.getLabelStyleFromLocalStorage("person1");

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

    // Verify Save button is visible (changes were made)
    expect(await graph.isSaveButtonVisible()).toBeTruthy();

    // Close the panel WITHOUT saving. Escape only reverts, it leaves the panel
    // open, and the graph info label list stays hidden behind it.
    await graph.closePanel();

    // Refresh the page
    await graph.refreshPage();
    await graph.waitForPageIdle();

    // Select the same graph again and query existing nodes
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("MATCH (n) RETURN n");
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Verify color did NOT change (reverted to original)
    const colorAfterRefresh = await graph.getLabelButtonColor("person1");
    expect(colorAfterRefresh).toBe(originalColor);

    // Verify style in localStorage did NOT change
    const styleAfterRefresh = await graph.getLabelStyleFromLocalStorage("person1");
    expect(styleAfterRefresh?.size).toBe(originalStyle?.size);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate label styles are independent across different graphs`, async () => {
    const graphName1 = getRandomString("graph");
    const graphName2 = getRandomString("graph");

    // Create two graphs
    await apiCall.addGraph(graphName1);
    await apiCall.addGraph(graphName2);

    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();

    // Setup first graph with the same query
    await graph.selectGraphByName(graphName1);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Customize person1 label in first graph
    await graph.clickCustomizeStyleButton("person1");

    const initialColorIndex = await graph.getSelectedColorButtonIndex();
    const initialSizeIndex = await graph.getSelectedSizeButtonIndex();

    const newColorIndex = initialColorIndex === 0 ? 2 : 0;
    const newSizeIndex = initialSizeIndex === 3 ? 5 : 3;

    await graph.selectColorByIndex(newColorIndex);
    await graph.selectSizeByIndex(newSizeIndex);

    // Save changes for graph1
    await graph.clickSaveStyleButton();

    // Get the customized style from graph1
    const graph1Color = await graph.getLabelButtonColor("person1");
    const graph1Style = await graph.getLabelStyleFromLocalStorage("person1");

    // Close panel
    await graph.closePanelWithEscape();

    // Refresh page to clear state before switching graphs
    await graph.refreshPage();
    await graph.waitForPageIdle();

    // Switch to second graph with the same query
    await graph.selectGraphByName(graphName2);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery();
    await graph.openGraphInfoButton();

    // Get the style from graph2 for person1 label
    const graph2Color = await graph.getLabelButtonColor("person1");
    const graph2Style = await graph.getLabelStyleFromLocalStorage("person1");

    // Verify that graph2's person1 label has the same style as graph1
    // (Label styles should be global, not graph-scoped)
    expect(graph2Color).toBe(graph1Color);
    expect(graph2Style?.size).toBe(graph1Style?.size);

    // Cleanup
    await apiCall.removeGraph(graphName1);
    await apiCall.removeGraph(graphName2);
  });

  test(`@readwrite Validate node color updates when label is changed`, async () => {
    test.setTimeout(40000); // 40s timeout for slow Firefox CI with canvas operations
    const graphName = getRandomString("graph");
    const newLabel = `label${Date.now()}`;
    await apiCall.addGraph(graphName);

    const dataGraph = await browser.createNewPage(DataPanel, urls.graphUrl);
    await browser.setPageToFullScreen();
    await dataGraph.selectGraphByName(graphName);
    await dataGraph.insertQuery(CREATE_QUERY);
    await dataGraph.clickRunQuery(false);

    // Get initial canvas nodes - find the node with person1 label
    let nodes = await dataGraph.getNodesScreenPositions();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetNode = nodes.find((n: any) => n.labels?.includes("person1"));
    expect(targetNode).toBeTruthy();

    // Store the initial node color (person1's default color)
    const initialNodeColor = targetNode.color;

    // Click on the person1 node (node with name "a")
    await dataGraph.searchElementInCanvas("a");

    // Verify the node has person1 label
    expect(await dataGraph.isVisibleLabel("person1")).toBeTruthy();

    // Add new random label to the node
    await dataGraph.addLabel(newLabel, true);

    // Remove person1 label from the node
    await dataGraph.removeLabel("person1");

    // Verify only the new label remains
    expect(await dataGraph.isVisibleLabel(newLabel)).toBeTruthy();

    // Close the data panel to refresh the canvas view
    await dataGraph.closeDataPanel();

    // Wait for the graph data model to reflect the label change.
    // We cannot use getNodesScreenPositions() here because canvas v0.0.49
    // does not update data-engine-status to "stopped" after re-renders
    // triggered by label edits when autoStopOnSettle is false.
    const result = await dataGraph.waitForGraphNodeUpdate({
      label: newLabel,
      notColor: initialNodeColor,
      nodeId: String(targetNode.id),
    });

    expect(result).toBeTruthy();
    expect(result!.color).not.toBe(initialNodeColor);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate nodes update correctly after color change and refresh`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery(false);
    
    // Get initial nodes from window.graph - find person1 nodes
    let nodes = await graph.getNodesScreenPositions();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const person1Nodes = nodes.filter((n: any) => n.labels?.includes("person1"));
    expect(person1Nodes.length).toBeGreaterThan(0);
    
    // Store initial color of person1 nodes
    const initialColor = person1Nodes[0].color;
    expect(initialColor).toBeDefined();

    // Open graph info and customize person1 style
    await graph.openGraphInfoButton();
    await graph.clickCustomizeStyleButton("person1");

    // Change color to a different one
    const initialColorIndex = await graph.getSelectedColorButtonIndex();
    const newColorIndex = initialColorIndex === 0 ? 2 : 0;
    await graph.selectColorByIndex(newColorIndex);

    // Save the style changes
    await graph.clickSaveStyleButton();

    // Get the new color from localStorage
    const savedStyle = await graph.getLabelStyleFromLocalStorage("person1");
    const newColor = savedStyle?.color;
    expect(newColor).toBeDefined();
    expect(newColor).not.toBe(initialColor);

    // Close the panel
    await graph.closePanelWithEscape();

    // Refresh the page
    await graph.refreshPage();
    await graph.waitForPageIdle();

    // Select graph and re-query to render nodes
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("MATCH (n) RETURN n");
    await graph.clickRunQuery(false);

    // Get nodes after refresh
    nodes = await graph.getNodesScreenPositions();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const person1NodesAfterRefresh = nodes.filter((n: any) => n.labels?.includes("person1"));
    expect(person1NodesAfterRefresh.length).toBeGreaterThan(0);

    // Verify that the node color matches the saved style
    const colorAfterRefresh = person1NodesAfterRefresh[0].color;
    expect(colorAfterRefresh).toBe(newColor);
    expect(colorAfterRefresh).not.toBe(initialColor);

    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Validate nodes update correctly after size change and refresh`, async () => {
    const graphName = getRandomString("graph");
    await apiCall.addGraph(graphName);
    const graph = await browser.createNewPage(CustomizeStylePage, urls.graphUrl);
    await browser.setPageToFullScreen();
    await graph.selectGraphByName(graphName);
    await graph.insertQuery(CREATE_QUERY);
    await graph.clickRunQuery(false);
    
    // Get initial nodes - find person1 nodes
    let nodes = await graph.getNodesScreenPositions();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const person1Nodes = nodes.filter((n: any) => n.labels?.includes("person1"));
    expect(person1Nodes.length).toBeGreaterThan(0);
    
    // Store initial size of person1 nodes
    const initialSize = person1Nodes[0].size;

    // Open graph info and customize person1 style
    await graph.openGraphInfoButton();
    await graph.clickCustomizeStyleButton("person1");

    // Change size to a different one
    const initialSizeIndex = await graph.getSelectedSizeButtonIndex();
    const newSizeIndex = initialSizeIndex === 3 ? 5 : 3;
    await graph.selectSizeByIndex(newSizeIndex);

    // Save the style changes
    await graph.clickSaveStyleButton();

    // Get the new size from localStorage
    const savedStyle = await graph.getLabelStyleFromLocalStorage("person1");
    const newSize = savedStyle?.size;
    expect(newSize).toBeDefined();
    expect(newSize).not.toBe(initialSize);

    // Close the panel
    await graph.closePanelWithEscape();

    // Refresh the page
    await graph.refreshPage();
    await graph.waitForPageIdle();

    // Select graph and re-query to render nodes
    await graph.selectGraphByName(graphName);
    await graph.insertQuery("MATCH (n) RETURN n");
    await graph.clickRunQuery(false);

    // Get nodes after refresh
    nodes = await graph.getNodesScreenPositions();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const person1NodesAfterRefresh = nodes.filter((n: any) => n.labels?.includes("person1"));
    expect(person1NodesAfterRefresh.length).toBeGreaterThan(0);

    // Verify that the node size matches the saved style
    const sizeAfterRefresh = person1NodesAfterRefresh[0].size;
    expect(sizeAfterRefresh).toBe(newSize);
    expect(sizeAfterRefresh).not.toBe(initialSize);

    await apiCall.removeGraph(graphName);
  });
});
