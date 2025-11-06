/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import { Download, Locator } from "@playwright/test";
import {
  waitForElementToBeVisible,
  waitForElementToNotBeVisible,
  interactWhenVisible,
  waitForElementToBeEnabled,
} from "@/e2e/infra/utils";
import Page, { ElementLabel, Type } from "./page";

export default class GraphPage extends Page {
  // TABS
  private get graphTab(): Locator {
    return this.page.getByTestId("graphTab");
  }

  private get tableTab(): Locator {
    return this.page.getByTestId("tableTab");
  }

  private get metadataTab(): Locator {
    return this.page.getByTestId("metadataTab");
  }

  private get graphsTabInHeader(): Locator {
    return this.page.getByTestId("GraphsButton");
  }

  // EDITOR
  public get editorContainer(): Locator {
    return this.page.getByTestId(`editorContainer`);
  }

  public get clearEditor(): Locator {
    return this.page.getByTestId(`editorContainer`);
  }

  public get editorRun(): Locator {
    return this.page.getByTestId(`editorRun`);
  }

  public get editorMaximize(): Locator {
    return this.page.getByTestId(`editorMaximize`);
  }

  // QUERY HISTORY
  public get queryHistory(): Locator {
    return this.page.getByTestId(`queryHistory`);
  }

  public get queryHistorySearch(): Locator {
    return this.page.getByTestId(`queryHistorySearch`);
  }

  public get queryHistoryButtonByIndex(): Locator {
    return this.page.getByTestId(`queryHistoryButtonByIndex`);
  }

  public get queryHistoryEditorInput(): Locator {
    return this.page.getByTestId(`queryHistoryEditorInput`);
  }

  public get queryHistoryEditorRun(): Locator {
    return this.page.getByTestId(`queryHistoryEditorRun`);
  }

  public get elementCanvasSuggestionsListGraph(): Locator {
    return this.page.getByTestId(`elementCanvasSuggestionsListGraph`);
  }

  private get querySearchList(): Locator {
    return this.page.locator("//div[contains(@class, 'tree')]");
  }

  private get querySearchListItems(): Locator {
    return this.page.locator(
      "//div[contains(@class, 'tree')]//div[contains(@class, 'contents')]"
    );
  }

  private get duplicateGraphBtn(): Locator {
    return this.page.getByTestId("duplicateGraph");
  }

  private get duplicateGraphInput(): Locator {
    return this.page.getByTestId("duplicateGraphInput");
  }

  private get duplicateGraphConfirm(): Locator {
    return this.page.getByTestId("duplicateGraphConfirm");
  }

  private get closeHelpMessage(): Locator {
    return this.page.locator("iframe[title='Close message']");
  }

  async getBoundingBoxCanvasElement(): Promise<null | {
    x: number;
    y: number;
    width: number;
    height: number;
  }> {
    const boundingBox = await interactWhenVisible(
      this.canvasElement,
      (el) => el.boundingBox(),
      "Canvas Element"
    );
    return boundingBox;
  }

  async getAttributeCanvasElement(attribute: string): Promise<string> {
    const attributeValue = await interactWhenVisible(
      this.canvasElement,
      (el) => el.getAttribute(attribute),
      "Canvas Element"
    );
    return attributeValue ?? "";
  }

  async fillCreateGraphInput(text: string): Promise<void> {
    await interactWhenVisible(
      this.insertInput("Graph"),
      (el) => el.fill(text),
      "Create Graph Input"
    );
  }

  async fillSearch(text: string): Promise<void> {
    await interactWhenVisible(
      this.search("Graph"),
      (el) => el.fill(text),
      "Search Graph"
    );
  }

  async fillInput(text: string): Promise<void> {
    await interactWhenVisible(
      this.input("Graph"),
      (el) => el.fill(text),
      `Input Graphs`
    );
  }

  async fillQueryHistorySearch(text: string): Promise<void> {
    await interactWhenVisible(
      this.queryHistorySearch,
      (el) => el.fill(text),
      "Query History Search"
    );
  }

