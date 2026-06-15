import { expect, test } from "@playwright/test";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import SettingsBrowserPage from "../logic/POM/settingsBrowserPage";
import ApiCalls from "../logic/api/apiCalls";
import ChatComponent from "../logic/POM/chatComponent";
import HeaderComponent from "../logic/POM/headerComponent";
import { getRandomString } from "../infra/utils";

test.describe.configure({ mode: 'serial' });
test.describe('@browser Browser Settings tests', () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;

    // Store first available model from each provider
    let openaiModel: string;
    let anthropicModel: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let geminiModel: string;
    let xaiModel: string;

    test.beforeAll(async () => {
        // Fetch available models from each provider before running tests
        const tempApiCall = new ApiCalls();

        try {
            // Get models from each provider
            const openaiModels = await tempApiCall.getModelsByProvider('openai');
            const anthropicModels = await tempApiCall.getModelsByProvider('anthropic');
            const geminiModels = await tempApiCall.getModelsByProvider('gemini');
            const xaiModels = await tempApiCall.getModelsByProvider('xai');

            // Store first model from each provider
            openaiModel = openaiModels.models?.[0] || 'gpt-4o-mini';
            anthropicModel = anthropicModels.models?.[0] || 'claude-3-5-sonnet';
            geminiModel = geminiModels.models?.[0] || 'gemini-2.0-flash-exp';
            xaiModel = xaiModels.models?.[0] || 'grok-3-mini';
        } catch (error) {
            // Fallback to default models if API call fails
            console.warn('Failed to fetch models, using defaults:', error);
            openaiModel = 'gpt-4o-mini';
            anthropicModel = 'claude-3-5-sonnet';
            geminiModel = 'gemini-2.0-flash-exp';
            xaiModel = 'grok-3-mini';
        }
    });

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test('@readwrite Verify user can select a model and API key then save settings', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        // Expand environment section
        await settingsBrowserPage.expandChatSection();

        // Wait for models to load
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

        // Skip if models are not visible in the UI (models require an API key to be loaded)
        const isVisible = await settingsBrowserPage.isModelVisible(openaiModel);
        if (!isVisible) {
            test.skip();
            return;
        }

        // Select a model - use the first available OpenAI model
        await settingsBrowserPage.selectModel(openaiModel);

        // Fill API key
        const testApiKey = "sk-test-key-12345";
        await settingsBrowserPage.fillChatApiKey(testApiKey);

        // Save settings
        await settingsBrowserPage.clickSaveSettingsButton();

        // Wait for save to complete
        await settingsBrowserPage.waitForTimeout(1000);

        // Verify the selected model is highlighted
        const isModelSelected = await settingsBrowserPage.isModelSelected(openaiModel);
        expect(isModelSelected).toBe(true);

        // Verify API key value persists
        const savedApiKey = await settingsBrowserPage.getChatApiKeyValue();
        expect(savedApiKey).toBe(testApiKey);
    });

    test('@readwrite Verify selected model and API key persist after page reload', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        // Expand environment section and wait for models
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

        // Skip if models are not visible in the UI (models require an API key to be loaded)
        if (!(await settingsBrowserPage.isModelVisible(openaiModel))) {
            test.skip();
            return;
        }

        // Select model and fill API key - use first available OpenAI model
        const testApiKey = "sk-persist-test-key";
        await settingsBrowserPage.selectModel(openaiModel);
        await settingsBrowserPage.fillChatApiKey(testApiKey);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(1000);

        // Reload the page
        await settingsBrowserPage.reloadPage();

        // Expand environment section again
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

        // Verify model is still selected
        const isModelSelected = await settingsBrowserPage.isModelSelected(openaiModel);
        expect(isModelSelected).toBe(true);

        // Verify API key persists
        const savedApiKey = await settingsBrowserPage.getChatApiKeyValue();
        expect(savedApiKey).toBe(testApiKey);
    });

    test('@readwrite Verify model search filters models correctly', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

        // Skip if models are not visible in the UI (models require an API key to be loaded)
        if (!(await settingsBrowserPage.isModelVisible(openaiModel))) {
            test.skip();
            return;
        }

        // Search for "gpt" - should only show OpenAI models
        await settingsBrowserPage.searchModels("gpt");
        await settingsBrowserPage.waitForTimeout(300); // Wait for debounce

        // Verify GPT models are visible
        const isGptModelVisible = await settingsBrowserPage.isModelVisible(openaiModel);
        expect(isGptModelVisible).toBe(true);

        // Verify non-GPT models are not visible
        const isClaudeVisible = await settingsBrowserPage.isModelVisible(anthropicModel);
        expect(isClaudeVisible).toBe(false);
    });

    test('@readwrite Verify search shows only matching category', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

        // Skip if models are not visible in the UI (models require an API key to be loaded)
        if (!(await settingsBrowserPage.isModelVisible(anthropicModel))) {
            test.skip();
            return;
        }

        // Search for "claude" - should only show Anthropic category
        await settingsBrowserPage.searchModels("claude");
        await settingsBrowserPage.waitForTimeout(300);

        // Verify Anthropic models are visible
        const isClaudeVisible = await settingsBrowserPage.isModelVisible(anthropicModel);
        expect(isClaudeVisible).toBe(true);

        // Verify other provider models are not visible
        const isGptVisible = await settingsBrowserPage.isModelVisible(openaiModel);
        expect(isGptVisible).toBe(false);
    });

    test('@readwrite Verify empty search state displays correctly', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        const testApiKey = `sk-e2e-${getRandomString("key")}`;

        await page.route("**/api/chat/models", (route) => {
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ models: [openaiModel, "gpt-4o-mini"] }),
            });
        });

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectApiKeyModelSource();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();
        await settingsBrowserPage.addChatApiKey(testApiKey);
        await settingsBrowserPage.selectChatApiKey(testApiKey);

        // Search for non-existent model
        await settingsBrowserPage.searchModels("nonexistentmodel123");
        await settingsBrowserPage.waitForTimeout(300);

        // Verify "No models found" message is displayed
        const noModelsText = await settingsBrowserPage.getNoModelsFoundText();
        expect(noModelsText).toContain("No models found");
    });

    test('@readwrite Verify API key provider info tooltip displays supported providers', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectApiKeyModelSource();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();
        await settingsBrowserPage.hoverApiKeyProvidersInfo();

        const tooltipText = await settingsBrowserPage.getApiKeyProvidersTooltipText();
        expect(tooltipText).toContain("OpenAI");
        expect(tooltipText).toContain("Anthropic");
        expect(tooltipText).toContain("Gemini");
        expect(tooltipText).toContain("Groq");
        expect(tooltipText).toContain("xAI");
    });

    test('@readwrite Verify API key can be added viewed edited and deleted', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const apiKey = `sk-e2e-${getRandomString("key")}`;
        const editedApiKey = `sk-e2e-edited-${getRandomString("key")}`;

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectApiKeyModelSource();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();
        await settingsBrowserPage.addChatApiKey(apiKey);

        const maskedKeyText = await settingsBrowserPage.getMaskedChatApiKeyText(apiKey);
        expect(maskedKeyText).toContain(apiKey.slice(0, 6));
        expect(maskedKeyText).toContain(apiKey.slice(-4));

        await settingsBrowserPage.showChatApiKey(apiKey);
        expect(await settingsBrowserPage.getVisibleChatApiKeyText(apiKey)).toBe(apiKey);

        await settingsBrowserPage.editChatApiKey(apiKey, editedApiKey);
        expect(await settingsBrowserPage.getVisibleChatApiKeyText(editedApiKey)).toBe(editedApiKey);

        await settingsBrowserPage.deleteChatApiKey(editedApiKey);
        expect(await settingsBrowserPage.isChatApiKeyPresent(editedApiKey)).toBe(false);
    });

    test('@readwrite Verify local LLM controls and load tooltip display correctly', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectLocalLlmModelSource();

        expect(await settingsBrowserPage.isLocalLlmModelSourceSelected()).toBe(true);
        expect(await settingsBrowserPage.isOllamaProviderVisible()).toBe(true);
        expect(await settingsBrowserPage.isLmStudioProviderVisible()).toBe(true);

        await settingsBrowserPage.selectLmStudioProvider();

        expect(await settingsBrowserPage.isLmStudioProviderSelected()).toBe(true);
        expect(await settingsBrowserPage.getLocalLlmEndpointValue()).toBe("http://localhost:1234/v1");
        expect(await settingsBrowserPage.getLocalLlmLoadButtonText()).toBe("");

        await settingsBrowserPage.hoverLocalLlmLoadButton();
        expect(await settingsBrowserPage.isLocalLlmLoadTooltipVisible()).toBe(true);
    });

    test('@readwrite Verify model categories display correctly', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

        // Skip if models are not visible in the UI (models require an API key to be loaded)
        if (!(await settingsBrowserPage.isCategoryVisible("OpenAI"))) {
            test.skip();
            return;
        }

        // Verify all main categories are visible
        const isOpenAICategoryVisible = await settingsBrowserPage.isCategoryVisible("OpenAI");
        const isAnthropicCategoryVisible = await settingsBrowserPage.isCategoryVisible("Anthropic");
        const isGoogleCategoryVisible = await settingsBrowserPage.isCategoryVisible("Google");

        expect(isOpenAICategoryVisible).toBe(true);
        expect(isAnthropicCategoryVisible).toBe(true);
        expect(isGoogleCategoryVisible).toBe(true);

        // Ollama category only appears if Ollama server is running locally
        // Check if the most popular 2026 Ollama model is available (llama3.3 or deepseek-r1)
        const ollamaModel = "llama3.3";
        const isOllamaModelVisible = await settingsBrowserPage.isModelVisible(ollamaModel);
        if (isOllamaModelVisible) {
            const isOllamaCategoryVisible = await settingsBrowserPage.isCategoryVisible("Ollama");
            expect(isOllamaCategoryVisible).toBe(true);
        }

        // xAI category only appears if xAI/Grok models are available
        const isXaiModelVisible = await settingsBrowserPage.isModelVisible(xaiModel);
        if (isXaiModelVisible) {
            const isXaiCategoryVisible = await settingsBrowserPage.isCategoryVisible("xAI");
            expect(isXaiCategoryVisible).toBe(true);
        }
    });

    test('@readwrite Verify clearing search shows all models again', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

        // Skip if models are not visible in the UI (models require an API key to be loaded)
        if (!(await settingsBrowserPage.isModelVisible(openaiModel))) {
            test.skip();
            return;
        }

        // Search for specific model
        await settingsBrowserPage.searchModels("gpt");

        // Verify filtered state - Anthropic model should not be visible
        let isClaudeVisible = await settingsBrowserPage.isModelVisible(anthropicModel);
        expect(isClaudeVisible).toBe(false);

        // Clear search
        await settingsBrowserPage.clearModelSearch();
        await settingsBrowserPage.waitForTimeout(300);

        // Verify all models are visible again
        isClaudeVisible = await settingsBrowserPage.isModelVisible(anthropicModel);
        const isGptVisible = await settingsBrowserPage.isModelVisible(openaiModel);
        expect(isClaudeVisible).toBe(true);
        expect(isGptVisible).toBe(true);
    });

    test('@readwrite Verify different models from different categories can be selected', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

        // Skip if models are not visible in the UI (models require an API key to be loaded)
        if (!(await settingsBrowserPage.isModelVisible(openaiModel))) {
            test.skip();
            return;
        }

        // Select OpenAI model
        await settingsBrowserPage.selectModel(openaiModel);
        let isSelected = await settingsBrowserPage.isModelSelected(openaiModel);
        expect(isSelected).toBe(true);

        // Select Anthropic model
        await settingsBrowserPage.selectModel(anthropicModel);
        await settingsBrowserPage.waitForTimeout(500); // Wait for selection to register
        isSelected = await settingsBrowserPage.isModelSelected(anthropicModel);
        expect(isSelected).toBe(true);

        // Verify previous selection is no longer selected
        const isPreviousSelected = await settingsBrowserPage.isModelSelected(openaiModel);
        expect(isPreviousSelected).toBe(false);
    });

    test('@readwrite Verify model/API key mismatch shows inline error in chat', async () => {
        // Create a graph first
        const graphName = getRandomString("chat");
        await apiCall.addGraph(graphName);
        await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');

        try {
            // Navigate to settings and configure with mismatched model and API key
            const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
            await browser.setPageToFullScreen();

            await settingsBrowserPage.expandChatSection();
            await settingsBrowserPage.waitForChatApiKeyInputEnabled();

            // Skip if models are not visible in the UI (models require an API key to be loaded)
            if (!(await settingsBrowserPage.isModelVisible(anthropicModel))) {
                test.skip();
                return;
            }

            // Select Anthropic model
            await settingsBrowserPage.selectModel(anthropicModel);

            // Use OpenAI API key (mismatch - starts with sk- but not sk-ant-)
            const testApiKey = process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY || "sk-test-openai-key-placeholder";
            await settingsBrowserPage.fillChatApiKey(testApiKey);

            // Save the settings
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(1000);

            // Navigate to graph page using header component
            const headerComponent = await browser.createNewPage(HeaderComponent, urls.settingsUrl);
            await headerComponent.clickOnGraphsButton();

            // Create chat component and select the graph
            const chatComponent = await browser.createNewPage(ChatComponent, urls.graphUrl);
            await chatComponent.selectGraphByName(graphName);

            // Open chat panel
            await chatComponent.openChat();
            await chatComponent.waitForChatPanel();

            // Verify chat input is visible
            expect(await chatComponent.isChatInputVisible()).toBe(true);

            // Send a question to trigger the model/API key mismatch error
            await chatComponent.fillChatInput("Who is Alice?");
            await chatComponent.clickChatSendButton();

            // Verify user message was sent (appears in chat)
            await chatComponent.waitForChatUserMessage();

            // Verify error message is displayed inline in chat due to model/API key mismatch
            // The error message should be: "Model/API key mismatch: You selected a Anthropic model but provided a OpenAI API key..."
            const hasErrorMessage = await chatComponent.waitForAssistantResponse("Error");
            expect(hasErrorMessage).toBe(true);
        } finally {
            // Clean up - always remove graph even if test fails
            await apiCall.removeGraph(graphName);
        }
    });

    test('@readwrite Verify xAI API key mismatch shows inline error in chat', async () => {
        // Create a graph first
        const graphName = getRandomString("chat");
        await apiCall.addGraph(graphName);
        await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');

        try {
            // Navigate to settings and configure with mismatched model and API key
            const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
            await browser.setPageToFullScreen();

            await settingsBrowserPage.expandChatSection();
            await settingsBrowserPage.waitForChatApiKeyInputEnabled();

            // Skip if xAI model is not available
            const isXaiModelVisible = await settingsBrowserPage.isModelVisible(xaiModel);
            if (!isXaiModelVisible) {
                test.skip();
                return;
            }

            // Select xAI model
            await settingsBrowserPage.selectModel(xaiModel);

            // Use OpenAI API key (mismatch with xAI model)
            const testApiKey = process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY || "sk-test-openai-key-placeholder";
            await settingsBrowserPage.fillChatApiKey(testApiKey);

            // Save the settings
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(1000);

            // Navigate to graph page using header component
            const headerComponent = await browser.createNewPage(HeaderComponent, urls.settingsUrl);
            await headerComponent.clickOnGraphsButton();

            // Create chat component and select the graph
            const chatComponent = await browser.createNewPage(ChatComponent, urls.graphUrl);
            await chatComponent.selectGraphByName(graphName);

            // Open chat panel
            await chatComponent.openChat();
            await chatComponent.waitForChatPanel();

            // Send a question to trigger the model/API key mismatch error
            await chatComponent.fillChatInput("Who is Alice?");
            await chatComponent.clickChatSendButton();

            // Verify user message was sent
            await chatComponent.waitForChatUserMessage();

            // Verify error message is displayed inline in chat due to model/API key mismatch
            const hasErrorMessage = await chatComponent.waitForAssistantResponse("Error");
            expect(hasErrorMessage).toBe(true);
        } finally {
            // Clean up - always remove graph even if test fails
            await apiCall.removeGraph(graphName);
        }
    });

    // ===== Max Saved Messages =====

    test('@readwrite Verify max saved messages can be set and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForMaxSavedMessagesInput();

        await settingsBrowserPage.fillMaxSavedMessages(7);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForMaxSavedMessagesInput();

        const savedValue = await settingsBrowserPage.getMaxSavedMessagesValue();
        expect(savedValue).toBe('7');
    });

    test('@readwrite Verify max saved messages rejects values below 5', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForMaxSavedMessagesInput();

        // Store the original value before entering invalid input
        const originalValue = await settingsBrowserPage.getMaxSavedMessagesValue();

        await settingsBrowserPage.fillMaxSavedMessages(3);
        await settingsBrowserPage.clickSaveSettingsButtonWithoutWait();
        await settingsBrowserPage.waitForTimeout(1000);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForMaxSavedMessagesInput();

        const savedValue = await settingsBrowserPage.getMaxSavedMessagesValue();
        expect(savedValue).toBe(originalValue);
    });

    test('@readwrite Verify max saved messages rejects values above 10', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForMaxSavedMessagesInput();

        // Store the original value before entering invalid input
        const originalValue = await settingsBrowserPage.getMaxSavedMessagesValue();

        await settingsBrowserPage.fillMaxSavedMessages(15);
        await settingsBrowserPage.clickSaveSettingsButtonWithoutWait();
        await settingsBrowserPage.waitForTimeout(1000);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForMaxSavedMessagesInput();

        const savedValue = await settingsBrowserPage.getMaxSavedMessagesValue();
        expect(savedValue).toBe(originalValue);
    });

    // ===== Graph Info Section =====

    test('@readwrite Verify refresh interval slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandGraphInfoSection();

        await settingsBrowserPage.setRefreshIntervalSlider(30);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandGraphInfoSection();

        const value = await settingsBrowserPage.getRefreshIntervalValue();
        expect(value).toBe(30);
    });

    test('@readwrite Verify max items for search slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandGraphInfoSection();

        await settingsBrowserPage.setMaxItemsForSearchSlider(25);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandGraphInfoSection();

        const value = await settingsBrowserPage.getMaxItemsForSearchValue();
        expect(value).toBe(25);
    });

    // ===== Table View Settings =====

    test('@readwrite Verify column width slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandUserExperienceSection();

        await settingsBrowserPage.setColumnWidthSlider(50);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandUserExperienceSection();

        const value = await settingsBrowserPage.getColumnWidthValue();
        expect(value).toBe(50);
    });

    test('@readwrite Verify row height slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandUserExperienceSection();

        await settingsBrowserPage.setRowHeightSlider(60);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandUserExperienceSection();

        const value = await settingsBrowserPage.getRowHeightValue();
        expect(value).toBe(60);
    });

    test('@readwrite Verify row height expand multiplier slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandUserExperienceSection();

        await settingsBrowserPage.setRowHeightExpandMultipleSlider(4);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandUserExperienceSection();

        const value = await settingsBrowserPage.getRowHeightExpandMultipleValue();
        expect(value).toBe(4);
    });

    // ===== User Experience - Captions Keys =====

    test('@readwrite Verify caption key can be added and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandUserExperienceSection();

        // Use a unique key name to avoid collisions with existing keys
        const captionKey = `testkey_${Date.now()}`;
        await settingsBrowserPage.addCaptionKey(captionKey);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandUserExperienceSection();

        const keys = await settingsBrowserPage.getCaptionKeys();
        expect(keys).toContain(captionKey);

        // Cleanup: remove the test key
        await settingsBrowserPage.removeCaptionKey(captionKey);
        await settingsBrowserPage.clickSaveSettingsButton();
    });

    test('@readwrite Verify caption key can be removed', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandUserExperienceSection();

        // Add a unique key to remove
        const captionKey = `removekey_${Date.now()}`;
        await settingsBrowserPage.addCaptionKey(captionKey);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandUserExperienceSection();

        // Remove the key
        await settingsBrowserPage.removeCaptionKey(captionKey);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandUserExperienceSection();

        const keys = await settingsBrowserPage.getCaptionKeys();
        expect(keys).not.toContain(captionKey);
    });

    // ===== User Experience - Show Property Key Prefix =====

    test('@readwrite Verify show property key prefix toggle can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandUserExperienceSection();

        const initialState = await settingsBrowserPage.getShowPropertyKeyPrefixState();
        try {
            await settingsBrowserPage.clickShowPropertyKeyPrefixSwitch();
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(500);

            await settingsBrowserPage.reloadPage();
            await settingsBrowserPage.waitForTimeout(1000);
            await settingsBrowserPage.expandUserExperienceSection();

            const newState = await settingsBrowserPage.getShowPropertyKeyPrefixState();
            expect(newState).toBe(!initialState);
        } finally {
            try {
                const currentState = await settingsBrowserPage.getShowPropertyKeyPrefixState();
                if (currentState !== initialState) {
                    await settingsBrowserPage.clickShowPropertyKeyPrefixSwitch();
                    await settingsBrowserPage.clickSaveSettingsButton();
                }
            } catch {
                // Page was closed due to timeout - cleanup not possible
            }
        }
    });

    // ===== Local LLM Immediate Persistence =====

    test('@readwrite Verify local LLM model source persists after Save', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectLocalLlmModelSource();
        expect(await settingsBrowserPage.isLocalLlmModelSourceSelected()).toBe(true);

        // Click Save before reloading
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);
        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(500);
        await settingsBrowserPage.expandChatSection();

        expect(await settingsBrowserPage.isLocalLlmModelSourceSelected()).toBe(true);
    });

    test('@readwrite Verify local LLM provider change persists after Save', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectLocalLlmModelSource();
        await settingsBrowserPage.selectLmStudioProvider();
        expect(await settingsBrowserPage.isLmStudioProviderSelected()).toBe(true);
        expect(await settingsBrowserPage.getLocalLlmEndpointValue()).toBe('http://localhost:1234/v1');

        // Click Save before reloading
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);
        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(500);
        await settingsBrowserPage.expandChatSection();

        // LM Studio provider and its default endpoint should persist after Save
        expect(await settingsBrowserPage.isLocalLlmModelSourceSelected()).toBe(true);
        expect(await settingsBrowserPage.isLmStudioProviderSelected()).toBe(true);
        expect(await settingsBrowserPage.getLocalLlmEndpointValue()).toBe('http://localhost:1234/v1');
    });

    test('@readwrite Verify local LLM endpoint change persists after Save', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectLocalLlmModelSource();

        const customEndpoint = 'http://localhost:8888/v1';
        await settingsBrowserPage.fillLocalLlmEndpoint(customEndpoint);

        // Click Save before reloading
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(500);
        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(500);
        await settingsBrowserPage.expandChatSection();

        // Custom endpoint should persist after Save
        expect(await settingsBrowserPage.getLocalLlmEndpointValue()).toBe(customEndpoint);
    });

});
