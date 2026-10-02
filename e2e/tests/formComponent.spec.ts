import { expect, test, type Page } from "@playwright/test";
import urls from "../config/urls.json";

// FormComponent is the browser's adapter over the design system form. These
// pin the behaviour it has to keep: when errors show, how cross-field and
// field-set changes re-check, tag normalisation and the password toggle. None
// of them submit valid data, so they leave nothing behind.

const port = (page: Page) => page.locator("//input[@id='Port']");
const password = (page: Page) => page.locator("//input[@id='Password']");
const confirmPassword = (page: Page) => page.locator("//input[@id='Confirm Password']");

test.describe("@admin Login form validation", () => {
    // A signed-out context, so /login stays on the form.
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
        await page.goto(urls.loginUrl);
        await expect(port(page)).toBeVisible();
    });

    test("@admin shows the first failing port rule while typing and clears it once fixed", async ({ page }) => {
        await port(page).fill("abc");
        await expect(page.getByText("Port must be a number", { exact: true })).toBeVisible();
        await expect(page.locator("label[for='Port']")).toHaveClass(/text-destructive/);

        await port(page).fill("99999");
        await expect(page.getByText("Port must be a number between 1 and 65535")).toBeVisible();

        await port(page).fill("0123");
        await expect(page.getByText("Invalid port format (port can't start with 0)")).toBeVisible();

        await port(page).fill("6379");
        await expect(page.getByText(/^Port must be|^Invalid port format/)).toHaveCount(0);
        await expect(page.locator("label[for='Port']")).not.toHaveClass(/text-destructive/);
    });

    test("@admin marks an invalid field on its label only, not the input border", async ({ page }) => {
        await port(page).fill("abc");
        await expect(port(page)).toHaveAttribute("aria-invalid", "true");
        const border = await port(page).evaluate((el) => getComputedStyle(el).borderColor);
        const hostBorder = await page.locator("//input[@id='Host']").evaluate((el) => getComputedStyle(el).borderColor);
        expect(border).toBe(hostBorder);
    });

    test("@admin blocks submit while a field is invalid", async ({ page }) => {
        await port(page).fill("abc");
        await page.getByRole("button", { name: "Log in" }).click();
        await expect(page).toHaveURL(/\/login/);
        await expect(page.getByText("Port must be a number", { exact: true })).toBeVisible();
    });

    test("@admin marks required fields with an asterisk without blocking the default connection", async ({ page }) => {
        await expect(page.locator("label[for='Host']")).toHaveText(/^\*\s*Host$/);
        await expect(port(page)).not.toHaveAttribute("required", /.*/);
        await expect(page.locator("#submit-button")).toBeEnabled();
    });

    test("@admin re-checks fields when switching connection mode", async ({ page }) => {
        await page.getByRole("radio", { name: "FalkorDB URL" }).click();
        const url = page.locator("//input[@id='FalkorDB URL']");
        await url.fill("falkor://localhost:abc");
        await expect(page.getByText("Port must be a number", { exact: true })).toBeVisible();

        // The URL's port carries over to the Port field, which is checked on arrival,
        // before any typing.
        await page.getByRole("radio", { name: "Manual Configuration" }).click();
        await expect(port(page)).toHaveValue("abc");
        await expect(page.getByText("Port must be a number", { exact: true })).toBeVisible();

        // Fixing it there carries back, and the URL field arrives clean.
        await port(page).fill("6379");
        await expect(page.getByText("Port must be a number", { exact: true })).toHaveCount(0);
        await page.getByRole("radio", { name: "FalkorDB URL" }).click();
        await expect(url).toHaveValue(/:6379/);
        await expect(page.getByText("Port must be a number", { exact: true })).toHaveCount(0);
    });

    test("@admin toggles password visibility", async ({ page }) => {
        await password(page).fill("secret");
        await expect(password(page)).toHaveAttribute("type", "password");

        await page.getByRole("button", { name: "Show password" }).click();
        await expect(password(page)).toHaveAttribute("type", "text");

        await page.getByRole("button", { name: "Hide password" }).click();
        await expect(password(page)).toHaveAttribute("type", "password");
    });

    test("@admin reveals a field's info hint", async ({ page }) => {
        const hint = page.locator("label[for='Username'] + button[aria-label='More information']");
        // Hovering before hydration opens nothing, so hover again until it does.
        await expect(async () => {
            await page.mouse.move(0, 0);
            await hint.hover();
            await expect(page.getByText(/You can skip entering your username/).first()).toBeVisible({ timeout: 1000 });
        }).toPass({ timeout: 10000 });
    });
});

test.describe("@admin Add user form validation", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(urls.settingsUrl);
        await page.getByTestId("settingsTabUsers").click();
        await page.locator("button#add-user").click();
        await expect(confirmPassword(page)).toBeVisible();
    });

    test("@admin shows every failing field on submit and does not submit", async ({ page }) => {
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Confirm password is required")).toBeVisible();
        await expect(page.getByText("Role is required")).toBeVisible();
        await expect(confirmPassword(page)).toBeVisible();
    });

    test("@admin re-checks the confirmation when the password changes", async ({ page }) => {
        await password(page).fill("Test1234!");
        await confirmPassword(page).fill("Test1234!");
        await expect(page.getByText("Password don't match")).toHaveCount(0);

        // Only the password changes, yet the confirmation below it is flagged at once.
        await password(page).fill("Test12345!");
        await expect(page.getByText("Password don't match")).toBeVisible();

        await password(page).fill("Test1234!");
        await expect(page.getByText("Password don't match")).toHaveCount(0);
    });

    test("@admin strips a leading ~ from keys and ignores duplicates", async ({ page }) => {
        const keys = page.locator("//input[@id='Key / Graph Permissions']");
        await keys.fill("~movies,movies,~actors");
        await keys.press("Enter");

        await expect(page.getByRole("button", { name: "Remove movies" })).toHaveCount(1);
        await expect(page.getByRole("button", { name: "Remove actors" })).toHaveCount(1);
        await expect(page.getByRole("button", { name: /Remove ~/ })).toHaveCount(0);

        await keys.fill("~movies");
        await keys.press("Enter");
        await expect(page.getByRole("button", { name: "Remove movies" })).toHaveCount(1);

        await page.getByRole("button", { name: "Remove movies" }).click();
        await expect(page.getByRole("button", { name: "Remove movies" })).toHaveCount(0);
    });
});
