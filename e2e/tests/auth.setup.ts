
import {test as setup} from "@playwright/test"
import urls from '../config/urls.json'
const authFile = 'playwright/.auth/user.json'

setup("authentication", async ({ page }) => {
    await page.goto(urls.loginUrl);
    await page.getByRole("button", { name: "Connect" }).click();
    await page.waitForURL(urls.graphUrl);
    await page.context().storageState({path : authFile})
})
