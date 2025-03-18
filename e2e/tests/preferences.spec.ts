import test, { expect } from "playwright/test";
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import GraphPage from "../logic/POM/graphPage";
import PreferencesPage from "../logic/POM/preferencesPage";
import ApiCalls from "../logic/api/apiCalls";
import roles from '../config/user.json'

test.describe('Preferences Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    roles.userRoles.forEach(role => {
        test(`@${role.role} Add color via UI -> verify color is added via UI`, async () => {
            const graphName = `preferences_${Date.now()}`;
            if (role.role !== "readonly") {
                await apicalls.addGraph(graphName);
            } else {
                await apicalls.addGraph(graphName, "admin");
            }
            const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
            await preferencesPage.selectExistingGraph(graphName, role.role === "readonly" ? "readonly" : undefined);
            const colorsCount = await preferencesPage.getColorsCount();
            await preferencesPage.addColor();
            const newColorsCount = await preferencesPage.getColorsCount();
            expect(newColorsCount).toBe(colorsCount + 1);
            await apicalls.removeGraph(graphName);
            if (role.role !== "readonly") {
                await apicalls.removeGraph(graphName);
            } else {
                await apicalls.removeGraph(graphName, "admin");
            } 
        })
    })

    roles.userRoles.forEach(role => {
        test(`@${role.role} remove color via UI -> verify color is removed via UI`, async () => {
            const graphName = `preferences_${Date.now()}`;
            if (role.role !== "readonly") {
                await apicalls.addGraph(graphName);
            } else {
                await apicalls.addGraph(graphName, "admin");
            }
            const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
            await preferencesPage.selectExistingGraph(graphName, role.role === "readonly" ? "readonly": undefined);
            await preferencesPage.addColor();
            const colorsCount = await preferencesPage.getColorsCount();
            await preferencesPage.removeColor();
            const removedColorsCount = await preferencesPage.getColorsCount();
            expect(removedColorsCount).toBe(colorsCount - 1);
            if (role.role !== "readonly") {
                await apicalls.removeGraph(graphName);
            } else {
                await apicalls.removeGraph(graphName, "admin");
            }
        })
    })

    roles.userRoles.forEach(role => {
        test(`@${role.role} Modify color via UI -> verify color is modified via UI`, async () => {
            const graphName = `preferences_${Date.now()}`;
            if (role.role !== "readonly") {
                await apicalls.addGraph(graphName);
            } else {
                await apicalls.addGraph(graphName, "admin");
            }
            const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
            await preferencesPage.selectExistingGraph(graphName, role.role === "readonly" ? "readonly": undefined);
            const color = await preferencesPage.getColorText();
            await preferencesPage.modifyColor();
            const modifiedColor = await preferencesPage.getColorText();
            expect(modifiedColor).not.toBe(color);
            await apicalls.removeGraph(graphName);
            if (role.role !== "readonly") {
                await apicalls.removeGraph(graphName);
            } else {
                await apicalls.removeGraph(graphName, "admin");
            }
        })
    })

    roles.userRoles.forEach(role => {
        test(`@${role.role} Add color via UI -> reset colors via UI -> verify color is reset via UI`, async () => {
            const graphName = `preferences_${Date.now()}`;
            if (role.role !== "readonly") {
                await apicalls.addGraph(graphName);
            } else {
                await apicalls.addGraph(graphName, "admin");
            }
            const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
            await preferencesPage.selectExistingGraph(graphName, role.role === "readonly" ? "readonly": undefined);
            const colorsCount = await preferencesPage.getColorsCount();
            await preferencesPage.addColor();
            await preferencesPage.resetColors();
            const resetColorsCount = await preferencesPage.getColorsCount();
            expect(resetColorsCount).toBe(colorsCount);
            await apicalls.removeGraph(graphName);
            if (role.role !== "readonly") {
                await apicalls.removeGraph(graphName);
            } else {
                await apicalls.removeGraph(graphName, "admin");
            }
        })
    })

})