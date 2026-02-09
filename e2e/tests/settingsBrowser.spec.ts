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

    test.beforeAll(async () => {
        // Fetch available models from each provider before running tests
        const tempBrowser = new BrowserWrapper();
        const tempApiCall = new ApiCalls();

        try {
            // Get models from each provider
            const openaiModels = await tempApiCall.getModelsByProvider('openai');
            const anthropicModels = await tempApiCall.getModelsByProvider('anthropic');
            const geminiModels = await tempApiCall.getModelsByProvider('gemini');

            // Store first model from each provider
            openaiModel = openaiModels.models[0] || 'gpt-4o-mini';
            anthropicModel = anthropicModels.models[0] || 'claude-3-5-sonnet';
            geminiModel = geminiModels.models[0] || 'gemini-2.0-flash-exp';

            // console.log('Test models:', { openaiModel, anthropicModel, geminiModel });
        } catch (error) {
            // Fallback to default models if API call fails
            console.warn('Failed to fetch models, using defaults:', error);
            openaiModel = 'gpt-4o-mini';
            anthropicModel = 'claude-3-5-sonnet';
            geminiModel = 'gemini-2.0-flash-exp';
        } finally {
            await tempBrowser.closeBrowser();
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
        await settingsBrowserPage.expandEnvironmentSection();

        // Wait for models to load
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

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
        await settingsBrowserPage.expandEnvironmentSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

        // Select model and fill API key - use first available OpenAI model
        const testApiKey = "sk-persist-test-key";
        await settingsBrowserPage.selectModel(openaiModel);
        await settingsBrowserPage.fillChatApiKey(testApiKey);
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForTimeout(1000);

        // Reload the page
        await settingsBrowserPage.reloadPage();

        // Expand environment section again
        await settingsBrowserPage.expandEnvironmentSection();
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

        await settingsBrowserPage.expandEnvironmentSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

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

        await settingsBrowserPage.expandEnvironmentSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

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

        await settingsBrowserPage.expandEnvironmentSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

        // Search for non-existent model
        await settingsBrowserPage.searchModels("nonexistentmodel123");
        await settingsBrowserPage.waitForTimeout(300);

        // Verify "No models found" message is displayed
        const noModelsText = await settingsBrowserPage.getNoModelsFoundText();
        expect(noModelsText).toContain("No models found");
    });

    test('@readwrite Verify model categories display correctly', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandEnvironmentSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

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
    });

    test('@readwrite Verify clearing search shows all models again', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandEnvironmentSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

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

        await settingsBrowserPage.expandEnvironmentSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

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

    test('@readwrite Verify model/API key mismatch shows error toast in chat', async () => {
        // Create a graph first
        const graphName = getRandomString("chat");
        await apiCall.addGraph(graphName);
        await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');

        // Navigate to settings and configure with mismatched model and API key
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await browser.setPageToFullScreen();

        await settingsBrowserPage.expandEnvironmentSection();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();

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

        // Verify error toast is displayed due to model/API key mismatch
        // The error message should be: "Model/API key mismatch: You selected a Anthropic model but provided a OpenAI API key..."
        const isErrorToastVisible = await chatComponent.getNotificationErrorToast();
        expect(isErrorToastVisible).toBe(true);

        // Clean up
        await apiCall.removeGraph(graphName);
    });
});
