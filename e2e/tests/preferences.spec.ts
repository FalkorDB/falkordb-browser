import test, { expect } from "playwright/test";
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import PreferencesView from "../logic/POM/preferencesView";
import ApiCalls from "../logic/api/apiCalls";

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

    test(`@readonly remove color via UI -> verify color is removed via UI`, async () => {
        const graphName = `preferences_${Date.now()}`;
        await apicalls.addGraph(graphName, "admin");
        const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
        await preferencesPage.selectExistingGraph(graphName, "readonly");
        await preferencesPage.addColor();
        const colorsCount = await preferencesPage.getColorsCount();
        await preferencesPage.removeColor();
        const removedColorsCount = await preferencesPage.getColorsCount();
        expect(removedColorsCount).toBe(colorsCount - 1);
        await apicalls.removeGraph(graphName, "admin");
    })

    test(`@readonly Modify color via UI -> verify color is modified via UI`, async () => {
        const graphName = `preferences_${Date.now()}`;
        await apicalls.addGraph(graphName, "admin");
        const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
        await preferencesPage.selectExistingGraph(graphName, "readonly");
        const color = await preferencesPage.getColorText();
        await preferencesPage.modifyColor();
        const modifiedColor = await preferencesPage.getColorText();
        expect(modifiedColor).not.toBe(color);
        await apicalls.removeGraph(graphName, "admin");
    })

    test(`@readonly Add color via UI -> reset colors via UI -> verify color is reset via UI`, async () => {
        const graphName = `preferences_${Date.now()}`;
        await apicalls.addGraph(graphName, "admin");
        const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
        await preferencesPage.selectExistingGraph(graphName, "readonly");
        const colorsCount = await preferencesPage.getColorsCount();
        await preferencesPage.addColor();
        await preferencesPage.resetColors();
        const resetColorsCount = await preferencesPage.getColorsCount();
        expect(resetColorsCount).toBe(colorsCount);
        await apicalls.removeGraph(graphName, "admin");
    })

})