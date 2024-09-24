import { test as setup } from "@playwright/test"
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import { LoginPage } from "../logic/POM/loginPage";
import { ApiCalls } from "../logic/api/apiCalls";
import {user} from '../config/user.json'
import SettingsUsersPage from "../logic/POM/settingsUsersPage";

const adminAuthFile = 'playwright/.auth/admin.json'
const readWriteAuthFile = 'playwright/.auth/readwriteuser.json'
const readOnlyAuthFile = 'playwright/.auth/readonlyuser.json'

setup("admin authentication", async () => {
    try {
        const browserWrapper = new BrowserWrapper();
        const loginPage = await browserWrapper.createNewPage(LoginPage, urls.loginUrl);
        await loginPage.clickOnConnect();
        const context = browserWrapper.getContext();
        await context!.storageState({ path: adminAuthFile });

        const settings = await browserWrapper.createNewPage(SettingsUsersPage, urls.settingsUrl)
        await settings.navigateToUserTab();
        await settings.addUser({userName: "readwriteuser", role: user.ReadWrite, password: user.password , confirmPassword: user.confirmPassword});
        await settings.addUser({userName: "readonlyuser", role: user.ReadOnly, password: user.password , confirmPassword: user.confirmPassword});
    } catch (error) {
        console.error("Error during authentication setup:", error);
    }
});


setup("readwrite authentication", async () => {
    try {
        const browserWrapper = new BrowserWrapper();
        const loginPage = await browserWrapper.createNewPage(LoginPage, urls.loginUrl);
        await loginPage.connectWithCredentials("readwriteuser", user.password)
        const context = browserWrapper.getContext();
        await context!.storageState({ path: readWriteAuthFile });
    } catch (error) {
        console.error("Error during additional setup:", error);
    }
});

setup("readOnly authentication", async () => {
    try {
        const browserWrapper = new BrowserWrapper();
        const loginPage = await browserWrapper.createNewPage(LoginPage, urls.loginUrl);
        await loginPage.connectWithCredentials("readonlyuser", user.password)
        const context = browserWrapper.getContext();
        await context!.storageState({ path: readOnlyAuthFile });
    } catch (error) {
        console.error("Error during additional setup:", error);
    }
});