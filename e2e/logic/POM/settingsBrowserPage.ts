import { Locator } from "@playwright/test";
import BasePage from "@/e2e/infra/ui/basePage";
import {
  interactWhenVisible,
  waitForElementToBeVisible,
} from "@/e2e/infra/utils";

export default class SettingsBrowserPage extends BasePage {
  // Chat Section
  private get chatSectionHeader(): Locator {
    return this.page.getByTestId("chatSectionHeader");
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

  // Model Selector Elements
  private get modelSearchInput(): Locator {
    return this.page.getByTestId("modelSearch");
  }

  private getModelButton(modelName: string): Locator {
    return this.page.getByTestId(`selectModel${modelName}`);
  }

  private getModelButtonByDisplayText(displayText: string): Locator {
    return this.page.locator(`button[data-testid^="selectModel"]:has(span:text-is("${displayText}"))`);
  }

  private getCategoryHeader(categoryName: string): Locator {
    // Match the exact h3 text within the category header
    return this.page.locator(`h3.text-sm.font-bold:has-text("${categoryName}")`);
  }

  private get noModelsFoundMessage(): Locator {
    return this.page.locator('p:has-text("No models found")');
  }

  // Wait for Interactive Methods
  async waitForEnvironmentSection(): Promise<boolean> {
    return waitForElementToBeVisible(this.chatSectionHeader);
  }

  async waitForChatApiKeyInput(): Promise<boolean> {
    return waitForElementToBeVisible(this.chatApiKeyInput);
  }

  async waitForSaveSettingsButton(): Promise<boolean> {
    return waitForElementToBeVisible(this.saveSettingsButton);
  }

  // Click Methods
  async clickChatSectionHeader(): Promise<void> {
    await interactWhenVisible(
      this.chatSectionHeader,
      (el) => el.click(),
      "Chat Section Header"
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
  async expandChatSection(): Promise<void> {
    const isInputVisible = await this.chatApiKeyInput.isVisible();
    if (!isInputVisible) {
      await this.clickChatSectionHeader();
      await this.waitForChatApiKeyInput();
    }
  }

  async setChatApiKey(apiKey: string): Promise<void> {
    await this.expandChatSection();
    await this.waitForChatApiKeyInputEnabled();
    await this.fillChatApiKey(apiKey);
  }

  async setChatApiKeyAndSave(apiKey: string, modelName?: string): Promise<void> {
    await this.expandChatSection();
    await this.waitForChatApiKeyInputEnabled();

    // Select model if provided
    if (modelName) {
      await this.selectModel(modelName);
    }

    // Fill the API key
    await this.fillChatApiKey(apiKey);

    // Save settings
    await this.waitForSaveSettingsButton();
    await this.clickSaveSettingsButton();
  }

  async clearChatApiKeyAndSave(): Promise<void> {
    await this.expandChatSection();
    await this.clearChatApiKey();
    await this.waitForSaveSettingsButton();
    await this.clickSaveSettingsButton();
  }

  // Model Selector Methods
  async searchModels(searchText: string): Promise<void> {
    await interactWhenVisible(
      this.modelSearchInput,
      (el) => el.fill(searchText),
      "Model Search Input"
    );
  }

  async clearModelSearch(): Promise<void> {
    await interactWhenVisible(
      this.modelSearchInput,
      (el) => el.clear(),
      "Model Search Input Clear"
    );
  }

  async selectModel(providerName: string): Promise<void> {
    // First check if element exists by testid (raw model name)
    const modelButton = this.getModelButton(providerName);
    const existsByTestId = await modelButton.count() > 0;

    if (existsByTestId) {
      // Use testid approach
      await interactWhenVisible(
        modelButton,
        (el) => el.click(),
        `Select Model: ${providerName}`
      );
    } else {
      // Try by displayed text (formatted name)
      const buttonByText = this.getModelButtonByDisplayText(providerName);
      await interactWhenVisible(
        buttonByText.first(),
        (el) => el.click(),
        `Select Model by text: ${providerName}`
      );
    }
  }

  async isModelSelected(providerName: string): Promise<boolean> {
    // First check if element exists by testid (raw model name)
    const modelButton = this.getModelButton(providerName);
    const existsByTestId = await modelButton.count() > 0;

    if (existsByTestId) {
      // Use testid approach
      try {
        const selected = await modelButton.getAttribute("data-selected");
        return selected === "true";
      } catch {
        return false;
      }
    } else {
      // Try by displayed text (formatted name)
      try {
        const buttonByText = this.getModelButtonByDisplayText(providerName);
        const selected = await buttonByText.first().getAttribute("data-selected");
        return selected === "true";
      } catch {
        return false;
      }
    }
  }

  async isModelVisible(providerName: string): Promise<boolean> {
    // First check if element exists by testid (raw model name)
    const modelButton = this.getModelButton(providerName);
    const existsByTestId = await modelButton.count() > 0;

    if (existsByTestId) {
      // Use testid approach
      try {
        return await modelButton.isVisible();
      } catch {
        return false;
      }
    } else {
      // Try by displayed text (formatted name)
      try {
        const buttonByText = this.getModelButtonByDisplayText(providerName);
        return await buttonByText.first().isVisible();
      } catch {
        return false;
      }
    }
  }

  async isCategoryVisible(categoryName: string): Promise<boolean> {
    const categoryHeader = this.getCategoryHeader(categoryName);
    try {
      // Wait a bit for categories to render after models load
      await this.page.waitForTimeout(500);
      return await categoryHeader.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  async getNoModelsFoundText(): Promise<string> {
    return interactWhenVisible(
      this.noModelsFoundMessage,
      (el) => el.textContent(),
      "No Models Found Message"
    ).then((text) => text || "");
  }

  async reloadPage(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Get all available model names from the UI
   * Returns the raw model values (data-testid values)
   */
  async getAvailableModels(): Promise<string[]> {
    // Wait for models to load
    await this.page.waitForTimeout(500);

    // Get all model buttons by looking for elements with data-testid starting with "selectModel"
    const modelButtons = await this.page.locator('[data-testid^="selectModel"]').all();

    // Get all testIds and extract model names
    const testIds = await Promise.all(
      modelButtons.map(async (button) => button.getAttribute('data-testid'))
    );

    // Extract model names from testIds (remove "selectModel" prefix)
    const models = testIds
      .filter((testId): testId is string => testId !== null)
      .map((testId) => testId.replace('selectModel', ''));

    return models;
  }

  /**
   * Get the first model from a specific category
   * @param searchTerm - Term to search for (e.g., "claude" for Anthropic, "gpt" for OpenAI)
   */
  async getFirstModelBySearch(searchTerm: string): Promise<string | null> {
    const allModels = await this.getAvailableModels();
    const matchingModel = allModels.find(model =>
      model.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchingModel || null;
  }

  /**
   * Get the first model that does NOT match a search term
   */
  async getFirstModelNotMatching(searchTerm: string): Promise<string | null> {
    const allModels = await this.getAvailableModels();
    const nonMatchingModel = allModels.find(model =>
      !model.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return nonMatchingModel || null;
  }
}
