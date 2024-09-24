import { expect, test } from "@playwright/test";
import urls  from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import navBarComponent from '../logic/POM/navBarComponent'

const roles = [
    { name: 'Default', role: 'admin' },
    { name: 'readwriteuser', role: 'readwrite' },
    { name: 'readonlyuser', role: 'readonly' },
];

roles.forEach((role) => {
    test.describe(`@${role.role} SignOut Test`, () => {
        let browser : BrowserWrapper;

        test.beforeAll(async () => {
            browser = new BrowserWrapper();
        })

        test.afterAll(async () => {
            await browser.closeBrowser();
        })

        test("Sign out Test", async () => {
            const navBar = await browser.createNewPage(navBarComponent, urls.graphUrl)
            await navBar.Logout(role.name);
            const newUrl = navBar.getCurrentURL();
            expect(newUrl).toBe(urls.loginUrl)
        })

    })
})