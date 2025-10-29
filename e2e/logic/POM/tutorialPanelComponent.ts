/* eslint-disable no-await-in-loop */
// /* eslint-disable prefer-destructuring */
// /* eslint-disable @typescript-eslint/no-shadow */
// /* eslint-disable no-plusplus */
// /* eslint-disable no-await-in-loop */
// /* eslint-disable arrow-body-style */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { Locator } from "playwright";
import { waitForElementToBeVisible } from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class TutorialPanel extends GraphPage {
  
  private get tutorialSpotlight(): Locator {
    return this.page.getByTestId("tutorialSpotlight");
  }

  async isTutorialVisible(): Promise<boolean> {
    return waitForElementToBeVisible(this.tutorialSpotlight)
  }

  async changeLocalStorage(value: string): Promise<void> {
    await this.page.evaluate((val) => {
      localStorage.setItem("tutorial", val);
    }, value);
  }

  async clickAtTopLeftCorner(): Promise<void> {
    await this.page.mouse.click(10, 10);
  }
}
