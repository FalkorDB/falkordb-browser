import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import NavBarComponent from "../logic/POM/navBarComponent";

const roles = [{ name: "admin" }, { name: "readwrite" }, { name: "readonly" }];

test.describe(`Navbar tests`, () => {
    let browser: BrowserWrapper;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });


    test(`@admin Verify clicking on FalkorDB logo redirects to specified URL`, async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
        const page = await navBar.clickOnFalkor()
        expect(page.url()).toBe(urls.falkorDBWeb)
    })


    test(`@admin Verify clicking on Graphs button redirects to specified URL`, async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
        await navBar.clickOnGraphsButton()
        const newUrl = navBar.getCurrentURL();
        expect(newUrl).toBe(urls.graphUrl)
    })


    test(`@admin Verify clicking on Schemas button redirects to specified URL`, async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
        await navBar.clickOnSchemasButton()
        const newUrl = navBar.getCurrentURL();
        expect(newUrl).toBe(urls.schemaUrl)
    })


    test(`@admin Verify clicking on help -> Documentation redirects to specified URL`, async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
        const page = await navBar.clickOnDocumentation()
        expect(page.url()).toBe(urls.documentationUrl)
    })

    test(`@admin Verify clicking on help -> Support redirects to specified URL`, async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
        const page = await navBar.clickOnSupport()
        expect(page.url()).toBe(urls.supportUrl)
    })

    roles.forEach((role) => {
        test(`@${role.name} Verify clicking on Settings redirects to specified URL`, async () => {
            const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
            const result = await navBar.isSettingsButtonEnabled()
            expect(result).toBe(role.name === 'admin')
        })
    })

    test(`@admin Verify Help -> About Popup opens and closes correctly`, async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl);
        await navBar.clickOnAbout();
        expect(await navBar.isAboutPopUp()).toBe(true);
        await navBar.closePopUp();
        expect(await navBar.isAboutPopUp()).toBe(false);
    })
})
