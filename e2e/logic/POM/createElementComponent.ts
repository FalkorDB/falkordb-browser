import { Locator, expect, test } from "@playwright/test";
import { interactWhenVisible } from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export type AttributeValue = string | number | boolean;

type ValueType = "string" | "number" | "boolean";

export default class CreateElementPanel extends GraphPage {
  // PANEL
  public get panel(): Locator {
    return this.page.getByTestId("CreateElementPanel");
  }

  public get title(): Locator {
    return this.page.getByTestId("CreateElementPanelTitle");
  }

  public get attributesCount(): Locator {
    return this.page.getByTestId("CreateElementPanelAttributesCount");
  }

  public get createButton(): Locator {
    return this.page.getByTestId("CreateElementPanelCreate");
  }

  public get errorDescription(): Locator {
    return this.errorToast.getByTestId("toast-description");
  }

  // LABELS
  public get addLabelTrigger(): Locator {
    return this.page.getByTestId("CreateElementPanelAddLabel");
  }

  public label(name: string): Locator {
    return this.page.getByTestId(`CreateElementPanelLabel${name}`);
  }

  // NEW ATTRIBUTE ROW
  public get newKey(): Locator {
    return this.page.getByTestId("CreateElementPanelNewKey");
  }

  public get newValue(): Locator {
    return this.page.getByTestId("CreateElementPanelNewValue");
  }

  // ATTRIBUTE ROWS
  public attributeKey(key: string): Locator {
    return this.page.getByTestId(`CreateElementPanelAttributeKey${key}`);
  }

  public attributeValue(key: string): Locator {
    return this.page.getByTestId(`CreateElementPanelAttributeValue${key}`);
  }

  public attributeType(key: string): Locator {
    return this.page.getByTestId(`CreateElementPanelAttributeType${key}`);
  }

  public get editValue(): Locator {
    return this.page.getByTestId("CreateElementPanelEditValue");
  }

  public get deleteAttributeDialog(): Locator {
    return this.page.getByRole("dialog");
  }

  // EDGE ENDPOINTS
  public get sourceNode(): Locator {
    return this.page.getByTestId("CreateElementPanelSourceNode");
  }

  public get targetNode(): Locator {
    return this.page.getByTestId("CreateElementPanelTargetNode");
  }

  async loadGraph(graphName: string, query: string): Promise<void> {
    await this.selectGraphByName(graphName);
    await this.insertQuery(query);
    await this.clickRunQuery();
    await this.waitForScaleToStabilize();
  }

  async openNodePanel(): Promise<void> {
    await this.clickElementCanvasAddNode();
    await expect(this.title).toHaveText("Create Node");
  }

