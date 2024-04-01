import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
});

test('connect', async ({ page }) => {
  await page.getByRole('button', { name: 'Connect' }).click();
  await page.getByRole('button', { name: 'Connect' }).click();

  await page.getByText('Select Graph...').click();
});