import { expect, test } from "@playwright/test";
import urls from '../config/urls.json'
import BrowserWrapper from "../infra/ui/browserWrapper";
import SettingsUsersPage from "../logic/POM/settingsUsersPage";
import { user } from '../config/user.json'
import ApiCalls from "../logic/api/apiCalls";

test.describe('Settings Tests', () => {
    let browser: BrowserWrapper;

    test.beforeAll(async () => {
        browser = new BrowserWrapper();
    })

    test.afterAll(async () => {
        await browser.closeBrowser();
    })

    test("@admin Add one new user -> validating user exists in the users list", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl)
        await settingsUsersPage.navigateToUserTab();
        const username = `user_${Date.now()}`
        await settingsUsersPage.addUser({ userName: username, role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });
        const isVisible = await settingsUsersPage.verifyUserExists(username)
        await settingsUsersPage.removeUser(username)
        expect(isVisible).toBe(true)
    })

    test("@admin Add one user -> remove one user -> Validate that the user has been removed", async () => {
        // Adding one user
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl)
        await settingsUsersPage.navigateToUserTab();
        const username = `user_${Date.now()}`
        await settingsUsersPage.addUser({ userName: username, role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });
        // Deleting one user
        await settingsUsersPage.removeUser(username)
        await settingsUsersPage.refreshPage()
        await settingsUsersPage.navigateToUserTab()
        const isVisible = await settingsUsersPage.verifyUserExists(username)
        expect(isVisible).toBe(false)

    })

    test("@admin Add one user -> change the role -> Validate that the user role have been changed", async () => {
        // Adding one user
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl)
        await settingsUsersPage.navigateToUserTab();
        const username = `user_${Date.now()}`
        await settingsUsersPage.addUser({ userName: username, role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });

        // modify user role
        await settingsUsersPage.modifyUserRole(username, user.ReadOnly)
        const newUserRole = await settingsUsersPage.getUserRole(username)
        await settingsUsersPage.removeUser(username)
        expect(newUserRole).toBe("Read-Only")

    })

    test("@admin Add two users -> change their roles -> Validate that the users roles have been changed", async () => {
        // Adding two user
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl)
        await settingsUsersPage.navigateToUserTab();
        const username1 = `user_${Date.now()}`
        await settingsUsersPage.addUser({ userName: username1, role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });
        const username2 = `user_${Date.now()}`
        await settingsUsersPage.addUser({ userName: username2, role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });

        console.log(username1, username2);
        
        // modify users roles
        const userRole = user.ReadOnly;
        await settingsUsersPage.modifyUserRole(username1, userRole)
        await settingsUsersPage.modifyUserRole(username2, userRole)
        await settingsUsersPage.refreshPage()
        await settingsUsersPage.navigateToUserTab()
        const userName1Role = await settingsUsersPage.getUserRole(username1)
        const userName2Role = await settingsUsersPage.getUserRole(username2)
        await settingsUsersPage.deleteTwoUsers(username1, username2)

        expect([userName1Role, userName2Role]).toEqual(["Read-Only", "Read-Only"])
    })

    test("@admin Add two users -> delete the two users by checkbox -> Validate that the users have been deleted", async () => {
        // Adding two user
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl)
        await settingsUsersPage.navigateToUserTab();
        const username1 = `user_${Date.now()}`
        await settingsUsersPage.addUser({ userName: username1, role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });
        await settingsUsersPage.refreshPage()
        await settingsUsersPage.navigateToUserTab()
        const username2 = `user_${Date.now()}`
        await settingsUsersPage.addUser({ userName: username2, role: user.ReadWrite, password: user.password, confirmPassword: user.confirmPassword });

        // delete two users
        await settingsUsersPage.deleteTwoUsers(username1, username2)
        const isVisible1 = await settingsUsersPage.verifyUserExists(username1)
        const isVisible2 = await settingsUsersPage.verifyUserExists(username2)
        expect([isVisible1, isVisible2]).toEqual([false, false])

    })

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
            const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl)
            await settingsUsersPage.navigateToUserTab();
            const username = `user_${Date.now()}`
            await settingsUsersPage.addUser({ userName: username, role: user.ReadWrite, password: invalidPassword, confirmPassword: invalidPassword });
            await settingsUsersPage.refreshPage()
            await settingsUsersPage.navigateToUserTab();
            const isVisible = await settingsUsersPage.verifyUserExists(username)
            expect(isVisible).toEqual(false)
        });
    })

    test("@admin Attempt to add a user without assigning a role -> Verify that the user has not been added", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl)
        await settingsUsersPage.navigateToUserTab();
        const username = `user_${Date.now()}`
        await settingsUsersPage.addUser({ userName: username, password: user.password, confirmPassword: user.confirmPassword });
        await settingsUsersPage.refreshPage()
        await settingsUsersPage.navigateToUserTab()
        const isVisible = await settingsUsersPage.verifyUserExists(username)
        expect(isVisible).toBe(false)
    })

    test("@admin Attempt to delete the default admin user -> Verify that the user has not been deleted.", async () => {
        const settingsUsersPage = await browser.createNewPage(SettingsUsersPage, urls.settingsUrl)
        await settingsUsersPage.navigateToUserTab();
        await settingsUsersPage.removeUser('default')
        const isVisible = await settingsUsersPage.verifyUserExists('default');
        expect(isVisible).toBe(true)
    })

    test("@admin API Test:Add user via API -> Validated user existing via API -> Delete user via API.", async () => {
        const apiCall = new ApiCalls()
        const username = `user_${Date.now()}`
        await apiCall.createUsers({ username, password: user.password, role: user.ReadOnly })
        const users = await apiCall.getUsers()
        await apiCall.deleteUsers({ users: [{ username }] })
        const User = users.result.find(u => u.username === username);
        expect(User?.username === username).toBe(true)
    })
    // fail tests
    test(`@admin API Test: without passing a username, Attempt to add a user and validate the user was not added`, async () => {
        const apiCall = new ApiCalls()
        const username = ''
        await apiCall.createUsers({ username, password: user.password, role: user.ReadOnly });
        const users = await apiCall.getUsers()
        const User = users.result.find(u => u.username === username);
        expect(User).toBeUndefined();
    });

    test(`@admin API Test: without passing a role, Attempt to add a user and validate the user was not added`, async () => {
        const apiCall = new ApiCalls()
        const username = `user_${Date.now()}`
        await apiCall.createUsers({ username, password: user.password, role: '' })
        const users = await apiCall.getUsers()
        const User = users.result.find(u => u.username === username);
        expect(User).toBeUndefined();
    });
    
    test(`@admin API Test: without passing a password, Attempt to add a user and validate the user was not added`, async () => {
        const apiCall = new ApiCalls()
        const username = `user_${Date.now()}`
        await apiCall.createUsers({ username, password: '', role: user.ReadOnly });
        const users = await apiCall.getUsers()
        const User = users.result.find(u => u.username === username);
        expect(User).toBeUndefined();
    });

})
