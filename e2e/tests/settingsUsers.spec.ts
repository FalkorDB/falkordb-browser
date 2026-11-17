import type { Page } from "@playwright/test";
import { expect, test } from "../infra/coverage";
import urls from '../config/urls.json';
import BrowserWrapper from "../infra/ui/browserWrapper";
import SettingsUsersPage from "../logic/POM/settingsUsersPage";
import { user } from '../config/user.json';
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

// Serves `users` to GET /api/user, rejects the first create/edit with `rejection` and accepts the retry.
async function mockUserRequests(page: Page, users: object[], rejection: { status: number, message: string }) {
    const requests: { method: string, body: unknown }[] = [];
    let saves = 0;
    await page.route(/\/api\/user(?:\/.*)?$/, async route => {
        const request = route.request();
        if (request.method() === "GET") {
            await route.fulfill({ json: { result: users } });
        } else if (request.url().endsWith("/save")) {
            saves += 1;
            await route.fulfill({ json: {} });
        } else {
            requests.push({ method: request.method(), body: request.postDataJSON() });
            await route.fulfill(requests.length === 1
                ? { status: rejection.status, json: { message: rejection.message } }
                : { json: {} });
        }
    });
    return { requests, saves: () => saves };
}

const ADMIN_ONLY_MESSAGE = "Forbidden: only Admin users can manage users";

async function listUsernames(apiCall: ApiCalls, role?: string): Promise<string[]> {
    const { result } = await apiCall.getUsers(role);
    return result.map(({ username }) => username);
}

