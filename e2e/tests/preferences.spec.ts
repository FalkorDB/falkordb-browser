import test, { expect } from "playwright/test";
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import GraphPage from "../logic/POM/graphPage";
import PreferencesPage from "../logic/POM/preferencesPage";

test.describe('Preferences Tests', () => {
    let browser: BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
        const graphPage = await browser.createNewPage(GraphPage, urls.graphUrl);
        await graphPage.removeAllGraphs();
        await graphPage.addGraph("test");
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test('@admin Add color via UI -> verify color is added via UI', async () => {
        const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
        const colorsCount = await preferencesPage.getColorsCount();
        await preferencesPage.addColor();
        const newColorsCount = await preferencesPage.getColorsCount();
        expect(newColorsCount).toBe(colorsCount + 1);
    })

    test('@admin Add color via UI -> verify color is added via UI -> remove color via UI -> verify color is removed via UI', async () => {
        const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
        const colorsCount = await preferencesPage.getColorsCount();
        await preferencesPage.addColor();
        const addedColorsCount = await preferencesPage.getColorsCount();
        expect(addedColorsCount).toBe(colorsCount + 1);
        await preferencesPage.removeColor();
        const removedColorsCount = await preferencesPage.getColorsCount();
        expect(removedColorsCount).toBe(colorsCount);
    })

    test('@admin Modify color via UI -> verify color is modified via UI', async () => {
        const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
        const color = await preferencesPage.getColor();
        await preferencesPage.modifyColor();
        const modifiedColor = await preferencesPage.getColor();
        expect(modifiedColor).not.toBe(color);
    })

    test('@admin Add color via UI -> verify color is added via UI -> reset colors via UI -> verify color is reset via UI', async () => {
        const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
        const colorsCount = await preferencesPage.getColorsCount();
        await preferencesPage.addColor();
        const addedColorsCount = await preferencesPage.getColorsCount();
        expect(addedColorsCount).toBe(colorsCount + 1);
        await preferencesPage.resetColors();
        const resetColorsCount = await preferencesPage.getColorsCount();
        expect(resetColorsCount).toBe(colorsCount);
    })

    test('@admin Open preferences view via UI -> verify preferences view is open via UI', async () => {
        const preferencesPage = await browser.createNewPage(PreferencesPage, urls.graphUrl);
        await preferencesPage.openPreferencesView();
        const isPreferencesViewOpen = await preferencesPage.isPreferencesViewOpen();
        expect(isPreferencesViewOpen).toBe(true);
    })
})