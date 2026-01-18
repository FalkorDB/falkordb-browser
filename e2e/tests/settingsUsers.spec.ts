import { expect, test } from "@playwright/test";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import SettingsUsersPage from "../logic/POM/settingsUsersPage";
import { user } from '../config/user.json';
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

test.describe('@Config Settings users tests', () => {
    let browser: BrowserWrapper;
    let apiCall: ApiCalls;

    test.beforeEach(async () => {
        browser = new BrowserWrapper();
        apiCall = new ApiCalls();
    });

    test.afterEach(async () => {
        await browser.closeBrowser();
    });

    test("@admin Add one new user -> validating user exists in the users list", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        const username = getRandomString('user');
        await settingsUsersPage.addUser({ userName: username, role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });
        const isVisible = await settingsUsersPage.verifyUserExists(username);
        await settingsUsersPage.removeUser(username);
        expect(isVisible).toBe(true);
        apiCall.deleteUsers({ users: [{ username }] });
    });

    test("@admin Add one user -> remove one user -> Validate that the user has been removed", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        const username = getRandomString('user');
        await settingsUsersPage.addUser({ userName: username, role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });
        await settingsUsersPage.removeUser(username);
        await settingsUsersPage.refreshPage();
        await settingsUsersPage.navigateToUserTab();
        const isVisible = await settingsUsersPage.verifyUserExists(username);
        expect(isVisible).toBe(false);
    });

    test("@admin Add one user -> change the role -> Validate that the user role have been changed", async () => {
        const username = getRandomString('user');
        await apiCall.createUsers({ username, password: user.password, role: user.ReadWrite });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.modifyUserRole(username, user.ReadOnly);
        await settingsUsersPage.refreshPage();
        await settingsUsersPage.navigateToUserTab();
        const newUserRole = await settingsUsersPage.getUserRole(username);
        expect(newUserRole).toBe("Read-Only");
        apiCall.deleteUsers({ users: [{ username }] });
    });

    const searchData = [
        { invalidPassword: 'Test123', description: "short password" },
        { invalidPassword: 'Test1234', description: "without special character" },
        { invalidPassword: 'Testtes@', description: "without digits" },
        { invalidPassword: 'TESTES1@', description: "without lowercase letters" },
        { invalidPassword: 'testte1@', description: "without uppercase letters" },
        { invalidPassword: '', description: "without password" }
    ];

    searchData.forEach(({ invalidPassword, description }) => {
        test(`@admin Enter password for new user: ${invalidPassword} reason: ${description} `, async () => {
            const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
            await settingsUsersPage.navigateToUserTab();
            const username = getRandomString('user');
            await settingsUsersPage.addUser({ userName: username, role: user.ReadWrite, password: invalidPassword, confirmPassword: invalidPassword });
            await settingsUsersPage.refreshPage();
            await settingsUsersPage.navigateToUserTab();
            const isVisible = await settingsUsersPage.verifyUserExists(username);
            expect(isVisible).toEqual(false);
        });
    });

    test("@admin Attempt to add a user without assigning a role -> Verify that the user has not been added", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        const username = getRandomString('user');
        await settingsUsersPage.addUser({ userName: username, password: user.password, confirmPassword: user.confirmPassword });
        await settingsUsersPage.refreshPage();
        await settingsUsersPage.navigateToUserTab();
        const isVisible = await settingsUsersPage.verifyUserExists(username);
        expect(isVisible).toBe(false);
    });

    test("@admin Attempt to delete the default admin user -> Verify that the user has not been deleted.", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.removeUser('default');
        const isVisible = await settingsUsersPage.verifyUserExists('default');
        expect(isVisible).toBe(true);
    });

    test("@admin API Test: Add user via API -> Validated user existing via UI -> Delete user via API.", async () => {
        const username = getRandomString('user');
        await apiCall.createUsers({ username, password: user.password, role: user.ReadOnly });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await new Promise(resolve => { setTimeout(resolve, 1000); });
        expect(await settingsUsersPage.verifyUserExists(username)).toEqual(true);
        await apiCall.deleteUsers({ users: [{ username }] });
    });

    test(`@admin API Test: without passing a username, Attempt to add a user via api and validate the user was not added via ui`, async () => {
        const username = '';
        await apiCall.createUsers({ username, password: user.password, role: user.ReadOnly });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        const isVisible = await settingsUsersPage.verifyUserExists(username);
        expect(isVisible).toEqual(false);
    });

    test(`@admin API Test: without passing a role, Attempt to add a user via api and validate the user was not added via ui`, async () => {
        const username = getRandomString('user');
        await apiCall.createUsers({ username, password: user.password, role: '' });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        const isVisible = await settingsUsersPage.verifyUserExists(username);
        expect(isVisible).toEqual(false);
    });
    
    test(`@admin API Test: without passing a password, Attempt to add a user via api and validate the user was not added via ui`, async () => {
        const username = getRandomString('user');
        await apiCall.createUsers({ username, password: '', role: user.ReadOnly });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        const isVisible = await settingsUsersPage.verifyUserExists(username);
        expect(isVisible).toEqual(false);
    });

    test(`@admin Validate user search filters table results`, async () => {
        const username = getRandomString('user');
        await apiCall.createUsers({ username, password: user.password, role: user.ReadOnly });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.searchForElement(username);
        expect(await settingsUsersPage.getTableRolesCount()).toBe(1);
        await apiCall.deleteUsers({ users: [{ username }] });
    });

});
