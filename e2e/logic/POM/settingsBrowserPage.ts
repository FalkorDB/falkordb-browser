import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import {
  interactWhenVisible,
  waitForElementToBeVisible,
} from "@/e2e/infra/utils";

export default class SettingsBrowserPage extends BasePage {
  // Environment Section
  private get environmentSectionHeader(): Locator {
    return this.page.getByTestId("environmentSectionHeader");
  }

  private get chatModelSelect(): Locator {
    return this.page.getByTestId("chatModelSelect");
  }

  private get chatApiKeyInput(): Locator {
    return this.page.getByTestId("chatApiKeyInput");
  }

  // Save/Cancel Buttons
  private get saveSettingsButton(): Locator {
    return this.page.getByTestId("saveSettingsButton");
  }

  private get cancelSettingsButton(): Locator {
    return this.page.getByTestId("cancelSettingsButton");
  }

  // Wait for Interactive Methods
  async waitForEnvironmentSection(): Promise<boolean> {
    return waitForElementToBeVisible(this.environmentSectionHeader);
  }

  async waitForChatApiKeyInput(): Promise<boolean> {
    return waitForElementToBeVisible(this.chatApiKeyInput);
  }

  async waitForSaveSettingsButton(): Promise<boolean> {
    return waitForElementToBeVisible(this.saveSettingsButton);
  }

  // Click Methods
  async clickEnvironmentSectionHeader(): Promise<void> {
    await interactWhenVisible(
      this.environmentSectionHeader,
      (el) => el.click(),
      "Environment Section Header"
    );
  }

  async clickSaveSettingsButton(): Promise<void> {
    await interactWhenVisible(
      this.saveSettingsButton,
      (el) => el.click(),
      "Save Settings Button"
    );
  }

  async clickCancelSettingsButton(): Promise<void> {
    await interactWhenVisible(
      this.cancelSettingsButton,
      (el) => el.click(),
      "Cancel Settings Button"
    );
  }

  // Fill Methods
  async fillChatApiKey(apiKey: string): Promise<void> {
    await interactWhenVisible(
      this.chatApiKeyInput,
      (el) => el.fill(apiKey),
      "Chat API Key Input"
    );
  }

  async clearChatApiKey(): Promise<void> {
    await interactWhenVisible(
      this.chatApiKeyInput,
      (el) => el.clear(),
      "Chat API Key Input Clear"
    );
  }

  // Get Content Methods
  async getChatApiKeyValue(): Promise<string> {
    return interactWhenVisible(
      this.chatApiKeyInput,
      (el) => el.inputValue(),
      "Chat API Key Value"
    );
  }

  async isSaveSettingsButtonVisible(): Promise<boolean> {
    return this.saveSettingsButton.isVisible();
  }

  async isChatApiKeyInputVisible(): Promise<boolean> {
    return this.chatApiKeyInput.isVisible();
  }

  async isChatApiKeyInputEnabled(): Promise<boolean> {
    return this.chatApiKeyInput.isEnabled();
  }

  async waitForChatApiKeyInputEnabled(): Promise<void> {
    // Wait for input to be attached first
    await this.chatApiKeyInput.waitFor({ state: "attached", timeout: 10000 });
    
    // Wait for the input to be enabled (displayChat must be true)
    // This happens after the /api/chat endpoint is called in the frontend
    await this.page.waitForFunction(
      () => {
        const input = document.querySelector('[data-testid="chatApiKeyInput"]') as HTMLInputElement;
        return input && !input.disabled;
      },
      { timeout: 30000 } // Increased timeout to 30 seconds
    );
  }

  // Combined Actions
  async expandEnvironmentSection(): Promise<void> {
    const isInputVisible = await this.chatApiKeyInput.isVisible();
    if (!isInputVisible) {
      await this.clickEnvironmentSectionHeader();
      await this.waitForChatApiKeyInput();
    }
  }

  async setChatApiKey(apiKey: string): Promise<void> {
    await this.expandEnvironmentSection();
    await this.waitForChatApiKeyInputEnabled();
    await this.fillChatApiKey(apiKey);
  }

  async setChatApiKeyAndSave(apiKey: string, modelName?: string): Promise<void> {
    await this.expandEnvironmentSection();
    await this.waitForChatApiKeyInputEnabled();
    
    // Fill the API key
    await this.fillChatApiKey(apiKey);
    
    // Save settings
    await this.waitForSaveSettingsButton();
    await this.clickSaveSettingsButton();
  }

  async clearChatApiKeyAndSave(): Promise<void> {
    await this.expandEnvironmentSection();
    await this.clearChatApiKey();
    await this.waitForSaveSettingsButton();
    await this.clickSaveSettingsButton();
  }
}