  /** Clicks two canvas nodes in order and opens the edge panel; the first is the source. */
  async openEdgePanel(): Promise<[number, number]> {
    const [first, second] = await this.snapshotNodesScreenPositions();
    expect(first?.isVisible && second?.isVisible, "both endpoints must be visible").toBe(true);
    await this.elementClick(first.screenX, first.screenY);
    await expect.poll(() => this.getDataPanelNodeId()).toBe(first.id);

    // Selection can pan and resize the canvas even after the force engine stops.
    const samples: { last?: { screenX: number; screenY: number }; stable: number } = { stable: 0 };
    await expect.poll(async () => {
      const current = (await this.snapshotNodesScreenPositions())
        .find((node) => node.id === second.id && node.isVisible);
      const previous = samples.last;
      const stable = previous && current
        && Math.hypot(previous.screenX - current.screenX, previous.screenY - current.screenY) < 1;
      samples.last = current;
      samples.stable = stable ? samples.stable + 1 : 0;
      return samples.stable;
    }, { intervals: [100], message: `node ${second.id} must settle on screen after selecting node ${first.id}` })
      .toBe(2);
    const caption = await this.page.evaluate((id) => {
      const canvas = document.querySelector("falkordb-canvas");
      const node = canvas?.getGraphData().nodes.find((entry) => entry.id === id);
      const label = canvas?.getGraph()?.nodeLabel();
      if (!node || typeof label !== "function") {
        throw new Error(`Cannot read the canvas tooltip for node ${id}`);
      }
      return String(label(node));
    }, second.id);

    type Point = { x: number; y: number };
    const diagnostics: {
      pointer?: Point;
      targets?: { document: string | null; shadow: string | null };
      projectedCenter?: Point;
      tooltip?: string;
      pointerUp?: unknown;
    } = {};
    try {
      // The projected position can settle before the renderer's hit-test canvas catches up.
      await expect.poll(async () => {
        const current = (await this.snapshotNodesScreenPositions())
          .find((node) => node.id === second.id && node.isVisible);
        diagnostics.projectedCenter = current && { x: current.screenX, y: current.screenY };
        diagnostics.targets = undefined;
        if (!current) return null;
        const hit = await this.canvasElement.evaluate((canvas, { screenX, screenY }) => {
          const root = canvas.getRootNode();
          if (!(root instanceof ShadowRoot)) {
            throw new Error("Expected the 2D graph canvas to be inside a shadow root");
          }
          const outer = document.elementFromPoint(screenX, screenY);
          const inner = root.elementFromPoint(screenX, screenY);
          const describe = (element: Element | null) =>
            element && (element.getAttribute("data-testid") ?? element.localName);
          return {
            // Document hit testing stops at the shadow host; check both layers.
            receivesPointer: outer === root.host && inner === canvas,
            targets: { document: describe(outer), shadow: describe(inner) },
          };
        }, current);
        diagnostics.targets = hit.targets;
        if (!hit.receivesPointer) return null;

        await this.page.mouse.move(current.screenX, current.screenY);
        diagnostics.pointer = { x: current.screenX, y: current.screenY };
        diagnostics.tooltip = (await this.nodeCanvasToolTip.filter({ visible: true }).allTextContents())[0] ?? "";
        return diagnostics.tooltip;
      }, { message: `the pointer must hit the inner canvas and resolve to node ${second.id} before Shift-click` }).toBe(caption);

      const pointer = diagnostics.pointer;
      if (!pointer) throw new Error(`No pointer position confirmed for node ${second.id}`);
      const capture = await this.page.evaluateHandle((id) => {
        const samples: Array<{
          target: string | null;
          coordinates: Point;
          projectedCenter: Point | null;
          tooltip: string | null;
        }> = [];
        document.addEventListener("pointerup", (event) => {
          const target = event.composedPath()[0];
          const canvas = document.querySelector("falkordb-canvas");
          const inner = canvas?.shadowRoot?.querySelector("canvas");
          const node = canvas?.getGraphData().nodes.find((entry) => entry.id === id);
          const rect = inner?.getBoundingClientRect();
          const center = node?.x !== undefined && node.y !== undefined
            ? canvas?.getGraph()?.graph2ScreenCoords(node.x, node.y)
            : undefined;
          samples.push({
            target: target instanceof Element ? target.getAttribute("data-testid") ?? target.localName : null,
            coordinates: { x: event.clientX, y: event.clientY },
            projectedCenter: center && rect ? { x: rect.left + center.x, y: rect.top + center.y } : null,
            tooltip: canvas?.shadowRoot?.querySelector(".float-tooltip-kap")?.textContent ?? null,
          });
        }, { capture: true, once: true });
        return samples;
      }, second.id);
      try {
        await this.elementClick(pointer.x, pointer.y, true);
        await expect.poll(() => this.getSelectionCount()).toBe(2);
      } catch (error) {
        diagnostics.pointerUp = await capture.jsonValue();
        throw error;
      } finally {
        await capture.dispose();
      }
    } catch (error) {
      await test.info().attach("edge-pointer-diagnostics", {
        body: JSON.stringify({ nodeId: second.id, expectedTooltip: caption, ...diagnostics }, null, 2),
        contentType: "application/json",
      });
      throw error;
    }
    await this.clickElementCanvasAddEdge();
    await expect(this.title).toHaveText("Create Edge");
    return [first.id, second.id];
  }

