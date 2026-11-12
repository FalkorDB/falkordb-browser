import { expect, test } from "../infra/coverage";
import type { CreateUser } from "@/app/api/user/model";
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

    test("@admin Failed user creation preserves the form and retries without adding a phantom row", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage);
        const page = await browser.getPage();
        const username = "mock-create-retry";
        const submissions: (CreateUser & { keys: string[] })[] = [];
        const methods: string[] = [];
        let saves = 0;
        await page.route(/\/api\/user(?:\/.*)?$/, async route => {
            if (route.request().method() === "GET") {
                await route.fulfill({ json: { result: [] } });
            } else if (route.request().url().endsWith("/save")) {
                saves += 1;
                await route.fulfill({ json: {} });
            } else {
                methods.push(route.request().method());
                submissions.push(route.request().postDataJSON() as CreateUser & { keys: string[] });
                await route.fulfill(submissions.length === 1
                    ? { status: 409, json: { message: "User creation temporarily rejected" } }
                    : { json: {} });
            }
        });
        await browser.navigateTo(urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.clickOnAddUserBtn();
        await settingsUsersPage.fillUserNameField(username);
        await settingsUsersPage.fillPasswordField(user.password);
        await settingsUsersPage.fillConfirmPasswordField(user.confirmPassword);
        await settingsUsersPage.clickOnSelectRoleBtnInAddUser();
        await settingsUsersPage.clickOnSelectUserRole(user.ReadWrite);
        await settingsUsersPage.clickOnSubmitUserAddition();
        await expect(settingsUsersPage.errorToast).toContainText("An unexpected error occurred. Please try again.");
        await expect(settingsUsersPage.userNameField).toHaveValue(username);
        await expect(settingsUsersPage.passwordField).toHaveValue(user.password);
        await expect(settingsUsersPage.findUserNameInTable(username)).toHaveCount(0);
        expect(saves).toBe(0);

        await settingsUsersPage.clickOnSubmitUserAddition();
        await expect(settingsUsersPage.dialog).toHaveCount(0);
        await expect(settingsUsersPage.findUserNameInTable(username)).toHaveCount(1);
        await expect.poll(() => saves).toBe(1);
        expect(submissions).toEqual([
            { username, role: user.ReadWrite, password: user.password, keys: ["*"] },
            { username, role: user.ReadWrite, password: user.password, keys: ["*"] },
        ]);
        expect(methods).toEqual(["POST", "POST"]);
    });

    test("@admin Failed user edit retains original permissions and retries without changing the password", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage);
        const page = await browser.getPage();
        const username = "mock-edit-retry";
        const submissions: { role: string; keys: string[]; password?: string }[] = [];
        const methods: string[] = [];
        let saves = 0;
        await page.route(/\/api\/user(?:\/.*)?$/, async route => {
            if (route.request().method() === "GET") {
                await route.fulfill({ json: { result: [{ username, role: user.ReadWrite, keys: ["reports:*"] }] } });
            } else if (route.request().url().endsWith("/save")) {
                saves += 1;
                await route.fulfill({ json: {} });
            } else {
                methods.push(route.request().method());
                submissions.push(route.request().postDataJSON() as typeof submissions[number]);
                await route.fulfill(submissions.length === 1
                    ? { status: 403, json: { message: "User update denied" } }
                    : { json: {} });
            }
        });
        await browser.navigateTo(urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.clickUserCheckboxBtn(username);
        await settingsUsersPage.clickOnEditUserBtn();
        await expect(settingsUsersPage.userNameField).toBeDisabled();
        await settingsUsersPage.clickOnSelectRoleBtnInAddUser();
        await settingsUsersPage.clickOnSelectUserRole(user.ReadOnly);
        await settingsUsersPage.fillEditKeysField("analytics:*");
        await settingsUsersPage.clickOnSubmitEditUser();
        await expect(settingsUsersPage.errorToast).toContainText("An unexpected error occurred. Please try again.");
        await expect(settingsUsersPage.userRoleContent(username)).toHaveText(user.ReadWrite);
        await expect(settingsUsersPage.userKeysContent(username)).toHaveText("reports:*");
        await expect(settingsUsersPage.dialog).toBeVisible();
        await expect(settingsUsersPage.editSelectRoleBtn).toContainText(user.ReadOnly);
        await expect(settingsUsersPage.permissionRemovalButton("analytics:*")).toBeVisible();
        await expect(settingsUsersPage.editNewPasswordField).toHaveValue("");
        await expect(settingsUsersPage.editConfirmPasswordField).toHaveValue("");
        expect(saves).toBe(0);

        await settingsUsersPage.clickOnSubmitEditUser();
        await expect(settingsUsersPage.dialog).toHaveCount(0);
        await expect(settingsUsersPage.userRoleContent(username)).toHaveText(user.ReadOnly);
        await expect(settingsUsersPage.userKeysContent(username)).toHaveText("analytics:*");
        await expect.poll(() => saves).toBe(1);
        expect(submissions).toEqual([
            { role: user.ReadOnly, keys: ["analytics:*"] },
            { role: user.ReadOnly, keys: ["analytics:*"] },
        ]);
        expect(methods).toEqual(["PATCH", "PATCH"]);
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

    test("@admin Attempt to delete the default admin user -> Verify delete button is disabled.", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.clickUserCheckboxBtn('default');
        const isDeleteDisabled = await settingsUsersPage.isDeleteUserButtonDisabled();
        expect(isDeleteDisabled).toBe(true);
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

    test("@admin Edit user -> change role via edit form -> Validate role changed", async () => {
        const username = getRandomString('user');
        await apiCall.createUsers({ username, password: user.password, role: user.ReadWrite });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.editUser(username, { role: user.ReadOnly });
        await settingsUsersPage.refreshPage();
        await settingsUsersPage.navigateToUserTab();
        const newUserRole = await settingsUsersPage.getUserRole(username);
        expect(newUserRole).toBe("Read-Only");
        await apiCall.deleteUsers({ users: [{ username }] });
    });

    test("@admin Edit user -> change key permissions via edit form -> Validate keys changed", async () => {
        const username = getRandomString('user');
        await apiCall.createUsers({ username, password: user.password, role: user.ReadWrite });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.editUser(username, { keys: "myprefix:*" });
        await settingsUsersPage.refreshPage();
        await settingsUsersPage.navigateToUserTab();
        const newKeys = await settingsUsersPage.getUserKeys(username);
        expect(newKeys).toBe("myprefix:*");
        await apiCall.deleteUsers({ users: [{ username }] });
    });

    test("@admin Edit user -> change password via edit form -> Validate login with new password", async () => {
        const username = getRandomString('user');
        const newPassword = "NewPass1@";
        await apiCall.createUsers({ username, password: user.password, role: user.ReadWrite });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.editUser(username, { password: newPassword, confirmPassword: newPassword });
        await apiCall.deleteUsers({ users: [{ username }] });
    });

    test("@admin Edit button disabled when default user is selected", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.clickUserCheckboxBtn('default');
        const isEditDisabled = await settingsUsersPage.isEditUserButtonDisabled();
        expect(isEditDisabled).toBe(true);
    });

    test("@admin Edit button disabled when no user is selected", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        const isEditDisabled = await settingsUsersPage.isEditUserButtonDisabled();
        expect(isEditDisabled).toBe(true);
    });

    test("@admin API Test: Update user role via PATCH -> Validate role changed via UI", async () => {
        const username = getRandomString('user');
        await apiCall.createUsers({ username, password: user.password, role: user.ReadWrite });
        await apiCall.updateUser(username, { role: user.ReadOnly });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        const newUserRole = await settingsUsersPage.getUserRole(username);
        expect(newUserRole).toBe("Read-Only");
        await apiCall.deleteUsers({ users: [{ username }] });
    });

    test("@admin API Test: Update user with password and keys via PATCH", async () => {
        const username = getRandomString('user');
        await apiCall.createUsers({ username, password: user.password, role: user.ReadWrite });
        await apiCall.updateUser(username, { role: user.ReadWrite, keys: ["test:*"], password: "NewPass1@" });
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        const newKeys = await settingsUsersPage.getUserKeys(username);
        expect(newKeys).toBe("test:*");
        await apiCall.deleteUsers({ users: [{ username }] });
    });
});
