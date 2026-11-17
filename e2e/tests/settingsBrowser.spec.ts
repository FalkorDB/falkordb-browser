import { expect, test, type Page } from "@playwright/test";
import type { Session, SessionConnection } from "next-auth";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import SettingsBrowserPage from "../logic/POM/settingsBrowserPage";
import ApiCalls from "../logic/api/apiCalls";
import ChatComponent from "../logic/POM/chatComponent";
import HeaderComponent from "../logic/POM/headerComponent";
import ConnectionManagerComponent from "../logic/POM/connectionManagerComponent";
import { getRandomString } from "../infra/utils";
import { CHAT_API_KEYS_STORAGE_KEY, SELECTED_CHAT_API_KEY_ID_STORAGE_KEY } from "@/lib/chat-api-key-storage";

const LOCAL_LLM_ENDPOINT = "http://localhost:11434";
const LOCAL_MODELS_LOADED = "1 local Ollama models loaded.";

async function delayNextKeyEncryption(page: Page) {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    let markStarted!: () => void;
    const started = new Promise<void>((resolve) => { markStarted = resolve; });
    let delayed = false;
    let encryptions = 0;
    await page.route("**/api/encrypt", async (route) => {
        if (route.request().postDataJSON().action !== "encrypt") {
            await route.continue();
            return;
        }
        encryptions += 1;
        if (delayed) {
            await route.continue();
            return;
        }
        delayed = true;
        const response = await route.fetch();
        markStarted();
        await gate;
        await route.fulfill({ response });
    });
    return { release, started, encryptionCount: () => encryptions };
}

