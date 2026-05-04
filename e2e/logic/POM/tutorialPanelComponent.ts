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
    // Wait for the target element to exist first
    const target = this.page.locator(selector);
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
    const target = this.page.locator(selector);
    await waitForElementToBeVisible(target);
    const box = await target.boundingBox();
    if (!box) throw new Error(`Target ${selector} has no bounding box`);
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.up();
  }

  /**
   * Right-click on the tutorial canvas target.
   */
  async rightClickTutorialTarget(selector: string): Promise<void> {
    const target = this.page.locator(selector);
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
    const canvas = this.page.locator("falkordb-canvas");
    const box = await canvas.boundingBox();
    if (!box) return false;

    const offsets = [
      { x: 0.5, y: 0.5 },
      { x: 0.4, y: 0.4 },
      { x: 0.6, y: 0.4 },
      { x: 0.3, y: 0.6 },
      { x: 0.5, y: 0.3 },
      { x: 0.7, y: 0.5 },
      { x: 0.3, y: 0.3 },
    ];

    for (const offset of offsets) {
      await this.page.mouse.click(
        box.x + box.width * offset.x,
        box.y + box.height * offset.y,
        { button: "right" }
      );
      // Check if DataPanel appeared
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
