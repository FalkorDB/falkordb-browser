import { expect, test } from "../infra/coverage";
import urls from '../config/urls.json';
import { roles } from '../config/roles.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import SettingsConfigPage from "../logic/POM/settingsConfigPage";
import ApiCalls from "../logic/api/apiCalls";
import Data from '../config/settingsConfigData.json';
import { initializeLocalStorage } from "../infra/utils";

test.describe.configure({ mode: 'serial' });
test.describe('@config Settings config tests', () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test("@admin Non-admin settings deep links do not expose configurations or load their data", async ({ browser: playwrightBrowser }) => {
        const context = await playwrightBrowser.newContext({ storageState: "playwright/.auth/readwriteuser.json" });
        try {
            const page = await context.newPage();
            await page.addInitScript(initializeLocalStorage("localhost", 6379));
            let configRequests = 0;
            await page.route(/\/api\/graph\/config(?:\/.*)?$/, async route => {
                configRequests += 1;
                await route.continue();
            });
            await page.goto(`${urls.settingsUrl}?tab=Configurations`);
            const session = await context.request.get(new URL("/api/auth/session", urls.settingsUrl).href);
            expect(session.ok()).toBe(true);
            expect((await session.json()).user.role).toBe("Read-Write");
            await expect(page).toHaveURL(url => !url.searchParams.has("tab"));
            await expect(page.getByTestId("settingsCurrentTab")).toHaveText("> Browser");
            await expect(page.getByTestId("settingsTabTokens")).toBeVisible();
            await expect(page.getByTestId("settingsTabConfigurations")).toHaveCount(0);
            await expect(page.getByTestId("tableRowConfigsTHREAD_COUNT")).toHaveCount(0);
            expect(configRequests).toBe(0);
        } finally {
            await context.close();
        }
    });

    test("@admin Load-time configuration cannot be edited while runtime configuration remains editable", async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage);
        const page = await browser.getPage();
        let mutations = 0;
        await page.route(/\/api\/graph\/config(?:\/.*)?$/, async route => {
            if (route.request().method() === "GET") {
                await route.fulfill({ json: { configs: [["THREAD_COUNT", 4], ["MAX_QUEUED_QUERIES", 25]] } });
            } else {
                mutations += 1;
                await route.fulfill({ status: 400, json: { message: "Unexpected mutation" } });
            }
        });
        await browser.navigateTo(urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.hoverOnRoleContentValue("MAX_QUEUED_QUERIES");
        await expect(page.getByTestId("tableRowConfigsMAX_QUEUED_QUERIES").getByTestId("editButtonConfigs")).toBeVisible();
        const readonlyRow = page.getByTestId("tableRowConfigsTHREAD_COUNT");
        await expect(readonlyRow).toBeVisible();
        await readonlyRow.hover();
        await expect(readonlyRow.getByTestId("editButtonConfigs")).toHaveCount(0);
        await settingsConfigPage.hoverOnRoleContentValue("MAX_QUEUED_QUERIES");
        await settingsConfigPage.clickEditRoleButton();
        await settingsConfigPage.fillRoleValueInput("99");
        await page.getByTestId("cancelButtonConfigs").click();
        await expect(page.getByTestId("inputConfigs")).toHaveCount(0);
        await expect(page.getByTestId("contentConfigsMAX_QUEUED_QUERIESValue")).toHaveText("25");
        expect(mutations).toBe(0);
    });

    test("@admin Failed configuration save preserves the pending value for retry", async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage);
        const page = await browser.getPage();
        const submissions: { value: string }[] = [];
        const requests: { method: string; path: string }[] = [];
        await page.route(/\/api\/graph\/config(?:\/.*)?$/, async route => {
            if (route.request().method() === "GET") {
                await route.fulfill({ json: { configs: [["MAX_QUEUED_QUERIES", 25]] } });
            } else {
                requests.push({ method: route.request().method(), path: new URL(route.request().url()).pathname });
                submissions.push(route.request().postDataJSON() as { value: string });
                await route.fulfill(submissions.length === 1
                    ? { status: 400, json: { message: "Configuration update rejected" } }
                    : { json: {} });
            }
        });
        await browser.navigateTo(urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.hoverOnRoleContentValue("MAX_QUEUED_QUERIES");
        await settingsConfigPage.clickEditRoleButton();
        await settingsConfigPage.fillRoleValueInput("42");
        await settingsConfigPage.clickConfirmValueInputBtn();
        await expect(page.getByTestId("toast-description").filter({ hasText: "An unexpected error occurred. Please try again." })).toBeVisible();
        await expect(page.getByTestId("inputConfigs")).toHaveValue("42");
        await expect(page.getByTestId("saveButtonConfigs")).toBeEnabled();

        await settingsConfigPage.clickConfirmValueInputBtn();
        await expect(page.getByTestId("inputConfigs")).toHaveCount(0);
        await expect(page.getByTestId("contentConfigsMAX_QUEUED_QUERIESValue")).toHaveText("42");
        expect(submissions).toEqual([{ value: "42" }, { value: "42" }]);
        expect(requests).toEqual(Array(2).fill({ method: "POST", path: "/api/graph/config/MAX_QUEUED_QUERIES" }));
    });

    Data.inputDataRejectsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.maxQueuedQueries} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            await apiCall.modifySettingsRole(roles.maxQueuedQueries, input);
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.fillSearchForConfigInput(roles.maxQueuedQueries);
            const value = await settingsConfigPage.getRoleContentValue(roles.maxQueuedQueries);
            expect(value === input).toBe(expected);
            if (index === Data.inputDataRejectsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.maxQueuedQueries, "25");
            }
        });
    });

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.TimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            await apiCall.modifySettingsRole(roles.TimeOut, input);
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.fillSearchForConfigInput(roles.TimeOut);
            const value = await settingsConfigPage.getRoleContentValue(roles.TimeOut);
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.TimeOut, "1000");
            }
        });
    });

    Data.maxTimeOut.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.maxTimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            await apiCall.modifySettingsRole(roles.maxTimeOut, input);
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.fillSearchForConfigInput(roles.maxTimeOut);
            const value = await settingsConfigPage.getRoleContentValue(roles.maxTimeOut);
            expect(value === input).toBe(expected);
            if (index === Data.maxTimeOut.length - 1) {
                await apiCall.modifySettingsRole(roles.maxTimeOut, "0");
            }
        });
    });

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.defaultTimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            await apiCall.modifySettingsRole(roles.defaultTimeOut, input);
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.fillSearchForConfigInput(roles.defaultTimeOut);
            const value = await settingsConfigPage.getRoleContentValue(roles.defaultTimeOut);
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.defaultTimeOut, "0");
            }
        });
    });

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.resultSetSize} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            await apiCall.modifySettingsRole(roles.resultSetSize, input);
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.fillSearchForConfigInput(roles.resultSetSize);
            const value = await settingsConfigPage.getRoleContentValue(roles.resultSetSize);
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.resultSetSize, "10000");
            }
        });
    });

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.queryMemCapacity} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            await apiCall.modifySettingsRole(roles.queryMemCapacity, input);
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.fillSearchForConfigInput(roles.queryMemCapacity);
            const value = await settingsConfigPage.getRoleContentValue(roles.queryMemCapacity);
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.queryMemCapacity, "0");
            }
        });
    });

    // Filter out "0" for VKEY_MAX_ENTITY_COUNT: setting it to 0 is a
    // server-wide FalkorDB config that also affects the token_management
    // graph (shared instance in CI), breaking auth on subsequent requests.
    const vkeyData = Data.inputDataAcceptsZero.filter(d => d.input !== "0");
    vkeyData.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.vKeyMaxEntityCount} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, input);
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.fillSearchForConfigInput(roles.vKeyMaxEntityCount);
            const value = await settingsConfigPage.getRoleContentValue(roles.vKeyMaxEntityCount);
            expect(value === input).toBe(expected);
            if (index === vkeyData.length - 1) {
                await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, "100000");
            }
        });
    });

    Data.CMDData.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.cmdInfo} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            await apiCall.modifySettingsRole(roles.cmdInfo, input);
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.fillSearchForConfigInput(roles.cmdInfo);
            const value = await settingsConfigPage.getRoleContentValue(roles.cmdInfo);
            expect(value === input).toBe(expected);
            if (index === Data.CMDData.length - 1) {
                await apiCall.modifySettingsRole(roles.cmdInfo, "yes");
            }
        });
    });

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.maxInfoQueries} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            await apiCall.modifySettingsRole(roles.maxInfoQueries, input);
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.fillSearchForConfigInput(roles.maxInfoQueries);
            const value = await settingsConfigPage.getRoleContentValue(roles.maxInfoQueries);
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.maxInfoQueries, "1000");
            }
        });
    });

    test(`@admin Modify maxQueuedQueries via UI validation via API: Input value: ${Data.roleModificationData[0].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.modifyRoleValue(roles.maxQueuedQueries, Data.roleModificationData[0].input);
        await settingsConfigPage.isUndoBtnInToastMsg();
        await settingsConfigPage.waitForPageIdle();
        const value = String((await apiCall.getSettingsRoleValue(roles.maxQueuedQueries)).config[1]);
        expect(value === Data.roleModificationData[0].input).toBe(true);
        await apiCall.modifySettingsRole(roles.maxQueuedQueries, "25");
    });

    test(`@admin Modify TimeOut via UI validation via API: Input value: ${Data.roleModificationData[1].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.modifyRoleValue(roles.TimeOut, Data.roleModificationData[1].input);
        await settingsConfigPage.isUndoBtnInToastMsg();
        await settingsConfigPage.waitForPageIdle();
        const value = String((await apiCall.getSettingsRoleValue(roles.TimeOut)).config[1]);
        expect(value === Data.roleModificationData[1].input).toBe(true);
        await apiCall.modifySettingsRole(roles.TimeOut, "1000");
    });

    test(`@admin Modify maxTimeOut via UI validation via API: Input value: ${Data.roleModificationData[2].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.modifyRoleValue(roles.maxTimeOut, Data.roleModificationData[2].input);
        await settingsConfigPage.isUndoBtnInToastMsg();
        await settingsConfigPage.waitForPageIdle();
        const value = String((await apiCall.getSettingsRoleValue(roles.maxTimeOut)).config[1]);
        expect(value === Data.roleModificationData[2].input).toBe(true);
        await apiCall.modifySettingsRole(roles.maxTimeOut, "0");
    });

    test(`@admin Modify defaultTimeOut via UI validation via API: Input value: ${Data.roleModificationData[3].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.modifyRoleValue(roles.defaultTimeOut, Data.roleModificationData[3].input);
        await settingsConfigPage.isUndoBtnInToastMsg();
        await settingsConfigPage.waitForPageIdle();
        const value = String((await apiCall.getSettingsRoleValue(roles.defaultTimeOut)).config[1]);
        expect(value === Data.roleModificationData[3].input).toBe(true);
        await apiCall.modifySettingsRole(roles.defaultTimeOut, "0");
    });

    test(`@admin Modify resultSetSize via UI validation via API: Input value: ${Data.roleModificationData[4].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.modifyRoleValue(roles.resultSetSize, Data.roleModificationData[4].input);
        await settingsConfigPage.isUndoBtnInToastMsg();
        await settingsConfigPage.waitForPageIdle();
        const value = String((await apiCall.getSettingsRoleValue(roles.resultSetSize)).config[1]);
        expect(value === Data.roleModificationData[4].input).toBe(true);
        await apiCall.modifySettingsRole(roles.resultSetSize, "10000");
    });

    test(`@admin Modify queryMemCapacity via UI validation via API: Input value: ${Data.roleModificationData[5].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.modifyRoleValue(roles.queryMemCapacity, Data.roleModificationData[5].input);
        await settingsConfigPage.isUndoBtnInToastMsg();
        await settingsConfigPage.waitForPageIdle();
        const value = String((await apiCall.getSettingsRoleValue(roles.queryMemCapacity)).config[1]);
        expect(value === Data.roleModificationData[5].input).toBe(true);
        await apiCall.modifySettingsRole(roles.queryMemCapacity, "0");
    });

    test(`@admin Modify vKeyMaxEntityCount via UI validation via API: Input value: ${Data.roleModificationData[6].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.modifyRoleValue(roles.vKeyMaxEntityCount, Data.roleModificationData[6].input);
        await settingsConfigPage.isUndoBtnInToastMsg();
        await settingsConfigPage.waitForPageIdle();
        const value = String((await apiCall.getSettingsRoleValue(roles.vKeyMaxEntityCount)).config[1]);
        expect(value === Data.roleModificationData[6].input).toBe(true);
        await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, "100000");
    });

    test(`@admin Modify cmdInfo via UI validation via API: Input value: ${Data.roleModificationData[7].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.modifyRoleValue(roles.cmdInfo, Data.roleModificationData[7].input);
        await settingsConfigPage.isUndoBtnInToastMsg();
        await settingsConfigPage.waitForPageIdle();
        const value = String((await apiCall.getSettingsRoleValue(roles.cmdInfo)).config[1]);
        let modifiedValue;
        if (value === '1') {
            modifiedValue = 'yes';
        } else if (value === '0') {
            modifiedValue = 'no';
        } else {
            modifiedValue = value;
        }
        expect(modifiedValue === Data.roleModificationData[7].input).toBe(true);
        await apiCall.modifySettingsRole(roles.cmdInfo, "yes");
    });

    test(`@admin Modify maxInfoQueries via UI validation via API: Input value: ${Data.roleModificationData[8].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        await settingsConfigPage.navigateToDBConfigurationTab();
        await settingsConfigPage.modifyRoleValue(roles.maxInfoQueries, Data.roleModificationData[8].input);
        await settingsConfigPage.isUndoBtnInToastMsg();
        await settingsConfigPage.waitForPageIdle();
        const value = String((await apiCall.getSettingsRoleValue(roles.maxInfoQueries)).config[1]);
        expect(value).toBe(Data.roleModificationData[8].input);
        await apiCall.modifySettingsRole(roles.maxInfoQueries, "1000");
    });

    // ===== EFFECTS_THRESHOLD tests =====

    Data.inputDataNoZeroCheck.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.effectsThreshold} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const originalValue = String((await apiCall.getSettingsRoleValue(roles.effectsThreshold)).config[1]);
            try {
                await apiCall.modifySettingsRole(roles.effectsThreshold, input);
                const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
                await settingsConfigPage.navigateToDBConfigurationTab();
                await settingsConfigPage.fillSearchForConfigInput(roles.effectsThreshold);
                const value = await settingsConfigPage.getRoleContentValue(roles.effectsThreshold);
                expect(value === input).toBe(expected);
            } finally {
                await apiCall.modifySettingsRole(roles.effectsThreshold, originalValue);
            }
        });
    });

    // ===== DELTA_MAX_PENDING_CHANGES tests =====

    Data.inputDataNoZeroCheck.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.deltaMaxPendingChanges} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const originalValue = String((await apiCall.getSettingsRoleValue(roles.deltaMaxPendingChanges)).config[1]);
            try {
                await apiCall.modifySettingsRole(roles.deltaMaxPendingChanges, input);
                const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
                await settingsConfigPage.navigateToDBConfigurationTab();
                await settingsConfigPage.fillSearchForConfigInput(roles.deltaMaxPendingChanges);
                const value = await settingsConfigPage.getRoleContentValue(roles.deltaMaxPendingChanges);
                expect(value === input).toBe(expected);
            } finally {
                await apiCall.modifySettingsRole(roles.deltaMaxPendingChanges, originalValue);
            }
        });
    });

    // ===== JS_HEAP_SIZE tests =====

    Data.jsMemoryData.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.jsHeapSize} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const originalValue = String((await apiCall.getSettingsRoleValue(roles.jsHeapSize)).config[1]);
            try {
                await apiCall.modifySettingsRole(roles.jsHeapSize, input);
                const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
                await settingsConfigPage.navigateToDBConfigurationTab();
                await settingsConfigPage.fillSearchForConfigInput(roles.jsHeapSize);
                const value = await settingsConfigPage.getRoleContentValue(roles.jsHeapSize);
                expect(value === input).toBe(expected);
            } finally {
                await apiCall.modifySettingsRole(roles.jsHeapSize, originalValue);
            }
        });
    });

    // ===== JS_STACK_SIZE tests =====

    Data.jsMemoryData.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.jsStackSize} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const originalValue = String((await apiCall.getSettingsRoleValue(roles.jsStackSize)).config[1]);
            try {
                await apiCall.modifySettingsRole(roles.jsStackSize, input);
                const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
                await settingsConfigPage.navigateToDBConfigurationTab();
                await settingsConfigPage.fillSearchForConfigInput(roles.jsStackSize);
                const value = await settingsConfigPage.getRoleContentValue(roles.jsStackSize);
                expect(value === input).toBe(expected);
            } finally {
                await apiCall.modifySettingsRole(roles.jsStackSize, originalValue);
            }
        });
    });

    // ===== UI modification tests for new configs =====

    test(`@admin Modify effectsThreshold via UI validation via API: Input value: ${Data.roleModificationData[9].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        try {
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.modifyRoleValue(roles.effectsThreshold, Data.roleModificationData[9].input);
            await settingsConfigPage.isUndoBtnInToastMsg();
            await settingsConfigPage.waitForPageIdle();
            const value = String((await apiCall.getSettingsRoleValue(roles.effectsThreshold)).config[1]);
            expect(value).toBe(Data.roleModificationData[9].input);
        } finally {
            await apiCall.modifySettingsRole(roles.effectsThreshold, "100");
        }
    });

    test(`@admin Modify deltaMaxPendingChanges via UI validation via API: Input value: ${Data.roleModificationData[10].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        try {
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.modifyRoleValue(roles.deltaMaxPendingChanges, Data.roleModificationData[10].input);
            await settingsConfigPage.isUndoBtnInToastMsg();
            await settingsConfigPage.waitForPageIdle();
            const value = String((await apiCall.getSettingsRoleValue(roles.deltaMaxPendingChanges)).config[1]);
            expect(value).toBe(Data.roleModificationData[10].input);
        } finally {
            await apiCall.modifySettingsRole(roles.deltaMaxPendingChanges, "10000");
        }
    });

    test(`@admin Modify jsHeapSize via UI validation via API: Input value: ${Data.roleModificationData[11].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        try {
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.modifyRoleValue(roles.jsHeapSize, Data.roleModificationData[11].input);
            await settingsConfigPage.isUndoBtnInToastMsg();
            await settingsConfigPage.waitForPageIdle();
            const value = String((await apiCall.getSettingsRoleValue(roles.jsHeapSize)).config[1]);
            expect(value).toBe(Data.roleModificationData[11].input);
        } finally {
            await apiCall.modifySettingsRole(roles.jsHeapSize, "1048576");
        }
    });

    test(`@admin Modify jsStackSize via UI validation via API: Input value: ${Data.roleModificationData[12].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
        try {
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.modifyRoleValue(roles.jsStackSize, Data.roleModificationData[12].input);
            await settingsConfigPage.isUndoBtnInToastMsg();
            await settingsConfigPage.waitForPageIdle();
            const value = String((await apiCall.getSettingsRoleValue(roles.jsStackSize)).config[1]);
            expect(value).toBe(Data.roleModificationData[12].input);
        } finally {
            await apiCall.modifySettingsRole(roles.jsStackSize, "1048576");
        }
    });

    Data.searchElements.forEach(({ input, expected }) => {
        test(`@admin Validate role filtering via search input: (${input})`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl);
            await settingsConfigPage.navigateToDBConfigurationTab();
            await settingsConfigPage.searchForElement(input);
            expect(await settingsConfigPage.getTableRolesCount()).toBe(expected);
        });
    });

});