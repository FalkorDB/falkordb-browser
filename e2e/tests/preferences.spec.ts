import test, { expect } from "playwright/test";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import PreferencesView from "../logic/POM/preferencesView";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

test.skip('Preferences Tests', () => {
    let browser: BrowserWrapper;
    let apicalls: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apicalls = new ApiCalls();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test(`@admin remove color via UI -> verify color is removed via UI`, async () => {
        const graphName = getRandomString('preferences');
        await apicalls.addGraph(graphName);
        const preferencesPage = await browser.createNewPage(PreferencesView, urls.graphUrl);
        await preferencesPage.selectGraphByName(graphName);
        await preferencesPage.addColor();
        const colorsCount = await preferencesPage.getColorsCount();
        await preferencesPage.removeColor();
        const removedColorsCount = await preferencesPage.getColorsCount();
        expect(removedColorsCount).toBe(colorsCount - 1);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Modify color via UI -> verify color is modified via UI`, async () => {
        const graphName = getRandomString('preferences');
        await apicalls.addGraph(graphName);
        const preferencesPage = await browser.createNewPage(PreferencesView, urls.graphUrl);
        await preferencesPage.selectGraphByName(graphName);
        const color = await preferencesPage.getColorText();
        await preferencesPage.modifyColor();
        const modifiedColor = await preferencesPage.getColorText();
        expect(modifiedColor).not.toBe(color);
        await apicalls.removeGraph(graphName);
    });

    test(`@admin Add color via UI -> reset colors via UI -> verify color is reset via UI`, async () => {
        const graphName = getRandomString('preferences');
        await apicalls.addGraph(graphName);
        const preferencesPage = await browser.createNewPage(PreferencesView, urls.graphUrl);
        await preferencesPage.selectGraphByName(graphName);
        const colorsCount = await preferencesPage.getColorsCount();
        await preferencesPage.addColor();
        await preferencesPage.resetColors();
        const resetColorsCount = await preferencesPage.getColorsCount();
        expect(resetColorsCount).toBe(colorsCount);
        await apicalls.removeGraph(graphName);
    });

});