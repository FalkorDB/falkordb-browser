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

    Data.inputDataAcceptsZero.forEach(({ input, description, expected }, index) => {
        test(`@admin Modify ${roles.TimeOut} via API validation via UI: Input value: ${input} description: ${description}`, async () => {
            const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
            const apiCall = new ApiCalls()
            await new Promise(resolve => { setTimeout(resolve, 1000) });
            await apiCall.modifySettingsRole(roles.TimeOut, input)
            await settingsConfigPage.refreshPage()
            const value = await settingsConfigPage.getRoleContentValue(roles.TimeOut)
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.TimeOut, "1000")
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
                await apiCall.modifySettingsRole(roles.maxInfoQueries, "1000");
            }
        });
    })

    test(`@admin Modify maxQueuedQueries via UI validation via API: Input value: ${Data.roleModificationData[0].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.maxQueuedQueries, Data.roleModificationData[0].input)
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.maxQueuedQueries)).config[1]);
        expect(value === Data.roleModificationData[0].input).toBe(true);
        await apiCall.modifySettingsRole(roles.maxQueuedQueries, "25")
    });

    test(`@admin Modify TimeOut via UI validation via API: Input value: ${Data.roleModificationData[1].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.TimeOut, Data.roleModificationData[1].input)
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.TimeOut)).config[1]);
        expect(value === Data.roleModificationData[1].input).toBe(true);
        await apiCall.modifySettingsRole(roles.TimeOut, "1000")
    });

    test(`@admin Modify maxTimeOut via UI validation via API: Input value: ${Data.roleModificationData[2].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.maxTimeOut, Data.roleModificationData[2].input)
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.maxTimeOut)).config[1]);
        expect(value === Data.roleModificationData[2].input).toBe(true);
        await apiCall.modifySettingsRole(roles.maxTimeOut, "0")
    });

    test(`@admin Modify defaultTimeOut via UI validation via API: Input value: ${Data.roleModificationData[3].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.defaultTimeOut, Data.roleModificationData[3].input)
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.defaultTimeOut)).config[1]);
        expect(value === Data.roleModificationData[3].input).toBe(true);
        await apiCall.modifySettingsRole(roles.defaultTimeOut, "0")
    });

    test(`@admin Modify resultSetSize via UI validation via API: Input value: ${Data.roleModificationData[4].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.resultSetSize, Data.roleModificationData[4].input)
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.resultSetSize)).config[1]);
        expect(value === Data.roleModificationData[4].input).toBe(true);
        await apiCall.modifySettingsRole(roles.resultSetSize, "10000")
    });

    test(`@admin Modify queryMemCapacity via UI validation via API: Input value: ${Data.roleModificationData[5].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.queryMemCapacity, Data.roleModificationData[5].input)
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.queryMemCapacity)).config[1]);
        expect(value === Data.roleModificationData[5].input).toBe(true);
        await apiCall.modifySettingsRole(roles.queryMemCapacity, "0")
    });

    test(`@admin Modify vKeyMaxEntityCount via UI validation via API: Input value: ${Data.roleModificationData[6].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.vKeyMaxEntityCount, Data.roleModificationData[6].input)
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.vKeyMaxEntityCount)).config[1]);
        expect(value === Data.roleModificationData[6].input).toBe(true);
        await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, "100000")
    });

    test(`@admin Modify cmdInfo via UI validation via API: Input value: ${Data.roleModificationData[7].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.cmdInfo, Data.roleModificationData[7].input)
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.cmdInfo)).config[1]);
        value = value === '1' ? 'yes' : value === '0' ? 'no' : value;
        expect(value === Data.roleModificationData[7].input).toBe(true);
        await apiCall.modifySettingsRole(roles.cmdInfo, "yes")
    });

    test(`@admin Modify maxInfoQueries via UI validation via API: Input value: ${Data.roleModificationData[8].input}`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.maxInfoQueries, Data.roleModificationData[8].input)
        await settingsConfigPage.refreshPage();
        await settingsConfigPage.getRoleContentValue(roles.maxInfoQueries);
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.maxInfoQueries)).config[1]);
        expect(value).toBe(Data.roleModificationData[8].input);
        await apiCall.modifySettingsRole(roles.maxInfoQueries, "1000");
    });

})