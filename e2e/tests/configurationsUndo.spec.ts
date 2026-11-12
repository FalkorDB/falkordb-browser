import { expect, test } from "../infra/coverage";
import { mountConfigurations } from "../infra/configurationsComponent";

test.use({ storageState: { cookies: [], origins: [] } });

test("configuration Undo restores the immediate previous value on first and repeated edits", async ({ page }) => {
    const postedValues: string[] = [];
    page.on("request", request => {
        if (request.method() === "POST") postedValues.push(request.postDataJSON().value);
    });
    await mountConfigurations(page, 10);
    const input = page.getByRole("textbox", { name: "MAX_QUEUED_QUERIES" });
    const undo = page.getByRole("button", { name: "Undo", exact: true });
    const save = page.getByRole("button", { name: "Save", exact: true });
    await expect(input).toHaveValue("10");

    await input.fill("20");
    await save.click();
    await expect(page.getByLabel("Saved value")).toHaveText("20");
    await expect(undo).toBeVisible();
    await undo.click();
    await expect(input).toHaveValue("10");
    await expect(undo).toHaveCount(0);

    await input.fill("30");
    await save.click();
    await expect(page.getByLabel("Saved value")).toHaveText("30");
    await expect(undo).toBeVisible();
    await input.fill("40");
    await save.click();
    await expect(page.getByLabel("Saved value")).toHaveText("40");
    await undo.click();
    await expect(input).toHaveValue("30");
    await expect(undo).toHaveCount(0);
    await expect(page.getByLabel("THREAD_COUNT")).toHaveText("8");
    expect(postedValues).toEqual(["20", "10", "30", "40", "30"]);
});

test("configuration Undo restores numeric zero", async ({ page }) => {
    await mountConfigurations(page, 0);
    const input = page.getByRole("textbox", { name: "MAX_QUEUED_QUERIES" });
    await expect(input).toHaveValue("0");
    await input.fill("20");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(input).toHaveValue("0");
});

test("configuration edits do not offer an Undo rejected by empty-value validation", async ({ page }) => {
    await mountConfigurations(page, "");
    const input = page.getByRole("textbox", { name: "MAX_QUEUED_QUERIES" });
    await expect(input).toHaveValue("");
    await input.fill("20");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("complementary", { name: "Notification" })).toHaveText("Configuration value set successfully");
    await expect(page.getByRole("button", { name: "Undo", exact: true })).toHaveCount(0);
});

test("configuration Undo uses newly loaded connection values", async ({ page }) => {
    await mountConfigurations(page, 10);
    const input = page.getByRole("textbox", { name: "MAX_QUEUED_QUERIES" });
    await expect(input).toHaveValue("10");
    await page.route("http://configurations.test/api/graph/config", route =>
        route.fulfill({ json: { configs: [["MAX_QUEUED_QUERIES", 70]] } }));
    await page.getByRole("button", { name: "Switch connection", exact: true }).click();
    await expect(input).toHaveValue("70");
    await input.fill("80");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(input).toHaveValue("70");
});