  async fillElementCanvasSearch(
    text: string
  ): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasSearch("Graph"),
      (el) => el.fill(text),
      `Element Canvas Search Graph`
    );
  }

  async clickCanvasElement(x: number, y: number): Promise<void> {
    await interactWhenVisible(
      this.canvasElement,
      (el) => el.click({ position: { x, y } }),
      "Canvas Element"
    );
  }

  async clickEditorInput(): Promise<void> {
    await interactWhenVisible(
      this.editorContainer,
      (el) => el.click(),
      "Editor Input"
    );
  }

  async clickClearEditorInput(): Promise<void> {
    await interactWhenVisible(
      this.clearEditor,
      (el) => el.click(),
      "Editor Input"
    );
  }

  async getEditorInput(): Promise<string | null> {
    return interactWhenVisible(
      this.editorContainer,
      (el) => el.getAttribute("data-value"),
      "Editor Input"
    );
  }

  async clickCreateGraph(): Promise<void> {
    await interactWhenVisible(
      this.create("Graph"),
      (el) => el.click(),
      "Create Graph"
    );
  }

  async clickConfirmCreateGraph(): Promise<void> {
    await interactWhenVisible(
      this.createConfirm("Graph"),
      (el) => el.click(),
      "Create Graph Confirm"
    );
  }

  async clickCreateCancel(): Promise<void> {
    await interactWhenVisible(
      this.createCancel("Graph"),
      (el) => el.click(),
      "Create Graph Cancel"
    );
  }

  async clickCloseHelpMessage(): Promise<void> {
    await interactWhenVisible(
      this.closeHelpMessage,
      (el) => el.click(),
      "Close Help Message"
    );
  }

  async isVisibleCloseHelpMessage(): Promise<boolean> {
    return waitForElementToBeVisible(this.closeHelpMessage);
  }

  async clickDelete(): Promise<void> {
    await interactWhenVisible(
      this.delete("Graph"),
      (el) => el.click(),
      "Delete Graph"
    );
  }

  async clickDeleteConfirm(): Promise<void> {
    await interactWhenVisible(
      this.deleteConfirm("Graph"),
      (el) => el.click(),
      "Confirm Delete Graph"
    );
  }

  async clickDeleteCancel(): Promise<void> {
    await interactWhenVisible(
      this.deleteCancel("Graph"),
      (el) => el.click(),
      "Cancel Delete Graph"
    );
  }

  async clickExport(): Promise<void> {
    await interactWhenVisible(
      this.export("Graph"),
      (el) => el.click(),
      "Export Graph"
    );
  }

  async clickExportConfirm(): Promise<void> {
    await interactWhenVisible(
      this.exportConfirm("Graph"),
      (el) => el.click(),
      "Confirm Export Graph"
    );
  }

  async clickExportCancel(): Promise<void> {
    await interactWhenVisible(
      this.exportCancel("Graph"),
      (el) => el.click(),
      "Cancel Export Graph"
    );
  }

  async clickSelect(type: Type = "Graph"): Promise<void> {
    await interactWhenVisible(
      this.select(type),
      (el) => el.click(),
      `Select ${type}`
    );
  }

  async clickSelectItem(id: string, type: Type = "Graph"): Promise<void> {
    await interactWhenVisible(
      this.selectItem(type, id),
      (el) => el.click(),
      `Select ${type} Item ${id}`
    );
  }

  async clickSearch(): Promise<void> {
    await interactWhenVisible(
      this.search("Graph"),
      (el) => el.click(),
      "Search Graph"
    );
  }

  async clickElementCanvasAdd(): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasAdd("Graph"),
      (el) => el.click(),
      "Add Element"
    );
  }

  async clickElementCanvasAddNode(): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasAddNode("Graph"),
      (el) => el.click(),
      "Add Node"
    );
  }

  async clickElementCanvasAddEdge(): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasAddEdge("Graph"),
      (el) => el.click(),
      "Add Edge"
    );
  }

  async clickDeleteElement(): Promise<void> {
    await interactWhenVisible(
      this.deleteElement("Graph"),
      (el) => el.click(),
      "Delete Element"
    );
  }

  async clickDeleteElementConfirm(): Promise<void> {
    await interactWhenVisible(
      this.deleteElementConfirm("Graph"),
      (el) => el.click(),
      "Confirm Delete Element"
    );
  }

  async clickDeleteElementCancel(): Promise<void> {
    await interactWhenVisible(
      this.deleteElementCancel("Graph"),
      (el) => el.click(),
      "Cancel Delete Element"
    );
  }

  async clickAnimationControl(): Promise<void> {
    await interactWhenVisible(
      this.animationControl(),
      (el) => el.click(),
      "Animation Control"
    );
  }

  async clickZoomInControl(): Promise<void> {
    await interactWhenVisible(
      this.zoomInControl(),
      (el) => el.click(),
      "Zoom In Control"
    );
  }

  async clickZoomOutControl(): Promise<void> {
    await interactWhenVisible(
      this.zoomOutControl(),
      (el) => el.click(),
      "Zoom Out Control"
    );
  }

  async clickCenterControl(): Promise<void> {
    await interactWhenVisible(
      this.centerControl(),
      (el) => el.click(),
      "Center Control"
    );
  }

  async clickGraphTab(): Promise<void> {
    await interactWhenVisible(this.graphTab, (el) => el.click(), "Graph Tab");
  }

  async getGraphTabEnabled(): Promise<boolean> {
    return waitForElementToBeEnabled(this.graphTab);
  }

  async clickTableTab(): Promise<void> {
    await interactWhenVisible(this.tableTab, (el) => el.click(), "Table Tab");
  }

  async getTableTabEnabled(): Promise<boolean> {
    return waitForElementToBeEnabled(this.tableTab);
  }

  async getMetadataTabEnabled(): Promise<boolean> {
    return waitForElementToBeEnabled(this.metadataTab);
  }

  async clickMetadataTab(): Promise<void> {
    await interactWhenVisible(
      this.metadataTab,
      (el) => el.click(),
      "Metadata Tab"
    );
  }

  async clickElementCanvasSuggestionByName(
    name: string
  ): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasSuggestionByName("Graph", name),
      (el) => el.click(),
      `Element Canvas Suggestion Graph ${name}`
    );
  }

  async clickLabelsButtonByLabel(
    label: ElementLabel,
    name: string
  ): Promise<void> {
    await interactWhenVisible(
      this.labelsButtonByName("Graph", label, name),
      (el) => el.click(),
      `Labels Panel Button Graph ${label} ${name}`
    );
  }

  async clickEditorRun(): Promise<void> {
    await interactWhenVisible(this.editorRun, (el) => el.click(), "Editor Run");
  }

  async clickManage(): Promise<void> {
    await interactWhenVisible(
      this.manage("Graph"),
      (el) => el.click(),
      "Manage Graphs Button"
    );
  }

  async clickTableCheckboxByName(name: string): Promise<void> {
    await interactWhenVisible(
      this.tableCheckboxByName("Graph", name),
      (el) => el.click(),
      `Table Graphs Checkbox ${name}`
    );
  }

  async clickEditButton(): Promise<void> {
    await interactWhenVisible(
      this.editButton("Graph"),
      (el) => el.click(),
      `Edit Button Graphs`
    );
  }

  async clickDuplicateGraphBtn(): Promise<void> {
    await interactWhenVisible(
      this.duplicateGraphBtn,
      (el) => el.click(),
      `Duplicate Graph Button`
    );
  }

  async insertDuplicateGraphInput(input: string): Promise<void> {
    await interactWhenVisible(
      this.duplicateGraphInput,
      (el) => el.fill(input),
      `Insert Duplicate Graph Input`
    );
  }

  async clickDuplicateGraphConfirm(): Promise<void> {
    await interactWhenVisible(
      this.duplicateGraphConfirm,
      (el) => el.click(),
      `Confirm Duplicate Graph`
    );
    // Wait until the confirmation dialog disappears
    await waitForElementToNotBeVisible(this.duplicateGraphConfirm);
    // And wait for the success toast to show up
    await this.isVisibleToast();
  }

  async clickSaveButton(): Promise<void> {
    await interactWhenVisible(
      this.saveButton("Graph"),
      (el) => el.click(),
      `Save Button Graphs`
    );
  }

  async hoverCanvasElement(x: number, y: number): Promise<void> {
    await interactWhenVisible(
      this.canvasElement,
      (el) => el.hover({ position: { x, y } }),
      "Canvas Element"
    );
  }

  async hoverTableRowByName(name: string): Promise<void> {
    await interactWhenVisible(
      this.tableRowByName("Graph", name),
      (el) => el.hover(),
      `Table Graphs Row ${name}`
    );
  }

  async isVisibleSelectItem(name: string): Promise<boolean> {
    return waitForElementToBeVisible(this.selectItem("Graph", name));
  }

  async isEnabledEditorRun(): Promise<boolean> {
    return waitForElementToBeEnabled(this.editorRun);
  }

  async clickGraphsTabInHeader(): Promise<void> {
    await interactWhenVisible(
      this.graphsTabInHeader,
      (el) => el.click(),
      "Graphs Tab in Header"
    );
  }

  async isVisibleLabelsButtonByName(
    label: ElementLabel,
    name: string
  ): Promise<boolean> {
    return waitForElementToBeVisible(this.labelsButtonByName("Graph", label, name));
  }

  async getLabelsButtonByNameContent(
    label: ElementLabel,
    name: string
  ): Promise<string | null> {
    const content = await interactWhenVisible(
      this.labelsButtonByName("Graph", label, name),
      (el) => el.textContent(),
      `Graph label ${name}`
    );
    return content;
  }

  async isVisibleEditButton(): Promise<boolean> {
    return waitForElementToBeVisible(this.editButton("Graph"));
  }

  async isVisibleToast(): Promise<boolean> {
    return waitForElementToBeVisible(this.toast);
  }

  async isVisibleNodeCanvasToolTip(): Promise<boolean> {
    return waitForElementToBeVisible(this.nodeCanvasToolTip);
  }

  async getNodeCanvasToolTipContent(): Promise<string | null> {
    const content = await interactWhenVisible(
      this.nodeCanvasToolTip,
      (el) => el.textContent(),
      "Node Canvas Tooltip"
    );
    return content;
  }

  async searchElementInCanvas(
    name: string
  ): Promise<void> {
    await this.fillElementCanvasSearch(name);
    await this.clickElementCanvasSuggestionByName(name);
  }

  async isSearchElementInCanvasVisible(name: string): Promise<boolean> {
    await this.fillElementCanvasSearch(name);
    return this.elementCanvasSuggestionsListGraph.isVisible();
  }

  async getGraphsCountInList(graphName: string): Promise<number> {
    await this.clickSelect();
    await this.fillSearch(graphName);
    const items = this.page.locator('//ul[@data-testid="queryList"]//li');
    const count = await items.count();
    return count;
  }

  async verifyGraphExists(graphName: string, apiCall?: any): Promise<boolean> {
    if (apiCall) {
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        const graphs = await apiCall.getGraphs();
        const graphExistsInAPI = graphs.opts.includes(graphName);
        if (!graphExistsInAPI) {
          break;
        }

        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
        attempts += 1;
      }
    }

    try {
      await this.clickSelect();
      await this.page.waitForTimeout(1000);

      await this.fillSearch(graphName);

      let attempts = 0;
      const maxAttempts = 5;
      let isVisible = false;

      while (attempts < maxAttempts) {
        await this.page.waitForTimeout(1000); // wait for the search results to be populated
        isVisible = await this.isVisibleSelectItem(graphName);

        if (!isVisible) {
          break;
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          await this.fillSearch("");
          await this.page.waitForTimeout(500);
          await this.fillSearch(graphName);
        }
      }

      return isVisible;
    } catch (error) {
      console.log("Graph selector interaction failed:", error);
      return false;
    }
  }

  async addGraph(graphName: string, waitForVisibility = true): Promise<void> {
    await this.clickCreateGraph();
    await this.fillCreateGraphInput(graphName);
    await this.page.waitForTimeout(1000); // wait for the input to be filled
    await this.clickConfirmCreateGraph();
    if (waitForVisibility) {
      await waitForElementToNotBeVisible(this.createConfirm("Graph"));
    }
  }

  async removeGraph(graphName: string): Promise<void> {
    await this.clickSelect();
    await this.clickManage();
    await this.clickTableCheckboxByName(graphName);
    await this.clickDelete();
    await this.clickDeleteConfirm();
    await waitForElementToNotBeVisible(this.deleteConfirm("Graph"));
  }

  async insertQuery(query: string): Promise<void> {
    await this.clickEditorInput();
    await this.page.keyboard.type(query);
  }

  async clickRunQuery(waitForAnimation = true): Promise<void> {
    await this.clickEditorRun();
    await waitForElementToBeEnabled(this.editorRun);
    if (waitForAnimation) {
      await this.waitForCanvasAnimationToEnd();
    }
  }

  async duplicateGraph(graphName: string): Promise<void> {
    await this.clickSelect();
    await this.clickManage();
    await this.clickTableCheckboxByName(graphName);
    await this.clickDuplicateGraphBtn();
    await this.insertDuplicateGraphInput(`${graphName} (copy)`);
    await this.clickDuplicateGraphConfirm();
    await waitForElementToNotBeVisible(this.deleteConfirm("Graph"));
  }

  async exportGraphByName(graphName: string): Promise<Download> {
    await this.clickSelect();
    await this.clickManage();
    await this.clickTableCheckboxByName(graphName);
    await this.clickExport();
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.clickExportConfirm(),
    ]);
    return download;
  }

  async isModifyGraphNameButtonVisible(graphName: string): Promise<boolean> {
    await this.clickSelect();
    await this.clickManage();
    await this.hoverTableRowByName(graphName);
    const isVisible = await this.isVisibleEditButton();
    return isVisible;
  }

  async modifyGraphName(oldName: string, newName: string): Promise<void> {
    await this.clickSelect();
    await this.clickManage();
    await this.hoverTableRowByName(oldName);
    await this.clickEditButton();
    await this.fillInput(newName);
    await this.clickSaveButton();
    await waitForElementToNotBeVisible(this.saveButton("Graph"));
  }

  async selectGraphByName(graphName: string): Promise<void> {
    await this.clickSelect();
    await this.fillSearch(graphName);
    await this.page.waitForTimeout(500); // wait for the search results to be populated
    await this.clickSelectItem(graphName); // selecting the first item in list after search
  }

  async deleteElementsByPosition(
    positions: { x: number; y: number }[]
  ): Promise<void> {
    positions.forEach(async (position) => {
      await this.elementClick(position.x, position.y);
    });
    await this.clickDeleteElement();
    await this.clickDeleteElementConfirm();
    await waitForElementToNotBeVisible(this.deleteElement("Graph"));
  }

  async deleteElementByName(name: string): Promise<void> {
    await this.searchElementInCanvas(name);
    await this.clickDeleteElement();
    await this.clickDeleteElementConfirm();
    await waitForElementToNotBeVisible(this.deleteElement("Graph"));
    await this.waitForCanvasAnimationToEnd();
  }

  async getNotificationToast(): Promise<boolean> {
    await this.page.waitForTimeout(1000);
    const isVisible = await this.isVisibleToast();
    return isVisible;
  }

  async getAnimationControl(): Promise<boolean> {
    const status = await this.getAttributeCanvasElement("data-engine-status");
    return status === "running";
  }

  async isNodeCanvasToolTipVisible(): Promise<boolean> {
    await this.page.waitForTimeout(500);
    const isVisible = await this.isVisibleNodeCanvasToolTip();
    return isVisible;
  }

  async getNodeCanvasToolTip(): Promise<string | null> {
    await this.page.waitForTimeout(1000);
    const toolTipText = await this.getNodeCanvasToolTipContent();
    return toolTipText;
  }

  // eslint-disable-next-line class-methods-use-this
  async getCanvasTransform(canvasElement: Locator): Promise<any> {
    let transformData = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      transformData = await canvasElement.evaluate(
        (canvas: HTMLCanvasElement) => {
          const rect = canvas.getBoundingClientRect();
          const ctx = canvas.getContext("2d");
          return {
            left: rect.left,
            top: rect.top,
            transform: ctx?.getTransform() || null,
          };
        }
      );

      if (transformData?.transform) return transformData;
      await new Promise((res) => {
        setTimeout(res, 1000);
      });
    }

    throw new Error("Canvas transform data not available!");
  }

  async changeNodePosition(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): Promise<void> {
    await this.page.mouse.move(fromX, fromY);
    await this.page.mouse.down();
    await this.page.mouse.move(toX, toY);
    await this.page.mouse.up();
  }

  async rightClickAtCanvasCenter(): Promise<void> {
    const boundingBox = await this.getBoundingBoxCanvasElement();
    if (!boundingBox) throw new Error("Canvas bounding box not found");
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    await this.page.mouse.click(centerX, centerY, { button: "right" });
  }

  async hoverAtCanvasCenter(): Promise<void> {
    const boundingBox = await this.getBoundingBoxCanvasElement();
    if (!boundingBox) throw new Error("Canvas bounding box not found");
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    await this.page.mouse.move(centerX, centerY);
  }

  async getQuerySearchListText(): Promise<string[]> {
    await waitForElementToBeVisible(this.querySearchList);
    const elements = this.querySearchListItems;
    const count = await elements.count();
    const texts: string[] = [];

    for (let i = 0; i < count; i += 1) {
      const item = elements.nth(i);
      const text = await interactWhenVisible(
        item,
        (el) => el.textContent(),
        `Query search list item #${i}`
      );
      if (text) texts.push(text.trim());
    }

    return texts;
  }

  async rightClickElement(x: number, y: number): Promise<void> {
    console.log(`Right-clicking element at position (${x}, ${y})`);
    await this.page.mouse.click(x, y, { button: "right" });
    await this.page.waitForTimeout(500);
  }
}
