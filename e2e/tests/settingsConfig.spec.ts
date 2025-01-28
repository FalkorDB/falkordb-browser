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
            console.log(value);
            expect(value === input).toBe(expected);
            if (index === Data.inputDataAcceptsZero.length - 1) {
                await apiCall.modifySettingsRole(roles.maxInfoQueries, "1000");
            }
        });
    })

    test(`@admin Modify maxQueuedQueries via UI validation via API: Input value: 24`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.maxQueuedQueries, "24")
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.maxQueuedQueries)).config[1]);
        expect(value === "24").toBe(true);
        await apiCall.modifySettingsRole(roles.maxQueuedQueries, "25")
    });

    test(`@admin Modify TimeOut via UI validation via API: Input value: 1001`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.TimeOut, "1001")
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.TimeOut)).config[1]);
        expect(value === "1001").toBe(true);
        await apiCall.modifySettingsRole(roles.TimeOut, "1000")
    });

    test(`@admin Modify maxTimeOut via UI validation via API: Input value: 1`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.maxTimeOut, "1")
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.maxTimeOut)).config[1]);
        expect(value === "1").toBe(true);
        await apiCall.modifySettingsRole(roles.maxTimeOut, "0")
    });

    test(`@admin Modify defaultTimeOut via UI validation via API: Input value: 1`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.defaultTimeOut, "1")
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.defaultTimeOut)).config[1]);
        expect(value === "1").toBe(true);
        await apiCall.modifySettingsRole(roles.defaultTimeOut, "0")
    });

    test(`@admin Modify resultSetSize via UI validation via API: Input value: 10001`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.resultSetSize, "10001")
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.resultSetSize)).config[1]);
        expect(value === "10001").toBe(true);
        await apiCall.modifySettingsRole(roles.resultSetSize, "10000")
    });

    test(`@admin Modify queryMemCapacity via UI validation via API: Input value: 1`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.queryMemCapacity, "1")
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.queryMemCapacity)).config[1]);
        expect(value === "1").toBe(true);
        await apiCall.modifySettingsRole(roles.queryMemCapacity, "0")
    });

    test(`@admin Modify vKeyMaxEntityCount via UI validation via API: Input value: 100001`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.vKeyMaxEntityCount, "100001")
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.vKeyMaxEntityCount)).config[1]);
        expect(value === "100001").toBe(true);
        await apiCall.modifySettingsRole(roles.vKeyMaxEntityCount, "100000")
    });

    test(`@admin Modify cmdInfo via UI validation via API: Input value: no`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.cmdInfo, "no")
        const apiCall = new ApiCalls()
        let value = String((await apiCall.getSettingsRoleValue(roles.cmdInfo)).config[1]);
        value = value === '1' ? 'yes' : value === '0' ? 'no' : value;
        expect(value === "no").toBe(true);
        await apiCall.modifySettingsRole(roles.cmdInfo, "yes")
    });

    test(`@admin Modify maxInfoQueries via UI validation via API: Input value: 999`, async () => {
        const settingsConfigPage = await browser.createNewPage(SettingsConfigPage, urls.settingsUrl)
        await settingsConfigPage.modifyRoleValue(roles.maxInfoQueries, "999")
        await settingsConfigPage.refreshPage();
        await new Promise(resolve => { setTimeout(resolve, 3000) });
        const apiCall = new ApiCalls()
        let value;
        for (let i = 0; i < 5; i++) {
            value = String((await apiCall.getSettingsRoleValue(roles.maxInfoQueries)).config[1]);
            if (value === "999") break;
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        console.log(value);
        expect(value).toBe("999");
        await apiCall.modifySettingsRole(roles.maxInfoQueries, "1000");
    });

})