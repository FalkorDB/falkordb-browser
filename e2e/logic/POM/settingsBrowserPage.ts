/* eslint-disable no-await-in-loop */
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

  private get chatModelSourceApiKeyButton(): Locator {
    return this.page.getByTestId("chatModelSourceApiKey");
  }

  private get chatModelSourceLocalButton(): Locator {
    return this.page.getByTestId("chatModelSourceLocal");
  }

  private get chatApiKeyProvidersInfoButton(): Locator {
    return this.page.getByTestId("chatApiKeyProvidersInfo");
  }

  private get addChatApiKeyButton(): Locator {
    return this.page.getByTestId("addChatApiKeyButton");
  }

  private get chatApiKeyCards(): Locator {
    return this.page.getByTestId("chatApiKeyCard");
  }

  private get localLlmProviderOllamaButton(): Locator {
    return this.page.getByTestId("localLlmProviderOllama");
  }

  private get localLlmProviderLmStudioButton(): Locator {
    return this.page.getByTestId("localLlmProviderLmStudio");
  }

  private get localLlmEndpointInput(): Locator {
    return this.page.getByTestId("localLlmEndpointInput");
  }

  private get localLlmLoadButton(): Locator {
    return this.page.getByTestId("localLlmLoadButton");
  }

  private get maxSaveMessagesInput(): Locator {
    return this.page.getByTestId("maxSaveMessagesInput");
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
    return this.page.getByTestId("noModelsFoundMessage");
  }

  // Wait for Interactive Methods
  async waitForChatSection(): Promise<boolean> {
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
    await this.saveSettingsButton.waitFor({ state: "hidden", timeout: 30000 });
  }

  async clickSaveSettingsButtonWithoutWait(): Promise<void> {
    await interactWhenVisible(
      this.saveSettingsButton,
      (el) => el.click(),
      "Save Settings Button (no wait)"
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

  async selectApiKeyModelSource(): Promise<void> {
    await interactWhenVisible(
      this.chatModelSourceApiKeyButton,
      (el) => el.click(),
      "API Key Model Source"
    );
    await this.chatApiKeyInput.waitFor({ state: "visible", timeout: 5000 });
  }

  async selectLocalLlmModelSource(): Promise<void> {
    await interactWhenVisible(
      this.chatModelSourceLocalButton,
      (el) => el.click(),
      "Local LLM Model Source"
    );
    await this.localLlmEndpointInput.waitFor({ state: "visible", timeout: 5000 });
  }

  async selectLmStudioProvider(): Promise<void> {
    await interactWhenVisible(
      this.localLlmProviderLmStudioButton,
      (el) => el.click(),
      "LM Studio Provider"
    );
  }

  async isLocalLlmModelSourceSelected(): Promise<boolean> {
    return (await this.chatModelSourceLocalButton.getAttribute("aria-pressed")) === "true";
  }

  async isLmStudioProviderSelected(): Promise<boolean> {
    return (await this.localLlmProviderLmStudioButton.getAttribute("aria-pressed")) === "true";
  }

  async isOllamaProviderVisible(): Promise<boolean> {
    return this.localLlmProviderOllamaButton.isVisible();
  }

  async isLmStudioProviderVisible(): Promise<boolean> {
    return this.localLlmProviderLmStudioButton.isVisible();
  }

  async getLocalLlmEndpointValue(): Promise<string> {
    return interactWhenVisible(
      this.localLlmEndpointInput,
      (el) => el.inputValue(),
      "Local LLM Endpoint Value"
    );
  }

  async getLocalLlmLoadButtonText(): Promise<string> {
    const text = await this.localLlmLoadButton.textContent();
    return text?.trim() ?? "";
  }

  async hoverLocalLlmLoadButton(): Promise<void> {
    await this.localLlmLoadButton.waitFor({ state: "visible", timeout: 5000 });
    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('[data-testid="localLlmLoadButton"]') as HTMLButtonElement | null;
        return button && !button.disabled;
      },
      { timeout: 10000 }
    );

    await interactWhenVisible(
      this.localLlmLoadButton,
      (el) => el.hover(),
      "Local LLM Load Button"
    );
  }

  async isLocalLlmLoadTooltipVisible(): Promise<boolean> {
    return waitForElementToBeVisible(this.page.getByText("Load", { exact: true }));
  }

  async hoverApiKeyProvidersInfo(): Promise<void> {
    await interactWhenVisible(
      this.chatApiKeyProvidersInfoButton,
      (el) => el.hover(),
      "API Key Providers Info"
    );
  }

  async getApiKeyProvidersTooltipText(): Promise<string> {
    const tooltip = this.page.getByText("Supported hosted keys:", { exact: false });
    await tooltip.waitFor({ state: "visible", timeout: 5000 });
    return (await tooltip.textContent()) ?? "";
  }

  private getMaskedApiKey(apiKey: string): string {
    if (apiKey.length <= 10) return "••••••••";
    return `${apiKey.slice(0, 6)}••••••••${apiKey.slice(-4)}`;
  }

  private getChatApiKeyCard(apiKey: string): Locator {
    return this.chatApiKeyCards.filter({ hasText: apiKey }).first();
  }

  private getMaskedChatApiKeyCard(apiKey: string): Locator {
    return this.chatApiKeyCards.filter({ hasText: this.getMaskedApiKey(apiKey) }).first();
  }

  async addChatApiKey(apiKey: string): Promise<void> {
    await this.fillChatApiKey(apiKey);
    await interactWhenVisible(
      this.addChatApiKeyButton,
      (el) => el.click(),
      "Add Chat API Key Button"
    );
    await this.getMaskedChatApiKeyCard(apiKey).waitFor({ state: "visible", timeout: 5000 });
  }

  async getMaskedChatApiKeyText(apiKey: string): Promise<string> {
    const keyText = this.getMaskedChatApiKeyCard(apiKey).getByTestId("chatApiKeyValue");
    await keyText.waitFor({ state: "visible", timeout: 5000 });
    return (await keyText.textContent()) ?? "";
  }

  async showChatApiKey(apiKey: string): Promise<void> {
    const card = this.getMaskedChatApiKeyCard(apiKey);
    await interactWhenVisible(
      card.getByTestId("toggleChatApiKeyVisibilityButton"),
      (el) => el.click(),
      "Show Chat API Key Button"
    );
    await this.getChatApiKeyCard(apiKey).waitFor({ state: "visible", timeout: 5000 });
  }

  async getVisibleChatApiKeyText(apiKey: string): Promise<string> {
    const keyText = this.getChatApiKeyCard(apiKey).getByTestId("chatApiKeyValue");
    await keyText.waitFor({ state: "visible", timeout: 5000 });
    return (await keyText.textContent()) ?? "";
  }

  async editChatApiKey(currentApiKey: string, nextApiKey: string): Promise<void> {
    const card = this.getChatApiKeyCard(currentApiKey);
    await interactWhenVisible(
      card.getByTestId("editChatApiKeyButton"),
      (el) => el.click(),
      "Edit Chat API Key Button"
    );

    const editInput = card.getByTestId("chatApiKeyEditInput");
    await interactWhenVisible(
      editInput,
      async (el) => {
        await el.clear();
        await el.fill(nextApiKey);
      },
      "Chat API Key Edit Input"
    );

    await interactWhenVisible(
      card.getByTestId("saveEditedChatApiKeyButton"),
      (el) => el.click(),
      "Save Edited Chat API Key Button"
    );
    await this.getChatApiKeyCard(nextApiKey).waitFor({ state: "visible", timeout: 5000 });
  }

  async deleteChatApiKey(apiKey: string): Promise<void> {
    const card = this.getChatApiKeyCard(apiKey);
    await interactWhenVisible(
      card.getByTestId("deleteChatApiKeyButton"),
      (el) => el.click(),
      "Delete Chat API Key Button"
    );
    await card.waitFor({ state: "detached", timeout: 5000 });
  }

  async isChatApiKeyPresent(apiKey: string): Promise<boolean> {
    return this.getChatApiKeyCard(apiKey).isVisible();
  }

  async fillMaxSavedMessages(value: number): Promise<void> {
    await interactWhenVisible(
      this.maxSaveMessagesInput,
      async (el) => {
        await el.clear();
        await el.fill(value.toString());
      },
      "Max Saved Messages Input"
    );
  }

  async getMaxSavedMessagesValue(): Promise<string> {
    return interactWhenVisible(
      this.maxSaveMessagesInput,
      (el) => el.inputValue(),
      "Max Saved Messages Value"
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
    await this.chatSectionHeader.waitFor({ state: "visible" });
    const isApiKeyInputVisible = await this.chatApiKeyInput.isVisible();
    const isLocalEndpointVisible = await this.localLlmEndpointInput.isVisible();
    if (!isApiKeyInputVisible && !isLocalEndpointVisible) {
      await this.clickChatSectionHeader();
      await this.page.waitForFunction(
        () => document.querySelector('[data-testid="chatApiKeyInput"]') ||
          document.querySelector('[data-testid="localLlmEndpointInput"]'),
        { timeout: 10000 }
      );
    }
  }

  async waitForMaxSavedMessagesInput(): Promise<void> {
    await this.maxSaveMessagesInput.waitFor({ state: "visible", timeout: 10000 });
  }

  async setChatApiKey(apiKey: string): Promise<void> {
    await this.expandChatSection();
    await this.waitForChatApiKeyInputEnabled();
    await this.fillChatApiKey(apiKey);
  }

  /**
   * Wait for model auto-detection to complete after saving an API key.
   * The settings page auto-detects the provider from the key and saves the first
   * available model to localStorage asynchronously. This can take longer on
   * cold starts (first test run), so we poll localStorage instead of using a
   * fixed timeout.
   */
  async waitForModelAutoDetection(timeout = 10000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        () => {
          const model = localStorage.getItem("model");
          return model !== null && model.trim() !== "";
        },
        { timeout }
      );
      return true;
    } catch {
      // Model was not auto-detected within the timeout
      return false;
    }
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

  /**
   * Expands all collapsible category sections in the ModelSelector.
   * Categories are collapsed by default and model buttons are only rendered when expanded.
   * Uses data-testid="categoryToggle*" added to each category <button> in ModelSelector.tsx.
   * Waits for categories to appear first (ModelSelector has a 200ms debounce before rendering).
   */
  private async expandAllCategories(): Promise<void> {
    const toggleLocator = this.page.locator('[data-testid^="categoryToggle"]');
    try {
      // Wait for at least one category toggle to be visible (handles the 200ms render debounce)
      await toggleLocator.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      return; // No categories rendered within timeout, nothing to expand
    }
    const count = await toggleLocator.count();
    for (let i = 0; i < count; i += 1) {
      const toggle = toggleLocator.nth(i);
      // Only click if not already expanded — avoids accidentally collapsing an open category
      const isExpanded = await toggle.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await toggle.click();
      }
    }
    // Allow time for expansion animations / DOM updates
    await this.page.waitForTimeout(200);
  }

  async searchModels(searchText: string): Promise<void> {
    await this.modelSearchInput.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForFunction(
      () => {
        const input = document.querySelector('[data-testid="modelSearch"]') as HTMLInputElement;
        return input && !input.disabled;
      },
      { timeout: 30000 }
    );
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
    let existsByTestId = await modelButton.count() > 0;

    if (!existsByTestId) {
      // Categories may be collapsed (new collapsible ModelSelector design) — expand all first
      await this.expandAllCategories();
      existsByTestId = await modelButton.count() > 0;
    }

    if (existsByTestId) {
      // Use testid approach
      await interactWhenVisible(
        modelButton,
        (el) => el.click(),
        `Select Model: ${providerName}`
      );
    } else {
      // Try by displayed text (formatted name).
      // Re-expand categories in case the component's debounced effect collapsed them.
      await this.expandAllCategories();
      const buttonByText = this.getModelButtonByDisplayText(providerName);
      await interactWhenVisible(
        buttonByText.first(),
        (el) => el.click(),
        `Select Model by text: ${providerName}`
      );
    }
  }

  async isModelSelected(providerName: string): Promise<boolean> {
    // Model buttons only exist in DOM when their category is expanded
    const modelButton = this.getModelButton(providerName);
    let existsByTestId = await modelButton.count() > 0;

    if (!existsByTestId) {
      await this.expandAllCategories();
      existsByTestId = await modelButton.count() > 0;
    }

    if (existsByTestId) {
      try {
        const selected = await modelButton.getAttribute("data-selected");
        return selected === "true";
      } catch {
        return false;
      }
    } else {
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
    // Model buttons only exist in DOM when their category is expanded.
    // Expand whatever categories are currently shown (respects active search filter)
    // so we can check whether the model is present in the filtered results.
    await this.expandAllCategories();

    const modelButton = this.getModelButton(providerName);
    if (await modelButton.count() > 0) {
      try {
        return await modelButton.isVisible();
      } catch {
        return false;
      }
    }

    try {
      const buttonByText = this.getModelButtonByDisplayText(providerName);
      return await buttonByText.first().isVisible();
    } catch {
      return false;
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

    // Expand all collapsible categories so model buttons are rendered in the DOM
    await this.expandAllCategories();

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

  // ===== Graph Info Section =====

  private get graphInfoSectionHeader(): Locator {
    return this.page.locator('[aria-expanded]').filter({ has: this.page.locator('text=Graph Info') }).first();
  }

  private get refreshIntervalSlider(): Locator {
    return this.page.locator('#refreshInterval');
  }

  private get maxItemsForSearchSlider(): Locator {
    return this.page.locator('#maxItemsForSearch');
  }

  async expandGraphInfoSection(): Promise<void> {
    const isExpanded = await this.graphInfoSectionHeader.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this.graphInfoSectionHeader.click();
      await this.refreshIntervalSlider.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  async setRefreshIntervalSlider(value: number): Promise<void> {
    await this.setSliderByStep(this.refreshIntervalSlider, value, 1);
  }

  async getRefreshIntervalValue(): Promise<number> {
    return this.getSliderValue(this.refreshIntervalSlider);
  }

  async setMaxItemsForSearchSlider(value: number): Promise<void> {
    await this.setSliderByStep(this.maxItemsForSearchSlider, value, 1);
  }

  async getMaxItemsForSearchValue(): Promise<number> {
    return this.getSliderValue(this.maxItemsForSearchSlider);
  }

  // ===== User Experience Section =====

  private get userExperienceSectionHeader(): Locator {
    return this.page.locator('[aria-expanded]').filter({ has: this.page.locator('text=User Experience') }).first();
  }

  private get showPropertyKeyPrefixSwitch(): Locator {
    return this.page.locator('#showPropertyKeyPrefixSwitch');
  }

  private get captionKeyInput(): Locator {
    return this.page.locator('#captionKeyInput');
  }

  private get addCaptionKeyBtn(): Locator {
    return this.page.locator('#addCaptionKeyBtn');
  }

  async expandUserExperienceSection(): Promise<void> {
    const isExpanded = await this.userExperienceSectionHeader.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this.userExperienceSectionHeader.click();
      await this.showPropertyKeyPrefixSwitch.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  async getShowPropertyKeyPrefixState(): Promise<boolean> {
    return (await this.showPropertyKeyPrefixSwitch.getAttribute('data-state')) === 'checked';
  }

  async clickShowPropertyKeyPrefixSwitch(): Promise<void> {
    await this.showPropertyKeyPrefixSwitch.click();
  }

  async addCaptionKey(key: string): Promise<void> {
    await this.captionKeyInput.fill(key);
    await this.addCaptionKeyBtn.click();
  }

  async getCaptionKeys(): Promise<string[]> {
    // The caption keys list (ul) is in the same container as the captionKeyInput form
    // Navigate: captionKeyInput -> form -> captions container div -> ul li p
    const captionsContainer = this.captionKeyInput.locator('..').locator('..');
    const items = captionsContainer.locator('ul li p');
    const count = await items.count();
    const keys: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const text = await items.nth(i).textContent();
      if (text) keys.push(text);
    }
    return keys;
  }

  async removeCaptionKey(key: string): Promise<void> {
    // Scope to the caption list container to avoid matching unrelated <li> elements
    const captionsContainer = this.captionKeyInput.locator('..').locator('..');
    const listItem = captionsContainer.locator('li').filter({ hasText: key });
    const deleteBtn = listItem.getByRole('button', { name: 'Remove Caption' });
    await deleteBtn.click();
  }

  // ===== Table View Section (within User Experience) =====

  private get columnWidthSlider(): Locator {
    return this.page.locator('#columnWidth');
  }

  private get rowHeightSlider(): Locator {
    return this.page.locator('#rowHeight');
  }

  private get rowHeightExpandMultipleSlider(): Locator {
    return this.page.locator('#rowHeightExpandMultiple');
  }

  private async getSliderValue(slider: Locator): Promise<number> {
    const thumb = slider.locator('[role="slider"]');
    const raw = await thumb.getAttribute('aria-valuenow');
    return Number(raw ?? 0);
  }

  private async setSliderByStep(slider: Locator, targetValue: number, step: number): Promise<void> {
    const thumb = slider.locator('[role="slider"]');
    await thumb.focus();
    const raw = await thumb.getAttribute('aria-valuenow');
    const current = Number(raw ?? 0);
    const steps = Math.round((targetValue - current) / step);
    const key = steps > 0 ? 'ArrowRight' : 'ArrowLeft';
    for (let i = 0; i < Math.abs(steps); i += 1) {
      await thumb.press(key);
    }
  }

  async getColumnWidthValue(): Promise<number> {
    return this.getSliderValue(this.columnWidthSlider);
  }

  async setColumnWidthSlider(value: number): Promise<void> {
    await this.setSliderByStep(this.columnWidthSlider, value, 5);
  }

  async getRowHeightValue(): Promise<number> {
    return this.getSliderValue(this.rowHeightSlider);
  }

  async setRowHeightSlider(value: number): Promise<void> {
    await this.setSliderByStep(this.rowHeightSlider, value, 1);
  }

  async getRowHeightExpandMultipleValue(): Promise<number> {
    return this.getSliderValue(this.rowHeightExpandMultipleSlider);
  }

  async setRowHeightExpandMultipleSlider(value: number): Promise<void> {
    await this.setSliderByStep(this.rowHeightExpandMultipleSlider, value, 1);
  }
}
