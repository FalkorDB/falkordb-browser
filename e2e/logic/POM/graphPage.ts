/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import { Download, Locator } from "@playwright/test";
import {
  pollForElementContent,
  waitForElementToBeVisible,
  waitForElementToNotBeVisible,
  interactWhenVisible,
  waitForElementToBeEnabled,
} from "@/e2e/infra/utils";
import BasePage from "@/e2e/infra/ui/basePage";

export type Element = "Node" | "Relation";

export type ElementLabel = "Relationships" | "Labels";

export type Type = "Graph" | "Role" | "Type" | "Model" | "Theme" | "Query";

export default class GraphPage extends BasePage {
  // CREATE
  public get create(): Locator {
    return this.page.getByTestId("createGraph");
  }

  public get insertInput(): Locator {
    return this.page.getByTestId("createGraphInput");
  }

  public get createConfirm(): Locator {
    return this.page.getByTestId("createGraphConfirm");
  }

  public get createCancel(): Locator {
    return this.page.getByTestId("createGraphCancel");
  }

  // DELETE
  public get deleteBtn(): Locator {
    return this.page.getByTestId("deleteGraph");
  }

  public get deleteConfirm(): Locator {
    return this.page.getByTestId("deleteGraphConfirm");
  }

  public get deleteCancel(): Locator {
    return this.page.getByTestId("deleteGraphCancel");
  }

  // EXPORT
  public get exportBtn(): Locator {
    return this.page.getByTestId("exportGraph");
  }

  public get exportConfirm(): Locator {
    return this.page.getByTestId("exportGraphConfirm");
  }

  public get exportCancel(): Locator {
    return this.page.getByTestId("exportGraphCancel");
  }

  // RELOAD
  public get reloadList(): Locator {
    return this.page.getByTestId("reloadGraphsList");
  }

  // SELECT
  public get select(): (type?: Type) => Locator {
    return (type: Type = "Graph") => this.page.getByTestId(`select${type}`);
  }

  public get selectItem(): (type: Type, id: string) => Locator {
    return (type: Type, id: string) =>
      this.page.getByTestId(`select${type}${id}`);
  }

  // SEARCH
  public get search(): (type?: Type) => Locator {
    return (type: Type = "Graph") => this.page.getByTestId(`${type}Search`);
  }

  // MANAGE
  public get manage(): Locator {
    return this.page.getByTestId("manageGraphs");
  }

  // TABLE
  public get tableCheckbox(): Locator {
    return this.page.getByTestId("tableGraphsCheckbox");
  }

  public get tableRowByName(): (name: string) => Locator {
    return (name: string) =>
      this.page.getByTestId(`tableRowGraphs${name}`);
  }

  public get tableCheckboxByName(): (name: string) => Locator {
    return (name: string) =>
      this.page.getByTestId(`tableCheckboxGraphs${name}`);
  }

  public get editButton(): Locator {
    return this.page.getByTestId("editButtonGraphs");
  }

  public get input(): Locator {
    return this.page.getByTestId("inputGraphs");
  }

  public get saveButton(): Locator {
    return this.page.getByTestId("saveButtonGraphs");
  }

  public get cancelButton(): Locator {
    return this.page.getByTestId("cancelGraphButton");
  }

  // CANVAS TOOLBAR - SEARCH
  public get elementCanvasSearch(): Locator {
    return this.page.getByTestId("elementCanvasSearchGraph");
  }

  public get elementCanvasSuggestionList(): Locator {
    return this.page.getByTestId("elementCanvasSuggestionsListGraph");
  }

  public get elementCanvasSuggestionByName(): (name: string) => Locator {
    return (name: string) =>
      this.page.getByTestId(`elementCanvasSuggestionGraph${name}`);
  }

  // ADD
  public get elementCanvasAdd(): Locator {
    return this.page.getByTestId("elementCanvasAddGraph");
  }

