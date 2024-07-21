import { test } from '@playwright/test';

test('create graph', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('button', { name: 'Connect' }).click();
    await page.waitForURL('http://localhost:3000/graph');
    await page.getByRole('button', {name: "New Graph"}).click();
    await page.getByRole('textbox').fill('falkorDB');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByRole("button", {name: "falkorDB"}).click();
})

test('run query', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('button', { name: 'Connect' }).click();
    await page.waitForURL('http://localhost:3000/graph');
    await page.getByRole('button', {name: "New Graph"}).click();
    await page.getByRole('textbox').fill('falkorDB');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByRole("button", {name: "falkorDB"}).click();
    await page.locator('.view-line').fill("UNWIND range(1, 3) as x CREATE (n) RETURN n");
})