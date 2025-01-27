import { expect, test } from "@playwright/test";
import urls from '../config/urls.json'
import { roles } from '../config/roles.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import SettingsConfigPage from "../logic/POM/settingsConfigPage";
import ApiCalls from "../logic/api/apiCalls";
import Data from '../config/settingsConfigData.json';

test.describe('Settings Tests', () => {
    let browser: BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    Data.inputDataRejectsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.maxQueuedQueries} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await new Promise(resolve => { setTimeout(resolve, 1000) });
            await apiCall.modifySettingsRole(roles.maxQueuedQueries, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.maxQueuedQueries)
            expect(value === input).toBe(expected);
            if (index === Data.inputDataRejectsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.maxQueuedQueries, "25")
            }
        });
    })

    Data.maxTimeOut.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.maxTimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.maxTimeOut, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.maxTimeOut)
            expect(value === input).toBe(expected);
            if (index === Data.maxTimeOut.length - 1) {
                await apiCall.modifySettingsRole(roles.maxTimeOut, "0")
            }
        });
    })

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.defaultTimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.defaultTimeOut, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.defaultTimeOut)
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.defaultTimeOut, "0")
            }
        });
    })

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.resultSetSize} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.resultSetSize, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.resultSetSize)
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.resultSetSize, "10000")
            }
        });
    })

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.queryMemCapacity} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.queryMemCapacity, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.queryMemCapacity) 
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.queryMemCapacity, "0")
            }
        });
    })

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.vKeyMaxEntityCount} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.vKeyMaxEntityCount)
            expect(value === input).toBe(expected)
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, "100000")
            }
        });
    })

    Data.CMDData.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.cmdInfo} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.cmdInfo, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.cmdInfo)
            expect(value === input).toBe(expected)
            if (index === Data.CMDData.length - 1) {
                await apiCall.modifySettingsRole(roles.cmdInfo, "yes")
            }
        });
    })

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.maxInfoQueries} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.maxInfoQueries, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.maxInfoQueries)
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.queryMemCapacity, "1000");
            }
        });
    })

    Data.roleModificationData.forEach(({ role, input, description, expected }, index) => {
        test(`@admin Modify ${role} via UI validation via API: Input value: ${input} description: ${description}`, async () => {
            const apiCall = new ApiCalls()
            console.log("before: ",String((await apiCall.getSettingsRoleValue(role)).config[1]));
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            await settingsConfigPage.modifyRoleValue(role, input)
            let value = String((await apiCall.getSettingsRoleValue(role)).config[1]);
            console.log("after: ",value);
            // Convert numeric values to yes/no for boolean settings
            value = value === '1' ? 'yes' : value === '0' ? 'no' : value;
            expect(value === input).toBe(expected);
            if (index === Data.roleModificationData.length - 1) {
                await apiCall.modifySettingsRole(roles.maxQueuedQueries, "25")
                await apiCall.modifySettingsRole(roles.maxTimeOut, "0")
                await apiCall.modifySettingsRole(roles.defaultTimeOut, "0")
                await apiCall.modifySettingsRole(roles.resultSetSize, "10000")
                await apiCall.modifySettingsRole(roles.queryMemCapacity, "0")
                await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, "100000")
                await apiCall.modifySettingsRole(roles.queryMemCapacity, "0")
                await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, "100000")
                await apiCall.modifySettingsRole(roles.cmdInfo, "yes")
                await apiCall.modifySettingsRole(roles.queryMemCapacity, "1000")
            }
        });
    })


})