  public get elementCanvasAddNode(): Locator {
    return this.page.getByTestId("elementCanvasAddNodeGraph");
  }

  public get elementCanvasAddEdge(): Locator {
    return this.page.getByTestId("elementCanvasAddEdgeGraph");
  }

  // DELETE ELEMENT
  public get deleteElement(): (type?: Element | "Graph") => Locator {
    return (type: Element | "Graph" = "Graph") =>
      this.page.getByTestId(`deleteElement${type}`);
  }

  public get deleteElementConfirm(): Locator {
    return this.page.getByTestId("deleteElementConfirmGraph");
  }

  public get deleteElementCancel(): Locator {
    return this.page.getByTestId("deleteElementCancelGraph");
  }

  // LABELS
  public get labelsButtonByName(): (label: ElementLabel, name: string) => Locator {
    return (label: ElementLabel, name: string) =>
      this.page.getByTestId(`Graph${label}Button${name}`);
  }

  // CANVAS CONTROLS
  public get animationControl(): Locator {
    return this.page.getByTestId("animationControl");
  }

  public get pinControl(): Locator {
    return this.page.getByTestId("pinControl");
  }

  public get zoomInControl(): Locator {
    return this.page.getByTestId("zoomInControl");
  }

  public get zoomOutControl(): Locator {
    return this.page.getByTestId("zoomOutControl");
  }

  public get centerControl(): Locator {
    return this.page.getByTestId("centerControl");
  }

  // COUNT
  public get nodesCount(): Locator {
    return this.page.getByTestId("nodesCount");
  }

  public get nodesCountLoader(): Locator {
    return this.page.getByTestId("nodesCountLoader");
  }

  public get edgesCount(): Locator {
    return this.page.getByTestId("edgesCount");
  }

  public get edgesCountLoader(): Locator {
    return this.page.getByTestId("edgesCountLoader");
  }

  // CANVAS TOOLTIP
  public get nodeCanvasToolTip(): Locator {
    return this.page.locator("div[class*='float-tooltip-kap']");
  }

  // CANVAS
  public get canvasElement(): Locator {
    return this.page.locator("falkordb-canvas").locator("canvas").first();
  }

  // TOAST
  public get toast(): Locator {
    return this.page.getByTestId("toast");
  }

  public get errorToast(): Locator {
    return this.page.getByTestId("toast-destructive");
  }

  public get toastUnDoButton(): Locator {
    return this.page.getByTestId("toast").getByRole("button", { name: "Undo" });
  }

  private get skeleton(): Locator {
    return this.page.locator("#skeleton").first();
  }

