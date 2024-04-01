import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
});

test('has title', async ({ page }) => {
  await expect(page).toHaveTitle(/FalkorDB Browser/);
});

test('dark-mode', async ({ page }) => {
  await page.getByLabel('system mode').click();
  await page.getByLabel('dark mode').click();
  await page.getByLabel('light mode').click();
});