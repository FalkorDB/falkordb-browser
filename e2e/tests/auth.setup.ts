import { test as setup } from "@playwright/test"
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import LoginPage from "../logic/POM/loginPage";
import { user } from '../config/user.json'
import SettingsUsersPage from "../logic/POM/settingsUsersPage";

const adminAuthFile = 'playwright/.auth/admin.json'
const readWriteAuthFile = 'playwright/.auth/readwriteuser.json'
const readOnlyAuthFile = 'playwright/.auth/readonlyuser.json'

setup.skip("admin authentication", async () => {
    try {
        const browserWrapper = new BrowserWrapper();
        const loginPage = await browserWrapper.createNewPage(LoginPage, urls.loginUrl);
        await loginPage.clickOnConnect();
        await loginPage.dismissDialogAtStart();
        const context = browserWrapper.getContext();
        await context!.storageState({ path: adminAuthFile });

        const settings = await browserWrapper.createNewPage(SettingsUsersPage, urls.settingsUrl)
        await settings.navigateToUserTab();
        await settings.addUser({ userName: "readwriteuser", role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });
        await settings.addUser({ userName: "readonlyuser", role: user.ReadOnly, password: user.password, confirmPassword: user.confirmPassword });
    } catch (error) {
        console.error("Error during authentication setup:", error);
    }
});

const userRoles = [
    { name: 'readwrite', file: readWriteAuthFile, userName: 'readwriteuser' },
    { name: 'readonly', file: readOnlyAuthFile, userName: 'readonlyuser' }
];

userRoles.forEach(({ name, file, userName }) => {
    setup.skip(`${name} authentication`, async () => {
        try {
            const browserWrapper = new BrowserWrapper();
            const loginPage = await browserWrapper.createNewPage(LoginPage, urls.loginUrl);
            await loginPage.connectWithCredentials(userName, user.password);
            await loginPage.dismissDialogAtStart();
            const context = browserWrapper.getContext();
            await context!.storageState({ path: file });
        } catch (error) {
            console.error(`Error during ${name} authentication setup:`, error);
        }
    });
});