// Cleanup runs as admin and only logs a failure, so it cannot replace the error that failed the test.
async function removeUsers(apiCall: ApiCalls, ...usernames: string[]) {
    try {
        const { status, body } = await apiCall.deleteUsersWithStatus({ users: usernames.map(username => ({ username })) }, "admin");
        if (status !== 200) console.error(`Failed to remove users ${usernames.join(", ")}: ${status} ${body.message}`);
    } catch (error) {
        console.error(`Failed to remove users ${usernames.join(", ")}`, error);
    }
}

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

    test("@admin Add user -> first request rejected -> Validate form kept, no phantom row and retry adds the user once", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage);
        const username = getRandomString('user');
        const rejection = { status: 409, message: "User already exists" };
        const mock = await mockUserRequests(await browser.getPage(), [], rejection);
        await browser.navigateTo(urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.addUser({ userName: username, role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });
        expect(await settingsUsersPage.getErrorToastText()).toBe(rejection.message);
        expect(await settingsUsersPage.getUserNameFieldValue()).toBe(username);
        expect(await settingsUsersPage.getPasswordFieldValue()).toBe(user.password);
        expect(await settingsUsersPage.getUserRowCount(username)).toBe(0);
        expect(mock.saves()).toBe(0);

        await settingsUsersPage.clickOnSubmitUserAddition();
        expect(await settingsUsersPage.isUserFormNotVisible()).toBe(true);
        expect(await settingsUsersPage.getUserRowCount(username)).toBe(1);
        await expect.poll(mock.saves).toBe(1);
        const body = { username, role: user.ReadWrite, password: user.password, keys: ["*"] };
        expect(mock.requests).toEqual([{ method: "POST", body }, { method: "POST", body }]);
    });

    test("@admin Edit user -> first request rejected -> Validate original permissions and draft kept and retry saves without a password", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage);
        const username = getRandomString('user');
        const rejection = { status: 403, message: "You do not have permission to update users" };
        const mock = await mockUserRequests(await browser.getPage(), [{ username, role: user.ReadWrite, keys: ["reports:*"] }], rejection);
        await browser.navigateTo(urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.editUser(username, { role: user.ReadOnly, keys: "analytics:*" });
        expect(await settingsUsersPage.isUserNameFieldDisabled()).toBe(true);
        expect(await settingsUsersPage.getErrorToastText()).toBe(rejection.message);
        expect(await settingsUsersPage.getUserRole(username)).toBe(user.ReadWrite);
        expect(await settingsUsersPage.getUserKeysInRow(username)).toBe("reports:*");
        expect(await settingsUsersPage.isUserFormVisible()).toBe(true);
        expect(await settingsUsersPage.getEditSelectedRole()).toContain(user.ReadOnly);
        expect(await settingsUsersPage.isEditKeyTagVisible("analytics:*")).toBe(true);
        expect(await settingsUsersPage.isEditKeyTagNotVisible("reports:*")).toBe(true);
        expect(mock.saves()).toBe(0);

        await settingsUsersPage.clickOnSubmitEditUser();
        expect(await settingsUsersPage.isUserFormNotVisible()).toBe(true);
        expect(await settingsUsersPage.getUserRole(username)).toBe(user.ReadOnly);
        expect(await settingsUsersPage.getUserKeysInRow(username)).toBe("analytics:*");
        await expect.poll(mock.saves).toBe(1);
        const body = { role: user.ReadOnly, keys: ["analytics:*"] };
        expect(mock.requests).toEqual([{ method: "PATCH", body }, { method: "PATCH", body }]);
    });

    test("@admin Search before the users load -> select the match -> Validate only that user is selected", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage);
        const username = getRandomString('user');
        const users = [{ username, role: user.ReadWrite, keys: ["*"] }, { username: getRandomString('other'), role: user.ReadOnly, keys: ["*"] }];
        let releaseUsers!: () => void;
        const usersReleased = new Promise<void>(resolve => { releaseUsers = resolve; });
        await (await browser.getPage()).route(/\/api\/user$/, async route => {
            await usersReleased;
            await route.fulfill({ json: { result: users } });
        });
        await browser.navigateTo(urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.searchForElement(username);
        releaseUsers();
        await settingsUsersPage.clickUserCheckboxBtn(username);
        await expect.poll(() => settingsUsersPage.isEditUserButtonEnabled()).toBe(true);
    });

    test("@admin Select two users -> search hides one -> Validate only the visible user stays selected", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage);
        const username = getRandomString('user');
        const hiddenUsername = getRandomString('other');
        await (await browser.getPage()).route(/\/api\/user$/, route => route.fulfill({
            json: { result: [{ username, role: user.ReadWrite, keys: ["*"] }, { username: hiddenUsername, role: user.ReadOnly, keys: ["*"] }] },
        }));
        await browser.navigateTo(urls.settingsUrl);
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.clickUserCheckboxBtn(username);
        await settingsUsersPage.clickUserCheckboxBtn(hiddenUsername);
        await expect.poll(() => settingsUsersPage.isEditUserButtonEnabled()).toBe(false);
        await settingsUsersPage.searchForElement(username);
        // Edit enables only for a single selection, so this proves the hidden user was unselected.
        await expect.poll(() => settingsUsersPage.isEditUserButtonEnabled()).toBe(true);
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
        await expect.poll(() => settingsUsersPage.getTableRolesCount()).toBe(1);
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
        const tokenName = getRandomString('new-password-login');
        await apiCall.createUsers({ username, password: user.password, role: user.ReadWrite });
        try {
            const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
            await settingsUsersPage.navigateToUserTab();
            await settingsUsersPage.editUser(username, { password: newPassword, confirmPassword: newPassword });

            // Signing in with credentials authenticates against FalkorDB as that user.
            const login = (password: string) => apiCall.generateTokenWithCredentialsRaw({ username, password, name: tokenName });
            await expect.poll(async () => (await login(user.password)).status).toBe(401);
            expect((await login(newPassword)).status).toBe(200);
        } finally {
            const { tokens } = await apiCall.listTokens();
            await Promise.all(tokens.filter(({ name }) => name === tokenName).map(({ token_id: id }) => apiCall.revokeToken(id)));
            await apiCall.deleteUsers({ users: [{ username }] });
        }
    });

    test("@admin Searching before the user list loads selects only the clicked user", async () => {
        const username = getRandomString('user');
        await apiCall.createUsers({ username, password: user.password, role: user.ReadWrite });
        try {
            const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
            const page = await browser.getPage();
            let releaseUserList!: () => void;
            const userListHeld = new Promise<void>((resolve) => { releaseUserList = resolve; });
            await page.route("**/api/user", async (route) => {
                if (route.request().method() === "GET") await userListHeld;
                await route.fallback();
            });
            await settingsUsersPage.navigateToUserTab();
            await settingsUsersPage.searchForElement(username);
            releaseUserList();
            await settingsUsersPage.clickUserCheckboxBtn(username);
            expect(await settingsUsersPage.isEditUserButtonDisabled()).toBe(false);
        } finally {
            await apiCall.deleteUsers({ users: [{ username }] });
        }
    });

    test("@admin Searching a selected user out of view clears the selection", async () => {
        const selected = getRandomString('user');
        const other = getRandomString('user');
        await apiCall.createUsers({ username: selected, password: user.password, role: user.ReadWrite });
        await apiCall.createUsers({ username: other, password: user.password, role: user.ReadWrite });
        try {
            const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl);
            await settingsUsersPage.navigateToUserTab();
            await settingsUsersPage.searchForElement(selected);
            await settingsUsersPage.clickUserCheckboxBtn(selected);
            expect(await settingsUsersPage.isEditUserButtonDisabled()).toBe(false);
            await settingsUsersPage.searchForElement(other);
            await expect.poll(() => settingsUsersPage.isEditUserButtonDisabled()).toBe(true);
        } finally {
            await apiCall.deleteUsers({ users: [{ username: selected }, { username: other }] });
        }
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

    const invalidCreateBodies: { description: string, body: (username: string) => Record<string, unknown>, message: string }[] = [
        { description: "missing username", body: () => ({ password: user.password, role: user.ReadWrite }), message: "username: Username is required" },
        { description: "empty username", body: () => ({ username: "", password: user.password, role: user.ReadWrite }), message: "username: Username cannot be empty" },
        { description: "missing password", body: (username) => ({ username, role: user.ReadWrite }), message: "password: Password is required" },
        { description: "empty password", body: (username) => ({ username, password: "", role: user.ReadWrite }), message: "password: Password cannot be empty" },
        { description: "missing role", body: (username) => ({ username, password: user.password }), message: "role: Role is required" },
        { description: "unknown role", body: (username) => ({ username, password: user.password, role: "Superuser" }), message: "Invalid role" },
        { description: "empty key", body: (username) => ({ username, password: user.password, role: user.ReadWrite, keys: [""] }), message: "keys.0: Key cannot be empty" },
    ];

    invalidCreateBodies.forEach(({ description, body, message }) => {
        test(`@admin API Test: POST /api/user with ${description} -> Validate 400 and the user was not created`, async () => {
            const username = getRandomString('user');
            const payload = body(username);
            try {
                const response = await apiCall.createUserWithStatus(payload);
                expect(response.status).toBe(400);
                expect(response.body.message).toBe(message);
                expect(response.location).toBeUndefined();
                if (payload.username) {
                    expect(await listUsernames(apiCall)).not.toContain(username);
                }
            } finally {
                await removeUsers(apiCall, username);
            }
        });
    });

    test("@admin API Test: POST /api/user with valid body -> Validate 201, Location header and the user in the list with its role", async () => {
        const username = getRandomString('user');
        try {
            const response = await apiCall.createUserWithStatus({ username, password: user.password, role: user.ReadOnly });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Success");
            expect(response.location).toBe(`/api/db/user/${username}`);
            const { result } = await apiCall.getUsers();
            expect(result.find(listed => listed.username === username)?.role).toBe(user.ReadOnly);
        } finally {
            await removeUsers(apiCall, username);
        }
    });

    test("@admin API Test: POST /api/user with an existing username -> Validate 409 and the original user is unchanged", async () => {
        const username = getRandomString('user');
        try {
            const created = await apiCall.createUserWithStatus({ username, password: user.password, role: user.ReadWrite });
            expect(created.status).toBe(201);
            const duplicate = await apiCall.createUserWithStatus({ username, password: user.password, role: user.ReadOnly });
            expect(duplicate.status).toBe(409);
            expect(duplicate.body.message).toBe(`User ${username} already exists`);
            expect(duplicate.location).toBeUndefined();
            const { result } = await apiCall.getUsers();
            expect(result.find(listed => listed.username === username)?.role).toBe(user.ReadWrite);
        } finally {
            await removeUsers(apiCall, username);
        }
    });

    const invalidDeleteBodies = [
        { description: "an empty users list", body: { users: [] }, message: "users: At least one user is required" },
        { description: "an empty username", body: { users: [{ username: "" }] }, message: "users.0.username: Username cannot be empty" },
    ];

    invalidDeleteBodies.forEach(({ description, body, message }) => {
        test(`@admin API Test: DELETE /api/user with ${description} -> Validate 400 and existing users are kept`, async () => {
            const username = getRandomString('user');
            try {
                const created = await apiCall.createUserWithStatus({ username, password: user.password, role: user.ReadWrite });
                expect(created.status).toBe(201);
                const response = await apiCall.deleteUsersWithStatus(body);
                expect(response.status).toBe(400);
                expect(response.body.message).toBe(message);
                expect(await listUsernames(apiCall)).toContain(username);
            } finally {
                await removeUsers(apiCall, username);
            }
        });
    });

    test("@admin API Test: DELETE /api/user with valid body -> Validate 200 and the user is gone while the other user stays", async () => {
        const removed = getRandomString('user');
        const kept = getRandomString('user');
        try {
            const createdRemoved = await apiCall.createUserWithStatus({ username: removed, password: user.password, role: user.ReadWrite });
            const createdKept = await apiCall.createUserWithStatus({ username: kept, password: user.password, role: user.ReadWrite });
            expect(createdRemoved.status).toBe(201);
            expect(createdKept.status).toBe(201);
            const response = await apiCall.deleteUsersWithStatus({ users: [{ username: removed }] });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Users deleted");
            const usernames = await listUsernames(apiCall);
            expect(usernames).not.toContain(removed);
            expect(usernames).toContain(kept);
        } finally {
            await removeUsers(apiCall, removed, kept);
        }
    });

    test(`@admin API Test: POST /api/user/save as an admin passes the admin guard and reaches ACL SAVE`, async () => {
        const response = await apiCall.saveUsersWithStatus("admin");
        // Without an aclfile (as in CI) Redis rejects ACL SAVE itself, so either outcome proves the guard let it through.
        if (response.status === 200) {
            expect(response.body.message).toBe("ACL saved to disk");
        } else {
            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/not configured to use an ACL file/);
        }
    });

    // Every request below is made as the project's own (non-admin) user; the admin calls only seed and verify.
    const nonAdminRoles = [
        { tag: "@readonly", label: "read-only" },
        { tag: "@readwrite", label: "read-write" },
    ];

    nonAdminRoles.forEach(({ tag, label }) => {
        test(`${tag} API Test: POST /api/user as a ${label} user -> Validate 403 and no user is created`, async () => {
            const username = getRandomString('user');
            try {
                const response = await apiCall.createUserWithStatus({ username, password: user.password, role: user.ReadWrite });
                expect(response.status).toBe(403);
                expect(response.body.message).toBe(ADMIN_ONLY_MESSAGE);
                expect(response.location).toBeUndefined();
                expect(await listUsernames(apiCall, "admin")).not.toContain(username);
            } finally {
                await removeUsers(apiCall, username);
            }
        });

        test(`${tag} API Test: DELETE /api/user as a ${label} user -> Validate 403 and the user is kept`, async () => {
            const username = getRandomString('user');
            try {
                const created = await apiCall.createUserWithStatus({ username, password: user.password, role: user.ReadWrite }, "admin");
                expect(created.status).toBe(201);
                const response = await apiCall.deleteUsersWithStatus({ users: [{ username }] });
                expect(response.status).toBe(403);
                expect(response.body.message).toBe(ADMIN_ONLY_MESSAGE);
                expect(await listUsernames(apiCall, "admin")).toContain(username);
            } finally {
                await removeUsers(apiCall, username);
            }
        });

        test(`${tag} API Test: PATCH /api/user/[user] as a ${label} user -> Validate 403 and the user is unchanged`, async () => {
            const username = getRandomString('user');
            try {
                const created = await apiCall.createUserWithStatus({ username, password: user.password, role: user.ReadWrite }, "admin");
                expect(created.status).toBe(201);
                const response = await apiCall.updateUserWithStatus(username, { role: user.ReadOnly });
                expect(response.status).toBe(403);
                expect(response.body.message).toBe(ADMIN_ONLY_MESSAGE);
                const { result } = await apiCall.getUsers("admin");
                expect(result.find(listed => listed.username === username)?.role).toBe(user.ReadWrite);
            } finally {
                await removeUsers(apiCall, username);
            }
        });

        test(`${tag} API Test: POST /api/user/save as a ${label} user -> Validate 403`, async () => {
            const response = await apiCall.saveUsersWithStatus();
            expect(response.status).toBe(403);
            expect(response.body.message).toBe(ADMIN_ONLY_MESSAGE);
        });
    });
});
