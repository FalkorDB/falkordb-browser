import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import SettingsTabsPage from "../logic/POM/settingsTabsPage";

test.describe("@admin Settings tab URL params", () => {
    let browser: BrowserWrapper;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test("Clicking a tab updates the URL with ?tab= param", async () => {
        const settingsTabs = await browser.createNewPage(SettingsTabsPage, urls.settingsUrl);

        // Default tab is Browser — URL should have no tab param
        expect(settingsTabs.getCurrentURL()).not.toContain("tab=");
        expect(await settingsTabs.getCurrentTabText()).toBe("> Browser");

        // Click Tokens tab
        await settingsTabs.clickTokensTab();
        expect(settingsTabs.getCurrentURL()).toContain("tab=Tokens");
        expect(await settingsTabs.getCurrentTabText()).toBe("> Tokens");

        // Click Configurations tab (admin only)
        await settingsTabs.clickConfigurationsTab();
        expect(settingsTabs.getCurrentURL()).toContain("tab=Configurations");
        expect(await settingsTabs.getCurrentTabText()).toBe("> Configurations");

        // Click Users tab (admin only)
        await settingsTabs.clickUsersTab();
        expect(settingsTabs.getCurrentURL()).toContain("tab=Users");
        expect(await settingsTabs.getCurrentTabText()).toBe("> Users");

        // Click back to Browser — tab param should be removed
        await settingsTabs.clickBrowserTab();
        expect(settingsTabs.getCurrentURL()).not.toContain("tab=");
        expect(await settingsTabs.getCurrentTabText()).toBe("> Browser");
    });

    test("Navigating directly to ?tab=Tokens opens the Tokens tab", async () => {
        const settingsTabs = await browser.createNewPage(SettingsTabsPage, `${urls.settingsUrl}?tab=Tokens`);

        expect(await settingsTabs.getCurrentTabText()).toBe("> Tokens");
        expect(settingsTabs.getCurrentURL()).toContain("tab=Tokens");
    });

    test("Navigating directly to ?tab=Configurations opens the Configurations tab", async () => {
        const settingsTabs = await browser.createNewPage(SettingsTabsPage, `${urls.settingsUrl}?tab=Configurations`);

        expect(await settingsTabs.getCurrentTabText()).toBe("> Configurations");
        expect(settingsTabs.getCurrentURL()).toContain("tab=Configurations");
    });

    test("Navigating directly to ?tab=Users opens the Users tab", async () => {
        const settingsTabs = await browser.createNewPage(SettingsTabsPage, `${urls.settingsUrl}?tab=Users`);

        expect(await settingsTabs.getCurrentTabText()).toBe("> Users");
        expect(settingsTabs.getCurrentURL()).toContain("tab=Users");
    });

    test("Navigating with an invalid tab param defaults to Browser", async () => {
        const settingsTabs = await browser.createNewPage(SettingsTabsPage, `${urls.settingsUrl}?tab=InvalidTab`);

        expect(await settingsTabs.getCurrentTabText()).toBe("> Browser");
        expect(settingsTabs.getCurrentURL()).not.toContain("tab=InvalidTab");
    });

    test("Tab persists after page refresh", async () => {
        const settingsTabs = await browser.createNewPage(SettingsTabsPage, urls.settingsUrl);

        // Switch to Tokens tab
        await settingsTabs.clickTokensTab();
        expect(settingsTabs.getCurrentURL()).toContain("tab=Tokens");

        // Refresh page
        await settingsTabs.reload();
        expect(await settingsTabs.getCurrentTabText()).toBe("> Tokens");
        expect(settingsTabs.getCurrentURL()).toContain("tab=Tokens");
    });

    test("Tab is restored after navigating away and back", async () => {
        const settingsTabs = await browser.createNewPage(SettingsTabsPage, `${urls.settingsUrl}?tab=Tokens`);

        expect(await settingsTabs.getCurrentTabText()).toBe("> Tokens");

        // Navigate away to graph page then back with tab param
        await settingsTabs.navigateTo(urls.graphUrl);
        await settingsTabs.navigateTo(`${urls.settingsUrl}?tab=Tokens`);
        expect(await settingsTabs.getCurrentTabText()).toBe("> Tokens");
    });
});
