import { Locator } from "@playwright/test";
import {
  waitForElementToBeVisible,
  interactWhenVisible,
  waitForElementToNotBeVisible,
} from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class GraphInfoPage extends GraphPage {
  private get graphInfoNodesCount(): Locator {
    return this.page.getByTestId("nodesCount");
  }

  private get graphInfoEdgesCount(): Locator {
    return this.page.getByTestId("edgesCount");
  }

  private get graphInfoPropertyKeysCount(): Locator {
    return this.page.getByTestId("propertyKeysCount");
  }

  private get graphInfoAllNodesButton(): Locator {
    return this.page.getByTestId("graphInfoAllNodes");
  }

  private get graphInfoAllEdgesButton(): Locator {
    return this.page.getByTestId("graphInfoAllEdges");
  }

  private graphInfoNodeButton(label: string): Locator {
    return this.page.getByTestId(`graphInfo${label}Node`);
  }

  private graphInfoEdgeButton(relationship: string): Locator {
    return this.page.getByTestId(`graphInfo${relationship}Edge`);
  }

  private get graphInfoButton(): Locator {
    return this.page.getByTestId("graphInfoToggle");
  }

  async isGraphInfoPanelContainerVisible(): Promise<boolean> {
    await this.page.waitForTimeout(1000);
    return waitForElementToBeVisible(this.graphInfoNodesCount);
  }

  async clickGraphInfoButton(): Promise<void> {
    await interactWhenVisible(
      this.graphInfoButton,
      (el) => el.click(),
      "Graph Info Button"
    );
  }

  async openGraphInfoButton(): Promise<void> {
    if (await this.isGraphInfoPanelContainerVisible()) return;
    this.clickGraphInfoButton()
  }

  async getGraphInfoNodesCount(): Promise<string | null> {
    const content = await interactWhenVisible(
      this.graphInfoNodesCount,
      (el) => el.textContent(),
      "Graph Info Nodes Count"
    );
    return content?.replace(/[()]/g, "").trim() || null;
  }

  async getGraphInfoEdgesCount(): Promise<string | null> {
    const content = await interactWhenVisible(
      this.graphInfoEdgesCount,
      (el) => el.textContent(),
      "Graph Info Edges Count"
    );
    return content?.replace(/[()]/g, "").trim() || null;
  }

  async getGraphInfoPropertyKeysCount(): Promise<string | null> {
    const content = await interactWhenVisible(
      this.graphInfoPropertyKeysCount,
      (el) => el.textContent(),
      "Graph Info Property Keys Count"
    );
    return content?.replace(/[()]/g, "").trim() || null;
  }

  async clickGraphInfoAllNodesButton(): Promise<void> {
    await interactWhenVisible(
      this.graphInfoAllNodesButton,
      (el) => el.click(),
      "Graph Info All Nodes Button"
    );
    await this.waitForCanvasAnimationToEnd();
  }

  async clickGraphInfoAllEdgesButton(): Promise<void> {
    await interactWhenVisible(
      this.graphInfoAllEdgesButton,
      (el) => el.click(),
      "Graph Info All Edges Button"
    );
    await this.waitForCanvasAnimationToEnd();
  }

  async clickGraphInfoNodeButton(label: string): Promise<void> {
    await interactWhenVisible(
      this.graphInfoNodeButton(label),
      (el) => el.click(),
      `Graph Info Node Button ${label}`
    );
    await this.waitForCanvasAnimationToEnd();
  }

  async clickGraphInfoEdgeButton(relationship: string): Promise<void> {
    await interactWhenVisible(
      this.graphInfoEdgeButton(relationship),
      (el) => el.click(),
      `Graph Info Edge Button ${relationship}`
    );
    await this.waitForCanvasAnimationToEnd();
  }

  async isGraphInfoNodeButtonVisible(label: string): Promise<boolean> {
    return waitForElementToBeVisible(this.graphInfoNodeButton(label));
  }

  async isGraphInfoNodeButtonNotVisible(label: string): Promise<boolean> {
    return waitForElementToNotBeVisible(this.graphInfoNodeButton(label));
  }

  async isGraphInfoEdgeButtonVisible(relationship: string): Promise<boolean> {
    return waitForElementToBeVisible(this.graphInfoEdgeButton(relationship));
  }
}