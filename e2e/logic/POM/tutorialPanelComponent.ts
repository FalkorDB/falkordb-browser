/* eslint-disable no-await-in-loop */
// /* eslint-disable prefer-destructuring */
// /* eslint-disable @typescript-eslint/no-shadow */
// /* eslint-disable no-plusplus */
// /* eslint-disable no-await-in-loop */
// /* eslint-disable arrow-body-style */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { Locator } from "@playwright/test";
import { interactWhenVisible } from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class TutorialPanel extends GraphPage {
  private get sideButtons(): (side: string) => Locator {
    return (side: string) =>
      this.page.locator(
        `//div[@id='graphTutoria#l']//div[@class='overflow-hidden']/following-sibling::button[${side}]`
      );
  }

  private get contentInCenter(): Locator {
    return this.page.locator(
      "//div[@id='graphTutorial']//div[@class='overflow-hidden']//p"
    );
  }

  private get createNewGraphBtn(): Locator {
    return this.page.locator('div[role="dialog"]').getByTestId("createGraph");
  }

  private get dissmissDialogCheckbox(): Locator {
    return this.page.locator(
      '//div[p[text()="Don\'t show this again"]]//button'
    );
  }

  async clickOnsideButtons(side: string): Promise<void> {
    await interactWhenVisible(
      this.sideButtons(side),
      (el) => el.click(),
      "side button"
    );
  }

  async isContentInCenterHidden(): Promise<boolean> {
    const isHidden = await this.contentInCenter.isHidden();
    return isHidden;
  }

  async clickOnCreateNewGraph(): Promise<void> {
    await interactWhenVisible(
      this.createNewGraphBtn,
      (el) => el.click(),
      "create new graph button"
    );
  }

  async disableTutorial(): Promise<void> {
    await interactWhenVisible(
      this.dissmissDialogCheckbox,
      (el) => el.click(),
      "disable tutorial"
    );
  }

  async scrollRightInTutorial(amount: number): Promise<void> {
    for (let i = 0; i < amount; i += 1) {
      await this.clickOnsideButtons("2");
      await this.page.waitForTimeout(500);
    }
  }

  async createNewGraph(graphName: string): Promise<void> {
    await this.scrollRightInTutorial(3);
    await this.clickOnCreateNewGraph();
    await this.fillCreateGraphInput(graphName);
    await this.clickConfirmCreateGraph();
    await this.waitForPageIdle();
  }

  async changeLocalStorage(value: string): Promise<void> {
    await this.page.evaluate((val) => {
      localStorage.setItem("tutorial", val);
    }, value);
  }

  async clickAtTopLeftCorner(): Promise<void> {
    await this.page.mouse.click(10, 10);
  }

  async dismissTutorial(): Promise<void> {
    await this.disableTutorial();
    await this.clickAtTopLeftCorner();
  }
}
