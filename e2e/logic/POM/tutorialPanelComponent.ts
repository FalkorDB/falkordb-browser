/* eslint-disable no-await-in-loop */
import { Locator } from "playwright";
import {
  interactWhenVisible,
  waitForElementToBeVisible,
  waitForElementToNotBeVisible,
} from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class TutorialPanel extends GraphPage {
  private get tutorialSpotlight(): Locator {
    return this.page.getByTestId("tutorialSpotlight");
  }

  private get replayTutorial(): Locator {
    return this.page.getByTestId("replayTutorial");
  }

  private get skipTutorial(): Locator {
    return this.page.getByTestId("skipTutorial");
  }

  async isTutorialVisible(): Promise<boolean> {
    return waitForElementToBeVisible(this.tutorialSpotlight);
  }

  async isTutorialNotVisible(): Promise<boolean> {
    return waitForElementToNotBeVisible(this.tutorialSpotlight);
  }

  async clickReplayTutorial(): Promise<boolean> {
    return interactWhenVisible(
      this.replayTutorial,
      async (el) => {
        await el.click();
        return true;
      },
      "Replay Tutorial"
    );
  }

  async changeLocalStorage(value: string): Promise<void> {
    await this.page.evaluate((val) => {
      localStorage.setItem("tutorial", val);
    }, value);
  }

  async clickAtTopLeftCorner(): Promise<void> {
    await this.page.mouse.click(10, 10);
  }

  /**
   * Get the current tutorial step title text.
   */
  async getStepTitle(): Promise<string | null> {
    const heading = this.page.locator(".fixed.bg-background h3");
    const isVisible = await waitForElementToBeVisible(heading);
    if (!isVisible) return null;
    return heading.textContent();
  }

  /**
   * Click the "Next" or "Finish" button in the tutorial tooltip.
   */
  async clickNextButton(): Promise<void> {
    const nextBtn = this.page.locator(".fixed.bg-background button").filter({ hasText: /^(Next|Finish)$/ });
    await interactWhenVisible(nextBtn, (el) => el.click(), "Tutorial Next/Finish");
  }

  /**
   * Click the tutorial overlay on a target element by forwarding a click event.
   * The tutorial creates an overlay div at z-40 covering the target element.
   * We locate that overlay and click it, which the tutorial system forwards.
   */
  async clickTutorialTarget(selector: string): Promise<void> {
    // Wait for the target element to exist first.
    // Use .first() to mirror document.querySelector behaviour when the selector
    // matches multiple elements (e.g. all 15 preset color buttons).
    const target = this.page.locator(selector).first();
    await waitForElementToBeVisible(target);
    // The tutorial overlay sits on z-index:40 over the target element.
    // Click the actual center of the target element's bounding box.
    const box = await target.boundingBox();
    if (!box) throw new Error(`Target ${selector} has no bounding box`);
    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }

  /**
   * Perform a mousedown on the tutorial target element.
   */
  async mousedownTutorialTarget(selector: string): Promise<void> {
    const target = this.page.locator(selector).first();
    await waitForElementToBeVisible(target);
    const box = await target.boundingBox();
    if (!box) throw new Error(`Target ${selector} has no bounding box`);
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.up();
  }

  /**
   * Hover over a tutorial target element to trigger pointermove/pointerenter.
   * Moves to the element, waits for sub-content to potentially render,
   * then moves slightly to fire additional pointermove events.
   */
  async hoverTutorialTarget(selector: string, nextStepTitle?: string): Promise<void> {
    const target = this.page.locator(selector).first();
    await waitForElementToBeVisible(target);
    const box = await target.boundingBox();
    if (!box) throw new Error(`Target ${selector} has no bounding box`);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await this.page.mouse.move(cx, cy);
    // Fire additional pointermove events until the tutorial advances or timeout.
    for (let i = 0; i < 10; i++) {
      await this.page.waitForTimeout(300);
      // Break early if the step already advanced
      if (nextStepTitle) {
        const title = await this.getStepTitle();
        if (title?.trim() === nextStepTitle) return;
      }
      await this.page.mouse.move(cx + (i % 2), cy);
    }
  }

  /**
   * Right-click on the tutorial canvas target.
   */
  async rightClickTutorialTarget(selector: string): Promise<void> {
    const target = this.page.locator(selector).first();
    await waitForElementToBeVisible(target);
    const box = await target.boundingBox();
    if (!box) throw new Error(`Target ${selector} has no bounding box`);
    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" });
  }

  /**
   * Right-click on the canvas at multiple positions attempting to hit a node.
   * Returns true if the DataPanel appeared (i.e. a node/edge was right-clicked).
   */
  async rightClickCanvasUntilDataPanel(): Promise<boolean> {
    // Use actual node screen positions from the graph so we always hit a node.
    const nodes = await this.getNodesScreenPositions();
    const visibleNodes = nodes.filter((n) => n.isVisible);
    const targets = visibleNodes.length > 0 ? visibleNodes : nodes;

    for (const node of targets) {
      await this.page.mouse.click(node.screenX, node.screenY, { button: "right" });
      const dataPanel = this.page.getByTestId("DataPanel");
      const appeared = await waitForElementToBeVisible(dataPanel, 500, 4);
      if (appeared) return true;
    }
    return false;
  }

  /**
   * Wait for a specific step title to appear. Useful after clicking an advance target.
   */
  async waitForStep(title: string, timeout = 10000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const current = await this.getStepTitle();
      if (current?.trim() === title) return;
      await this.page.waitForTimeout(300);
    }
    throw new Error(`Timed out waiting for tutorial step: "${title}"`);
  }

  /**
   * Get list of graphs currently in the Graph selector dropdown via the API.
   */
  async getGraphList(): Promise<string[]> {
    const result = await this.page.evaluate(async () => {
      const res = await fetch("/api/graph/");
      const data = await res.json();
      return data.opts || data || [];
    });
    return result as string[];
  }
}
