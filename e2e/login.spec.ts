import { expect, test } from '@playwright/test';

test('login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('button', { name: 'Connect' }).click();
  await page.waitForURL('http://localhost:3000/graph');
  expect(page.url()).toBe('http://localhost:3000/graph');
});