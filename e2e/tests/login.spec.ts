import test, { expect } from "@playwright/test"
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import { userRoles, user } from '../config/user.json'

test.describe(`Login tests`, () => {
    let browser: BrowserWrapper;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
    });

    test.afterEach(async () => {
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
        await login.waitForUrl(urls.graphUrl)
        expect(login.getCurrentURL()).toBe(urls.graphUrl);
    })

    const invalidInputs = [
        { description: 'invalid host', host: 'localhostt', port: '6379', username: userRoles[1].name, password: user.password },
        { description: 'invalid port', host: 'localhost', port: '6378', username: userRoles[1].name, password: user.password },
        { description: 'invalid username', host: 'localhost', port: '6379', username: "user1", password: user.password },
        { description: 'invalid password', host: 'localhost', port: '6379', username: userRoles[1].name, password: "password1!" },
    ];

    invalidInputs.forEach(({ description, host, port, username, password }) => {
        test(`@admin validate user login with wrong credentials: ${description}`, async () => {
            const login = await browser.createNewPage(LoginPage, urls.loginUrl);
            if (login.getCurrentURL() === urls.graphUrl) await login.Logout();
            await browser.setPageToFullScreen();
            await login.connectWithCredentials(username, password, host, port);
            await new Promise((res) => { setTimeout(res, 500) });
            expect(login.getCurrentURL()).not.toBe(urls.graphUrl)
        })
    });

    test(`@admin validate login with FalkorDB URL - default user`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();
        await login.connectWithUrl("falkor://localhost:6379");
        await login.waitForSuccessfulLogin(urls.graphUrl);
        expect(login.getCurrentURL()).toBe(urls.graphUrl);
    })

    test(`@admin validate login with FalkorDB URL - with credentials`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();
        await login.connectWithUrl(`falkor://readonlyuser:${user.password}@localhost:6379`);
        await login.waitForSuccessfulLogin(urls.graphUrl);
        expect(login.getCurrentURL()).toBe(urls.graphUrl);
    })

    test(`@admin validate toggle between manual and URL modes`, async () => {
        const login = await browser.createNewPage(LoginPage, urls.loginUrl);
        await login.Logout();
        await browser.setPageToFullScreen();
        
        // Verify manual mode is selected by default
        expect(await login.isManualModeSelected()).toBe(true);
        
        // Switch to URL mode
        await login.clickUrlMode();
        expect(await login.isUrlModeSelected()).toBe(true);
        
        // Switch back to manual mode
        await login.clickManualMode();
        expect(await login.isManualModeSelected()).toBe(true);
    })

    const invalidUrls = [
        { description: 'invalid protocol', url: 'invalid://localhost:6379' },
        { description: 'invalid host', url: 'falkor://invalidhost:6379' },
        { description: 'invalid port', url: 'falkor://localhost:6378' },
        { description: 'invalid credentials', url: 'falkor://wronguser:wrongpass@localhost:6379' },
    ];

    invalidUrls.forEach(({ description, url }) => {
        test(`@admin validate user login with invalid URL: ${description}`, async () => {
            const login = await browser.createNewPage(LoginPage, urls.loginUrl);
            if (login.getCurrentURL() === urls.graphUrl) await login.Logout();
            await browser.setPageToFullScreen();
            await login.connectWithUrl(url);
            // Wait for page to process the invalid login attempt
            await login.waitForPageIdle();
            expect(login.getCurrentURL()).not.toBe(urls.graphUrl);
        })
    });
})