  async closePanel(): Promise<void> {
    await interactWhenVisible(
      this.page.getByTestId("CreateElementPanelClose"),
      (el) => el.click(),
      "Create Element Panel Close"
    );
    await expect(this.panel).toBeHidden();
  }

  async closeWithEscape(): Promise<void> {
    await this.title.click();
    await this.page.keyboard.press("Escape");
    await expect(this.panel).toBeHidden();
  }

  async cancelEditWithEscape(): Promise<void> {
    await interactWhenVisible(
      this.editValue,
      (el) => el.press("Escape"),
      "Create Element Edit Value"
    );
    await expect(this.editValue).toBeHidden();
  }

  async cancelNewAttributeWithEscape(focus: "key" | "value" = "key"): Promise<void> {
    const activeField = focus === "key" ? this.newKey : this.newValue;
    await interactWhenVisible(
      activeField,
      (el) => el.press("Escape"),
      "Create Element New Attribute"
    );
  }

  async clickCreate(): Promise<void> {
    await interactWhenVisible(
      this.createButton,
      (el) => el.click(),
      "Create Element"
    );
  }

  // LABELS
  async addLabel(name: string): Promise<void> {
    await interactWhenVisible(
      this.addLabelTrigger,
      (el) => el.click(),
      "Create Element Add Label"
    );
    await interactWhenVisible(
      this.page.getByTestId("addLabelInput"),
      (el) => el.fill(name),
      "Add Label Input"
    );
    await interactWhenVisible(
      this.page.getByTestId("addLabelButton"),
      (el) => el.click(),
      "Add Label Confirm"
    );
    await expect(this.label(name)).toBeVisible();
  }

  async removeLabel(name: string): Promise<void> {
    await interactWhenVisible(
      this.page.getByTestId(`CreateElementPanelRemoveLabel${name}`),
      (el) => el.click(),
      "Create Element Remove Label"
    );
    await interactWhenVisible(
      this.page.getByTestId("removeLabelButton"),
      (el) => el.click(),
      "Remove Label Confirm"
    );
    await expect(this.label(name)).toBeHidden();
  }

  // NEW ATTRIBUTE
  /** Fills the new-attribute row without submitting it. Type goes before value: changing the type resets the value. */
  async fillNewAttribute(key: string, value: AttributeValue): Promise<void> {
    await interactWhenVisible(
      this.newKey,
      (el) => el.fill(key),
      "Create Element New Key"
    );
    await this.setValue(this.page.getByTestId("CreateElementPanelNewType"), this.newValue, value);
  }

  async clickAddAttribute(): Promise<void> {
    await interactWhenVisible(
      this.page.getByTestId("CreateElementPanelAddAttribute"),
      (el) => el.click(),
      "Create Element Add Attribute"
    );
  }

  async clearNewValue(): Promise<void> {
    await interactWhenVisible(
      this.newValue,
      (el) => el.fill(""),
      "Create Element New Value"
    );
  }

  async addAttribute(key: string, value: AttributeValue): Promise<void> {
    await this.fillNewAttribute(key, value);
    await this.clickAddAttribute();
    await expect(this.attributeKey(key)).toBeVisible();
  }

  async cancelNewAttribute(): Promise<void> {
    await interactWhenVisible(
      this.page.getByTestId("CreateElementPanelCancelNewAttribute"),
      (el) => el.click(),
      "Create Element Cancel New Attribute"
    );
  }

  // EXISTING ATTRIBUTE
  /** The row's actions only render while the row is hovered. */
  async hoverAttribute(key: string): Promise<void> {
    await interactWhenVisible(
      this.attributeKey(key),
      (el) => el.hover(),
      "Create Element Attribute"
    );
  }

