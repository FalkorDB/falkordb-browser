import { Locator } from "@playwright/test";
import {
  interactWhenVisible,
  waitForElementToBeVisible,
  waitForElementToNotBeVisible,
} from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class SettingsQueryPage extends GraphPage {
  private get queryExecutionSectionHeader(): Locator {
    return this.page.getByRole("heading", { name: "Query Execution" }).locator("xpath=ancestor::div[@class and contains(@class, 'cursor-pointer')]");
  }

  private get userExperienceSectionHeader(): Locator {
    return this.page.getByRole("heading", { name: "User Experience" }).locator("xpath=ancestor::div[@class and contains(@class, 'cursor-pointer')]");
  }

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

  private get runDefaultQuerySwitch(): Locator {
    return this.page.locator("#runDefaultQuerySwitch");
  }

  private get runDefaultQueryInput(): Locator {
    return this.page.locator("#runDefaultQueryInput");
  }

  private get runDefaultQueryResetBtn(): Locator {
    return this.page.locator("#runDefaultQueryResetBtn");
  }

  private get contentPersistenceSwitch(): Locator {
    return this.page.locator("#contentPersistenceSwitch");
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

  async clickRunDefaultQuerySwitchOn(): Promise<void> {
    await interactWhenVisible(
      this.runDefaultQuerySwitch,
      async (el) => {
        if ((await el.getAttribute("data-state")) === "checked") return;
        el.click();
      },
      "check run default query ON switch"
    );
  }

  async clickRunDefaultQuerySwitchOff(): Promise<void> {
    await interactWhenVisible(
      this.runDefaultQuerySwitch,
      async (el) => {
        if ((await el.getAttribute("data-state")) === "unchecked") return;
        el.click();
      },
      "check run default query OFF switch"
    );
  }

  async getRunDefaultQuerySwitch(): Promise<boolean> {
    return interactWhenVisible(
      this.runDefaultQuerySwitch,
      async (el) => (await el.getAttribute("data-state")) === "checked",
      "get run default query switch"
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

  async clickContentPersistenceSwitchOn(): Promise<void> {
    await interactWhenVisible(
      this.contentPersistenceSwitch,
      async (el) => {
        if ((await el.getAttribute("data-state")) === "checked") return;
        el.click();
      },
      "check content persistence ON switch"
    );
  }

  async clickContentPersistenceSwitchOff(): Promise<void> {
    await interactWhenVisible(
      this.contentPersistenceSwitch,
      async (el) => {
        if ((await el.getAttribute("data-state")) === "unchecked") return;
        el.click();
      },
      "check content persistence OFF switch"
    );
  }

  async getContentPersistenceSwitch(): Promise<boolean> {
    return interactWhenVisible(
      this.contentPersistenceSwitch,
      async (el) => (await el.getAttribute("data-state")) === "checked",
      "check content persistence ON switch"
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
      throw new Error("Save Query Settings button not visible after 1s");
    }
  }

  async expandQueryExecutionSection(): Promise<void> {
    await interactWhenVisible(
      this.queryExecutionSectionHeader,
      async (el) => {
        await el.click();
        // Wait a bit for the section to expand
        await this.page.waitForTimeout(300);
      },
      "expand query execution section"
    );
  }

  async expandUserExperienceSection(): Promise<void> {
    await interactWhenVisible(
      this.userExperienceSectionHeader,
      async (el) => {
        await el.click();
        // Wait a bit for the section to expand
        await this.page.waitForTimeout(300);
      },
      "expand user experience section"
    );
  }
}