  // Wait for the canvas engine to report "stopped" status.
  async waitForCanvasAnimationToEnd(timeout = 4500): Promise<void> {
    await waitForElementToBeVisible(this.skeleton);

    const canvasContainer = this.page.locator("falkordb-canvas");
    const canvasCount = await canvasContainer.count();

    if (canvasCount === 0) {
      return;
    }

    await this.canvasElement.waitFor({ state: "attached", timeout: 10000 });

    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const status = await this.canvasElement.getAttribute("data-engine-status");
      if (status === "stopped") {
        return;
      }
      await this.page.waitForTimeout(500);
    }
    throw new Error(`Canvas animation did not stop within ${timeout}ms`);
  }

  async getCanvasScaling(): Promise<{ scaleX: number; scaleY: number }> {
    const { scaleX, scaleY } = await this.canvasElement.evaluate(
      (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext("2d");
        const transform = ctx?.getTransform();
        return {
          scaleX: transform?.a || 1,
          scaleY: transform?.d || 1,
        };
      }
    );
    return { scaleX, scaleY };
  }

  async waitForScaleToStabilize(
    threshold = 0.01,
    stableCycles = 5,
    timeout = 3000
  ) {
    let lastScale = await this.getCanvasScaling();
    let stableCount = 0;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      await new Promise((res) => {
        setTimeout(res, 100);
      });
      const currentScale = await this.getCanvasScaling();
      if (
        Math.abs(currentScale.scaleX - lastScale.scaleX) < threshold &&
        Math.abs(currentScale.scaleY - lastScale.scaleY) < threshold
      ) {
        stableCount += 1;
        if (stableCount >= stableCycles) return;
      } else {
        stableCount = 0;
      }
      lastScale = currentScale;
    }
    throw new Error("Scale did not stabilize within timeout");
  }

  async waitForGraphNodeUpdate(
    predicate: { label: string; notColor: string; nodeId?: string },
    timeout = 15000
  ): Promise<any> {
    const result = await this.page.waitForFunction(
      ({ key, label, notColor, nodeId }) => {
        const data = (window as any)[key]?.();
        if (!data) return null;
        const allNodes = data.nodes || data.elements?.nodes || [];
        const node = allNodes.find((n: any) => {
          if (nodeId && String(n.id) !== String(nodeId)) return false;
          return n.labels?.includes(label);
        });
        if (node && typeof node.color === "string" && node.color && node.color !== notColor) {
          return { color: node.color, labels: node.labels };
        }
        return null;
      },
      { key: "graph", ...predicate },
      { timeout }
    );
    return result.jsonValue();
  }

  async getNodesScreenPositions(): Promise<any[]> {
    await this.waitForCanvasAnimationToEnd();
    await this.page.waitForTimeout(500);

    await this.page.waitForFunction(
      (key) => {
        const data = (window as any)[key]?.();
        return (data && ((Array.isArray(data.nodes) && data.nodes.length > 0) ||
          (data.elements && Array.isArray(data.elements.nodes) && data.elements.nodes.length > 0)));
      },
      "graph",
      { timeout: 5000 }
    );

    const canvasInfo = await this.canvasElement.evaluate((canvasElement: HTMLCanvasElement) => {
      if (!canvasElement) return null;
      const rect = canvasElement.getBoundingClientRect();
      const ctx = canvasElement.getContext("2d");
      const transform = ctx?.getTransform();
      return {
        width: canvasElement.width,
        height: canvasElement.height,
        clientWidth: rect.width,
        clientHeight: rect.height,
        left: rect.left,
        top: rect.top,
        devicePixelRatio: window.devicePixelRatio || 1,
        transform: transform
          ? { a: transform.a, b: transform.b, c: transform.c, d: transform.d, e: transform.e, f: transform.f }
          : null,
      };
    });

    if (!canvasInfo || !canvasInfo.transform) return [];

    const graphData = await this.page.evaluate(
      (key) => (window as any)[key]?.(),
      "graph"
    );

    const nodes = graphData?.nodes || graphData?.elements?.nodes;
    if (!nodes || !Array.isArray(nodes)) return [];

    const { a: scaleX, e: translateX, d: scaleY, f: translateY } = canvasInfo.transform;

    return nodes.map((node: any) => {
      const transformedX = node.x * scaleX + translateX;
      const transformedY = node.y * scaleY + translateY;
      const screenX = canvasInfo.left + transformedX;
      const screenY = canvasInfo.top + transformedY;

      const isVisible =
        screenX >= canvasInfo.left &&
        screenX <= canvasInfo.left + canvasInfo.clientWidth &&
        screenY >= canvasInfo.top &&
        screenY <= canvasInfo.top + canvasInfo.clientHeight;

      return {
        id: node.id, screenX, screenY, isVisible,
        canvasWidth: canvasInfo.clientWidth, canvasHeight: canvasInfo.clientHeight,
        x: node.x, y: node.y, transformedX, transformedY,
        transform: { scaleX, translateX, scaleY, translateY },
        canvasInfo: { left: canvasInfo.left, top: canvasInfo.top, clientWidth: canvasInfo.clientWidth, clientHeight: canvasInfo.clientHeight, devicePixelRatio: canvasInfo.devicePixelRatio },
        ...node,
      };
    });
  }

  async elementClick(x: number, y: number): Promise<void> {
    await this.page.mouse.click(x, y, { button: "right" });
  }

  async getNodesCount(): Promise<string | null> {
    return (await pollForElementContent(this.nodesCount, "Nodes Count", this.nodesCountLoader))?.replace(/[()]/g, '') || null;
  }

  async getEdgesCount(): Promise<string | null> {
    return (await pollForElementContent(this.edgesCount, "Edges Count", this.edgesCountLoader))?.replace(/[()]/g, '') || null;
  }

  async isVisibleErrorToast(): Promise<boolean> {
    return waitForElementToBeVisible(this.errorToast);
  }

  async getNotificationErrorToast(): Promise<boolean> {
    const isVisible = await this.isVisibleErrorToast();
    return isVisible;
  }

  async getErrorToastText(): Promise<string> {
    const isVisible = await this.isVisibleErrorToast();
    if (!isVisible) return "";
    return (await this.errorToast.textContent()) || "";
  }

  async getErrorToastTitle(): Promise<string> {
    const isVisible = await this.isVisibleErrorToast();
    if (!isVisible) return "";
    const title = this.errorToast.getByTestId("toast-title");
    return (await title.textContent()) || "";
  }

  async isOfflineIndicatorVisible(): Promise<boolean> {
    const indicator = this.page.locator('[role="status"][aria-label*="offline"]');
    return waitForElementToBeVisible(indicator);
  }

  async getLinksScreenPositions(): Promise<any[]> {
    await this.waitForCanvasAnimationToEnd();
    await this.page.waitForTimeout(500);

    await this.page.waitForFunction(
      (key) => {
        const data = (window as any)[key]?.();
        return (data && ((Array.isArray(data.links) && data.links.length > 0) ||
          (data.elements && Array.isArray(data.elements.links) && data.elements.links.length > 0)));
      },
      "graph",
      { timeout: 5000 }
    );

    const canvasInfo = await this.canvasElement.evaluate((canvasElement: HTMLCanvasElement) => {
      if (!canvasElement) return null;
      const rect = canvasElement.getBoundingClientRect();
      const ctx = canvasElement.getContext("2d");
      const transform = ctx?.getTransform();
      return {
        width: canvasElement.width, height: canvasElement.height,
        clientWidth: rect.width, clientHeight: rect.height,
        left: rect.left, top: rect.top,
        devicePixelRatio: window.devicePixelRatio || 1,
        transform: transform
          ? { a: transform.a, b: transform.b, c: transform.c, d: transform.d, e: transform.e, f: transform.f }
          : null,
      };
    });

    if (!canvasInfo || !canvasInfo.transform) return [];

    const graphData = await this.page.evaluate(
      (key) => (window as any)[key]?.(),
      "graph"
    );

    const links = graphData?.links || graphData?.elements?.links;
    const nodesData = graphData?.nodes || graphData?.elements?.nodes;
    if (!links || !Array.isArray(links) || !nodesData || !Array.isArray(nodesData)) return [];

    const { a: scaleX, e: translateX, d: scaleY, f: translateY } = canvasInfo.transform;

    return links.map((link: any) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      const source = nodesData.find((n: any) => n.id === sourceId);
      const target = nodesData.find((n: any) => n.id === targetId);

      if (!source || !target) {
        return {
          id: link.id, sourceId, targetId,
          sourceScreenX: 0, sourceScreenY: 0, targetScreenX: 0, targetScreenY: 0,
          midX: 0, midY: 0, isVisible: false,
          canvasWidth: canvasInfo.clientWidth, canvasHeight: canvasInfo.clientHeight,
          ...link,
        };
      }

      const sourceTransformedX = source.x * scaleX + translateX;
      const sourceTransformedY = source.y * scaleY + translateY;
      const targetTransformedX = target.x * scaleX + translateX;
      const targetTransformedY = target.y * scaleY + translateY;
      const sourceScreenX = canvasInfo.left + sourceTransformedX;
      const sourceScreenY = canvasInfo.top + sourceTransformedY;
      const targetScreenX = canvasInfo.left + targetTransformedX;
      const targetScreenY = canvasInfo.top + targetTransformedY;
      const midX = (sourceScreenX + targetScreenX) / 2;
      const midY = (sourceScreenY + targetScreenY) / 2;

      const isVisible =
        ((sourceScreenX >= canvasInfo.left && sourceScreenX <= canvasInfo.left + canvasInfo.clientWidth) ||
          (targetScreenX >= canvasInfo.left && targetScreenX <= canvasInfo.left + canvasInfo.clientWidth) ||
          (midX >= canvasInfo.left && midX <= canvasInfo.left + canvasInfo.clientWidth)) &&
        ((sourceScreenY >= canvasInfo.top && sourceScreenY <= canvasInfo.top + canvasInfo.clientHeight) ||
          (targetScreenY >= canvasInfo.top && targetScreenY <= canvasInfo.top + canvasInfo.clientHeight) ||
          (midY >= canvasInfo.top && midY <= canvasInfo.top + canvasInfo.clientHeight));

      return {
        id: link.id, sourceId, targetId, sourceScreenX, sourceScreenY, targetScreenX, targetScreenY,
        midX, midY, isVisible, canvasWidth: canvasInfo.clientWidth, canvasHeight: canvasInfo.clientHeight,
        sourceX: source.x, sourceY: source.y, targetX: target.x, targetY: target.y,
        sourceTransformedX, sourceTransformedY, targetTransformedX, targetTransformedY,
        transform: { scaleX, translateX, scaleY, translateY },
        canvasInfo: { left: canvasInfo.left, top: canvasInfo.top, clientWidth: canvasInfo.clientWidth, clientHeight: canvasInfo.clientHeight, devicePixelRatio: canvasInfo.devicePixelRatio },
        ...link,
      };
    });
  }

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
    return this.page.getByTestId(`clearEditor`);
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

  /**
   * Ensures the graph info side panel is expanded.
   * react-resizable-panels v4 renders content inside collapsed panels
   * (overflow: visible on outer div), so Playwright's isVisible() returns
   * true even when the panel is at 0% width. We check the panel's actual
   * bounding box width instead.
   */
  private async ensureGraphInfoPanelOpen(): Promise<void> {
    // Use .first() to avoid strict-mode violations: two elements share
    // data-testid="graphInfoPanel" (the ResizablePanel wrapper in providers.tsx
    // and the inner div in graphInfo.tsx).
    const box = await this.graphInfoPanel.first().boundingBox().catch(() => null);
    if (!box || box.width < 50) {
      await interactWhenVisible(
        this.graphInfoToggle,
        (el) => el.click(),
        "Graph Info Toggle"
      );
      // Wait for the panel expansion animation to complete
      await this.graphInfoPanel.first().waitFor({ state: "visible" });
      await this.page.waitForTimeout(300);
    }
  }

  private get duplicateGraphInput(): Locator {
    return this.page.getByTestId("duplicateGraphInput");
  }

  private get duplicateGraphConfirm(): Locator {
    return this.page.getByTestId("duplicateGraphConfirm");
  }

  private get graphInfoToggle(): Locator {
    return this.page.getByTestId("graphInfoToggle");
  }

  private get graphInfoPanel(): Locator {
    return this.page.getByTestId("graphInfoPanel");
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
      this.insertInput,
      (el) => el.fill(text),
      "Create Graph Input"
    );
  }

  async fillSearch(text: string): Promise<void> {
    await interactWhenVisible(
      this.search(),
      (el) => el.fill(text),
      "Search Graph"
    );
  }

  async fillInput(text: string): Promise<void> {
    await interactWhenVisible(
      this.input,
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
      this.elementCanvasSearch,
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
    // Dismiss any open Radix tooltips that may overlay the editor
    await this.page.keyboard.press("Escape");
    await interactWhenVisible(
      this.editorContainer,
      (el) => el.click(),
      "Editor Input",
      1000,
      15
    );
  }

  async clickClearEditorInput(): Promise<void> {
    await interactWhenVisible(
      this.clearEditor,
      (el) => el.click(),
      "Clear Editor Input"
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
    await this.ensureGraphInfoPanelOpen();
    await interactWhenVisible(
      this.create,
      (el) => el.click(),
      "Create Graph"
    );
  }

  async clickConfirmCreateGraph(): Promise<void> {
    await interactWhenVisible(
      this.createConfirm,
      (el) => el.click(),
      "Create Graph Confirm"
    );
  }

  async clickCreateCancel(): Promise<void> {
    await interactWhenVisible(
      this.createCancel,
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
      this.deleteBtn,
      (el) => el.click(),
      "Delete Graph"
    );
  }

  async clickDeleteConfirm(): Promise<void> {
    await interactWhenVisible(
      this.deleteConfirm,
      (el) => el.click(),
      "Confirm Delete Graph"
    );
  }

  async clickDeleteCancel(): Promise<void> {
    await interactWhenVisible(
      this.deleteCancel,
      (el) => el.click(),
      "Cancel Delete Graph"
    );
  }

  async clickExport(): Promise<void> {
    await interactWhenVisible(
      this.exportBtn,
      (el) => el.click(),
      "Export Graph"
    );
  }

  async clickExportConfirm(): Promise<void> {
    await interactWhenVisible(
      this.exportConfirm,
      (el) => el.click(),
      "Confirm Export Graph"
    );
  }

  async clickExportCancel(): Promise<void> {
    await interactWhenVisible(
      this.exportCancel,
      (el) => el.click(),
      "Cancel Export Graph"
    );
  }

  async clickSelect(type: Type = "Graph"): Promise<void> {
    if (type === "Graph") {
      await this.ensureGraphInfoPanelOpen();
    }
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
      this.search(),
      (el) => el.click(),
      "Search Graph"
    );
  }

  async clickElementCanvasAdd(): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasAdd,
      (el) => el.click(),
      "Add Element"
    );
  }

  async clickElementCanvasAddNode(): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasAddNode,
      (el) => el.click(),
      "Add Node"
    );
  }

  async clickElementCanvasAddEdge(): Promise<void> {
    await interactWhenVisible(
      this.elementCanvasAddEdge,
      (el) => el.click(),
      "Add Edge"
    );
  }

  async clickDeleteElement(): Promise<void> {
    await interactWhenVisible(
      this.deleteElement(),
      (el) => el.click(),
      "Delete Element"
    );
  }

  async clickDeleteElementConfirm(): Promise<void> {
    await interactWhenVisible(
      this.deleteElementConfirm,
      (el) => el.click(),
      "Confirm Delete Element"
    );
  }

  async clickDeleteElementCancel(): Promise<void> {
    await interactWhenVisible(
      this.deleteElementCancel,
      (el) => el.click(),
      "Cancel Delete Element"
    );
  }

  async clickAnimationControl(): Promise<void> {
    await interactWhenVisible(
      this.animationControl,
      (el) => el.click(),
      "Animation Control"
    );
  }

  async clickZoomInControl(): Promise<void> {
    await interactWhenVisible(
      this.zoomInControl,
      (el) => el.click(),
      "Zoom In Control"
    );
  }

  async clickZoomOutControl(): Promise<void> {
    await interactWhenVisible(
      this.zoomOutControl,
      (el) => el.click(),
      "Zoom Out Control"
    );
  }

  async clickCenterControl(): Promise<void> {
    await interactWhenVisible(
      this.centerControl,
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
      this.elementCanvasSuggestionByName(name),
      (el) => el.click(),
      `Element Canvas Suggestion Graph ${name}`
    );
  }

  async clickLabelsButtonByLabel(
    label: ElementLabel,
    name: string
  ): Promise<void> {
    await interactWhenVisible(
      this.labelsButtonByName(label, name),
      (el) => el.click(),
      `Labels Panel Button Graph ${label} ${name}`
    );
  }

  async clickEditorRun(): Promise<void> {
    await interactWhenVisible(this.editorRun, (el) => el.click(), "Editor Run");
  }

  async clickManage(): Promise<void> {
    await interactWhenVisible(
      this.manage,
      (el) => el.click(),
      "Manage Graphs Button"
    );
  }

  async clickTableCheckboxByName(name: string): Promise<void> {
    await interactWhenVisible(
      this.tableCheckboxByName(name),
      (el) => el.click(),
      `Table Graphs Checkbox ${name}`
    );
  }

  async clickEditButton(): Promise<void> {
    await interactWhenVisible(
      this.editButton,
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
      this.saveButton,
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
      this.tableRowByName(name),
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
    return waitForElementToBeVisible(this.labelsButtonByName(label, name));
  }

  async getLabelsButtonByNameContent(
    label: ElementLabel,
    name: string
  ): Promise<string | null> {
    const content = await interactWhenVisible(
      this.labelsButtonByName(label, name),
      (el) => el.textContent(),
      `Graph label ${name}`
    );
    return content;
  }

  async isVisibleEditButton(): Promise<boolean> {
    return waitForElementToBeVisible(this.editButton);
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
    return this.elementCanvasSuggestionList.isVisible();
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
      await waitForElementToNotBeVisible(this.createConfirm);
      // Wait for the editor to become visible after graph creation
      await waitForElementToBeVisible(this.editorContainer, 1000, 10);
    }
    // Wait for the editor to stabilize after graph creation triggers re-renders
    await waitForElementToBeVisible(this.editorContainer, 500, 20);
  }

  async removeGraph(graphName: string): Promise<void> {
    await this.clickSelect();
    await this.clickManage();
    await this.clickTableCheckboxByName(graphName);
    await this.clickDelete();
    await this.clickDeleteConfirm();
    await waitForElementToNotBeVisible(this.deleteConfirm);
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
    await waitForElementToNotBeVisible(this.deleteConfirm);
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
    // Wait for graph selector to be enabled (graphs loaded)
    await waitForElementToBeEnabled(this.select("Graph"), 1000, 15);
    await this.clickSelect();
    await this.clickManage();
    await this.hoverTableRowByName(oldName);
    await this.clickEditButton();
    await this.fillInput(newName);
    await this.clickSaveButton();
    await waitForElementToNotBeVisible(this.saveButton);
  }

  async selectGraphByName(graphName: string): Promise<void> {
    await this.ensureGraphInfoPanelOpen();
    // Wait for graph selector to be enabled (graphs loaded from API)
    let isEnabled = await waitForElementToBeEnabled(this.select("Graph"), 1000, 15);
    if (!isEnabled) {
      await interactWhenVisible(
        this.reloadList,
        (el) => el.click(),
        "Reload Graphs List"
      );
      isEnabled = await waitForElementToBeEnabled(this.select("Graph"), 1000, 30);
    }
    if (!isEnabled) throw new Error("Graph selector is not enabled after reloading the graph list");
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
    await waitForElementToNotBeVisible(this.deleteElementConfirm);
  }

  async deleteElementByName(name: string): Promise<void> {
    await this.searchElementInCanvas(name);
    await this.clickDeleteElement();
    await this.clickDeleteElementConfirm();
    await waitForElementToNotBeVisible(this.deleteElementConfirm);
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
    await this.page.mouse.click(x, y, { button: "right" });
    await this.page.waitForTimeout(500);
  }
}
