import { Locator } from "@playwright/test";
import {
  interactWhenVisible,
  waitForElementToBeVisible,
  waitForElementToNotBeVisible,
} from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class SettingsQueryPage extends GraphPage {
  private get limitInput(): Locator {
    return this.page.locator("#limitInput");
  }

  private get timeoutInput(): Locator {
    return this.page.locator("#timeoutInput");
  }

  private get increaseLimitBtn(): Locator {
    return this.page.locator("#increaseLimitBtn");
  }

  private get increaseTimeoutBtn(): Locator {
    return this.page.locator("#increaseTimeoutBtn");
  }

  private get decreaseLimitBtn(): Locator {
    return this.page.locator("#decreaseLimitBtn");
  }

  private get decreaseTimeoutBtn(): Locator {
    return this.page.locator("#decreaseTimeoutBtn");
  }

  private get runDefaultQueryCheckboxOn(): Locator {
    return this.page.locator("#runDefaultQueryCheckboxOn");
  }

  private get runDefaultQueryCheckboxOff(): Locator {
    return this.page.locator("#runDefaultQueryCheckboxOff");
  }

  private get runDefaultQueryInput(): Locator {
    return this.page.locator("#runDefaultQueryInput");
  }

  private get runDefaultQueryResetBtn(): Locator {
    return this.page.locator("#runDefaultQueryResetBtn");
  }

  private get contentPersistenceCheckboxOn(): Locator {
    return this.page.locator("#contentPersistenceCheckboxOn");
  }

  private get contentPersistenceCheckboxOff(): Locator {
    return this.page.locator("#contentPersistenceCheckboxOff");
  }

  private get cancelQuerySettingsBtn(): Locator {
    return this.page.locator("#cancelQuerySettingsBtn");
  }

  private get saveQuerySettingsBtn(): Locator {
    return this.page.locator("#saveQuerySettingsBtn");
  }

  async clickIncreaseLimit(): Promise<void> {
    await interactWhenVisible(
      this.increaseLimitBtn,
      (el) => el.click(),
      "increase Limit button"
    );
  }

  async clickIncreaseTimeout(): Promise<void> {
    await interactWhenVisible(
      this.increaseTimeoutBtn,
      (el) => el.click(),
      "increase timeout button"
    );
  }

  async clickDecreaseLimit(): Promise<void> {
    await interactWhenVisible(
      this.decreaseLimitBtn,
      (el) => el.click(),
      "decrease limit button"
    );
  }

  async clickDecreaseTimeout(): Promise<void> {
    await interactWhenVisible(
      this.decreaseTimeoutBtn,
      (el) => el.click(),
      "decrease timeout button"
    );
  }

  async fillTimeoutInput(input: string): Promise<void> {
    await interactWhenVisible(
      this.timeoutInput,
      (el) => el.fill(input),
      "time out input"
    );
  }

  async fillLimitInput(input: string): Promise<void> {
    await interactWhenVisible(
      this.limitInput,
      (el) => el.fill(input),
      "limit input"
    );
  }

  async fillLimit(limit: number): Promise<void> {
    await this.fillLimitInput(limit.toString());
  }

  async fillTimeout(timeout: number): Promise<void> {
    await this.fillTimeoutInput(timeout.toString());
  }

  async increaseLimit(): Promise<void> {
    await this.clickIncreaseLimit();
  }

  async increaseTimeout(): Promise<void> {
    await this.clickIncreaseTimeout();
  }

  async decreaseLimit(): Promise<void> {
    await this.clickDecreaseLimit();
  }

  async decreaseTimeout(): Promise<void> {
    await this.clickDecreaseTimeout();
  }

  async getLimit(): Promise<string> {
    const limit = await this.limitInput.inputValue();
    return limit;
  }

  async getTimeout(): Promise<string> {
    const timeout = await this.timeoutInput.inputValue();
    return timeout;
  }

  async checkRunDefaultQueryCheckboxOn(): Promise<void> {
    await interactWhenVisible(
      this.runDefaultQueryCheckboxOn,
      (el) => el.check(),
      "check run default query ON checkbox"
    );
  }

  async getRunDefaultQueryCheckboxOn(): Promise<boolean> {
    return interactWhenVisible(
      this.runDefaultQueryCheckboxOn,
      (el) => el.isChecked(),
      "check run default query ON checkbox"
    );
  }

  async checkRunDefaultQueryCheckboxOff(): Promise<void> {
    await interactWhenVisible(
      this.runDefaultQueryCheckboxOff,
      (el) => el.check(),
      "check run default query OFF checkbox"
    );
  }

  async getRunDefaultQueryCheckboxOff(): Promise<boolean> {
    return interactWhenVisible(
      this.runDefaultQueryCheckboxOff,
      (el) => el.isChecked(),
      "check run default query OFF checkbox"
    );
  }

  async fillRunDefaultQueryInput(input: string): Promise<void> {
    await interactWhenVisible(
      this.runDefaultQueryInput,
      (el) => el.fill(input),
      "fill run default query input"
    );
  }

  async getRunDefaultQueryInput(): Promise<string> {
    return this.runDefaultQueryInput.inputValue();
  }

  async clickRunDefaultQueryResetBtn(): Promise<void> {
    await interactWhenVisible(
      this.runDefaultQueryResetBtn,
      (el) => el.click(),
      "click run default query reset button"
    );

    await waitForElementToNotBeVisible(this.runDefaultQueryInput, 1000);
  }

  async checkContentPersistenceCheckboxOn(): Promise<void> {
    await interactWhenVisible(
      this.contentPersistenceCheckboxOn,
      (el) => el.check(),
      "check content persistence ON checkbox"
    );
  }

  async getContentPersistenceCheckboxOn(): Promise<boolean> {
    return interactWhenVisible(
      this.contentPersistenceCheckboxOn,
      (el) => el.isChecked(),
      "check content persistence ON checkbox"
    );
  }

  async checkContentPersistenceCheckboxOff(): Promise<void> {
    await interactWhenVisible(
      this.contentPersistenceCheckboxOff,
      (el) => el.check(),
      "check content persistence OFF checkbox"
    );
  }

  async getContentPersistenceCheckboxOff(): Promise<boolean> {
    return interactWhenVisible(
      this.contentPersistenceCheckboxOff,
      (el) => el.isChecked(),
      "check content persistence OFF checkbox"
    );
  }

  async clickCancelQuerySettingsBtn(): Promise<void> {
    await interactWhenVisible(
      this.cancelQuerySettingsBtn,
      (el) => el.click(),
      "click cancel query settings button"
    );
  }

  async clickSaveQuerySettingsBtn(): Promise<void> {
    if (await waitForElementToBeVisible(this.saveQuerySettingsBtn, 1000)) {
      await this.saveQuerySettingsBtn.click();
    } else {
      throw new Error("Save query settings button did not become visible within timeout");
    }
  }
}
