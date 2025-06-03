import { expect, test } from "@playwright/test";
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import HeaderComponent from '../logic/POM/headerComponent'
import roles from '../config/user.json'

roles.userRoles.forEach((role) => {
    test.describe(`@${role.role} SignOut Test`, () => {
        let browser: BrowserWrapper;

        test.beforeEach(async () => {
            browser = new BrowserWrapper();
        })

        test.afterEach(async () => {
            await browser.closeBrowser();
        })

        test("Sign out Test", async () => {
            const navBar = await browser.createNewPage(HeaderComponent, urls.graphUrl)
            await navBar.Logout();
            const newUrl = navBar.getCurrentURL();
            expect(newUrl).toBe(urls.loginUrl)
        })

    })
})