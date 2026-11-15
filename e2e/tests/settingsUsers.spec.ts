import { mock } from "node:test";
import { expect, test } from "../infra/coverage";
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

    [
        { patchStatus: 200, saveStatus: 200, error: undefined },
        { patchStatus: 400, saveStatus: 200, error: 'Updating user "wait-test" failed with HTTP 400' },
        { patchStatus: 200, saveStatus: 500, error: 'Saving user "wait-test" failed with HTTP 500' },
    ].forEach(({ patchStatus, saveStatus, error }) => {
        test(`@admin Edit user waits for ACL persistence even when fixed delays finish immediately (${patchStatus}/${saveStatus})`, async ({ page }) => {
            await page.route("http://localhost:3003/**", route => route.fulfill({
                status: route.request().method() === "PATCH" ? patchStatus
                    : route.request().method() === "POST" ? saveStatus : 200,
                json: {},
            }));
            await page.goto("http://localhost:3003/");
            const patchResponsePromise = page.waitForResponse(response => response.request().method() === "PATCH");
            const saveResponsePromise = page.waitForResponse(response => response.request().method() === "POST");
            await page.evaluate(async () => {
                await fetch("/api/user/wait-test", { method: "PATCH" });
                await fetch("/api/user/save", { method: "POST" });
            });
            const [patchResponse, saveResponse] = await Promise.all([patchResponsePromise, saveResponsePromise]);
            const saveGate = Promise.withResolvers<void>();
            const saveWaitStarted = Promise.withResolvers<void>();
            const settingsUsersPage = new SettingsUsersPage(page);
            const mocked = [
                mock.method(settingsUsersPage, "waitForPageIdle", async () => { }),
                mock.method(settingsUsersPage, "searchForElement", async () => { }),
                mock.method(settingsUsersPage, "clickUserCheckboxBtn", async () => { }),
                mock.method(settingsUsersPage, "clickOnEditUserBtn", async () => { }),
                mock.method(settingsUsersPage, "clickOnSubmitEditUser", async () => { }),
                mock.method(page, "waitForTimeout", async () => { }),
                mock.method(page, "waitForResponse", async (predicate: Parameters<typeof page.waitForResponse>[0]) => {
                    if (typeof predicate !== "function") throw new Error("Expected a response predicate");
                    if (!patchResponse.ok() && await predicate(patchResponse)) return patchResponse;
                    if (await predicate(saveResponse)) {
                        saveWaitStarted.resolve();
                        await saveGate.promise;
                        return saveResponse;
                    }
                    if (await predicate(patchResponse)) return patchResponse;
                    throw new Error("Unexpected response predicate");
                }),
            ];
            let editCompleted = false;
            let editError: unknown;
            const editPromise = settingsUsersPage.editUser("wait-test", {}).then(() => {
                editCompleted = true;
            }, reason => {
                editError = reason;
            });
            try {
                if (patchResponse.ok()) {
                    expect(await Promise.race([
                        editPromise.then(() => "returned"),
                        saveWaitStarted.promise.then(() => "waiting for persistence"),
                    ])).toBe("waiting for persistence");
                    expect(editCompleted).toBe(false);
                }
                saveGate.resolve();
                await editPromise;
                expect(editCompleted).toBe(error === undefined);
                if (error) {
                    if (!(editError instanceof Error)) throw new Error("Expected an edit failure", { cause: editError });
                    expect(editError.message).toBe(error);
                } else {
                    expect(editError).toBeUndefined();
                }
            } finally {
                saveGate.resolve();
                await editPromise;
                mocked.forEach(method => method.mock.restore());
            }
        });
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
