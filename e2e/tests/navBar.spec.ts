import { expect, test } from "@playwright/test"
import urls  from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper"
import NavBarComponent from '../logic/POM/navBarComponent'

test.describe('NavBar Tests', () => {
    let browser : BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })


    test("Verify clicking on FalkorDB logo redirects to specified URL", async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
        
        const context = browser.getContext()!;
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            navBar.clickOnFalkorLogo(),
        ]);

        await newPage.waitForLoadState('domcontentloaded');
        const newUrl = newPage.url();

        expect(newUrl).toBe("https://www.falkordb.com/")
       
    })
    
    test("Verify clicking on Graphs button redirects to specified URL", async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
        
        const context = browser.getContext()!;
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            navBar.clickOnGraphsButton(),
        ]);

        await newPage.waitForLoadState('domcontentloaded');
        const newUrl = newPage.url();

        expect(newUrl).toBe(urls.graphUrl)
       
    })
    
    test("Verify clicking on Schemas button redirects to specified URL", async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
        
        const context = browser.getContext()!;
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            navBar.clickOnSchemasButton(),
        ]);

        await newPage.waitForLoadState('domcontentloaded');
        const newUrl = newPage.url();

        expect(newUrl).toBe(urls.schemaUrl)
       
    })

    test("Verify clicking on help -> Documentation redirects to specified URL", async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
        
        const context = browser.getContext()!;
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            navBar.clickOnHelpBtn(),
            navBar.clickOnDocumentationBtn(),
        ]);

        await newPage.waitForLoadState('domcontentloaded');
        const newUrl = newPage.url();
        
        expect(newUrl).toBe("https://docs.falkordb.com/")
       
    })

    test("Verify clicking on help -> Support redirects to specified URL", async () => {
        const navBar = await browser.createNewPage(NavBarComponent, urls.graphUrl)
        
        const context = browser.getContext()!;
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            navBar.clickOnHelpBtn(),
            navBar.clickOnSupportBtn(),
        ]);

        await newPage.waitForLoadState('domcontentloaded');
        const newUrl = newPage.url();
        
        expect(newUrl).toBe("https://www.falkordb.com/contact-us/")
       
    })

})