  async editAttributeWithPencil(key: string): Promise<void> {
    await this.hoverAttribute(key);
    await interactWhenVisible(
      this.page.getByTestId(`CreateElementPanelEditAttribute${key}`),
      (el) => el.click(),
      "Create Element Edit Attribute"
    );
    await expect(this.editValue).toBeVisible();
  }

  async editAttributeByValue(key: string): Promise<void> {
    await interactWhenVisible(
      this.attributeValue(key),
      (el) => el.click(),
      "Create Element Attribute Value"
    );
    await expect(this.editValue).toBeVisible();
  }

  async fillEditValue(value: string): Promise<void> {
    await interactWhenVisible(
      this.editValue,
      (el) => el.fill(value),
      "Create Element Edit Value"
    );
  }

  async selectEditType(type: ValueType): Promise<void> {
    await this.selectType(this.page.getByTestId("CreateElementPanelEditType"), type);
  }

  async toggleEditValue(): Promise<void> {
    await interactWhenVisible(
      this.editValue,
      (el) => el.click(),
      "Create Element Edit Value"
    );
  }

  async saveAttributeEdit(): Promise<void> {
    await interactWhenVisible(
      this.page.getByTestId("CreateElementPanelSaveAttribute"),
      (el) => el.click(),
      "Create Element Save Attribute"
    );
  }

  async saveAttributeEditWithEnter(): Promise<void> {
    await interactWhenVisible(
      this.editValue,
      (el) => el.press("Enter"),
      "Create Element Edit Value"
    );
  }

  async cancelAttributeEdit(): Promise<void> {
    await interactWhenVisible(
      this.page.getByTestId("CreateElementPanelCancelEditAttribute"),
      (el) => el.click(),
      "Create Element Cancel Attribute Edit"
    );
    await expect(this.editValue).toBeHidden();
  }

  async deleteAttribute(key: string, confirm: boolean): Promise<void> {
    await this.hoverAttribute(key);
    await interactWhenVisible(
      this.page.getByTestId(`CreateElementPanelDeleteAttribute${key}`),
      (el) => el.click(),
      "Create Element Delete Attribute"
    );
    await expect(this.deleteAttributeDialog).toBeVisible();
    await interactWhenVisible(
      this.page.getByTestId(
        confirm
          ? "CreateElementPanelDeleteAttributeConfirm"
          : "CreateElementPanelDeleteAttributeCancel"
      ),
      (el) => el.click(),
      "Create Element Delete Attribute Dialog"
    );
    await expect(this.deleteAttributeDialog).toBeHidden();
  }

  // EDGE
  async swapNodes(): Promise<void> {
    await interactWhenVisible(
      this.page.getByTestId("CreateElementPanelSwap"),
      (el) => el.click(),
      "Create Element Swap"
    );
  }

  private async selectType(typeCell: Locator, type: ValueType): Promise<void> {
    const trigger = typeCell.getByTestId("selectType");
    if ((await trigger.textContent())?.trim() === type) return;
    await interactWhenVisible(
      trigger,
      (el) => el.click(),
      "Create Element Type Select"
    );
    await interactWhenVisible(
      this.page.getByTestId(`selectType${type}`),
      (el) => el.click(),
      "Create Element Type Option"
    );
    await expect(trigger).toContainText(type);
  }

  private async setValue(typeCell: Locator, input: Locator, value: AttributeValue): Promise<void> {
    if (typeof value === "string") {
      await this.selectType(typeCell, "string");
      await interactWhenVisible(input, (el) => el.fill(value), "Create Element Value");
      return;
    }

    await this.selectType(typeCell, typeof value as ValueType);
    if (typeof value === "number") {
      await interactWhenVisible(input, (el) => el.fill(String(value)), "Create Element Value");
      return;
    }

    if (value) {
      await interactWhenVisible(input, (el) => el.click(), "Create Element Value");
      await expect(input).toHaveAttribute("data-state", "checked");
    }
  }
}
