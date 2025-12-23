import { Locator } from "@playwright/test";
import {
  waitForElementToBeVisible,
  interactWhenVisible,
  waitForElementToNotBeVisible,
} from "@/e2e/infra/utils";
import GraphInfoPage from "./graphInfoPage";

export default class CustomizeStylePage extends GraphInfoPage {
  private customizeStyleButton(label: string): Locator {
    return this.page.getByTestId(`customizeStyle${label}`);
  }

  private labelButton(label: string): Locator {
    return this.page.getByTestId(`graphInfo${label}Node`);
  }

  private get panelTitle(): Locator {
    return this.page.getByText("Customize Style");
  }

  private get colorSection(): Locator {
    return this.page.getByText("Color:");
  }

  private get sizeSection(): Locator {
    return this.page.getByText("Size:");
  }

  private get captionSection(): Locator {
    return this.page.getByText("Caption:");
  }

  private get colorButtons(): Locator {
    return this.page.locator('button[aria-label^="Select color"]');
  }

  private get sizeButtons(): Locator {
    return this.page.locator('button[aria-label^="Select size"]');
  }

  private captionOption(caption: string): Locator {
    return this.page.getByText(caption).last();
  }

  private get closeButton(): Locator {
    return this.page.locator('button[title="Close"]').first();
  }

  async isCustomizeStyleButtonVisible(label: string): Promise<boolean> {
    return waitForElementToBeVisible(this.customizeStyleButton(label));
  }

  async clickCustomizeStyleButton(label: string): Promise<void> {
    await interactWhenVisible(
      this.customizeStyleButton(label),
      (el) => el.click(),
      `Customize Style Button ${label}`
    );
  }

  async isPanelVisible(): Promise<boolean> {
    return waitForElementToBeVisible(this.panelTitle);
  }

  async isPanelNotVisible(): Promise<boolean> {
    return waitForElementToNotBeVisible(this.panelTitle);
  }

  async isColorSectionVisible(): Promise<boolean> {
    return waitForElementToBeVisible(this.colorSection);
  }

  async isSizeSectionVisible(): Promise<boolean> {
    return waitForElementToBeVisible(this.sizeSection);
  }

  async isCaptionSectionVisible(): Promise<boolean> {
    return waitForElementToBeVisible(this.captionSection);
  }

  async selectFirstColor(): Promise<void> {
    await interactWhenVisible(
      this.colorButtons.first(),
      (el) => el.click(),
      "First Color Button"
    );
  }

  async selectColorByIndex(index: number): Promise<void> {
    await interactWhenVisible(
      this.colorButtons.nth(index),
      (el) => el.click(),
      `Color Button ${index}`
    );
  }

  async selectFirstSize(): Promise<void> {
    await interactWhenVisible(
      this.sizeButtons.first(),
      (el) => el.click(),
      "First Size Button"
    );
  }

  async selectSizeByIndex(index: number): Promise<void> {
    await interactWhenVisible(
      this.sizeButtons.nth(index),
      (el) => el.click(),
      `Size Button ${index}`
    );
  }

  async selectCaption(caption: string): Promise<void> {
    await interactWhenVisible(
      this.captionOption(caption),
      (el) => el.click(),
      `Caption Option ${caption}`
    );
  }

  async closePanel(): Promise<void> {
    await interactWhenVisible(
      this.closeButton,
      (el) => el.click(),
      "Close Button"
    );
  }

  async closePanelWithEscape(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }

  async getLabelButtonColor(label: string): Promise<string> {
    const color = await this.labelButton(label).evaluate((el: HTMLElement) =>
      window.getComputedStyle(el).backgroundColor
    );
    return color;
  }

  async getLabelStyleFromLocalStorage(label: string): Promise<{
    customColor?: string;
    customSize?: number;
    customCaption?: string;
  } | null> {
    const style = await this.page.evaluate((labelName) => {
      const stored = localStorage.getItem(`labelStyle_${labelName}`);
      return stored ? JSON.parse(stored) : null;
    }, label);
    return style;
  }

  async hoverOnNode(x: number, y: number): Promise<void> {
    await this.page.mouse.move(x, y);
    await this.page.waitForTimeout(500);
  }

  async getSelectedSizeButtonIndex(): Promise<number> {
    const selectedIndex = await this.page.evaluate(() => {
      const sizeButtons = Array.from(
        document.querySelectorAll('button[aria-label^="Select size"]')
      );
      return sizeButtons.findIndex((btn) =>
        btn.classList.contains("ring-2")
      );
    });
    return selectedIndex;
  }

  async getSelectedColorButtonIndex(): Promise<number> {
    const selectedIndex = await this.page.evaluate(() => {
      const colorButtons = Array.from(
        document.querySelectorAll('button[aria-label^="Select color"]')
      );
      return colorButtons.findIndex((btn) =>
        btn.classList.contains("ring-2")
      );
    });
    return selectedIndex;
  }

  async getNodeDisplayName(nodeId: number): Promise<string> {
    const nodes = await this.getNodesScreenPositions("graph");
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }
    // displayName is a tuple [line1, line2]
    const [line1, line2] = node.displayName || ["", ""];
    return [line1, line2].filter(Boolean).join(" ");
  }
}
