import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
});

test('connect', async ({ page }) => {
    await page.getByRole('button').click();
    await page.waitForURL('http://localhost:3000/login');
    expect(page.url()).toBe('http://localhost:3000/login');
});

test('themes', async ({ page }) => {
    await page.getByLabel('system mode').click();
    await page.getByLabel('dark mode').click();
    await page.getByLabel('light mode').click();
});