/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import BasePage from "@/e2e/infra/ui/basePage";
import { pollForElementContent, waitForElementToBeVisible } from "@/e2e/infra/utils";
import { Locator } from "@playwright/test";

export type GraphType = "Graph" | "Schema";

export type Element = "Node" | "Relation";

export type ElementLabel = "Relationships" | "Labels";

export type Type = GraphType | "Role" | "Type" | "Model" | "Theme" | "Query";

export default class Page extends BasePage {
  // CREATE
  public get create(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`create${type}`);
  }

  public get insertInput(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`create${type}Input`);
  }

  public get createConfirm(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`create${type}Confirm`);
  }

  public get createCancel(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`create${type}Cancel`);
  }

  // DELETE
  public get delete(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`delete${type}`);
  }

  public get deleteConfirm(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`delete${type}Confirm`);
  }

  public get deleteCancel(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`delete${type}Cancel`);
  }

  // EXPORT
  public get export(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`export${type}`);
  }

  public get exportConfirm(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`export${type}Confirm`);
  }

  public get exportCancel(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`export${type}Cancel`);
  }

  // RELOAD
  public get reloadList(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`reload${type}sList`);
  }

  // SELECT
  public get select(): (type: Type) => Locator {
    return (type: Type) => this.page.getByTestId(`select${type}`);
  }

  public get selectItem(): (type: Type, id: string) => Locator {
    return (type: Type, id: string) =>
      this.page.getByTestId(`select${type}${id}`);
  }

  // SEARCH
  public get search(): (type: Type) => Locator {
    return (type: Type) => this.page.getByTestId(`${type}Search`);
  }

  // MANAGE
  public get manage(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`manage${type}s`);
  }

  // TABLE
  public get tableCheckbox(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`table${type}sCheckbox`);
  }

  public get tableRowByName(): (type: GraphType, name: string) => Locator {
    return (type: GraphType, name: string) =>
      this.page.getByTestId(`tableRow${type}s${name}`);
  }

  public get tableCheckboxByName(): (type: GraphType, name: string) => Locator {
    return (type: GraphType, name: string) =>
      this.page.getByTestId(`tableCheckbox${type}s${name}`);
  }

  public get editButton(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`editButton${type}s`);
  }

  public get input(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`input${type}s`);
  }

  public get saveButton(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`saveButton${type}s`);
  }

  public get cancelButton(): (type: GraphType) => Locator {
    return (type: GraphType) => this.page.getByTestId(`cancel${type}Button`);
  }

  // CANVAS TOOLBAR

  // SEARCH
  public get elementCanvasSearch(): (type: GraphType) => Locator {
    return (type: GraphType) =>
      this.page.getByTestId(`elementCanvasSearch${type}`);
  }

  public get elementCanvasSuggestionList(): (type: GraphType) => Locator {
    return (type: GraphType) =>
      this.page.getByTestId(`elementCanvasSuggestionsList${type}`);
  }

  public get elementCanvasSuggestionByName(): (
    type: GraphType,
    name: string
  ) => Locator {
    return (type: GraphType, name: string) =>
      this.page.getByTestId(`elementCanvasSuggestion${type}${name}`);
  }

  // ADD
  public get elementCanvasAdd(): (type: GraphType) => Locator {
    return (type: GraphType) =>
      this.page.getByTestId(`elementCanvasAdd${type}`);
  }

  public get elementCanvasAddNode(): (type: GraphType) => Locator {
    return (type: GraphType) =>
      this.page.getByTestId(`elementCanvasAddNode${type}`);
  }

  public get elementCanvasAddEdge(): (type: GraphType) => Locator {
    return (type: GraphType) =>
      this.page.getByTestId(`elementCanvasAddEdge${type}`);
  }

  // DELETE
  public get deleteElement(): (type: Element | GraphType) => Locator {
    return (type: Element | GraphType) =>
      this.page.getByTestId(`deleteElement${type}`);
  }

  public get deleteElementConfirm(): (type: GraphType) => Locator {
    return (type: GraphType) =>
      this.page.getByTestId(`deleteElementConfirm${type}`);
  }

  public get deleteElementCancel(): (type: GraphType) => Locator {
    return (type: GraphType) =>
      this.page.getByTestId(`deleteElementCancel${type}`);
  }

  // LABELS
  public get labelsButtonByName(): (
    type: GraphType,
    label: ElementLabel,
    name: string
  ) => Locator {
    return (type: GraphType, label: ElementLabel, name: string) =>
      this.page.getByTestId(`${type}${label}Button${name}`);
  }

  // CANVAS CONTROLS
  public get animationControl(): () => Locator {
    return () => this.page.getByTestId(`animationControl`);
  }

  public get zoomInControl(): () => Locator {
    return () => this.page.getByTestId(`zoomInControl`);
  }

  public get zoomOutControl(): () => Locator {
    return () => this.page.getByTestId(`zoomOutControl`);
  }

  public get centerControl(): () => Locator {
    return () => this.page.getByTestId("centerControl");
  }

  // COUNT
  public get nodesCount(): () => Locator {
    return () => this.page.getByTestId(`nodesCount`);
  }

  public get nodesCountLoader(): () => Locator {
    return () => this.page.getByTestId(`nodesCountLoader`);
  }

  public get edgesCount(): () => Locator {
    return () => this.page.getByTestId(`edgesCount`);
  }

  public get edgesCountLoader(): () => Locator {
    return () => this.page.getByTestId(`edgesCountLoader`);
  }

  // CANVAS TOOLTIP
  public get nodeCanvasToolTip(): Locator {
    return this.page.locator("//div[contains(@class, 'float-tooltip-kap')]");
  }

  // CANVAS
  public get canvasElement(): Locator {
    return this.page.locator("falkordb-canvas").locator("canvas").first();
  }

  // TOAST
  public get toast(): Locator {
    return this.page.getByTestId(`toast`);
  }

  public get errorToast(): Locator {
    return this.page.getByTestId(`toast-destructive`);
  }

  public get toastUnDoButton(): Locator {
    return this.page.getByTestId("toast").getByRole("button", { name: "Undo" });
  }

  private get skeleton(): Locator {
    return this.page.locator("#skeleton").first();
  }

  // 2000 is the timeout for the animation to end
  // 1000 is the timeout for the fit to size animation
  // 1500 is extra timeout to ensure the animation is over
  async waitForCanvasAnimationToEnd(timeout = 4500): Promise<void> {
    await waitForElementToBeVisible(this.skeleton);

    // Wait for the web component to be loaded (it's imported asynchronously)
    await this.canvasElement.waitFor({ state: "attached", timeout: 10000 });

    // Poll the canvas element's data-engine-status attribute using the locator
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const status = await this.canvasElement.getAttribute("data-engine-status");
      if (status === "stopped") {
        return;
      }
      await this.page.waitForTimeout(500); // Poll every 500ms
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

  async getNodesScreenPositions(windowKey: "graph" | "schema"): Promise<any[]> {
    // Wait for canvas to be ready and animations to settle
    await this.waitForCanvasAnimationToEnd();
    await this.page.waitForTimeout(1500); // Allow some time for the canvas to render properly

    // Get canvas element and its properties
    const canvasInfo = await this.page.evaluate((selector) => {
      const canvasElement = document.querySelector(
        selector
      ) as HTMLCanvasElement;
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
          ? {
              a: transform.a,
              b: transform.b,
              c: transform.c,
              d: transform.d,
              e: transform.e,
              f: transform.f,
            }
          : null,
      };
    }, ".force-graph-container canvas");

    if (!canvasInfo || !canvasInfo.transform) return [];

    // Get graph data from window object
    const graphData = await this.page.evaluate(
      (key) => (window as any)[key],
      windowKey
    );

    if (!graphData?.elements?.nodes) return [];

    const {
      a: scaleX,
      e: translateX,
      d: scaleY,
      f: translateY,
    } = canvasInfo.transform;

    return graphData.elements.nodes.map((node: any) => {
      // Apply canvas transform matrix to node coordinates
      // Transform: screenX = node.x * scaleX + translateX, screenY = node.y * scaleY + translateY
      const transformedX = node.x * scaleX + translateX;
      const transformedY = node.y * scaleY + translateY;

      // Convert from canvas coordinates to actual screen coordinates
      // Account for canvas positioning and device pixel ratio
      const screenX = canvasInfo.left + transformedX;
      const screenY = canvasInfo.top + transformedY;

      // Check if node is visible in viewport
      const isVisible =
        screenX >= canvasInfo.left &&
        screenX <= canvasInfo.left + canvasInfo.clientWidth &&
        screenY >= canvasInfo.top &&
        screenY <= canvasInfo.top + canvasInfo.clientHeight;

      return {
        id: node.id,
        screenX,
        screenY,
        isVisible,
        canvasWidth: canvasInfo.clientWidth,
        canvasHeight: canvasInfo.clientHeight,
        // Keep original coordinates for reference
        x: node.x,
        y: node.y,
        // Transform data for debugging
        transformedX,
        transformedY,
        transform: { scaleX, translateX, scaleY, translateY },
        canvasInfo: {
          left: canvasInfo.left,
          top: canvasInfo.top,
          clientWidth: canvasInfo.clientWidth,
          clientHeight: canvasInfo.clientHeight,
          devicePixelRatio: canvasInfo.devicePixelRatio,
        },
        ...node,
      };
    });
  }

  async elementClick(x: number, y: number): Promise<void> {
    await this.page.mouse.click(x, y, { button: "right" });
  }

  async getNodesCount(): Promise<string | null> {
    return (await pollForElementContent(this.nodesCount(), "Nodes Count", this.nodesCountLoader()))?.replace(/[()]/g, '') || null;
  }

  async getEdgesCount(): Promise<string | null> {
    return (await pollForElementContent(this.edgesCount(), "Edges Count", this.edgesCountLoader()))?.replace(/[()]/g, '') || null;
  }

  async isVisibleErrorToast(): Promise<boolean> {
    return waitForElementToBeVisible(this.errorToast);
  }

  async getNotificationErrorToast(): Promise<boolean> {
    await this.page.waitForTimeout(1000);
    const isVisible = await this.isVisibleErrorToast();
    return isVisible;
  }

  async getLinksScreenPositions(windowKey: "graph" | "schema"): Promise<any[]> {
    // Wait for canvas to be ready and animations to settle
    await this.waitForCanvasAnimationToEnd();

    // Get canvas element and its properties
    const canvasInfo = await this.page.evaluate((selector) => {
      const canvasElement = document.querySelector(
        selector
      ) as HTMLCanvasElement;
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
          ? {
              a: transform.a,
              b: transform.b,
              c: transform.c,
              d: transform.d,
              e: transform.e,
              f: transform.f,
            }
          : null,
      };
    }, ".force-graph-container canvas");

    if (!canvasInfo || !canvasInfo.transform) return [];

    // Get graph data from window object
    const graphData = await this.page.evaluate(
      (key) => (window as any)[key],
      windowKey
    );

    if (!graphData?.elements?.links || !graphData?.elements?.nodes) return [];

    const {
      a: scaleX,
      e: translateX,
      d: scaleY,
      f: translateY,
    } = canvasInfo.transform;

    return graphData.elements.links.map((link: any) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;

      const source = graphData.elements.nodes.find(
        (n: any) => n.id === sourceId
      );
      const target = graphData.elements.nodes.find(
        (n: any) => n.id === targetId
      );

      if (!source || !target) {
        return {
          id: link.id,
          sourceId,
          targetId,
          sourceScreenX: 0,
          sourceScreenY: 0,
          targetScreenX: 0,
          targetScreenY: 0,
          midX: 0,
          midY: 0,
          isVisible: false,
          canvasWidth: canvasInfo.clientWidth,
          canvasHeight: canvasInfo.clientHeight,
          ...link,
        };
      }

      // Apply canvas transform matrix to node coordinates
      // Transform: screenX = node.x * scaleX + translateX, screenY = node.y * scaleY + translateY
      const sourceTransformedX = source.x * scaleX + translateX;
      const sourceTransformedY = source.y * scaleY + translateY;
      const targetTransformedX = target.x * scaleX + translateX;
      const targetTransformedY = target.y * scaleY + translateY;

      // Convert from canvas coordinates to actual screen coordinates
      // Account for canvas positioning and device pixel ratio
      const sourceScreenX = canvasInfo.left + sourceTransformedX;
      const sourceScreenY = canvasInfo.top + sourceTransformedY;
      const targetScreenX = canvasInfo.left + targetTransformedX;
      const targetScreenY = canvasInfo.top + targetTransformedY;

      // Calculate midpoint
      const midX = (sourceScreenX + targetScreenX) / 2;
      const midY = (sourceScreenY + targetScreenY) / 2;

      // Check if link is visible in viewport (if any part of the link is visible)
      const isVisible =
        ((sourceScreenX >= canvasInfo.left &&
          sourceScreenX <= canvasInfo.left + canvasInfo.clientWidth) ||
          (targetScreenX >= canvasInfo.left &&
            targetScreenX <= canvasInfo.left + canvasInfo.clientWidth) ||
          (midX >= canvasInfo.left &&
            midX <= canvasInfo.left + canvasInfo.clientWidth)) &&
        ((sourceScreenY >= canvasInfo.top &&
          sourceScreenY <= canvasInfo.top + canvasInfo.clientHeight) ||
          (targetScreenY >= canvasInfo.top &&
            targetScreenY <= canvasInfo.top + canvasInfo.clientHeight) ||
          (midY >= canvasInfo.top &&
            midY <= canvasInfo.top + canvasInfo.clientHeight));

      return {
        id: link.id,
        sourceId,
        targetId,
        sourceScreenX,
        sourceScreenY,
        targetScreenX,
        targetScreenY,
        midX,
        midY,
        isVisible,
        canvasWidth: canvasInfo.clientWidth,
        canvasHeight: canvasInfo.clientHeight,
        // Keep original coordinates for reference
        sourceX: source.x,
        sourceY: source.y,
        targetX: target.x,
        targetY: target.y,
        // Transform data for debugging
        sourceTransformedX,
        sourceTransformedY,
        targetTransformedX,
        targetTransformedY,
        transform: { scaleX, translateX, scaleY, translateY },
        canvasInfo: {
          left: canvasInfo.left,
          top: canvasInfo.top,
          clientWidth: canvasInfo.clientWidth,
          clientHeight: canvasInfo.clientHeight,
          devicePixelRatio: canvasInfo.devicePixelRatio,
        },
        ...link,
      };
    });
  }
}
