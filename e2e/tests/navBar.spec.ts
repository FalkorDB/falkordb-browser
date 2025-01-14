import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import NavBarComponent from "../logic/POM/navBarComponent";

const roles = [{ name: "admin" }, { name: "readwrite" }, { name: "readonly" }];

test.describe(`Navbar tests`, () => {
    let browser: BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
    });

    test.afterAll(async () => {
        await browser.closeBrowser();
    });

    roles.forEach((role) => {
        test(`@${role.name} Verify clicking on FalkorDB logo redirects to specified URL`, async () => {
            const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
            const page = await navBar.clickOnFalkor()
            expect(page.url()).toBe("https://www.falkordb.com/")

        })
    })

    roles.forEach((role) => {
        test(`@${role.name} Verify clicking on Graphs button redirects to specified URL`, async () => {
            const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
            await navBar.clickOnGraphsButton()
            const newUrl = navBar.getCurrentURL();
            expect(newUrl).toBe(urls.graphUrl)

        })
    })

    roles.forEach((role) => {
        test(`@${role.name} Verify clicking on Schemas button redirects to specified URL`, async () => {
            const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
            await navBar.clickOnSchemasButton()
            const newUrl = navBar.getCurrentURL();
            expect(newUrl).toBe(urls.schemaUrl)

        })
    })

    roles.forEach((role) => {
        test(`@${role.name} Verify clicking on help -> Documentation redirects to specified URL`, async () => {
            const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
            const page = await navBar.clickOnDocumentation()
            expect(page.url()).toBe("https://docs.falkordb.com/")

        })
    })

    roles.forEach((role) => {
        test(`@${role.name} Verify clicking on help -> Support redirects to specified URL`, async () => {
            const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
            const page = await navBar.clickOnSupport()
            expect(page.url()).toBe("https://www.falkordb.com/contact-us/")

        })
    })

    roles.forEach((role) => {
        test(`@${role.name} Verify clicking on Settings redirects to specified URL`, async () => {
            const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
            const result = await navBar.isSettingsButtonEnabled()
            expect(result).toBe(role.name === 'admin')
        })
    })
})
