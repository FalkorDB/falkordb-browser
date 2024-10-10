import { expect, test } from "@playwright/test";
import urls  from '../config/urls.json'
import { roles } from '../config/roles.json'
import  BrowserWrapper  from "../infra/ui/browserWrapper";
import SettingsConfigPage from "../logic/POM/settingsConfigPage";
import { ApiCalls } from "../logic/api/apiCalls";
import Data from '../config/settingsConfigData.json';
 
test.describe('Settings Tests', () => {
    let browser : BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })
    
    Data.inputDataRejectsZero.forEach(({ input, description, expected }) => {
        test(`@admin Modify ${roles.maxQueuedQueries} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.maxQueuedQueries, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.maxQueuedQueries)      
            expect(value === input).toBe(expected)
        });
    })
    
    Data.maxTimeOut.forEach(({ input, description, expected }) => {
        test(`@admin Modify ${roles.maxTimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.maxTimeOut, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.maxTimeOut)  
            expect(value === input).toBe(expected)
        });
    })

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }) => {
        test(`@admin Modify ${roles.defaultTimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.defaultTimeOut, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.defaultTimeOut)    
            expect(value === input).toBe(expected)
        });
    })

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }) => {
        test(`@admin Modify ${roles.resultSetSize} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.resultSetSize, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.resultSetSize)      
            expect(value === input).toBe(expected)
        });
    })

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }) => {
        test(`@admin Modify ${roles.queryMemCapacity} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.queryMemCapacity, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.queryMemCapacity)
            await apiCall.modifySettingsRole(roles.queryMemCapacity, "0")//update to default values    
            expect(value === input).toBe(expected)
        });
    })

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }) => {
        test(`@admin Modify ${roles.vKeyMaxEntityCount} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.vKeyMaxEntityCount)      
            expect(value === input).toBe(expected)
        });
    })

    Data.CMDData.forEach(({ input, description, expected }) => {
        test(`@admin Modify ${roles.cmdInfo} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.cmdInfo, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.cmdInfo)      
            expect(value === input).toBe(expected)
        });
    })

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }) => {
        test(`@admin Modify ${roles.maxInfoQueries} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await apiCall.modifySettingsRole(roles.maxInfoQueries, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.maxInfoQueries)      
            expect(value === input).toBe(expected)
        });
    })

    Data.roleModificationData.forEach(({ role, input, description, expected }) => {
        test(`@admin Modify ${role} via UI validation via API: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            await settingsConfigPage.modifyRoleValue(role, input)
            const apiCall = new ApiCalls()
            let value = String((await apiCall.getSettingsRoleValue(role)).config[1]);
            value = value === '1' ? 'yes' : value === '0' ? 'no' : value;
            await apiCall.modifySettingsRole(roles.queryMemCapacity, "0")//update to default values   
            expect(value === input).toBe(expected)
        });
    })

    
})