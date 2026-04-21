/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { test as setup, request as playwrightRequest } from "@playwright/test";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import { user } from '../config/user.json';
import ApiCalls from "../logic/api/apiCalls";

const adminAuthFile = 'playwright/.auth/admin.json';
const readWriteAuthFile = 'playwright/.auth/readwriteuser.json';
const readOnlyAuthFile = 'playwright/.auth/readonlyuser.json';
// Dedicated auth files for sign-out tests — these are invalidated by the
// sign-out test itself and must not be shared with any other project.
const signOutReadWriteAuthFile = 'playwright/.auth/signout-readwriteuser.json';
const signOutReadOnlyAuthFile = 'playwright/.auth/signout-readonlyuser.json';

setup("setup authentication", async () => {
    try {
        const browserWrapper = new BrowserWrapper();
        const loginPage = await browserWrapper.createNewPage(LoginPage, urls.loginUrl);
        await browserWrapper.setPageToFullScreen();
        await loginPage.clickOnConnect();
        await loginPage.handleSkipTutorial();
        const context = browserWrapper.getContext();
        await context!.storageState({ path: adminAuthFile });
        const adminContext = await playwrightRequest.newContext({ storageState: adminAuthFile });
        const apiCall = new ApiCalls();
        await apiCall.createUsers({ username: 'readwriteuser', role: user.ReadWrite, password: user.password}, adminContext);
        await apiCall.createUsers({ username: 'readonlyuser', role: user.ReadOnly, password: user.password}, adminContext);

        const userRoles = [
            { name: 'readwrite', file: readWriteAuthFile, userName: 'readwriteuser' },
            { name: 'readonly', file: readOnlyAuthFile, userName: 'readonlyuser' }
        ];

        for (const { file, userName } of userRoles) {
            const userBrowserWrapper = new BrowserWrapper();
            const userLoginPage = await userBrowserWrapper.createNewPage(LoginPage, urls.loginUrl);
            await userBrowserWrapper.setPageToFullScreen();
            await userLoginPage.connectWithCredentials(userName, user.password);
            await userLoginPage.handleSkipTutorial();
            const userContext = userBrowserWrapper.getContext();
            await userContext!.storageState({ path: file });
        }

        // Create and authenticate dedicated sign-out users.
        // These are separate accounts whose sessions can be safely invalidated
        // by the sign-out test without affecting any other test's auth state.
        await apiCall.createUsers({ username: 'signoutreadwriteuser', role: user.ReadWrite, password: user.password }, adminContext);
        await apiCall.createUsers({ username: 'signoutreadonlyuser', role: user.ReadOnly, password: user.password }, adminContext);

        const signOutUserRoles = [
            { file: signOutReadWriteAuthFile, userName: 'signoutreadwriteuser' },
            { file: signOutReadOnlyAuthFile, userName: 'signoutreadonlyuser' },
        ];

        for (const { file, userName } of signOutUserRoles) {
            const userBrowserWrapper = new BrowserWrapper();
            const userLoginPage = await userBrowserWrapper.createNewPage(LoginPage, urls.loginUrl);
            await userBrowserWrapper.setPageToFullScreen();
            await userLoginPage.connectWithCredentials(userName, user.password);
            await userLoginPage.handleSkipTutorial();
            const userContext = userBrowserWrapper.getContext();
            await userContext!.storageState({ path: file });
        }

    } catch (error) {
        console.error("Error during authentication setup:", error);
    }
});