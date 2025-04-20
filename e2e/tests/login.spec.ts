import test, { expect } from "@playwright/test"
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import { userRoles, user } from '../config/user.json'

test.describe(`Login tests`, () => {
    let browser: BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
    });

    test.afterAll(async () => {
        await browser.closeBrowser();
    });

    test(`@admin validate login as default user without credentials`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();
        await login.clickOnConnect();
        expect(login.getCurrentURL()).toBe(urls.graphUrl);
    })

    test(`@admin validate user login with credentials`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();
        await login.connectWithCredentials("readonlyuser", user.password);
        await new Promise((res) => setTimeout(res, 500));
        expect(login.getCurrentURL()).toBe(urls.graphUrl);
    })

    const invalidInputs = [
        { description: 'invalid host', host: 'localhostt', port: '6379', username: userRoles[1].name, password: user.password },
        { description: 'invalid port', host: 'localhost', port: '6378', username: userRoles[1].name, password: user.password },
        { description: 'invalid username', host: 'localhost', port: '6379', username: "user1", password: user.password },
        { description: 'invalid password', host: 'localhost', port: '6379', username: userRoles[1].name, password: "password1!" },
    ];

    invalidInputs.forEach(({ description, host, port, username, password }, index) => {
        test.skip(`@admin validate user login with wrong credentials: ${description}`, async () => {
            const login = await browser.createNewPage(LoginPage, urls.loginUrl);
            if (index === 0) await login.Logout();
            await browser.setPageToFullScreen();
            await login.connectWithCredentials(username, password, host, port);
            await login.refreshPage();
            await new Promise((res) => setTimeout(res, 500));
            expect(login.getCurrentURL()).not.toBe(urls.graphUrl)
        })
    });
})