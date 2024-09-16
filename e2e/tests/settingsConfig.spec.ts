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

    const inputData1 = [
        { input: 'aa', description: "invalid input - character", expected: false},
        { input: "-3", description: "invalid input - negative number", expected: false},
        { input: "0", description: "invalid input - zero value", expected: false},
        { input: "00-1", description: "invalid input", expected: false},
        { input: "10s", description: "invalid input", expected: false},
        { input: "12", description: "valid input", expected: true},
    ];

    const inputData2 = [
        { input: 'aa', description: "invalid input - character", expected: false},
        { input: "-3", description: "invalid input - negative number", expected: false},
        { input: "00-1", description: "invalid input", expected: false},
        { input: "10s", description: "invalid input", expected: false},
        { input: "0", description: "valid input - zero value", expected: true},
        { input: "12", description: "valid input", expected: true},
    ];

    const CMDData = [
        { input: 'aa', description: "invalid input - character", expected: false},
        { input: "-3", description: "invalid input - negative number", expected: false},
        { input: "00-1", description: "invalid input", expected: false},
        { input: "10s", description: "invalid input", expected: false},
        { input: "0", description: "valid input - zero value", expected: true},
        { input: "1", description: "valid input", expected: true},
    ];

    inputData1.forEach(({ input, description, expected }) => {
        test(`Modify ${roles.maxQueuedQueries} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.maxQueuedQueries, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.maxQueuedQueries)      
            expect(value === input).toBe(expected)
        });
    })

    inputData2.forEach(({ input, description, expected }) => {
        test(`Modify ${roles.TimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.TimeOut, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.TimeOut)      
            expect(value === input).toBe(expected)
        });
    })
    
    inputData2.forEach(({ input, description, expected }) => {
        test(`Modify ${roles.maxTimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.maxTimeOut, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.maxTimeOut)      
            expect(value === input).toBe(expected)
        });
    })

    inputData2.forEach(({ input, description, expected }) => {
        test(`Modify ${roles.defaultTimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.defaultTimeOut, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.defaultTimeOut)      
            expect(value === input).toBe(expected)
        });
    })

    inputData2.forEach(({ input, description, expected }) => {
        test(`Modify ${roles.resultSetSize} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.resultSetSize, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.resultSetSize)      
            expect(value === input).toBe(expected)
        });
    })

    inputData2.forEach(({ input, description, expected }) => {
        test(`Modify ${roles.queryMemCapacity} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.queryMemCapacity, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.queryMemCapacity)      
            expect(value === input).toBe(expected)
        });
    })

    inputData2.forEach(({ input, description, expected }) => {
        test(`Modify ${roles.vKeyMaxEntityCount} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.vKeyMaxEntityCount)      
            expect(value === input).toBe(expected)
        });
    })

    CMDData.forEach(({ input, description, expected }) => {
        test(`Modify ${roles.cmdInfo} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.cmdInfo, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.cmdInfo)      
            expect(value === input).toBe(expected)
        });
    })

    inputData2.forEach(({ input, description, expected }) => {
        test(`Modify ${roles.maxInfoQueries} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.maxInfoQueries, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.maxInfoQueries)      
            expect(value === input).toBe(expected)
        });
    })
})