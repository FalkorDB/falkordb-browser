import { expect, test, type Page } from "@playwright/test";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import SettingsBrowserPage from "../logic/POM/settingsBrowserPage";
import ApiCalls from "../logic/api/apiCalls";
import ChatComponent from "../logic/POM/chatComponent";
import HeaderComponent from "../logic/POM/headerComponent";
import { getRandomString } from "../infra/utils";

async function delayNextKeyEncryption(page: Page) {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    let markStarted!: () => void;
    const started = new Promise<void>((resolve) => { markStarted = resolve; });
    let delayed = false;
    await page.route("**/api/encrypt", async (route) => {
        if (delayed || route.request().postDataJSON().action !== "encrypt") {
            await route.continue();
            return;
        }
        delayed = true;
        const response = await route.fetch();
        markStarted();
        await gate;
        await route.fulfill({ response });
    });
    return { release, started };
}

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

    for (const wasVisible of [false, true]) {
        test(`@readwrite discarding settings restores a ${wasVisible ? "shown" : "hidden"} key and closes its edit`, async () => {
            const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
            const page = await browser.getPage();
            await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
            const apiKey = `sk-e2e-discard-${getRandomString("key")}`;
            await settings.expandChatSection();
            await settings.selectApiKeyModelSource();
            await settings.waitForChatApiKeyInputEnabled();
            await settings.addChatApiKey(apiKey);
            if (wasVisible) await settings.showChatApiKey(apiKey);

            await page.getByTestId("queryExecutionSectionHeader").click();
            const limit = page.locator("#limitInput");
            const savedLimit = await limit.inputValue();
            await limit.fill(savedLimit === "123" ? "124" : "123");
            await expect(page.getByTestId("cancelSettingsButton")).toBeVisible();
            await settings.startChatApiKeyEdit(apiKey, `${apiKey}-discarded`);
            await page.getByTestId("cancelSettingsButton").click();

            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
            expect(await settings.getChatApiKeyVisibilityLabel(apiKey)).toBe(wasVisible ? "Hide" : "Show");
            await expect(limit).toHaveValue(savedLimit);
            await settings.deleteChatApiKey(apiKey);
        });
    }

    for (const abandon of ["discard", "unmount"] as const) {
        test(`@readwrite a pending API key save cannot overwrite a newer edit after ${abandon}`, async () => {
            const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
            const page = await browser.getPage();
            await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
            const apiKey = `sk-e2e-pending-${getRandomString("key")}`;
            const staleKey = `${apiKey}-stale`;
            const newerKey = `${apiKey}-newer`;
            await settings.expandChatSection();
            await settings.selectApiKeyModelSource();
            await settings.waitForChatApiKeyInputEnabled();
            await settings.addChatApiKey(apiKey);

            const { release: releaseEncryption, started } = await delayNextKeyEncryption(page);

            try {
                if (abandon === "discard") {
                    await page.getByTestId("queryExecutionSectionHeader").click();
                    const limit = page.locator("#limitInput");
                    await limit.fill((await limit.inputValue()) === "123" ? "124" : "123");
                    await expect(page.getByTestId("cancelSettingsButton")).toBeVisible();
                }
                await settings.startChatApiKeyEdit(apiKey, staleKey);
                await page.getByTestId("saveEditedChatApiKeyButton").click();
                await started;
                if (abandon === "discard") {
                    await page.getByTestId("cancelSettingsButton").click();
                } else {
                    await page.getByTestId("settingsTabTokens").click();
                    await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
                    await page.getByTestId("settingsTabBrowser").click();
                    await settings.expandChatSection();
                }
                await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
                await settings.editChatApiKey(apiKey, newerKey);

                const staleResponse = page.waitForResponse((response) =>
                    response.url().endsWith("/api/encrypt")
                    && response.request().postData()?.includes(staleKey) === true);
                releaseEncryption();
                await (await staleResponse).finished();
                // Allow the resumed save to reach its commit guard before asserting.
                await page.waitForTimeout(500);
                await expect(page.getByTestId("chatApiKeyValue").filter({
                    hasText: `sk-e2e••••••••${newerKey.slice(-4)}`,
                })).toBeVisible();
                expect(await settings.getChatApiKeyVisibilityLabel(newerKey)).toBe("Show");
                await page.reload({ waitUntil: "networkidle" });
                await settings.expandChatSection();
                expect(await settings.getMaskedChatApiKeyText(newerKey)).toContain(newerKey.slice(-4));
                await settings.deleteChatApiKey(newerKey);
            } finally {
                releaseEncryption();
                await page.unrouteAll({ behavior: "wait" });
            }
        });
    }

    for (const mutation of ["delete", "add"] as const) {
        test(`@readwrite ${mutation} of another key is preserved when a pending edit finishes`, async () => {
            const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
            const page = await browser.getPage();
            await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
            const apiKey = `sk-e2e-mutation-${getRandomString("key")}`;
            const otherKey = `${apiKey}-other`;
            const staleKey = `${apiKey}-stale`;
            await settings.expandChatSection();
            await settings.selectApiKeyModelSource();
            await settings.waitForChatApiKeyInputEnabled();
            await settings.addChatApiKey(apiKey);
            if (mutation === "delete") {
                await settings.addChatApiKey(otherKey);
                await settings.selectChatApiKey(apiKey);
            }
            const { release, started } = await delayNextKeyEncryption(page);
            try {
                await settings.startChatApiKeyEdit(apiKey, staleKey);
                await page.getByTestId("saveEditedChatApiKeyButton").click();
                await started;
                if (mutation === "delete") await settings.deleteChatApiKey(otherKey);
                else await settings.addChatApiKey(otherKey);

                const staleResponse = page.waitForResponse((response) =>
                    response.url().endsWith("/api/encrypt")
                    && response.request().postData()?.includes(staleKey) === true);
                release();
                await (await staleResponse).finished();
                await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
                // Reload verifies the full encrypted list, not just optimistic UI state.
                await page.reload({ waitUntil: "networkidle" });
                await settings.expandChatSection();
                const retainedKey = mutation === "delete" ? staleKey : apiKey;
                await expect.poll(() => settings.isChatApiKeyPresent(retainedKey)).toBe(true);
                expect(await settings.isChatApiKeyPresent(otherKey)).toBe(mutation === "add");
                expect(await settings.getMaskedChatApiKeyText(retainedKey)).toContain(retainedKey.slice(-4));
                if (mutation === "add") await settings.deleteChatApiKey(otherKey);
                await settings.deleteChatApiKey(retainedKey);
            } finally {
                release();
                await page.unrouteAll({ behavior: "wait" });
            }
        });
    }

    for (const mutation of ["add", "delete"] as const) {
        test(`@readwrite selecting a key while ${mutation} encrypts preserves the newer selection`, async () => {
            const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
            const page = await browser.getPage();
            const suffix = getRandomString("selection");
            const firstKey = `sk-e2e-${suffix}-first`;
            const secondKey = `sk-e2e-${suffix}-second`;
            const thirdKey = `sk-e2e-${suffix}-third`;
            const firstModel = "gpt-4o-mini";
            let loadSelectionModel = false;
            await page.route("**/api/chat/models**", route => route.fulfill({
                json: { models: loadSelectionModel && route.request().postDataJSON().key === firstKey ? [firstModel] : [] },
            }));
            await settings.expandChatSection();
            await settings.selectApiKeyModelSource();
            await settings.waitForChatApiKeyInputEnabled();
            await settings.addChatApiKey(firstKey);
            await settings.addChatApiKey(secondKey);
            if (mutation === "delete") {
                await settings.addChatApiKey(thirdKey);
                await settings.selectChatApiKey(secondKey);
            }
            const firstCard = page.getByTestId("chatApiKeyCard").filter({
                has: page.getByTestId("chatApiKeyValue").filter({ hasText: firstKey.slice(-4) }),
            });
            const firstId = await firstCard.getAttribute("data-api-key-id");
            if (!firstId) throw new Error("Selection test key is missing its stable ID");
            const selectedId = () => page.evaluate(() => {
                const key = Object.keys(localStorage).find(name => name.endsWith(":selectedChatApiKeyId"));
                return key ? localStorage.getItem(key) : null;
            });
            const encryption = await delayNextKeyEncryption(page);
            try {
                if (mutation === "add") {
                    await settings.fillChatApiKey(thirdKey);
                    await page.getByTestId("addChatApiKeyButton").click();
                } else {
                    const secondCard = page.getByTestId("chatApiKeyCard").filter({
                        has: page.getByTestId("chatApiKeyValue").filter({ hasText: secondKey.slice(-4) }),
                    });
                    await secondCard.getByTestId("deleteChatApiKeyButton").click();
                    await page.getByTestId("confirmDeleteChatApiKeyButton").click();
                }
                await encryption.started;
                if (mutation === "delete") {
                    await page.getByTestId("deleteChatApiKeyDialog").getByRole("button", { name: "Close", exact: true }).click();
                    await expect(page.getByTestId("deleteChatApiKeyDialog")).toBeHidden();
                }
                await expect(firstCard.getByTestId("selectChatApiKeyButton")).toBeEnabled();
                loadSelectionModel = true;
                await firstCard.getByTestId("selectChatApiKeyButton").click();
                await expect.poll(selectedId).toBe(firstId);
                const selectedModel = page.getByTestId(`selectModel${firstModel}`);
                await expect(selectedModel).toHaveAttribute("data-selected", "true");
                await expect.poll(() => page.evaluate(() => localStorage.getItem("model"))).toBe(firstModel);
                encryption.release();
                if (mutation === "delete") await expect.poll(() => settings.isChatApiKeyPresent(secondKey)).toBe(false);
                else await expect.poll(() => settings.isChatApiKeyPresent(thirdKey)).toBe(true);
                await expect.poll(selectedId).toBe(firstId);
                await expect(selectedModel).toHaveAttribute("data-selected", "true");
                expect(await page.evaluate(() => localStorage.getItem("model"))).toBe(firstModel);
                await page.reload({ waitUntil: "networkidle" });
                await settings.expandChatSection();
                await expect(firstCard).toBeVisible({ timeout: 15000 });
                await expect.poll(selectedId).toBe(firstId);
                await expect(selectedModel).toHaveAttribute("data-selected", "true", { timeout: 15000 });
                expect(await page.evaluate(() => localStorage.getItem("model"))).toBe(firstModel);
                expect(await settings.isChatApiKeyPresent(secondKey)).toBe(mutation === "add");
                expect(await settings.isChatApiKeyPresent(thirdKey)).toBe(true);
                await settings.deleteChatApiKey(thirdKey);
                if (mutation === "add") await settings.deleteChatApiKey(secondKey);
                await settings.deleteChatApiKey(firstKey);
            } finally {
                encryption.release();
                await page.unrouteAll({ behavior: "wait" });
            }
        });
    }

    test('@readwrite deleting the selected key does not select another key or reload its models', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        const suffix = getRandomString("clear-selection");
        const firstKey = `sk-e2e-${suffix}-first`;
        const secondKey = `sk-e2e-${suffix}-second`;
        const model = "gpt-4o-mini";
        const modelLoads: string[] = [];
        await page.route("**/api/chat/models**", route => {
            modelLoads.push(route.request().postDataJSON().key);
            return route.fulfill({ json: { models: [model] } });
        });
        await settings.expandChatSection();
        await settings.selectApiKeyModelSource();
        await settings.waitForChatApiKeyInputEnabled();
        await settings.addChatApiKey(firstKey);
        await settings.addChatApiKey(secondKey);
        await expect(page.getByTestId(`selectModel${model}`)).toHaveAttribute("data-selected", "true");
        modelLoads.length = 0;
        await settings.deleteChatApiKey(secondKey);
        await expect(page.getByTestId("chatApiKeyCard")).toHaveCount(1);
        await expect(page.getByTestId("selectChatApiKeyButton")).toHaveAttribute("aria-pressed", "false");
        await expect(page.getByTestId(`selectModel${model}`)).toHaveCount(0);
        expect(await page.evaluate(() => localStorage.getItem("model"))).toBe("");
        expect(await page.evaluate(() => Object.keys(localStorage).some(key => key.endsWith(":selectedChatApiKeyId")))).toBe(false);
        expect(modelLoads).toEqual([]);
        await settings.deleteChatApiKey(firstKey);
    });

    test('@readwrite a pending deletion does not close an edit started on another key', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
        const apiKey = `sk-e2e-delete-edit-${getRandomString("key")}-first`;
        const otherKey = `${apiKey}-other`;
        const editedKey = `${otherKey}-edited`;
        await settings.expandChatSection();
        await settings.selectApiKeyModelSource();
        await settings.waitForChatApiKeyInputEnabled();
        await settings.addChatApiKey(apiKey);
        await settings.addChatApiKey(otherKey);
        await settings.startChatApiKeyEdit(apiKey, `${apiKey}-abandoned`);
        const deletingCard = page.getByTestId("chatApiKeyCard").filter({
            has: page.getByTestId("chatApiKeyEditInput"),
        });
        const encryption = await delayNextKeyEncryption(page);
        try {
            await deletingCard.getByTestId("deleteChatApiKeyButton").click();
            await page.getByTestId("confirmDeleteChatApiKeyButton").click();
            await encryption.started;
            await page.getByTestId("deleteChatApiKeyDialog").getByRole("button", { name: "Close", exact: true }).click();
            await expect(page.getByTestId("deleteChatApiKeyDialog")).toBeHidden();
            await settings.startChatApiKeyEdit(otherKey, editedKey);
            encryption.release();
            await expect.poll(() => settings.isChatApiKeyPresent(apiKey)).toBe(false);
            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveValue(editedKey);
            await page.getByTestId("saveEditedChatApiKeyButton").click();
            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
            expect(await settings.getChatApiKeyVisibilityLabel(editedKey)).toBe("Show");
            await page.reload({ waitUntil: "networkidle" });
            await settings.expandChatSection();
            await expect.poll(() => settings.isChatApiKeyPresent(editedKey)).toBe(true);
            expect(await settings.isChatApiKeyPresent(apiKey)).toBe(false);
            await settings.deleteChatApiKey(editedKey);
        } finally {
            encryption.release();
            await page.unrouteAll({ behavior: "wait" });
        }
    });

    test('@readwrite typing during a pending API key save preserves the newer draft', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
        const apiKey = `sk-e2e-draft-${getRandomString("key")}-original`;
        const staleKey = `${apiKey}-stale`;
        const newerKey = `${apiKey}-newer`;
        await settings.expandChatSection();
        await settings.selectApiKeyModelSource();
        await settings.waitForChatApiKeyInputEnabled();
        await settings.addChatApiKey(apiKey);
        const encryption = await delayNextKeyEncryption(page);
        try {
            await settings.startChatApiKeyEdit(apiKey, staleKey);
            await page.getByTestId("saveEditedChatApiKeyButton").click();
            await encryption.started;
            await page.getByTestId("chatApiKeyEditInput").fill(newerKey);
            const staleResponse = page.waitForResponse(response =>
                response.url().endsWith("/api/encrypt")
                && response.request().postData()?.includes(staleKey) === true);
            encryption.release();
            await (await staleResponse).finished();
            // Let the resumed save reach its commit guard before checking the draft.
            await page.waitForTimeout(500);
            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveValue(newerKey);
            await page.getByTestId("saveEditedChatApiKeyButton").click();
            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
            expect(await settings.getChatApiKeyVisibilityLabel(newerKey)).toBe("Show");
            await page.reload({ waitUntil: "networkidle" });
            await settings.expandChatSection();
            await expect.poll(() => settings.isChatApiKeyPresent(newerKey)).toBe(true);
            expect(await settings.isChatApiKeyPresent(staleKey)).toBe(false);
            await settings.deleteChatApiKey(newerKey);
        } finally {
            encryption.release();
            await page.unrouteAll({ behavior: "wait" });
        }
    });

    for (const successor of ["cancel", "fail", "save"] as const) {
        test(`@readwrite a pending API key addition survives a later edit that will ${successor}`, async () => {
            const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
            const page = await browser.getPage();
            await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
            const apiKey = `sk-e2e-rebase-${getRandomString("key")}`;
            const addedKey = `${apiKey}-added`;
            const editedKey = `${apiKey}-edited`;
            await settings.expandChatSection();
            await settings.selectApiKeyModelSource();
            await settings.waitForChatApiKeyInputEnabled();
            await settings.addChatApiKey(apiKey);
            const addition = await delayNextKeyEncryption(page);
            let edit: Awaited<ReturnType<typeof delayNextKeyEncryption>> | undefined;
            try {
                await settings.fillChatApiKey(addedKey);
                await page.getByTestId("addChatApiKeyButton").click();
                await addition.started;
                await settings.startChatApiKeyEdit(apiKey, editedKey);
                if (successor === "fail") {
                    await page.route("**/api/encrypt", route => route.fulfill({ status: 503, json: { message: "Simulated encryption failure" } }), { times: 1 });
                } else if (successor === "cancel") {
                    edit = await delayNextKeyEncryption(page);
                }
                await page.getByTestId("saveEditedChatApiKeyButton").click();
                if (successor === "cancel") {
                    await edit!.started;
                    await page.getByTestId("editChatApiKeyButton").filter({ hasText: "Cancel edit" }).click();
                    edit!.release();
                } else if (successor === "fail") {
                    await expect(page.getByText("Could not encrypt API keys. Please try again.", { exact: true })).toBeVisible();
                } else {
                    await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
                }
                addition.release();
                await expect.poll(() => settings.isChatApiKeyPresent(addedKey)).toBe(true);
                await page.reload({ waitUntil: "networkidle" });
                await settings.expandChatSection();
                const retainedKey = successor === "save" ? editedKey : apiKey;
                await expect.poll(() => settings.isChatApiKeyPresent(retainedKey)).toBe(true);
                expect(await settings.isChatApiKeyPresent(addedKey)).toBe(true);
                await settings.deleteChatApiKey(addedKey);
                await settings.deleteChatApiKey(retainedKey);
            } finally {
                addition.release();
                edit?.release();
                await page.unrouteAll({ behavior: "wait" });
            }
        });
    }

    test('@readwrite API key editing remains available while its models are loading', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        const apiKey = `sk-e2e-loading-${getRandomString("key")}`;
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        await page.route("**/api/chat/models**", async route => {
            await gate;
            await route.fulfill({ json: { models: [] } });
        });
        try {
            await settings.expandChatSection();
            await settings.selectApiKeyModelSource();
            await settings.waitForChatApiKeyInputEnabled();
            await settings.addChatApiKey(apiKey);
            await expect(page.getByTestId("chatApiKeyCard").filter({
                has: page.getByTestId("chatApiKeyValue").filter({ hasText: apiKey.slice(-4) }),
            }).getByTestId("selectChatApiKeyButton")).toBeDisabled();
            expect(await settings.startChatApiKeyEdit(apiKey, `${apiKey}-edited`)).toBe("text");
            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveValue(`${apiKey}-edited`);
            await page.getByTestId("editChatApiKeyButton").filter({ hasText: "Cancel edit" }).click();
        } finally {
            release();
            await page.unrouteAll({ behavior: "wait" });
        }
        await settings.deleteChatApiKey(apiKey);
    });

    test('@readwrite masked key collisions preserve the identity of the edited and deleted card', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
        const suffix = getRandomString("collision");
        const firstKey = `sk-e2e-first-${suffix}-same`;
        const secondKey = `sk-e2e-second-${suffix}-same`;
        const editedKey = `sk-e2e-edited-${suffix}-same`;
        await settings.expandChatSection();
        await settings.selectApiKeyModelSource();
        await settings.waitForChatApiKeyInputEnabled();
        const originalCount = await page.getByTestId("chatApiKeyCard").count();
        await settings.addChatApiKey(firstKey);
        await settings.addChatApiKey(secondKey);
        expect(await settings.getMaskedChatApiKeyText(firstKey))
            .toBe(await settings.getMaskedChatApiKeyText(secondKey));

        await settings.editChatApiKey(secondKey, editedKey);
        await settings.showChatApiKey(firstKey);
        expect(await settings.getVisibleChatApiKeyText(firstKey)).toBe(firstKey);
        await settings.showChatApiKey(editedKey);
        expect(await settings.getVisibleChatApiKeyText(editedKey)).toBe(editedKey);
        expect(await settings.isChatApiKeyPresent(secondKey)).toBe(false);
        await page.reload({ waitUntil: "networkidle" });
        await settings.expandChatSection();
        await settings.deleteChatApiKey(editedKey);
        await expect(page.getByTestId("chatApiKeyCard")).toHaveCount(originalCount + 1);
        await settings.showChatApiKey(firstKey);
        expect(await settings.getVisibleChatApiKeyText(firstKey)).toBe(firstKey);
        await settings.deleteChatApiKey(firstKey);
    });

    test('@readwrite Verify API key can be added viewed edited and deleted', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
        const apiKey = `sk-e2e-${getRandomString("key")}-old1`;
        const editedApiKey = `sk-e2e-edited-${getRandomString("key")}-new2`;

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectApiKeyModelSource();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();
        await settingsBrowserPage.addChatApiKey(apiKey);

        const maskedKeyText = await settingsBrowserPage.getMaskedChatApiKeyText(apiKey);
        expect(maskedKeyText).toContain(apiKey.slice(0, 6));
        expect(maskedKeyText).toContain(apiKey.slice(-4));

        expect(await settingsBrowserPage.editChatApiKey(apiKey, editedApiKey)).toBe("text");
        expect(await settingsBrowserPage.isChatApiKeyPresent(apiKey)).toBe(false);
        expect(await settingsBrowserPage.editChatApiKey(editedApiKey, editedApiKey)).toBe("text");
        expect(await settingsBrowserPage.isChatApiKeyPresent(editedApiKey)).toBe(true);
        expect(await settingsBrowserPage.getChatApiKeyVisibilityLabel(editedApiKey)).toBe("Show");
        const editedMaskedKeyText = await settingsBrowserPage.getMaskedChatApiKeyText(editedApiKey);
        expect(editedMaskedKeyText).toContain(editedApiKey.slice(0, 6));
        expect(editedMaskedKeyText).toContain(editedApiKey.slice(-4));

        // Cancelling an edit returns a hidden key to hidden as well.
        expect(await settingsBrowserPage.cancelChatApiKeyEdit(editedApiKey)).toBe("text");
        expect(await settingsBrowserPage.getChatApiKeyVisibilityLabel(editedApiKey)).toBe("Show");

        await settingsBrowserPage.showChatApiKey(editedApiKey);
        expect(await settingsBrowserPage.getVisibleChatApiKeyText(editedApiKey)).toBe(editedApiKey);
        const secondEditedApiKey = `sk-e2e-edited-again-${getRandomString("key")}`;
        expect(await settingsBrowserPage.editChatApiKey(editedApiKey, secondEditedApiKey)).toBe("text");
        expect(await settingsBrowserPage.getChatApiKeyVisibilityLabel(secondEditedApiKey)).toBe("Hide");
        expect(await settingsBrowserPage.getVisibleChatApiKeyText(secondEditedApiKey)).toBe(secondEditedApiKey);

        // ...and a shown key stays shown after a cancelled edit.
        expect(await settingsBrowserPage.cancelChatApiKeyEdit(secondEditedApiKey)).toBe("text");
        expect(await settingsBrowserPage.getChatApiKeyVisibilityLabel(secondEditedApiKey)).toBe("Hide");

        await settingsBrowserPage.deleteChatApiKey(secondEditedApiKey);
        expect(await settingsBrowserPage.isChatApiKeyPresent(secondEditedApiKey)).toBe(false);
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

        const originalValue = await settingsBrowserPage.getMaxSavedMessagesValue();

        try {
            await settingsBrowserPage.fillMaxSavedMessages(7);
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(500);

            await settingsBrowserPage.reloadPage();
            await settingsBrowserPage.waitForTimeout(1000);
            await settingsBrowserPage.expandChatSection();
            await settingsBrowserPage.waitForMaxSavedMessagesInput();

            const savedValue = await settingsBrowserPage.getMaxSavedMessagesValue();
            expect(savedValue).toBe('7');
        } finally {
            // Restore original value
            await settingsBrowserPage.fillMaxSavedMessages(parseInt(originalValue));
            await settingsBrowserPage.clickSaveSettingsButton();
        }
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

    test('@readwrite Verify max tabs slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandUserExperienceSection();

        const originalValue = await settingsBrowserPage.getMaxTabsValue();

        try {
            await settingsBrowserPage.setMaxTabsSlider(4);
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(500);

            await settingsBrowserPage.reloadPage();
            await settingsBrowserPage.waitForTimeout(1000);
            await settingsBrowserPage.expandUserExperienceSection();

            const value = await settingsBrowserPage.getMaxTabsValue();
            expect(value).toBe(4);
        } finally {
            // Restore original value
            await settingsBrowserPage.expandUserExperienceSection();
            await settingsBrowserPage.setMaxTabsSlider(originalValue);
            await settingsBrowserPage.clickSaveSettingsButton();
        }
    });

    test('@readwrite Verify graphs order can be changed and persists', async () => {
        const orderByLabel: Record<string, string> = {
            'Newest First': 'new-old',
            'Oldest First': 'old-new',
            'Name (A-Z)': 'a-z',
            'Name (Z-A)': 'z-a',
        };
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const originalValue = await settingsBrowserPage.getGraphsSortOrder();

        expect(originalValue).toBe('Newest First');

        try {
            await settingsBrowserPage.setGraphsSortOrder('a-z');
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(500);

            await settingsBrowserPage.reloadPage();
            await settingsBrowserPage.waitForTimeout(1000);

            expect(await settingsBrowserPage.getGraphsSortOrder()).toBe('Name (A-Z)');
        } finally {
            // Restore original value
            await settingsBrowserPage.setGraphsSortOrder(orderByLabel[originalValue]);
            await settingsBrowserPage.clickSaveSettingsButton();
        }
    });

    // ===== Graph Info Section =====

    test('@readwrite Verify refresh interval slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandGraphInfoSection();

        const originalValue = await settingsBrowserPage.getRefreshIntervalValue();

        try {
            await settingsBrowserPage.setRefreshIntervalSlider(30);
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(500);

            await settingsBrowserPage.reloadPage();
            await settingsBrowserPage.waitForTimeout(1000);
            await settingsBrowserPage.expandGraphInfoSection();

            const value = await settingsBrowserPage.getRefreshIntervalValue();
            expect(value).toBe(30);
        } finally {
            // Restore original value
            await settingsBrowserPage.setRefreshIntervalSlider(originalValue);
            await settingsBrowserPage.clickSaveSettingsButton();
        }
    });

    test('@readwrite Verify max items for search slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandGraphInfoSection();

        const originalValue = await settingsBrowserPage.getMaxItemsForSearchValue();

        try {
            await settingsBrowserPage.setMaxItemsForSearchSlider(25);
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(500);

            await settingsBrowserPage.reloadPage();
            await settingsBrowserPage.waitForTimeout(1000);
            await settingsBrowserPage.expandGraphInfoSection();

            const value = await settingsBrowserPage.getMaxItemsForSearchValue();
            expect(value).toBe(25);
        } finally {
            // Restore original value
            await settingsBrowserPage.setMaxItemsForSearchSlider(originalValue);
            await settingsBrowserPage.clickSaveSettingsButton();
        }
    });

    // ===== Table View Settings =====

    test('@readwrite Verify column width slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandUserExperienceSection();

        const originalValue = await settingsBrowserPage.getColumnWidthValue();

        try {
            await settingsBrowserPage.setColumnWidthSlider(50);
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(500);

            await settingsBrowserPage.reloadPage();
            await settingsBrowserPage.waitForTimeout(1000);
            await settingsBrowserPage.expandUserExperienceSection();

            const value = await settingsBrowserPage.getColumnWidthValue();
            expect(value).toBe(50);
        } finally {
            // Restore original value
            await settingsBrowserPage.setColumnWidthSlider(originalValue);
            await settingsBrowserPage.clickSaveSettingsButton();
        }
    });

    test('@readwrite Verify row height slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandUserExperienceSection();

        const originalValue = await settingsBrowserPage.getRowHeightValue();

        try {
            await settingsBrowserPage.setRowHeightSlider(60);
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(500);

            await settingsBrowserPage.reloadPage();
            await settingsBrowserPage.waitForTimeout(1000);
            await settingsBrowserPage.expandUserExperienceSection();

            const value = await settingsBrowserPage.getRowHeightValue();
            expect(value).toBe(60);
        } finally {
            // Restore original value
            await settingsBrowserPage.setRowHeightSlider(originalValue);
            await settingsBrowserPage.clickSaveSettingsButton();
        }
    });

    test('@readwrite Verify row height expand multiplier slider can be changed and persists', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        await settingsBrowserPage.expandUserExperienceSection();

        const originalValue = await settingsBrowserPage.getRowHeightExpandMultipleValue();

        try {
            await settingsBrowserPage.setRowHeightExpandMultipleSlider(4);
            await settingsBrowserPage.clickSaveSettingsButton();
            await settingsBrowserPage.waitForTimeout(500);

            await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.waitForTimeout(1000);
        await settingsBrowserPage.expandUserExperienceSection();

        const value = await settingsBrowserPage.getRowHeightExpandMultipleValue();
        expect(value).toBe(4);
       } finally {
           // Restore original value
           await settingsBrowserPage.setRowHeightExpandMultipleSlider(originalValue);
           await settingsBrowserPage.clickSaveSettingsButton();
       }
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
        // Clear the key first so waitForChatModelSourceSaved can detect the fresh write
        await settingsBrowserPage.clearChatModelSourceFromLocalStorage();
        await settingsBrowserPage.selectLocalLlmModelSource();
        expect(await settingsBrowserPage.isLocalLlmModelSourceSelected()).toBe(true);

        // Click Save, then wait until the encrypted value lands in localStorage before reloading
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForChatModelSourceSaved();
        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForLocalLlmModelSourceSelected();

        expect(await settingsBrowserPage.isLocalLlmModelSourceSelected()).toBe(true);
    });

    test('@readwrite Verify local LLM provider change persists after Save', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.clearChatModelSourceFromLocalStorage();
        await settingsBrowserPage.selectLocalLlmModelSource();
        await settingsBrowserPage.selectLmStudioProvider();
        expect(await settingsBrowserPage.isLmStudioProviderSelected()).toBe(true);
        expect(await settingsBrowserPage.getLocalLlmEndpointValue()).toBe('http://localhost:1234/v1');

        // Click Save, then wait until the encrypted value lands in localStorage before reloading
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForChatModelSourceSaved();
        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForLocalLlmModelSourceSelected();

        // LM Studio provider and its default endpoint should persist after Save
        expect(await settingsBrowserPage.isLocalLlmModelSourceSelected()).toBe(true);
        expect(await settingsBrowserPage.isLmStudioProviderSelected()).toBe(true);
        expect(await settingsBrowserPage.getLocalLlmEndpointValue()).toBe('http://localhost:1234/v1');
    });

    test('@readwrite Verify local LLM endpoint change persists after Save', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.clearChatModelSourceFromLocalStorage();
        await settingsBrowserPage.selectLocalLlmModelSource();

        const customEndpoint = 'http://localhost:8888/v1';
        await settingsBrowserPage.fillLocalLlmEndpoint(customEndpoint);

        // Click Save, then wait until the encrypted value lands in localStorage before reloading
        await settingsBrowserPage.clickSaveSettingsButton();
        await settingsBrowserPage.waitForChatModelSourceSaved();
        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.waitForLocalLlmModelSourceSelected();

        // Custom endpoint should persist after Save
        expect(await settingsBrowserPage.getLocalLlmEndpointValue()).toBe(customEndpoint);
    });

});
