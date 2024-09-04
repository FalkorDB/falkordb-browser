import { expect, test } from "@playwright/test";
import urls  from '../config/urls.json'
import { roles } from '../config/roles.json'
import  BrowserWrapper  from "../infra/ui/browserWrapper";
import SettingsConfigPage from "../logic/POM/settingsConfigPage";
import { ApiCalls } from "../logic/api/apiCalls";

test.describe('Settings Tests', () => {
    let browser : BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    const inputData = [
        { input: 'aa', description: "invalid input - character", expected: false},
        { input: "-3", description: "invalid input - negative number", expected: false},
        { input: "0", description: "invalid input - zero value", expected: false},
        { input: "12", description: "without lowercase letters", expected: true},

    ];

    inputData.forEach(({ input, description, expected }) => {
        test(`Modify ${roles.maxQueuedQueries} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.maxQueuedQueries, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.maxQueuedQueries)      
            expect(value === input).toBe(expected)
        });
    })
})