test.describe('@browser Browser Settings tests', () => {
    test.describe.configure({ mode: 'serial' });

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

        // Poll: the search filter is debounced and auto-expands matching categories
        await expect.poll(() => settingsBrowserPage.isModelShown(openaiModel)).toBe(true);
        await expect.poll(() => settingsBrowserPage.isModelShown(anthropicModel)).toBe(false);
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

        // Poll: the search filter is debounced and auto-expands matching categories
        await expect.poll(() => settingsBrowserPage.isModelShown(anthropicModel)).toBe(true);
        await expect.poll(() => settingsBrowserPage.isModelShown(openaiModel)).toBe(false);
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

        // Verify "No models found" message is displayed
        const noModelsText = await settingsBrowserPage.getNoModelsFoundText();
        expect(noModelsText).toContain("No models found");
    });

    test('@readwrite Verify a saved legacy OpenAI model is preserved when it is not first', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        const testApiKey = `sk-e2e-${getRandomString("key")}`;

        await settingsBrowserPage.seedStoredModel("api-key", "codex-mini-latest");
        await page.route("**/api/chat/models", route => route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ models: ["openai::gpt-4o-mini", "openai::codex-mini-latest"] }),
        }));
        await page.goto(urls.settingsUrl);
        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectApiKeyModelSource();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();
        await settingsBrowserPage.addChatApiKey(testApiKey);
        await settingsBrowserPage.selectChatApiKey(testApiKey);

        await expect.poll(() => settingsBrowserPage.getStoredPerSourceModel("api-key"))
            .toBe("openai::codex-mini-latest");
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

    test("@readwrite an old model response cannot update settings after switching connections", async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        const sessionResponse = await page.request.get(`${urls.localHost}/api/auth/session`);
        const connectionsResponse = await page.request.get(`${urls.localHost}/api/connections`);
        expect(sessionResponse.ok()).toBe(true);
        expect(connectionsResponse.ok()).toBe(true);
        const session = await sessionResponse.json() as Session;
        const { connections } = await connectionsResponse.json() as { connections: SessionConnection[] };
        const first = connections[0];
        if (!first) throw new Error("Model switch test needs an authenticated connection");
        const second = { ...first, id: getRandomString("model-connection"), host: "model-secondary.invalid" };
        let active = first;
        let releaseSwitch!: () => void;
        const switchGate = new Promise<void>(resolve => { releaseSwitch = resolve; });
        let markSwitchStarted!: () => void;
        const switchStarted = new Promise<void>(resolve => { markSwitchStarted = resolve; });
        await page.route("**/api/**", route => {
            const headers = route.request().headers();
            const url = new URL(route.request().url());
            if (url.searchParams.get("connectionId") === second.id) url.searchParams.set("connectionId", first.id);
            return route.continue({
                url: url.toString(),
                headers: headers["x-connection-id"] === second.id ? { ...headers, "x-connection-id": first.id } : headers,
            });
        });
        await page.route("**/api/connections", route => route.fulfill({ json: { connections: [first, second] } }));
        await page.route("**/api/auth/csrf", route => route.fulfill({ json: { csrfToken: "model-test-csrf" } }));
        await page.route("**/api/auth/session", async route => {
            if (route.request().method() === "POST") {
                const body = route.request().postDataJSON() as { data?: { activeConnectionId?: string } };
                if (body.data?.activeConnectionId === second.id) {
                    markSwitchStarted();
                    await switchGate;
                    active = second;
                }
            }
            await route.fulfill({ json: {
                ...session,
                activeConnectionId: active.id,
                user: { ...session.user, host: active.host, port: active.port },
            } });
        });
        await page.addInitScript(id => localStorage.setItem("lastActiveConnectionId", id), first.id);

        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        let requested!: () => void;
        const started = new Promise<void>(resolve => { requested = resolve; });
        let delayed = false;
        let completed!: () => void;
        const finished = new Promise<void>(resolve => { completed = resolve; });
        const staleModel = "stale-connection-model";
        await page.route("**/api/chat/models**", async route => {
            if (delayed || route.request().postDataJSON().source !== "local") {
                return route.fulfill({ json: { models: [] } });
            }
            delayed = true;
            requested();
            await gate;
            try {
                await route.fulfill({ json: { models: [staleModel] } });
            } finally {
                completed();
            }
        });
        try {
            await page.goto(urls.settingsUrl);
            await settings.expandChatSection();
            await settings.selectLocalLlmModelSource();
            await started;
            const connections = new ConnectionManagerComponent(page);
            await connections.selectConnectionById(first.id);
            await connections.openDropdown();
            await connections.selectConnectionById(second.id);
            await switchStarted;
            release();
            await finished;
            await page.evaluate(() => new Promise<void>(resolve => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            }));
            await settings.expectModelAbsent(staleModel);
            expect(await page.evaluate(() => localStorage.getItem("model"))).not.toBe(staleModel);
            releaseSwitch();
            await expect.poll(() => active.id).toBe(second.id);
        } finally {
            release();
            releaseSwitch();
            // Close the page while the routes still rewrite the fake connection: an
            // unrouted request carrying it gets SESSION_INVALID, and the resulting real
            // sign-out deletes the shared read-write user's connections for every test.
            await browser.closePage();
        }
    });

    test("@readwrite models reload after a rejected connection switch rolls back", async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        const sessionResponse = await page.request.get(`${urls.localHost}/api/auth/session`);
        const connectionsResponse = await page.request.get(`${urls.localHost}/api/connections`);
        expect(sessionResponse.ok()).toBe(true);
        expect(connectionsResponse.ok()).toBe(true);
        const session = await sessionResponse.json() as Session;
        const { connections } = await connectionsResponse.json() as { connections: SessionConnection[] };
        const first = connections[0];
        if (!first) throw new Error("Rejected switch test needs an authenticated connection");
        const second = { ...first, id: getRandomString("rejected-connection"), host: "rejected-secondary.invalid" };
        let markSwitchRequested!: () => void;
        const switchRequested = new Promise<void>(resolve => { markSwitchRequested = resolve; });
        await page.route("**/api/**", route => {
            const headers = route.request().headers();
            const url = new URL(route.request().url());
            if (url.searchParams.get("connectionId") === second.id) url.searchParams.set("connectionId", first.id);
            return route.continue({
                url: url.toString(),
                headers: headers["x-connection-id"] === second.id ? { ...headers, "x-connection-id": first.id } : headers,
            });
        });
        await page.route("**/api/connections", route => route.fulfill({ json: { connections: [first, second] } }));
        await page.route("**/api/auth/csrf", route => route.fulfill({ json: { csrfToken: "rejected-test-csrf" } }));
        await page.route("**/api/auth/session", async route => {
            if (route.request().method() === "POST") {
                const body = route.request().postDataJSON() as { data?: { activeConnectionId?: string } };
                if (body.data?.activeConnectionId === second.id) markSwitchRequested();
            }
            // The session never adopts `second`, so the switch is rejected and rolls back.
            await route.fulfill({ json: {
                ...session,
                activeConnectionId: first.id,
                user: { ...session.user, host: first.host, port: first.port },
            } });
        });
        await page.addInitScript(id => localStorage.setItem("lastActiveConnectionId", id), first.id);

        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        let requested!: () => void;
        const started = new Promise<void>(resolve => { requested = resolve; });
        let delayed = false;
        await page.route("**/api/chat/models**", async route => {
            if (route.request().postDataJSON().source !== "local") {
                return route.fulfill({ json: { models: [] } });
            }
            if (delayed) return route.fulfill({ json: { models: ["fresh-model"] } });
            delayed = true;
            requested();
            await gate;
            // The page may have aborted this request; the switch already discarded it.
            return route.fulfill({ json: { models: ["stale-model"] } }).catch(() => undefined);
        });
        try {
            await page.goto(urls.settingsUrl);
            await settings.expandChatSection();
            await settings.selectLocalLlmModelSource();
            await started;
            const connections = new ConnectionManagerComponent(page);
            await connections.selectConnectionById(first.id);
            await connections.openDropdown();
            await connections.selectConnectionById(second.id);
            await switchRequested;
            release();
            await expect(settings.modelsStatusMessage).toHaveText(LOCAL_MODELS_LOADED);
            await settings.expectModelAbsent("stale-model");
        } finally {
            release();
            // Close the page while the routes still rewrite the fake connection (see above).
            await browser.closePage();
        }
    });

    test("@readwrite model absence check detects models in collapsed categories", async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        const model = "ollama::llama3.2";
        await page.setContent('<button data-testid="categoryToggleOllama" aria-expanded="false">Ollama</button>');
        await page.evaluate(modelName => {
            const toggle = document.querySelector("button");
            if (!toggle) throw new Error("Missing model category");
            toggle.addEventListener("click", () => {
                toggle.setAttribute("aria-expanded", "true");
                const button = document.createElement("button");
                button.dataset.testid = `selectModel${modelName}`;
                document.body.append(button);
            });
        }, model);
        await expect(settings.expectModelAbsent(model)).rejects.toThrow();
    });

    test("@readwrite loading models does not discard an API key edit", async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        let releaseModels!: () => void;
        const modelGate = new Promise<void>(resolve => { releaseModels = resolve; });
        let modelsRequested = false;
        await page.route("**/api/chat/models**", async route => {
            modelsRequested = true;
            await modelGate;
            await route.fulfill({ json: { models: ["gpt-edit-preservation-test"] } });
        });
        const apiKey = `sk-e2e-model-edit-${getRandomString("key")}`;
        const draft = `${apiKey}-draft`;
        try {
            await settings.expandChatSection();
            await settings.selectApiKeyModelSource();
            await settings.waitForChatApiKeyInputEnabled();
            await settings.addChatApiKey(apiKey);
            await expect.poll(() => modelsRequested).toBe(true);
            await settings.beginEditChatApiKey(apiKey);
            await settings.fillChatApiKeyEdit(draft);
            releaseModels();
            await expect.poll(() => page.evaluate(() => localStorage.getItem("model")))
                .toBe("gpt-edit-preservation-test");
            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveValue(draft);
            await page.getByTestId("editChatApiKeyButton").filter({ hasText: "Cancel edit" }).click();
            await settings.deleteChatApiKey(apiKey);
        } finally {
            releaseModels();
        }
    });

    for (const mutation of ["add", "delete selected"] as const) {
        test(`@readwrite ${mutation} does not discard another API key edit`, async () => {
            const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
            const page = await browser.getPage();
            await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
            const apiKey = `sk-e2e-edit-${getRandomString("key")}-first`;
            const otherKey = `sk-e2e-edit-${getRandomString("key")}-other`;
            const draft = `${apiKey}-draft`;
            await settings.expandChatSection();
            await settings.selectApiKeyModelSource();
            await settings.waitForChatApiKeyInputEnabled();
            await settings.addChatApiKey(apiKey);

            if (mutation === "add") {
                const { release, started } = await delayNextKeyEncryption(page);
                try {
                    await settings.fillChatApiKey(otherKey);
                    await page.getByTestId("addChatApiKeyButton").click();
                    await started;
                    await settings.beginEditChatApiKey(apiKey);
                    await settings.fillChatApiKeyEdit(draft);
                    release();
                    await expect(page.getByTestId("chatApiKeyValue").filter({ hasText: otherKey.slice(-4) })).toBeVisible();
                    await expect(page.getByTestId("chatApiKeyEditInput")).toHaveValue(draft);
                } finally {
                    release();
                }
            } else {
                await settings.addChatApiKey(otherKey);
                await settings.beginEditChatApiKey(apiKey);
                await settings.fillChatApiKeyEdit(draft);
                await settings.deleteChatApiKey(otherKey);
                await expect(page.getByTestId("chatApiKeyEditInput")).toHaveValue(draft);
            }
            await page.getByTestId("editChatApiKeyButton").filter({ hasText: "Cancel edit" }).click();
            await settings.deleteChatApiKey(apiKey);
            if (mutation === "add") await settings.deleteChatApiKey(otherKey);
        });
    }

    test("@readwrite selecting another key preserves an open edit and the new selection", async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
        const first = `sk-e2e-select-${getRandomString("key")}-first`;
        const second = `sk-e2e-select-${getRandomString("key")}-second`;
        const draft = `${first}-edited`;
        await settings.expandChatSection();
        await settings.selectApiKeyModelSource();
        await settings.waitForChatApiKeyInputEnabled();
        await settings.addChatApiKey(first);
        await settings.addChatApiKey(second);
        await settings.selectChatApiKey(first);
        await settings.beginEditChatApiKey(first);
        await settings.fillChatApiKeyEdit(draft);
        await settings.selectChatApiKey(second);
        await expect(page.getByTestId("chatApiKeyEditInput")).toHaveValue(draft);
        await page.getByTestId("saveEditedChatApiKeyButton").click();
        await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
        const selectedCard = page.getByTestId("chatApiKeyCard").filter({
            has: page.getByTestId("chatApiKeyValue").filter({ hasText: second.slice(-4) }),
        });
        await expect(selectedCard.getByTestId("selectChatApiKeyButton")).toHaveAttribute("aria-pressed", "true");
        await settings.deleteChatApiKey(draft);
        await settings.deleteChatApiKey(second);
    });

    test("@readwrite discarding settings closes an open API key edit", async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
        const apiKey = `sk-e2e-discard-${getRandomString("key")}`;
        await settings.expandChatSection();
        await settings.selectApiKeyModelSource();
        await settings.waitForChatApiKeyInputEnabled();
        await settings.addChatApiKey(apiKey);

        await page.getByTestId("queryExecutionSectionHeader").click();
        const limit = page.locator("#limitInput");
        const savedLimit = await limit.inputValue();
        await limit.fill(savedLimit === "123" ? "124" : "123");
        await expect(page.getByTestId("cancelSettingsButton")).toBeVisible();
        await settings.beginEditChatApiKey(apiKey);
        await settings.fillChatApiKeyEdit(`${apiKey}-discarded`);
        await page.getByTestId("cancelSettingsButton").click();

        await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
        await expect(limit).toHaveValue(savedLimit);
        expect(await settings.isChatApiKeyPresent(apiKey)).toBe(true);
        await settings.deleteChatApiKey(apiKey);
    });

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
                await settings.beginEditChatApiKey(apiKey);
                await settings.fillChatApiKeyEdit(staleKey);
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
                await page.waitForLoadState("networkidle");
                await expect(page.getByTestId("chatApiKeyValue").filter({
                    hasText: `sk-e2e••••••••${newerKey.slice(-4)}`,
                })).toBeVisible();
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
                await settings.beginEditChatApiKey(apiKey);
                await settings.fillChatApiKeyEdit(staleKey);
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
                const retainedKey = staleKey;
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
                expect(encryption.encryptionCount()).toBe(1);
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

    test('@readwrite a temporary saved-key decryption failure preserves the selected preference and ciphertext', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        const suffix = getRandomString("decrypt");
        const firstKey = `sk-e2e-${suffix}-first`;
        const secondKey = `sk-e2e-${suffix}-second`;
        const model = "gpt-4o-mini";
        await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [model] } }));
        await settings.expandChatSection();
        await settings.selectApiKeyModelSource();
        await settings.waitForChatApiKeyInputEnabled();
        await settings.addChatApiKey(firstKey);
        await expect(page.getByTestId(`selectModel${model}`)).toHaveAttribute("data-selected", "true");
        await settings.addChatApiKey(secondKey);
        await expect(page.getByTestId(`selectModel${model}`)).toHaveAttribute("data-selected", "true");
        const savedState = () => page.evaluate(() => {
            const keys = Object.keys(localStorage).filter(name =>
                name.endsWith(":chatApiKeys") || name.endsWith(":selectedChatApiKeyId"));
            return Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
        });
        const saved = await savedState();
        const selectedId = await page.getByTestId("chatApiKeyCard").filter({
            has: page.getByTestId("chatApiKeyValue").filter({ hasText: secondKey.slice(-4) }),
        }).getAttribute("data-api-key-id");
        let failedDecrypts = 0;
        await page.route("**/api/encrypt", route => {
            if (route.request().postDataJSON().action !== "decrypt") return route.continue();
            failedDecrypts += 1;
            return route.fulfill({ status: 503, json: { error: "Simulated temporary decryption failure" } });
        });
        await page.clock.install();
        await page.reload({ waitUntil: "networkidle" });
        await settings.expandChatSection();
        await expect.poll(() => failedDecrypts).toBeGreaterThan(0);
        await page.clock.runFor(1000);
        await expect(page.getByTestId("chatApiKeyCard")).toHaveCount(0);
        expect(await savedState()).toEqual(saved);
        await page.unroute("**/api/encrypt");
        await page.reload({ waitUntil: "networkidle" });
        await settings.expandChatSection();
        await expect(page.getByTestId("chatApiKeyCard")).toHaveCount(2);
        await expect(page.locator(`[data-api-key-id="${selectedId}"]`).getByTestId("selectChatApiKeyButton"))
            .toHaveAttribute("aria-pressed", "true");
        await page.clock.runFor(1000);
        await expect(page.getByTestId(`selectModel${model}`)).toHaveAttribute("data-selected", "true");
        expect(await savedState()).toEqual(saved);
        await settings.deleteChatApiKey(secondKey);
        await settings.deleteChatApiKey(firstKey);
    });

    test('@readwrite selecting the key being deleted while encryption is pending falls back to the remaining key', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        const suffix = getRandomString("delete-selection");
        const firstKey = `sk-e2e-${suffix}-first`;
        const secondKey = `sk-e2e-${suffix}-second`;
        await page.route("**/api/chat/models**", route => route.fulfill({ json: { models: [] } }));
        await settings.expandChatSection();
        await settings.selectApiKeyModelSource();
        await settings.waitForChatApiKeyInputEnabled();
        await settings.addChatApiKey(firstKey);
        await settings.addChatApiKey(secondKey);
        await settings.selectChatApiKey(firstKey);
        const firstId = await page.getByTestId("chatApiKeyCard").filter({ has: page.getByTestId("chatApiKeyValue").filter({ hasText: firstKey.slice(-4) }) }).getAttribute("data-api-key-id");
        if (!firstId) throw new Error("Selection test key is missing its stable ID");
        const secondCard = page.getByTestId("chatApiKeyCard").filter({ has: page.getByTestId("chatApiKeyValue").filter({ hasText: secondKey.slice(-4) }) });
        const selectedId = () => page.evaluate(() => {
            const key = Object.keys(localStorage).find(name => name.endsWith(":selectedChatApiKeyId"));
            return key ? localStorage.getItem(key) : null;
        });
        const encryption = await delayNextKeyEncryption(page);
        try {
            await secondCard.getByTestId("deleteChatApiKeyButton").click();
            await page.getByTestId("confirmDeleteChatApiKeyButton").click();
            await encryption.started;
            await page.getByTestId("deleteChatApiKeyDialog").getByRole("button", { name: "Close", exact: true }).click();
            await expect(page.getByTestId("deleteChatApiKeyDialog")).toBeHidden();
            await settings.selectChatApiKey(secondKey);
            await expect(secondCard.getByTestId("selectChatApiKeyButton")).toHaveAttribute("aria-pressed", "true");
            encryption.release();
            await expect(page.getByTestId("chatApiKeyCard")).toHaveCount(1);
            expect(encryption.encryptionCount()).toBe(1);
            await expect(page.getByTestId("selectChatApiKeyButton")).toHaveAttribute("aria-pressed", "true");
            await expect.poll(selectedId).toBe(firstId);
            await page.reload({ waitUntil: "networkidle" });
            await settings.expandChatSection();
            await expect(page.getByTestId("chatApiKeyCard")).toHaveCount(1);
            await expect(page.getByTestId("selectChatApiKeyButton")).toHaveAttribute("aria-pressed", "true");
            await settings.deleteChatApiKey(firstKey);
        } finally {
            encryption.release();
            await page.unrouteAll({ behavior: "wait" });
        }
    });

    test('@readwrite deleting the selected key selects the remaining key and loads its models', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const page = await browser.getPage();
        const suffix = getRandomString("next-selection");
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
        await settings.selectChatApiKey(secondKey);
        await expect.poll(() => modelLoads).toContain(secondKey);
        const firstId = await page.getByTestId("chatApiKeyCard").filter({ has: page.getByTestId("chatApiKeyValue").filter({ hasText: firstKey.slice(-4) }) }).getAttribute("data-api-key-id");
        modelLoads.length = 0;
        await settings.deleteChatApiKey(secondKey);
        await expect(page.getByTestId("chatApiKeyCard")).toHaveCount(1);
        await expect(page.getByTestId("selectChatApiKeyButton")).toHaveAttribute("aria-pressed", "true");
        await expect.poll(() => page.evaluate(() => {
            const key = Object.keys(localStorage).find(name => name.endsWith(":selectedChatApiKeyId"));
            return key ? localStorage.getItem(key) : null;
        })).toBe(firstId);
        // A debounced load queued before the delete may still land, but the last one must be the fallback key.
        await expect.poll(() => modelLoads.at(-1)).toBe(firstKey);
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
        await settings.beginEditChatApiKey(apiKey);
        await settings.fillChatApiKeyEdit(`${apiKey}-abandoned`);
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
            await settings.beginEditChatApiKey(otherKey);
            await settings.fillChatApiKeyEdit(editedKey);
            encryption.release();
            await expect.poll(() => settings.isChatApiKeyPresent(apiKey)).toBe(false);
            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveValue(editedKey);
            await page.getByTestId("saveEditedChatApiKeyButton").click();
            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
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
            await settings.beginEditChatApiKey(apiKey);
            await settings.fillChatApiKeyEdit(staleKey);
            await page.getByTestId("saveEditedChatApiKeyButton").click();
            await encryption.started;
            await page.getByTestId("chatApiKeyEditInput").fill(newerKey);
            const staleResponse = page.waitForResponse(response =>
                response.url().endsWith("/api/encrypt")
                && response.request().postData()?.includes(staleKey) === true);
            encryption.release();
            await (await staleResponse).finished();
            await page.waitForLoadState("networkidle");
            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveValue(newerKey);
            await page.getByTestId("saveEditedChatApiKeyButton").click();
            await expect(page.getByTestId("chatApiKeyEditInput")).toHaveCount(0);
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
                await settings.beginEditChatApiKey(apiKey);
                await settings.fillChatApiKeyEdit(editedKey);
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
            await settings.beginEditChatApiKey(apiKey);
            await settings.fillChatApiKeyEdit(`${apiKey}-edited`);
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

        await settingsBrowserPage.showChatApiKey(apiKey);
        expect(await settingsBrowserPage.getVisibleChatApiKeyText(apiKey)).toBe(apiKey);

        await settingsBrowserPage.editChatApiKey(apiKey, editedApiKey);
        expect(await settingsBrowserPage.isChatApiKeyPresent(apiKey)).toBe(false);
        expect(await settingsBrowserPage.isChatApiKeyPresent(editedApiKey)).toBe(true);
        expect(await settingsBrowserPage.getVisibleChatApiKeyText(editedApiKey)).toBe(editedApiKey);

        await settingsBrowserPage.beginEditChatApiKey(editedApiKey);
        await settingsBrowserPage.cancelEditChatApiKey();
        expect(await settingsBrowserPage.isChatApiKeyPresent(editedApiKey)).toBe(true);

        const secondEditedApiKey = `sk-e2e-edited-again-${getRandomString("key")}`;
        await settingsBrowserPage.editChatApiKey(editedApiKey, secondEditedApiKey);
        expect(await settingsBrowserPage.getVisibleChatApiKeyText(secondEditedApiKey)).toBe(secondEditedApiKey);

        await settingsBrowserPage.deleteChatApiKey(secondEditedApiKey);
        expect(await settingsBrowserPage.isChatApiKeyPresent(secondEditedApiKey)).toBe(false);
    });

    test('@readwrite Chat API key visibility stays hidden when editing and cancelling or saving', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const apiKey = `sk-e2e-${getRandomString("key")}`;
        const maskedKeyText = `${apiKey.slice(0, 6)}••••••••${apiKey.slice(-4)}`;

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectApiKeyModelSource();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();
        await settingsBrowserPage.addChatApiKey(apiKey);
        expect(await settingsBrowserPage.getMaskedChatApiKeyText(apiKey)).toBe(maskedKeyText);

        await settingsBrowserPage.beginEditChatApiKey(apiKey);
        await expect(settingsBrowserPage.chatApiKeyEditInput).toHaveAttribute("type", "text");
        await settingsBrowserPage.cancelEditChatApiKey();
        expect(await settingsBrowserPage.getMaskedChatApiKeyText(apiKey)).toBe(maskedKeyText);

        await settingsBrowserPage.beginEditChatApiKey(apiKey);
        await settingsBrowserPage.clickSaveEditedChatApiKey();
        expect(await settingsBrowserPage.getMaskedChatApiKeyText(apiKey)).toBe(maskedKeyText);
    });

    test('@readwrite Chat API key visibility preserves an explicit Show choice while editing', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const apiKey = `sk-e2e-${getRandomString("key")}`;

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectApiKeyModelSource();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();
        await settingsBrowserPage.addChatApiKey(apiKey);
        await settingsBrowserPage.showChatApiKey(apiKey);

        await settingsBrowserPage.beginEditChatApiKey(apiKey);
        await settingsBrowserPage.cancelEditChatApiKey();
        expect(await settingsBrowserPage.getVisibleChatApiKeyText(apiKey)).toBe(apiKey);

        await settingsBrowserPage.beginEditChatApiKey(apiKey);
        await settingsBrowserPage.clickSaveEditedChatApiKey();
        expect(await settingsBrowserPage.getVisibleChatApiKeyText(apiKey)).toBe(apiKey);
    });

    test('@readwrite Chat API key visibility is restored when switching the edit to another key', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const firstApiKey = `sk-e2e-${getRandomString("first-key")}-A001`;
        const secondApiKey = `sk-e2e-${getRandomString("second-key")}-B002`;
        const maskedFirstApiKeyText = `${firstApiKey.slice(0, 6)}••••••••${firstApiKey.slice(-4)}`;
        const maskedSecondApiKeyText = `${secondApiKey.slice(0, 6)}••••••••${secondApiKey.slice(-4)}`;

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectApiKeyModelSource();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();
        await settingsBrowserPage.addChatApiKey(firstApiKey);
        await settingsBrowserPage.addChatApiKey(secondApiKey);

        await settingsBrowserPage.beginEditChatApiKey(firstApiKey);
        await settingsBrowserPage.beginEditChatApiKey(secondApiKey);
        expect(await settingsBrowserPage.getMaskedChatApiKeyText(firstApiKey)).toBe(maskedFirstApiKeyText);
        await settingsBrowserPage.cancelEditChatApiKey();
        expect(await settingsBrowserPage.getMaskedChatApiKeyText(secondApiKey)).toBe(maskedSecondApiKeyText);
    });

    test('@readwrite Chat API key can be hidden while editing and keeps that choice', async () => {
        const settingsBrowserPage = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
        const apiKey = `sk-e2e-${getRandomString("key")}`;
        const maskedKeyText = `${apiKey.slice(0, 6)}••••••••${apiKey.slice(-4)}`;

        await settingsBrowserPage.expandChatSection();
        await settingsBrowserPage.selectApiKeyModelSource();
        await settingsBrowserPage.waitForChatApiKeyInputEnabled();
        await settingsBrowserPage.addChatApiKey(apiKey);
        await settingsBrowserPage.showChatApiKey(apiKey);

        await settingsBrowserPage.beginEditChatApiKey(apiKey);
        await expect(settingsBrowserPage.editingChatApiKeyVisibilityButton).toHaveText("Hide");
        await settingsBrowserPage.toggleEditingChatApiKeyVisibility();
        await expect(settingsBrowserPage.chatApiKeyEditInput).toHaveAttribute("type", "password");
        await expect(settingsBrowserPage.editingChatApiKeyVisibilityButton).toHaveText("Show");
        await settingsBrowserPage.cancelEditChatApiKey();
        expect(await settingsBrowserPage.getMaskedChatApiKeyText(apiKey)).toBe(maskedKeyText);

        await settingsBrowserPage.beginEditChatApiKey(apiKey);
        await expect(settingsBrowserPage.chatApiKeyEditInput).toHaveAttribute("type", "text");
        await settingsBrowserPage.toggleEditingChatApiKeyVisibility();
        await expect(settingsBrowserPage.chatApiKeyEditInput).toHaveAttribute("type", "password");
        await settingsBrowserPage.toggleEditingChatApiKeyVisibility();
        await expect(settingsBrowserPage.chatApiKeyEditInput).toHaveAttribute("type", "text");
        await settingsBrowserPage.clickSaveEditedChatApiKey();
        expect(await settingsBrowserPage.getVisibleChatApiKeyText(apiKey)).toBe(apiKey);
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

        // Verify filtered state (debounced) - Anthropic model should not be visible
        await expect.poll(() => settingsBrowserPage.isModelShown(anthropicModel)).toBe(false);

        // Clear search
        await settingsBrowserPage.clearModelSearch();

        // Verify all models are visible again
        await expect.poll(() => settingsBrowserPage.isModelVisible(anthropicModel)).toBe(true);
        await expect.poll(() => settingsBrowserPage.isModelVisible(openaiModel)).toBe(true);
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
        await expect.poll(() => settingsBrowserPage.isModelSelected(anthropicModel)).toBe(true);

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

            await settingsBrowserPage.reloadPage();
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

        await settingsBrowserPage.reloadPage();
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

        await settingsBrowserPage.reloadPage();
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

            await settingsBrowserPage.reloadPage();
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

            await settingsBrowserPage.reloadPage();

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

            await settingsBrowserPage.reloadPage();
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

            await settingsBrowserPage.reloadPage();
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

            await settingsBrowserPage.reloadPage();
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

            await settingsBrowserPage.reloadPage();
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

            await settingsBrowserPage.reloadPage();
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

        await settingsBrowserPage.reloadPage();
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

        await settingsBrowserPage.reloadPage();
        await settingsBrowserPage.expandUserExperienceSection();

        // Remove the key
        await settingsBrowserPage.removeCaptionKey(captionKey);
        await settingsBrowserPage.clickSaveSettingsButton();

        await settingsBrowserPage.reloadPage();
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

            await settingsBrowserPage.reloadPage();
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

test.describe('@browser Browser Settings AI recovery tests', () => {
    let browser: BrowserWrapper;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    async function openLocalSettings(
        settings: SettingsBrowserPage,
        initialModel = "",
        perSourceModels?: Record<string, string>
    ) {
        const page = await browser.getPage();
        await page.addInitScript(({ model, endpoint, perSource }) => {
            localStorage.setItem("chatModelSource", "local");
            localStorage.setItem("localLlmProvider", "ollama");
            localStorage.setItem("localLlmEndpoint", endpoint);
            if (model) localStorage.setItem("model", model);
            else localStorage.removeItem("model");
            if (perSource) localStorage.setItem("perSourceModels", JSON.stringify(perSource));
            else localStorage.removeItem("perSourceModels");
        }, { model: initialModel, endpoint: LOCAL_LLM_ENDPOINT, perSource: perSourceModels });
        await browser.navigateTo(urls.settingsUrl);
        await settings.expandChatSection();
    }

    test('@readwrite Verify a rejected local model request is retried with the edited endpoint', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        const requests: Record<string, string>[] = [];
        await page.route("**/api/chat/models", async (route) => {
            requests.push(route.request().postDataJSON());
            await route.fulfill({
                status: requests.length === 1 ? 503 : 200,
                json: requests.length === 1
                    ? { error: "Local model server unavailable" }
                    : { models: ["llama3.2"] },
            });
        });
        await openLocalSettings(settings, "llama3.2");
        await expect(settings.modelsStatusMessage).toHaveText("Local model server unavailable");
        expect(await settings.getNoModelsFoundText()).toBe("No models found");

        await settings.fillLocalLlmEndpoint("http://localhost:11435");
        await expect(settings.modelsStatusMessage).toHaveText(LOCAL_MODELS_LOADED);
        expect(await settings.getLocalLlmEndpointValue()).toBe("http://localhost:11435");
        expect(requests).toEqual([
            { source: "local", localProvider: "ollama", endpoint: LOCAL_LLM_ENDPOINT },
            { source: "local", localProvider: "ollama", endpoint: "http://localhost:11435" },
        ]);
        expect(await settings.isModelVisible("llama3.2")).toBe(true);
    });

    test('@readwrite Verify malformed model JSON recovers after reloading local models', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        let requests = 0;
        await page.route("**/api/chat/models", async (route) => {
            requests += 1;
            await route.fulfill(requests === 1
                ? { status: 200, contentType: "application/json", body: '{"models":' }
                : { status: 200, json: { models: ["llama3.2"] } });
        });
        await openLocalSettings(settings);
        await expect(settings.modelsStatusMessage).toHaveText("Could not connect to local server. Check the URL and click reload.");
        expect(await settings.isModelSearchEnabled()).toBe(true);
        await settings.clickLocalLlmLoadButton();

        await expect(settings.modelsStatusMessage).toHaveText(LOCAL_MODELS_LOADED);
        expect(await settings.isModelVisible("llama3.2")).toBe(true);
        expect(requests).toBe(2);
    });

    test('@readwrite Verify an empty local model list recovers after reloading local models', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        const requests: Record<string, string>[] = [];
        await page.route("**/api/chat/models", async (route) => {
            requests.push(route.request().postDataJSON());
            await route.fulfill({
                json: { models: requests.length === 1 ? [] : ["qwen2.5"] },
            });
        });
        await openLocalSettings(settings);
        await expect(settings.modelsStatusMessage).toHaveText("No local Ollama models were returned.");
        expect(await settings.getNoModelsFoundText()).toBe("No models found");
        await settings.clickLocalLlmLoadButton();

        await expect(settings.modelsStatusMessage).toHaveText(LOCAL_MODELS_LOADED);
        expect(await settings.isNoModelsFoundMessageNotVisible()).toBe(true);
        const localRequest = { source: "local", localProvider: "ollama", endpoint: LOCAL_LLM_ENDPOINT };
        expect(requests).toEqual([localRequest, localRequest]);
        await expect.poll(() => settings.getSavedModelFromLocalStorage()).toBe("qwen2.5");
    });

    test('@readwrite Verify Ollama models load and the first one is selected', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        const requests: Record<string, string>[] = [];
        await page.route("**/api/chat/models", async (route) => {
            requests.push(route.request().postDataJSON());
            await route.fulfill({ json: { models: ["llama3.2", "qwen2.5"] } });
        });
        await openLocalSettings(settings);

        await expect(settings.modelsStatusMessage).toHaveText("2 local Ollama models loaded.");
        expect(await settings.isModelVisible("llama3.2")).toBe(true);
        expect(await settings.isModelVisible("qwen2.5")).toBe(true);
        expect(await settings.isModelSelected("llama3.2")).toBe(true);
        expect(await settings.isModelSelected("qwen2.5")).toBe(false);
        expect(requests.at(-1)).toEqual({ source: "local", localProvider: "ollama", endpoint: LOCAL_LLM_ENDPOINT });
        await expect.poll(() => settings.getSavedModelFromLocalStorage()).toBe("llama3.2");
    });

    test('@readwrite Verify LM Studio loads its models from its default endpoint', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        const requests: Record<string, string>[] = [];
        await page.route("**/api/chat/models", async (route) => {
            const request = route.request().postDataJSON();
            requests.push(request);
            await route.fulfill({
                json: { models: request.localProvider === "lmstudio" ? ["qwen2.5", "phi3"] : ["llama3.2"] },
            });
        });
        await openLocalSettings(settings);
        await expect(settings.modelsStatusMessage).toHaveText(LOCAL_MODELS_LOADED);

        await settings.selectLmStudioProvider();

        await expect(settings.modelsStatusMessage).toHaveText("2 local LM Studio models loaded.");
        expect(await settings.isLmStudioProviderSelected()).toBe(true);
        expect(await settings.getLocalLlmEndpointValue()).toBe("http://localhost:1234/v1");
        expect(requests.at(-1)).toEqual({ source: "local", localProvider: "lmstudio", endpoint: "http://localhost:1234/v1" });
        expect(await settings.isModelVisible("qwen2.5")).toBe(true);
        expect(await settings.isModelVisible("llama3.2")).toBe(false);
    });

    test('@readwrite Verify local model search filters case-insensitively and clears', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        await page.route("**/api/chat/models", (route) => route.fulfill({
            json: { models: ["llama3.2", "qwen2.5", "phi3"] },
        }));
        await openLocalSettings(settings);
        await expect(settings.modelsStatusMessage).toHaveText("3 local Ollama models loaded.");

        await settings.searchModels("QWEN");
        await expect.poll(() => settings.isModelShown("llama3.2")).toBe(false);
        expect(await settings.isModelVisible("qwen2.5")).toBe(true);
        expect(await settings.isModelVisible("phi3")).toBe(false);

        await settings.searchModels("no-such-model");
        const noModelsText = await settings.getNoModelsFoundText();
        expect(noModelsText).toContain("No models found");
        expect(noModelsText).toContain("Try a different search term");

        await settings.clearModelSearch();
        await expect.poll(() => settings.isModelShown("llama3.2")).toBe(true);
        expect(await settings.isModelVisible("qwen2.5")).toBe(true);
        expect(await settings.isModelVisible("phi3")).toBe(true);
        expect(await settings.isModelSelected("llama3.2")).toBe(true);
    });

    test('@readwrite Verify a stored model the server no longer offers falls back to the first local model', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        await page.route("**/api/chat/models", (route) => route.fulfill({
            json: { models: ["llama3.2", "qwen2.5"] },
        }));
        await openLocalSettings(settings, "ghost-model", { ollama: "ghost-model" });
        await expect(settings.modelsStatusMessage).toHaveText("2 local Ollama models loaded.");

        expect(await settings.isModelSelected("llama3.2")).toBe(true);
        await expect.poll(() => settings.getSavedModelFromLocalStorage()).toBe("llama3.2");
        await expect.poll(() => settings.getStoredPerSourceModel("ollama")).toBe("llama3.2");
    });

    test('@readwrite Verify key-like stored model values are dropped instead of being persisted again', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        await page.route("**/api/chat/models", (route) => route.fulfill({
            json: { models: ["llama3.2", "qwen2.5"] },
        }));
        await openLocalSettings(settings, "sk-not-a-model", { ollama: "sk-not-a-model", lmstudio: "sk-other-secret" });
        await expect(settings.modelsStatusMessage).toHaveText("2 local Ollama models loaded.");

        await expect.poll(() => settings.getStoredPerSourceModel("ollama")).toBe("llama3.2");
        expect(await settings.getStoredPerSourceModel("lmstudio")).toBeUndefined();
        expect(await settings.getSavedModelFromLocalStorage()).toBe("llama3.2");
    });

    test('@readwrite Verify Cancel Changes discards unsaved local LLM provider and endpoint edits', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const page = await browser.getPage();
        await page.route("**/api/chat/models", (route) => route.fulfill({ json: { models: ["llama3.2"] } }));
        await openLocalSettings(settings);
        await expect(settings.modelsStatusMessage).toHaveText(LOCAL_MODELS_LOADED);
        await settings.waitForSaveSettingsButtonHidden();

        await settings.selectLmStudioProvider();
        await settings.fillLocalLlmEndpoint("http://localhost:9999/v1");
        expect(await settings.waitForSaveSettingsButton()).toBe(true);
        await settings.clickCancelSettingsButton();

        await settings.waitForSaveSettingsButtonHidden();
        expect(await settings.isOllamaProviderSelected()).toBe(true);
        expect(await settings.getLocalLlmEndpointValue()).toBe(LOCAL_LLM_ENDPOINT);
        await expect(settings.modelsStatusMessage).toHaveText(LOCAL_MODELS_LOADED);
        expect(await settings.getStoredLocalLlmEndpoint()).toBe(LOCAL_LLM_ENDPOINT);
    });

    async function openApiKeySettings(settings: SettingsBrowserPage) {
        const page = await browser.getPage();
        await page.addInitScript((storageKeys) => {
            localStorage.setItem("chatModelSource", "api-key");
            localStorage.removeItem("secretKey");
            for (const key of Object.keys(localStorage)) {
                if (storageKeys.some((storageKey) => key.endsWith(storageKey))) {
                    localStorage.removeItem(key);
                }
            }
        }, [CHAT_API_KEYS_STORAGE_KEY, SELECTED_CHAT_API_KEY_ID_STORAGE_KEY]);
        let encryptRequests = 0;
        await page.route("**/api/encrypt", async (route) => {
            if (route.request().postDataJSON().action === "encrypt") encryptRequests += 1;
            await route.fallback();
        });
        await page.route("**/api/chat/models", (route) => route.fulfill({ json: { models: ["gpt-4o-mini"] } }));
        await browser.navigateTo(urls.settingsUrl);
        await settings.expandChatSection();
        return { getEncryptRequests: () => encryptRequests };
    }

    test('@readwrite Verify empty API keys are not added or saved while editing', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const { getEncryptRequests } = await openApiKeySettings(settings);
        const apiKey = `sk-e2e-${getRandomString("key")}`;
        const editedApiKey = `sk-e2e-edited-${getRandomString("key")}`;

        await settings.fillChatApiKey("   ");
        await settings.clickAddChatApiKeyButton();
        await settings.fillChatApiKey(`  ${apiKey}  `);
        await settings.clickAddChatApiKeyButton();

        expect(await settings.getMaskedChatApiKeyText(apiKey)).toBe(`${apiKey.slice(0, 6)}••••••••${apiKey.slice(-4)}`);
        expect(await settings.getChatApiKeyCount()).toBe(1);
        expect(await settings.getChatApiKeyValue()).toBe("");
        expect(getEncryptRequests()).toBe(1);
        await expect(settings.modelsStatusMessage).toHaveText("1 live models loaded for OpenAI.");

        await settings.showChatApiKey(apiKey);
        await settings.beginEditChatApiKey(apiKey);
        await settings.fillChatApiKeyEdit("   ");
        await settings.clickSaveEditedChatApiKey();

        await settings.fillChatApiKeyEdit(editedApiKey);
        await settings.clickSaveEditedChatApiKey();

        expect(await settings.getVisibleChatApiKeyText(editedApiKey)).toBe(editedApiKey);
        expect(await settings.getChatApiKeyCount()).toBe(1);
        expect(getEncryptRequests()).toBe(2);
    });

    test('@readwrite Verify cancelling an API key edit keeps the saved key', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const { getEncryptRequests } = await openApiKeySettings(settings);
        const apiKey = `sk-e2e-${getRandomString("key")}`;
        const discardedApiKey = `sk-e2e-discarded-${getRandomString("key")}`;
        await settings.addChatApiKey(apiKey);
        await expect(settings.modelsStatusMessage).toHaveText("1 live models loaded for OpenAI.");
        await settings.showChatApiKey(apiKey);

        await settings.beginEditChatApiKey(apiKey);
        await settings.fillChatApiKeyEdit(discardedApiKey);
        await settings.cancelEditChatApiKey();

        expect(await settings.getVisibleChatApiKeyText(apiKey)).toBe(apiKey);
        expect(await settings.isChatApiKeyPresent(discardedApiKey)).toBe(false);
        expect(await settings.getChatApiKeyCount()).toBe(1);

        await settings.beginEditChatApiKey(apiKey);
        expect(await settings.getChatApiKeyEditValue()).toBe(apiKey);
        await settings.cancelEditChatApiKey();
        expect(getEncryptRequests()).toBe(1);
    });

    test('@readwrite Verify an API key is retained after an encryption failure and can be retried', async () => {
        const settings = await browser.createNewPage(SettingsBrowserPage);
        const apiKey = `sk-e2e-${getRandomString("key")}`;
        await openApiKeySettings(settings);
        const page = await browser.getPage();
        let encryptAttempts = 0;
        // Registered after the helper's counting route, so it runs first and falls back to it.
        await page.route("**/api/encrypt", async (route) => {
            if (route.request().postDataJSON().action !== "encrypt") {
                await route.fallback();
                return;
            }
            encryptAttempts += 1;
            if (encryptAttempts === 1) {
                await route.fulfill({ status: 500, json: { error: "Encryption unavailable" } });
            } else {
                await route.fallback();
            }
        });
        await settings.fillChatApiKey(apiKey);
        await settings.clickAddChatApiKeyButton();

        await expect(settings.errorToastDescription).toHaveText("Could not encrypt API keys. Please try again.");
        expect(await settings.getChatApiKeyCount()).toBe(0);
        expect(await settings.getChatApiKeyValue()).toBe(apiKey);
        expect(await settings.isAddChatApiKeyButtonEnabled()).toBe(true);
        await settings.clickAddChatApiKeyButton();

        expect(await settings.getMaskedChatApiKeyText(apiKey)).toBe(`${apiKey.slice(0, 6)}••••••••${apiKey.slice(-4)}`);
        expect(await settings.getChatApiKeyCount()).toBe(1);
        expect(await settings.getChatApiKeyValue()).toBe("");
        await expect(settings.modelsStatusMessage).toHaveText("1 live models loaded for OpenAI.");
        expect(encryptAttempts).toBe(2);
    });
});
